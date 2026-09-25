import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  BomImportPayload,
  buildPurchasesFromJobs,
  findTableHeaderRow,
  normalisePdfBomRows,
} from '@/services/bomImport';

type SupportedFileType = 'excel' | 'csv' | 'tsv' | 'json' | 'pdf';

interface DetectedFileType {
  type: SupportedFileType;
  label: string;
}

const EXCEL_EXTENSIONS = ['xlsx', 'xls', 'xlsm', 'xlsb', 'ods'];

const getExtension = (fileName: string) => fileName.split('.').pop()?.toLowerCase() ?? '';

const isZipSignature = (bytes: Uint8Array) =>
  bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;

const isLegacyExcelSignature = (bytes: Uint8Array) =>
  bytes.length >= 8 && [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1].every((value, index) => bytes[index] === value);

const isPdfSignature = (bytes: Uint8Array) =>
  bytes.length >= 5 && [0x25, 0x50, 0x44, 0x46, 0x2d].every((value, index) => bytes[index] === value);

const detectFileType = async (file: File): Promise<DetectedFileType> => {
  const sample = new Uint8Array(await file.slice(0, 8192).arrayBuffer());
  const extension = getExtension(file.name);
  const textSample = new TextDecoder().decode(sample).replace(/^\uFEFF/, '').trimStart();

  // Prefer file signatures and content over a filename extension, which can be misleading.
  if (isPdfSignature(sample) || extension === 'pdf' || file.type === 'application/pdf') {
    return { type: 'pdf', label: 'PDF' };
  }
  if (isLegacyExcelSignature(sample) || (isZipSignature(sample) && EXCEL_EXTENSIONS.includes(extension))) {
    return { type: 'excel', label: 'Excel spreadsheet' };
  }
  if (textSample.startsWith('{') || textSample.startsWith('[')) {
    return { type: 'json', label: 'JSON' };
  }
  if (textSample.includes('\t') || extension === 'tsv' || file.type === 'text/tab-separated-values') {
    return { type: 'tsv', label: 'TSV' };
  }
  if (textSample.length > 0 && (textSample.includes(',') || extension === 'csv' || file.type === 'text/csv')) {
    return { type: 'csv', label: 'CSV' };
  }
  if (EXCEL_EXTENSIONS.includes(extension)) {
    return { type: 'excel', label: 'Excel spreadsheet' };
  }

  throw new Error('Unsupported file type. Upload an Excel spreadsheet, CSV, TSV, JSON, or PDF file.');
};

const parseDelimitedText = (text: string, delimiter: ',' | '\t'): any[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === delimiter && !quoted) {
      row.push(value);
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(value);
      if (row.some(cell => cell.trim() !== '')) rows.push(row);
      row = [];
      value = '';
    } else {
      value += character;
    }
  }
  row.push(value);
  if (row.some(cell => cell.trim() !== '')) rows.push(row);
  return rows;
};

const parseJsonRows = (text: string): any[][] => {
  const parsed = JSON.parse(text);
  const records = Array.isArray(parsed)
    ? parsed
    : Object.values(parsed).find(value => Array.isArray(value));

  if (!Array.isArray(records) || records.length === 0) {
    throw new Error('JSON must contain a non-empty array of records.');
  }
  if (Array.isArray(records[0])) return records;
  if (records.every(record => record && typeof record === 'object' && !Array.isArray(record))) {
    const headers = Array.from(new Set(records.flatMap(record => Object.keys(record))));
    return [headers, ...records.map(record => headers.map(header => record[header] ?? ''))];
  }
  throw new Error('JSON records must be objects or rows of values.');
};

const parsePdfRows = async (file: File): Promise<any[][]> => {
  // Dynamic loading keeps the PDF parser out of the initial work-order page bundle.
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const rows: string[][] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const lines = new Map<number, Array<{ text: string; x: number }>>();

    content.items.forEach((item) => {
      if (!('str' in item) || !item.str.trim()) return;
      const x = item.transform[4];
      const y = Math.round(item.transform[5] / 3) * 3;
      const line = lines.get(y) ?? [];
      line.push({ text: item.str.trim(), x });
      lines.set(y, line);
    });

    [...lines.entries()]
      .sort(([firstY], [secondY]) => secondY - firstY)
      .forEach(([, line]) => rows.push(line.sort((first, second) => first.x - second.x).map(item => item.text)));
  }

  if (rows.length === 0) {
    throw new Error('No readable text was found in this PDF. Image-only or scanned PDFs require OCR before import.');
  }
  return rows;
};

interface ExcelImportManagerProps {
  onImport: (data: BomImportPayload) => void;
  onCancel: () => void;
}

