import { 
  generateJobOrders, generateMachines, generateAuditLogs, 
  generateRecentJobs, generateProductionStats, generatePurchases 
} from './demoGenerator';

export const productionStats = generateProductionStats();

export const kpiMetrics = [
  { title: 'Total Production', value: '12,482', sub: '+5.12% ↗', trend: 'up' },
  { title: 'Completed Tools', value: '8,421', sub: '+1.23% ↗', trend: 'up' },
  { title: 'Pending Tasks', value: '2,154', sub: '-2.44% ↘', trend: 'down' },
  { title: 'Scrap Parts', value: '412', sub: '-12.5% ↘', trend: 'down' },
];

export const recentTools = generateRecentJobs(30);

export const jobOrders = generateJobOrders(20);

export const activeTools = [
  { id: 'WO-9800/1', name: 'Main Engine Chassis', cnc: 100, milling: 85, heat: 45, grinding: 0, edm: 0 },
  { id: 'WO-9801/1', name: 'Front Hub Assy', cnc: 100, milling: 100, heat: 100, grinding: 65, edm: 0 },
  { id: 'WO-9802/1', name: 'Titanium Valve', cnc: 100, milling: 100, heat: 100, grinding: 100, edm: 80 },
  { id: 'WO-9803/1', name: 'Engine Mount', cnc: 45, milling: 20, heat: 0, grinding: 0, edm: 0 },
  { id: 'WO-9804/1', name: 'Transmission Housing', cnc: 10, milling: 0, heat: 0, grinding: 0, edm: 0 },
  { id: 'WO-9805/1', name: 'Steering Shaft', cnc: 30, milling: 15, heat: 0, grinding: 0, edm: 0 },
  { id: 'WO-9806/1', name: 'Fuel System Assy', cnc: 90, milling: 80, heat: 70, grinding: 50, edm: 0 },
];

export const machineFleet = generateMachines(25);

export const auditLogs = generateAuditLogs(100);

export const delayedTools = [
  { id: 'WO-9807/1', name: 'Tra. Housing', reason: 'Material Shortage', timeLost: '4.5h', impact: 'High' },
  { id: 'WO-9808/1', name: 'Steering Shaft', reason: 'Tooling Breakage', timeLost: '2.0h', impact: 'Medium' },
  { id: 'WO-9809/1', name: 'Engine Mount', reason: 'Operator Unavailable', timeLost: '1.5h', impact: 'Low' },
];

export const delaySummary = {
  totalDelay: '42.5 hours',
  activeDelays: 12,
  trend: '+5% from yesterday',
  status: 'Warning Level'
};

export const toolStatusBreakdown = [
  { label: 'Running', value: 45, color: 'var(--success-green)' },
  { label: 'Pending', value: 22, color: 'var(--text-tertiary)' },
  { label: 'Completed', value: 156, color: '#1976D2' },
  { label: 'Delayed', value: 12, color: 'var(--accent-red)' },
];

export const recentPurchases = generatePurchases(20);

export const jobOrdersExtended = generateJobOrders(100);

export const jobOrderMetrics = [
  { title: 'Total Job Orders', value: '412', sub: '+18% ↗', trend: 'up' },
  { title: 'In Progress', value: '62', sub: '+12% ↗', trend: 'up' },
  { title: 'Completed Month', value: '184', sub: '+5.4% ↗', trend: 'up' },
  { title: 'Critical Delays', value: '8', sub: '+2% ↗', trend: 'up' },
  { title: 'Pending Approval', value: '14', sub: '-1% ↘', trend: 'down' },
];
