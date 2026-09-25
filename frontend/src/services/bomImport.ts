export interface ImportedJob {
  id: string;
  name: string;
  partNumber?: string;
  qty?: number | string;
  material?: string;
  catalogSize?: string;
  dims?: string;
  supplier?: string;
  startDate?: string;
  expectedDate?: string;
  processPath?: string;
  processes: Record<string, { actual: number; estimated: number; status: string; machine?: string }>;
}

export interface PurchaseLine {
  id: string;
  name: string;
  specs: string;
  qty: number;
  unit: string;
  suggested: string;
  final: string;
  unitCost: number;
  totalCost: number;
  eta: string;
  status: string;
  risk: string;
  prNum: string;
  poNum: string;
  requestDate: string;
  orderDate: string;
  actualArrivalDate: string;
  leadTime: string;
  blocking: boolean;
  jobId?: string;
  material?: string;
  date?: string;
}

export interface BomImportPayload {
  id: string;
  customer: string;
  headerMetadata: Record<string, string>;
  tools: ImportedJob[];
  purchases?: PurchaseLine[];
  sourceFormat?: string;
}

const JOB_NUMBER_PATTERN = /\b\d{2,4}-\d{3,6}(?:=[A-Z0-9_-]+)?\b/i;
const PART_NUMBER_PATTERN = /^(?=.*\d)(?=.*[A-Z])[A-Z0-9]{6,}$/i;
const PDF_NOISE = new Set([
  'BILL OF MATERIAL',
  'TOOL DEVELOPMENT CENTRE',
  'TECHNOLOGIES',
  '-',
]);

const formatImportDate = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString().split('T')[0];
  const raw = String(value).trim();
  if (!raw) return undefined;

  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, month, day, year] = slashMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  return raw;
};

export const extractDateFromFilename = (fileName: string): string | undefined => {
  const match = fileName.match(/(\d{2})-(\d{2})-(\d{4})/);
  if (!match) return undefined;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
};

export const normalisePdfBomRows = (rows: string[][], fileName?: string): string[][] => {
  if (rows.some(row => isToolTableHeader(row))) return rows;

  const values = rows.flat().map(value => String(value).trim()).filter(Boolean);
  const cleaned = values.filter(value => !PDF_NOISE.has(value.toUpperCase()) && !/^QP\d/i.test(value));

  const jobCandidates = cleaned.filter(value => JOB_NUMBER_PATTERN.test(value));
  const jobNumber = jobCandidates.find(value => /=\s*[A-Z0-9_-]+/i.test(value)) ?? jobCandidates.at(-1);
  const partNumber = cleaned.find(value => PART_NUMBER_PATTERN.test(value) && value !== jobNumber);
  const project = cleaned.find(value => value.includes('=') && value !== jobNumber);
  const partName = cleaned.find(value =>
    /^[A-Z][A-Z0-9 -]{2,}$/i.test(value)
    && value !== jobNumber
    && value !== partNumber
    && value !== project
    && !PDF_NOISE.has(value.toUpperCase()),
  );
  const fileDate = fileName ? extractDateFromFilename(fileName) : undefined;

  if (!jobNumber && !partNumber && !partName) return rows;

  const metadataRows: string[][] = [
    ['JOB NO.', jobNumber ?? 'Unknown'],
    ['TOOL NO.', jobNumber ?? 'Unknown'],
    ['PART NO.', partNumber ?? 'Unknown'],
    ['PROJECT', project ?? 'Unknown'],
    ['PART NAME', partName ?? 'Imported PDF part'],
    ['SOURCE FORMAT', 'PDF BOM title block'],
  ];

  if (fileDate) metadataRows.push(['DATE', fileDate]);

  return [
    ...metadataRows,
    [],
    ['NO.', 'PART NO.', 'DESCRIPTION', 'QTY'],
    ['1', partNumber ?? '-', partName ?? 'Imported PDF part', '1'],
  ];
};