export const ExcelImportManager: React.FC<ExcelImportManagerProps> = ({ onImport, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [purchasePreview, setPurchasePreview] = useState<any[]>([]);
  const [importSummary, setImportSummary] = useState<{ jobOrderId: string; jobCount: number; purchaseCount: number } | null>(null);
  const [fileType, setFileType] = useState<DetectedFileType | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    setStatus('parsing');
    setError(null);
    setFileType(null);
    try {
        const detectedType = await detectFileType(file);
        setFileType(detectedType);
        let json: any[][];

        if (detectedType.type === 'excel') {
          const data = new Uint8Array(await file.arrayBuffer());
          const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
          json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        } else if (detectedType.type === 'pdf') {
          json = normalisePdfBomRows(await parsePdfRows(file), file.name);
        } else {
          const text = (await file.text()).replace(/^\uFEFF/, '');
          json = detectedType.type === 'json'
            ? parseJsonRows(text)
            : parseDelimitedText(text, detectedType.type === 'tsv' ? '\t' : ',');
        }
        
        if (json.length === 0) {
          throw new Error('The uploaded file is empty.');
        }

        // 1. Locate the tool table, then extract metadata from the rows above it.
        // Excel templates usually place it on row 9; delimited and JSON files commonly use row 1.
        const headerRowIndex = findTableHeaderRow(json, detectedType.type === 'excel' ? 8 : 0);
        const headerMetadata: Record<string, string> = {};
        json.slice(0, headerRowIndex).forEach((row) => {
          for (let i = 0; i < row.length; i++) {
            const cell = row[i];
            if (cell && typeof cell === 'string') {
               const cleanCell = cell.trim();
               if (cleanCell.endsWith(':')) {
                 const key = cleanCell.replace(':', '').trim();
                 const val = row[i+1];
                 if (val) headerMetadata[key] = String(val).trim();
               } else if (['PROJECT', 'CUSTOMER', 'JOB NO.', 'TOOL NO.', 'DATE'].some(k => cleanCell.toUpperCase().includes(k))) {
                 // Try to find a value in the next 2 cells
                 const val = row[i+1] || row[i+2];
                 if (val) headerMetadata[cleanCell] = String(val).trim();
               }
            }
          }
        });

        const jobOrderId =
          headerMetadata['JOB NO.']
          || headerMetadata['TOOL NO.']
          || headerMetadata['TOOL NO']
          || headerMetadata['PROJECT']
          || 'Unknown';
        const customer = headerMetadata['CUSTOMER'] || headerMetadata['FROM'] || 'Unknown';
        const sourceFormat = detectedType.type === 'pdf' ? 'pdf' : detectedType.label.toLowerCase();

        // 2. Table data extraction starts after the detected header row.
        const jobHeaders = json[headerRowIndex] || [];
        const dataRows = json.slice(headerRowIndex + 1);

        const mappedJobs = dataRows
          .filter(row => row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== '')) // Not completely empty
          .map((row) => {
            const getVal = (keywords: string[]) => {
              const i = jobHeaders.findIndex(h => typeof h === 'string' && keywords.some(k => h.toUpperCase().includes(k)));
              return i > -1 ? row[i] : undefined;
            };

            const name = getVal(['DESCRIPTION', 'JOB NAME', 'NAME']) ?? getVal(['PART']);
            if (!name) return null; // Skip non-tool rows

            const rowNo = getVal(['NO.', 'NO', 'ITEM', '#']) || '1';

            // Extract departmental hours and determine if it's N/A
            const getProcessData = (keywords: string[]) => {
               const val = getVal(keywords);
               if (val === undefined || val === null || String(val).trim() === '' || Number(val) === 0) {
                 return { actual: 0, estimated: 0, status: 'N/A' };
               }
               return { 
                 actual: 0, 
                 estimated: Number(val), 
                 status: 'Pending' 
               };
            };

            return {
              id: `${jobOrderId}/${rowNo}`,
              name: name,
              partNumber: getVal(['PART NO', 'PART NUMBER', 'DRAWING NO']),
              qty: getVal(['QTY', 'QUANTITY']),
              material: getVal(['MAT', 'MATERIAL']),
              catalogSize: getVal(['CATALOG', 'SIZE']),
              dims: `${getVal(['T']) || '-'} x ${getVal(['W']) || '-'} x ${getVal(['L']) || '-'}`,
              supplier: getVal(['SUPPLIER', 'VENDOR']),
              startDate: getVal(['START']),
              expectedDate: getVal(['EXPECTED', 'DUE', 'E.DATE']),
              processPath: getVal(['PATH', 'PROCESS', 'CODE']),
              processes: {
                cnc: getProcessData(['C1', 'C2', 'CNC', 'G1']),
                edm: getProcessData(['EDM', 'W1', 'W2']),
                milling: getProcessData(['M', 'MILL']),
                heat: getProcessData(['HT', 'HEAT']),
                grinding: getProcessData(['GRINDING', 'G']),
                wiring: getProcessData(['WIRING', 'W']), // EDM Wire might be separate or same
                assembly: getProcessData(['ASSY', 'ASSEMBLY', 'A1'])
              }
            };
          }).filter(j => j !== null);

        const purchases = buildPurchasesFromJobs(mappedJobs, jobOrderId);

        const parsedPayload: BomImportPayload = {
          id: jobOrderId,
          customer,
          headerMetadata,
          tools: mappedJobs,
          purchases,
          sourceFormat,
        };

        // Store full payload for import
        (file as any).parsedPayload = parsedPayload;

        setPreview(mappedJobs.slice(0, 5));
        setPurchasePreview(purchases.slice(0, 5));
        setImportSummary({
          jobOrderId,
          jobCount: mappedJobs.length,
          purchaseCount: purchases.length,
        });
        setStatus('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to parse the uploaded file.');
      setStatus('error');
    }
  };

  const handleImport = () => {
    onImport((file as any).parsedPayload);
  };

  return (
    <div className="excel-import">
      {status === 'idle' && (
        <div className="upload-container" onClick={() => document.getElementById('excel-input')?.click()}>
          <Upload size={48} color="var(--accent-red)" opacity={0.5} />
          <p>Click to select or drag and drop a data file</p>
          <input 
            id="excel-input" 
            type="file" 
            accept=".xlsx,.xls,.xlsm,.xlsb,.ods,.csv,.tsv,.json,.pdf"
            style={{ display: 'none' }} 
            onChange={handleFileChange} 
          />
          <div className="format-hint">
            Supported: Excel, CSV, TSV, JSON, and text-based PDF files. The format is detected before parsing.
          </div>
        </div>
      )}

      {status === 'parsing' && (
        <div className="status-container">
          <Loader className="spin" size={32} />
          <p>Detecting file type and parsing data...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="success-container">
          <div className="status-header">
            <CheckCircle size={24} color="var(--success-green)" />
            <h3>File Ready for Import</h3>
          </div>
          <p className="file-info">
            {file?.name} · {fileType?.label}
            {importSummary && (
              <> · WO {importSummary.jobOrderId} · {importSummary.jobCount} tools · {importSummary.purchaseCount} purchase lines</>
            )}
          </p>
          
          <div className="preview-table-wrapper">
            {preview.length > 0 ? (
              <>
                <p className="preview-section-label">Production tools</p>
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Tool ID</th>
                      <th>Part Name</th>
                      <th>Material</th>
                      <th>Supplier</th>
                      <th>Path</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i}>
                        <td>{row.id}</td>
                        <td>{row.name}</td>
                        <td>{row.material || '-'}</td>
                        <td>{row.supplier || '-'}</td>
                        <td><span className="path-badge-mini">{row.processPath || '-'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className="preview-section-label">Procurement lines (auto-generated)</p>
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Material ID</th>
                      <th>Item</th>
                      <th>Specs</th>
                      <th>Qty</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchasePreview.map((row, i) => (
                      <tr key={i}>
                        <td>{row.id}</td>
                        <td>{row.name}</td>
                        <td>{row.specs}</td>
                        <td>{row.qty}</td>
                        <td>{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p>No valid tool rows extracted.</p>
            )}
          </div>
          
          <div className="import-actions">
            <button className="header-tab" onClick={() => setStatus('idle')}>Change File</button>
            <button className="pro-btn" onClick={handleImport} style={{ background: 'var(--success-green)', color: 'white' }}>
              Confirm & Import
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="error-container">
          <AlertCircle size={32} color="var(--accent-red)" />
          <h3>Import Error</h3>
          <p>{error}</p>
          <button className="pro-btn" onClick={() => setStatus('idle')} style={{ marginTop: '16px' }}>Try Again</button>
        </div>
      )}

      <style jsx>{`
        .excel-import {
          min-height: 300px;
          display: flex;
          flex-direction: column;
        }
        .upload-container {
          flex: 1;
          border: 2px dashed var(--border-color);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          cursor: pointer;
          background: var(--bg-color);
          transition: border-color 0.2s, background 0.2s;
        }
        .upload-container:hover {
          border-color: var(--accent-red);
          background: rgba(var(--accent-red-rgb), 0.05);
        }
        .format-hint {
          font-size: 11px;
          color: var(--text-tertiary);
          max-width: 300px;
          text-align: center;
        }
        .status-container, .success-container, .error-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          text-align: center;
        }
        .status-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .file-info {
          font-size: 13px;
          color: var(--text-secondary);
        }
        .preview-section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin: 12px 12px 8px;
          text-align: left;
        }
        .preview-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          margin: 12px 0;
        }
        .preview-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .preview-table th {
          background: var(--bg-color);
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
          white-space: nowrap;
        }
        .preview-table td {
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-color);
          white-space: nowrap;
        }
        .path-badge-mini {
          padding: 2px 6px;
          background: #f1f5f9;
          border-radius: 4px;
          font-family: monospace;
          font-size: 10px;
          font-weight: 700;
          color: #475569;
        }
        .dept-tag-mini {
          padding: 2px 6px;
          background: var(--accent-red-light);
          color: var(--accent-red);
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
        }
        .import-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
          color: var(--accent-red);
        }
      `}</style>
    </div>
  );
};
