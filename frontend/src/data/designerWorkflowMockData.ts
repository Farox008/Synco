import type { DesignRevision } from '@/services/db';

const departments = ['cnc', 'milling', 'heat', 'grinding', 'wiring', 'edm', 'assembly'];

function sampleFiles(toolId: string, name: string, revision: number): DesignRevision['files'] {
  const csv = `Part Number,Description,Material,Dimensions,Quantity,Unit\n${toolId}-01,Base plate,DC53,200x150x25,1,pcs\n${toolId}-02,Guide pin,EN31,20x80,4,pcs\n${toolId}-03,Socket head screw,Steel,M8x30,8,pcs\n`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" fill="white"/><g fill="none" stroke="black" stroke-width="2"><rect x="120" y="100" width="400" height="200"/><circle cx="150" cy="130" r="10"/><circle cx="490" cy="130" r="10"/><circle cx="150" cy="270" r="10"/><circle cx="490" cy="270" r="10"/><path d="M120 320v20h400v-20"/></g><g font-family="sans-serif" fill="black"><text x="32" y="40" font-size="18">${name} - Rev ${revision}</text><text x="280" y="365">200 mm</text><text x="32" y="390" font-size="12">DEMO DRAWING - NOT FOR MANUFACTURING | ${toolId}</text></g></svg>`;
  return [
    { name: `${toolId.replaceAll('/', '-')}-R${revision}.svg`, kind: 'Drawing', url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` },
    { name: `${toolId.replaceAll('/', '-')}-BOM-R${revision}.csv`, kind: 'BOM', url: `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}` },
  ];
}

export function createDesignerWorkflowMocks() {
  return [
    { id: 'DEMO-2026-001', customer: 'Atlas Precision (Demo)', name: 'Progressive Stamping Die', stage: 'draft', names: ['Upper Die Plate', 'Lower Die Plate', 'Guide Pillar Assembly'] },
    { id: 'DEMO-2026-002', customer: 'Nova Engineering (Demo)', name: 'Injection Mould Assembly', stage: 'submitted', names: ['Core Insert', 'Cavity Insert', 'Ejector Plate'] },
    { id: 'DEMO-2026-003', customer: 'Vertex Components (Demo)', name: 'Machining Fixture', stage: 'new', names: ['Fixture Base', 'Locating Block', 'Clamping Arm'] },
  ].map((sample, jobIndex) => {
    const tools = sample.names.map((name, index) => ({
      id: `${sample.id}/${index + 1}`, name, partNumber: `DEMO-P${jobIndex + 1}${index + 1}`, qty: index === 2 ? 4 : 1,
      material: index === 2 ? 'EN31' : 'DC53', dims: '200 x 150 x 25 mm', catalogSize: '200 x 150 x 25',
      designer: 'Demo Designer', status: sample.stage === 'new' ? 'Pending' : 'In Progress', progress: sample.stage === 'new' ? 0 : 25 + index * 10,
      processPath: 'M1-C1-G1-A1', startDate: '2026-09-16', expectedDate: '2026-10-02',
      headerMetadata: { 'DRAWING NO': `DEMO-DWG-${jobIndex + 1}${index + 1}`, 'MATERIAL': index === 2 ? 'EN31' : 'DC53', 'DIMENSIONS': '200 x 150 x 25 mm', 'QUANTITY': String(index === 2 ? 4 : 1), 'DATA TYPE': 'Demonstration only' },
      processes: Object.fromEntries(departments.map((department, step) => [department, {
        estimated: [8, 6, 4, 3, 2, 2, 4][step], actual: sample.stage === 'new' ? 0 : step === 0 ? 8 : step === 1 ? 2 : 0,
        status: sample.stage === 'new' ? 'Pending' : step === 0 ? 'Completed' : step === 1 ? 'In Progress' : 'Pending', machine: `${department.toUpperCase()}-01`,
      }])),
      purchases: [], history: [{ action: 'Demo tool assigned to design', time: '16.09.2026 09:00am', user: 'Demo Designer', type: 'system' }],
    }));
    const designRevisions: DesignRevision[] = [];
    if (sample.stage !== 'new') {
      for (const [index, tool] of tools.entries()) {
        if (sample.stage === 'draft' && index === 2) continue;
        const revision = index === 0 ? 2 : 1;
        designRevisions.push({ id: `${tool.id}-r${revision}`, toolId: tool.id, toolName: tool.name, revision, createdAt: `2026-09-16T0${9 - index}:00:00.000Z`, status: sample.stage === 'submitted' || index === 1 ? 'Submitted' : 'Draft', notes: revision === 2 ? 'Updated plate dimensions and guide-pin quantities (demo).' : 'Initial design and BOM package (demo).', files: sampleFiles(tool.id, tool.name, revision) });
        if (revision === 2) designRevisions.push({ id: `${tool.id}-r1`, toolId: tool.id, toolName: tool.name, revision: 1, createdAt: '2026-09-15T08:00:00.000Z', status: 'Submitted', notes: 'Original design package (demo).', files: sampleFiles(tool.id, tool.name, 1) });
      }
    }
    return { id: sample.id, customer: sample.customer, name: sample.name, createdAt: `2026-09-16T0${9 - jobIndex}:00:00.000Z`, startDate: '2026-09-16', dueDate: '2026-10-02', priority: jobIndex === 0 ? 'High' : 'Medium', status: sample.stage === 'new' ? 'Pending' : 'Running', progress: sample.stage === 'new' ? 0 : 35, items: '0/3', activeJob: tools[0].id, tools, designRevisions, purchases: [], headerMetadata: { 'DRAWING NO': `DEMO-ASM-${jobIndex + 1}`, 'REV': 'B', 'MATERIAL': 'DC53 / EN31', 'PO VALUE': 'RM 12,500.00', 'DATA TYPE': 'Demonstration only' } };
  });
}
