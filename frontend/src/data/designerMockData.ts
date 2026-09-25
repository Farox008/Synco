export const designerKpiMetrics = [
  { title: 'Assigned Tools', value: '14', sub: '+2 this week', trend: 'up' },
  { title: 'Pending Designs', value: '5', sub: '-1 from last week', trend: 'down' },
  { title: 'In Progress', value: '4', sub: '', trend: 'up' },
  { title: 'Revision Requests', value: '2', sub: 'Needs attention', trend: 'down' },
  { title: 'Completed Today', value: '1', sub: '', trend: 'up' },
  { title: 'Awaiting BOM Upload', value: '3', sub: '', trend: 'up' },
  { title: 'Overdue Designs', value: '0', sub: 'On track', trend: 'up' },
  { title: 'Design Approvals', value: '12', sub: '+3 this week', trend: 'up' },
];

export const assignedTools = [
  { id: 'T-8091', jobOrder: 'WO-1001', customer: 'Acme Corp', name: 'Widget Component', revision: 'A', priority: 'High', dueDate: '2026-08-10', status: 'In Progress', progress: 45, assignedBy: 'A001' },
  { id: 'T-8092', jobOrder: 'WO-1002', customer: 'Stark Ind', name: 'Thruster Housing', revision: 'B', priority: 'Critical', dueDate: '2026-08-08', status: 'Pending', progress: 0, assignedBy: 'D001' },
  { id: 'T-8093', jobOrder: 'WO-1003', customer: 'Wayne Ent', name: 'Armor Plate', revision: 'A', priority: 'Normal', dueDate: '2026-08-15', status: 'Awaiting BOM', progress: 90, assignedBy: 'A001' },
  { id: 'T-8094', jobOrder: 'WO-1004', customer: 'LexCorp', name: 'Lens Mount', revision: 'C', priority: 'High', dueDate: '2026-08-12', status: 'Revision', progress: 20, assignedBy: 'D001' },
  { id: 'T-8095', jobOrder: 'WO-1005', customer: 'Oscorp', name: 'Bio-Chamber', revision: 'A', priority: 'Normal', dueDate: '2026-08-20', status: 'In Progress', progress: 60, assignedBy: 'A001' },
];

export const designProgressData = [
  { label: 'Pending', value: 5, color: '#9A9FA5' },
  { label: 'In Progress', value: 4, color: '#1976D2' },
  { label: 'Awaiting Review', value: 2, color: '#F39C12' },
  { label: 'Ready for BOM', value: 3, color: '#8E44AD' },
  { label: 'Completed', value: 12, color: '#27AE60' },
];

export const upcomingDeadlines = [
  { title: 'Thruster Housing Design', type: 'Design Due', time: 'Tomorrow', urgency: 'high' },
  { title: 'Widget Component', type: 'Design Due', time: '2026-08-10', urgency: 'medium' },
  { title: 'Armor Plate BOM Upload', type: 'BOM Due', time: '2026-08-15', urgency: 'low' },
];

export const designerActivity = [
  { id: 1, action: 'Drawing Uploaded', target: 'T-8091 Widget Component v2', time: '10 mins ago', type: 'upload' },
  { id: 2, action: 'BOM Uploaded', target: 'T-8089 Engine Bracket', time: '2 hours ago', type: 'bom' },
  { id: 3, action: 'Revision Created', target: 'T-8094 Lens Mount Rev C', time: 'Yesterday', type: 'revision' },
  { id: 4, action: 'Tool Assigned', target: 'T-8095 Bio-Chamber by Admin Root', time: 'Yesterday', type: 'assignment' },
];

export const designerNotifications = [
  { id: 1, title: 'New Assignment', message: 'You have been assigned T-8095 Bio-Chamber.', time: '1 day ago' },
  { id: 2, title: 'Revision Request', message: 'T-8094 Lens Mount requires dimension update.', time: '1 day ago' },
  { id: 3, title: 'Design Approved', message: 'T-8088 Chassis Frame approved by D001.', time: '2 days ago' },
];

export const designVersions = [
  { tool: 'T-8094', revision: 'C', date: '2026-08-06', author: 'D002', status: 'Draft' },
  { tool: 'T-8094', revision: 'B', date: '2026-07-20', author: 'D002', status: 'Rejected' },
  { tool: 'T-8094', revision: 'A', date: '2026-07-10', author: 'D001', status: 'Approved' },
];

export const monthlyPerformance = [
  { month: 'Jan', completed: 12, revisions: 3 },
  { month: 'Feb', completed: 15, revisions: 2 },
  { month: 'Mar', completed: 14, revisions: 4 },
  { month: 'Apr', completed: 18, revisions: 1 },
  { month: 'May', completed: 20, revisions: 2 },
  { month: 'Jun', completed: 22, revisions: 3 },
];

export const recentFiles = [
  { name: 'T-8091_Widget_v2.dwg', type: 'CAD', date: 'Today' },
  { name: 'T-8089_BOM_Final.csv', type: 'BOM', date: 'Yesterday' },
  { name: 'T-8094_LensMount_Specs.pdf', type: 'PDF', date: '2 days ago' },
];