export const isToolTableHeader = (row: unknown[]) => {
  const headers = row.map(cell => String(cell ?? '').toUpperCase());
  const hasPartName = headers.some(header =>
    ['DESCRIPTION', 'JOB NAME', 'NAME', 'PART'].some(term => header.includes(term)),
  );
  const hasSupportingColumn = headers.some(header =>
    ['NO.', 'NO', 'ITEM', '#', 'QTY', 'QUANTITY', 'PROCESS', 'MATERIAL'].some(term => header.includes(term)),
  );
  return hasPartName && hasSupportingColumn;
};

export const findTableHeaderRow = (rows: unknown[][], fallback: number) => {
  const candidate = rows.slice(0, 50).findIndex(row => isToolTableHeader(row));
  return candidate >= 0 ? candidate : Math.min(fallback, Math.max(rows.length - 1, 0));
};

export const buildPurchasesFromJobs = (tools: ImportedJob[], jobOrderId: string): PurchaseLine[] =>
  tools.map((tool, index) => {
    const rowNo = tool.id.split('/').pop() ?? String(index + 1);
    const qty = Number(tool.qty) || 1;
    const material = tool.material?.trim();
    const dims = tool.dims && !tool.dims.includes('- x - x -') ? `${tool.dims} mm`.replace(/\s+/g, ' ') : '';
    const specs = dims || tool.catalogSize || (tool.partNumber ? `Part No: ${tool.partNumber}` : '-');
    const today = new Date().toISOString().split('T')[0];

    return {
      id: `MAT-${jobOrderId}-${rowNo}`,
      name: material ? `${material} — ${tool.name}` : tool.name,
      specs,
      qty,
      unit: qty === 1 ? 'block' : 'pcs',
      suggested: tool.supplier ? String(tool.supplier) : '',
      final: '',
      unitCost: 0,
      totalCost: 0,
      eta: formatImportDate(tool.expectedDate) ?? 'TBD',
      status: 'Purchase Pending',
      risk: 'On Schedule',
      prNum: '-',
      poNum: '-',
      requestDate: formatImportDate(tool.startDate) ?? today,
      orderDate: '-',
      actualArrivalDate: '-',
      leadTime: 'N/A',
      blocking: false,
      jobId: tool.id,
      material: material || undefined,
      date: formatImportDate(tool.expectedDate) ?? 'TBD',
    };
  });

export const buildJobOrderFromImport = (payload: BomImportPayload) => {
  const purchases = payload.purchases?.length
    ? payload.purchases
    : buildPurchasesFromJobs(payload.tools, payload.id);

  const dueDate =
    payload.headerMetadata['DATE']
    || payload.headerMetadata['Expected Date']
    || payload.headerMetadata['Expected date']
    || payload.headerMetadata['TARGET DATE']
    || purchases.find(purchase => purchase.eta !== 'TBD')?.eta
    || 'TBD';

  return {
    id: payload.id,
    customer: payload.customer || 'Unknown',
    headerMetadata: payload.headerMetadata,
    priority: 'High',
    progress: 0,
    items: `0/${payload.tools.length}`,
    dueDate,
    status: 'Running',
    activeJob: payload.tools[0]?.id ?? 'None',
    tools: payload.tools,
    purchases,
    importSource: payload.sourceFormat ?? 'excel',
    importedAt: new Date().toISOString(),
  };
};

export const mapPurchaseStatusToMaterial = (status: string | undefined): 'Arrived' | 'Pending' | 'Delayed' | 'Not Ordered' | 'Partial Arrival' => {
  const normalised = (status || '').toLowerCase();

  if (['arrived', 'delivered', 'done', 'completed'].includes(normalised)) return 'Arrived';
  if (['delayed', 'critical delay', 'at risk'].includes(normalised)) return 'Delayed';
  if (['partial arrival', 'partial'].includes(normalised)) return 'Partial Arrival';
  if (['purchase pending', 'awaiting approval', 'not ordered'].includes(normalised)) return 'Not Ordered';
  if (['ordered', 'processing', 'approved', 'in transit', 'pending'].includes(normalised)) return 'Pending';

  return 'Not Ordered';
};
