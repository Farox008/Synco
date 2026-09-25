// Operation Manager Service — Core Aggregator & Data Layer for Synco

export interface KpiData {
  activeJobs: { value: number; change: number; highPriority: number };
  rfqs: { new: number; awaitingAction: number; nearingDeadline: number };
  quotations: { draft: number; awaitingApproval: number; sent: number; awaitingResponse: number; totalValue: string };
  overdueJobs: { value: number; critical: number };
  revisions: { pending: number; highPriority: number; timelineAffecting: number };
  dueSoon: { value: number; days: number };
}

export interface AttentionItem {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING';
  type: 'Job' | 'Quotation' | 'Revision' | 'RFQ' | 'Design';
  refNo: string;
  description: string;
  date: string;
  status: string;
  actionLabel: string;
  link: string;
}

export interface ActiveJob {
  jobNo: string;
  customer: string;
  project: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  stage: 'RFQ' | 'Quotation' | 'Design' | 'Purchasing' | 'Production' | 'Production - CNC' | 'Production - Grinding' | 'Production - Wire Cut' | 'Production - Assembly' | 'QI' | 'Completed' | 'On Hold' | 'Cancelled';
  progress: number;
  plannedCompletion: string;
  status: 'On Track' | 'At Risk' | 'Delayed' | 'Blocked' | 'Completed';
  estimatedHours: number;
  actualHours: number;
  toolsCount: number;
}

export interface ScheduleItem {
  id: string;
  jobNo: string;
  customer: string;
  task: string;
  dueDate: string;
  urgency: 'Overdue' | 'Due Today' | 'Due within 3 days' | 'Due this week';
}

export interface SubWorkloadItem {
  name: string;
  loadPercent: number;
  allocatedHours: number;
  capacityHours: number;
  status: 'Normal' | 'Near Capacity' | 'Overloaded';
}

export interface WorkloadItem {
  department: string;
  loadPercent: number;
  allocatedHours: number;
  capacityHours: number;
  status: 'Normal' | 'Near Capacity' | 'Overloaded';
  subCenters?: SubWorkloadItem[];
}

export interface ActivityItem {
  id: string;
  time: string;
  description: string;
  type: 'job' | 'rfq' | 'quotation' | 'revision' | 'design';
  link: string;
}

export interface NotificationItem {
  id: string;
  category: 'Critical' | 'Action Required' | 'Informational';
  title: string;
  message: string;
  time: string;
  link?: string;
  read: boolean;
}

const STORAGE_KEY = 'synco_om_operational_store_v2';

interface OperationalStore {
  activeJobs: ActiveJob[];
  attentionItems: AttentionItem[];
  activities: ActivityItem[];
  notifications: NotificationItem[];
  workload: WorkloadItem[];
}

const initialJobs: ActiveJob[] = [
  {
    jobNo: 'JOB-0045',
    customer: 'ABC Automotive',
    project: 'Door Inner Panel Die',
    priority: 'HIGH',
    stage: 'Design',
    progress: 78,
    plannedCompletion: '12 Sep 2026',
    status: 'At Risk',
    estimatedHours: 120,
    actualHours: 95,
    toolsCount: 4
  },
  {
    jobNo: 'JOB-0046',
    customer: 'XYZ Motors',
    project: 'Bracket Stamping Tool',
    priority: 'MEDIUM',
    stage: 'Production - CNC',
    progress: 52,
    plannedCompletion: '15 Sep 2026',
    status: 'On Track',
    estimatedHours: 80,
    actualHours: 42,
    toolsCount: 2
  },
  {
    jobNo: 'JOB-0048',
    customer: 'Precision Aero',
    project: 'Titanium Wing Spar Jig',
    priority: 'CRITICAL',
    stage: 'Production - Wire Cut',
    progress: 88,
    plannedCompletion: '08 Sep 2026',
    status: 'Delayed',
    estimatedHours: 240,
    actualHours: 260,
    toolsCount: 6
  },
  {
    jobNo: 'JOB-0051',
    customer: 'Global Energy',
    project: 'Turbine Rotor Flange',
    priority: 'HIGH',
    stage: 'Purchasing',
    progress: 25,
    plannedCompletion: '18 Sep 2026',
    status: 'On Track',
    estimatedHours: 60,
    actualHours: 15,
    toolsCount: 1
  },
  {
    jobNo: 'JOB-0054',
    customer: 'Nexus Robotics',
    project: 'Gripper Arm Tooling',
    priority: 'HIGH',
    stage: 'Production - Grinding',
    progress: 60,
    plannedCompletion: '14 Sep 2026',
    status: 'Blocked',
    estimatedHours: 90,
    actualHours: 65,
    toolsCount: 3
  },
  {
    jobNo: 'JOB-0057',
    customer: 'BioMedical Systems',
    project: 'Surgical Tray Mold',
    priority: 'LOW',
    stage: 'Purchasing',
    progress: 10,
    plannedCompletion: '24 Sep 2026',
    status: 'On Track',
    estimatedHours: 40,
    actualHours: 4,
    toolsCount: 1
  },
  {
    jobNo: 'JOB-0059',
    customer: 'Defense Logistics',
    project: 'Armor Mount Chassis',
    priority: 'CRITICAL',
    stage: 'QI',
    progress: 94,
    plannedCompletion: '09 Sep 2026',
    status: 'On Track',
    estimatedHours: 180,
    actualHours: 172,
    toolsCount: 5
  },
  {
    jobNo: 'JOB-0062',
    customer: 'Tesla Motors',
    project: 'Battery Pack Tray Tool',
    priority: 'HIGH',
    stage: 'Production - Assembly',
    progress: 68,
    plannedCompletion: '17 Sep 2026',
    status: 'On Track',
    estimatedHours: 310,
    actualHours: 215,
    toolsCount: 8
  }
];

const initialAttention: AttentionItem[] = [
  {
    id: 'att-1',
    severity: 'CRITICAL',
    type: 'Job',
    refNo: 'JOB-0048',
    description: 'Manufacturing is 2 days behind schedule (Tool steel shortage resolved)',
    date: 'Due Today',
    status: 'Delayed',
    actionLabel: 'View Job',
    link: '/job-orders/JOB-0048'
  },
  {
    id: 'att-2',
    severity: 'HIGH',
    type: 'Quotation',
    refNo: 'QT-0088',
    description: 'Quotation approval required for Global Energy ($48,500 total value)',
    date: 'Yesterday',
    status: 'Pending Approval',
    actionLabel: 'Review',
    link: '/quotations'
  },
  {
    id: 'att-3',
    severity: 'HIGH',
    type: 'Revision',
    refNo: 'REV-0012',
    description: 'Revision request for JOB-0054 requires Operation decision on cavity rework',
    date: 'Today',
    status: 'Decision Required',
    actionLabel: 'Review',
    link: '/revisions'
  },
  {
    id: 'att-4',
    severity: 'WARNING',
    type: 'Job',
    refNo: 'JOB-0045',
    description: 'Delivery deadline in 4 days. Design review completion pending sign-off',
    date: '12 Sep',
    status: 'At Risk',
    actionLabel: 'View Job',
    link: '/job-orders/JOB-0045'
  }
];

const initialActivities: ActivityItem[] = [
  { id: 'act-1', time: '08:42', description: 'Revision #03 created for JOB-0045 (ABC Automotive)', type: 'revision', link: '/job-orders/JOB-0045' },
  { id: 'act-2', time: '08:31', description: 'Quotation #QT-0088 submitted for approval ($48,500)', type: 'quotation', link: '/quotations' },
  { id: 'act-3', time: '08:10', description: 'JOB-0062 moved to Manufacturing Stage', type: 'job', link: '/job-orders/JOB-0062' },
  { id: 'act-4', time: '07:55', description: 'Design completed for JOB-0046 by Designer Emily', type: 'design', link: '/job-orders/JOB-0046' },
  { id: 'act-5', time: '07:42', description: 'New RFQ received from BioMedical Systems (Surgical Tray Mold)', type: 'rfq', link: '/rfqs' }
];

const initialNotifications: NotificationItem[] = [
  { id: 'n-1', category: 'Critical', title: 'JOB-0048 Overdue', message: 'Delivery date exceeded by 24 hours. Customer inquiry logged.', time: '10m ago', read: false },
  { id: 'n-2', category: 'Critical', title: 'Machine Overload', message: 'VMC CNC milling line at 94% capacity limit.', time: '45m ago', read: false },
  { id: 'n-3', category: 'Action Required', title: 'Quotation Approval Needed', message: 'QT-0088 for $48,500 is waiting for your sign-off.', time: '1h ago', read: false },
  { id: 'n-4', category: 'Action Required', title: 'Revision Decision Pending', message: 'JOB-0054 cavity alteration requires review.', time: '2h ago', read: false },
  { id: 'n-5', category: 'Informational', title: 'Design Review Completed', message: 'JOB-0046 signed off by Design Manager.', time: '3h ago', read: true },
  { id: 'n-6', category: 'Informational', title: 'BOM Import Synced', message: 'Door Inner Panel Die materials catalog matched.', time: '5h ago', read: true }
];

const initialWorkload: WorkloadItem[] = [
  { 
    department: 'Design', 
    loadPercent: 82, 
    allocatedHours: 328, 
    capacityHours: 400, 
    status: 'Near Capacity' 
  },
  { 
    department: 'Purchasing', 
    loadPercent: 68, 
    allocatedHours: 136, 
    capacityHours: 200, 
    status: 'Normal' 
  },
  { 
    department: 'Production', 
    loadPercent: 91, 
    allocatedHours: 1092, 
    capacityHours: 1200, 
    status: 'Overloaded',
    subCenters: [
      { name: 'CNC', loadPercent: 94, allocatedHours: 376, capacityHours: 400, status: 'Overloaded' },
      { name: 'Grinding', loadPercent: 88, allocatedHours: 220, capacityHours: 250, status: 'Near Capacity' },
      { name: 'Wire Cut', loadPercent: 92, allocatedHours: 276, capacityHours: 300, status: 'Overloaded' },
      { name: 'Assembly', loadPercent: 88, allocatedHours: 220, capacityHours: 250, status: 'Near Capacity' }
    ]
  },
  { 
    department: 'QI', 
    loadPercent: 45, 
    allocatedHours: 90, 
    capacityHours: 200, 
    status: 'Normal' 
  }
];

export const OperationManagerService = {
  getStore(): OperationalStore {
    if (typeof window === 'undefined') {
      return {
        activeJobs: initialJobs,
        attentionItems: initialAttention,
        activities: initialActivities,
        notifications: initialNotifications,
        workload: initialWorkload
      };
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const store: OperationalStore = {
        activeJobs: initialJobs,
        attentionItems: initialAttention,
        activities: initialActivities,
        notifications: initialNotifications,
        workload: initialWorkload
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      return store;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        activeJobs: initialJobs,
        attentionItems: initialAttention,
        activities: initialActivities,
        notifications: initialNotifications,
        workload: initialWorkload
      };
    }
  },

  saveStore(store: OperationalStore) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
  },

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  async getKpis(): Promise<KpiData> {
    await this.delay(150);
    const store = this.getStore();
    const active = store.activeJobs.filter(j => j.status !== 'Completed');
    const highPriorityActive = active.filter(j => j.priority === 'HIGH' || j.priority === 'CRITICAL').length;
    const overdue = active.filter(j => j.status === 'Delayed');
    const criticalOverdue = overdue.filter(j => j.priority === 'CRITICAL').length;

    return {
      activeJobs: {
        value: active.length,
        change: 8.5,
        highPriority: highPriorityActive
      },
      rfqs: {
        new: 3,
        awaitingAction: 5,
        nearingDeadline: 2
      },
      quotations: {
        draft: 2,
        awaitingApproval: 3,
        sent: 6,
        awaitingResponse: 4,
        totalValue: '₹18,40,000'
      },
      overdueJobs: {
        value: overdue.length,
        critical: criticalOverdue
      },
      revisions: {
        pending: 4,
        highPriority: 2,
        timelineAffecting: 2
      },
      dueSoon: {
        value: 4,
        days: 3
      }
    };
  },

  async getAttentionRequired(): Promise<AttentionItem[]> {
    await this.delay(150);
    const store = this.getStore();
    return store.attentionItems;
  },

  async getActiveJobs(): Promise<ActiveJob[]> {
    await this.delay(200);
    const store = this.getStore();
    return store.activeJobs;
  },

  async getScheduleOverview(): Promise<ScheduleItem[]> {
    await this.delay(150);
    return [
      { id: 'sch-1', jobNo: 'JOB-0048', customer: 'Precision Aero', task: 'Wire Cut Machining Stage', dueDate: 'Today · 4:00 PM', urgency: 'Overdue' },
      { id: 'sch-2', jobNo: 'JOB-0045', customer: 'ABC Automotive', task: 'Design Completion Sign-off', dueDate: 'Today · 6:00 PM', urgency: 'Due Today' },
      { id: 'sch-3', jobNo: 'JOB-0054', customer: 'Nexus Robotics', task: 'Grinding Precision Check', dueDate: 'Tomorrow · 11:00 AM', urgency: 'Due within 3 days' },
      { id: 'sch-4', jobNo: 'JOB-0046', customer: 'XYZ Motors', task: 'CNC Rough Milling Inspection', dueDate: '15 Sep · 2:00 PM', urgency: 'Due this week' },
      { id: 'sch-5', jobNo: 'JOB-0062', customer: 'Tesla Motors', task: 'Assembly Verification Check', dueDate: '17 Sep · 5:00 PM', urgency: 'Due this week' }
    ];
  },

  async getWorkflowDistribution(): Promise<Record<string, number>> {
    await this.delay(150);
    const store = this.getStore();
    const dist: Record<string, number> = {
      'Design': 0,
      'Purchasing': 0,
      'Production': 0,
      'Production - CNC': 0,
      'Production - Grinding': 0,
      'Production - Wire Cut': 0,
      'Production - Assembly': 0,
      'QI': 0,
      'RFQ': 0,
      'Quotation': 0,
      'On Hold': 0
    };

    store.activeJobs.forEach(job => {
      if (dist[job.stage] !== undefined) {
        dist[job.stage]++;
      }
      if (job.stage.startsWith('Production')) {
        dist['Production']++;
      }
    });

    return dist;
  },

  async getWorkload(): Promise<WorkloadItem[]> {
    await this.delay(150);
    const store = this.getStore();
    return store.workload;
  },

  async getRecentActivity(): Promise<ActivityItem[]> {
    await this.delay(150);
    const store = this.getStore();
    return store.activities;
  },

  async getNotifications(): Promise<NotificationItem[]> {
    await this.delay(100);
    const store = this.getStore();
    return store.notifications;
  },

  // Operational Mutations
  async createJob(newJob: {
    jobNo: string;
    customer: string;
    project: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    plannedCompletion: string;
    estimatedHours: number;
  }): Promise<ActiveJob> {
    const store = this.getStore();
    const createdJob: ActiveJob = {
      ...newJob,
      stage: 'Design',
      progress: 0,
      status: 'On Track',
      actualHours: 0,
      toolsCount: 1
    };

    store.activeJobs.unshift(createdJob);
    store.activities.unshift({
      id: `act-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: `Job ${createdJob.jobNo} created for ${createdJob.customer}`,
      type: 'job',
      link: `/job-orders/${createdJob.jobNo}`
    });

    this.saveStore(store);
    return createdJob;
  },

  async createRFQ(data: {
    rfqNo: string;
    customer: string;
    partName: string;
    targetDate: string;
    estimatedValue: string;
  }) {
    const store = this.getStore();
    store.activities.unshift({
      id: `act-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: `New RFQ ${data.rfqNo} received from ${data.customer} (${data.partName})`,
      type: 'rfq',
      link: '/rfqs'
    });
    this.saveStore(store);

    // Sync with RfqService
    try {
      const { RfqService } = await import('./rfq.service');
      const numericBudget = parseFloat(data.estimatedValue.replace(/[^0-9.-]+/g, '')) || 25000;
      await RfqService.saveRfq({
        rfqNumber: data.rfqNo,
        customerName: data.customer,
        projectName: data.partName,
        requiredEndDate: data.targetDate,
        budget: {
          currency: 'RM',
          customerBudget: numericBudget,
          exchangeRate: 1.0,
          convertedBudget: numericBudget
        },
        items: [
          {
            id: `item-${Date.now()}`,
            partNumber: `PRT-${data.rfqNo.slice(-4)}`,
            partName: data.partName,
            partDescription: 'Customer required precision tooling component',
            quantity: 1,
            process: 'Tooling',
            toolType: 'Precision Die',
            material: 'SKD11',
            materialThickness: '10.0mm',
            machineRequirement: 'CNC & Wire Cut',
            specialRequirements: 'Standard factory tolerance'
          }
        ]
      });
    } catch (e) {
      console.warn('Failed to sync to RfqService:', e);
    }

    return data;
  },

  async createQuotation(data: {
    quoteNo: string;
    customer: string;
    amount: string;
    validUntil: string;
  }) {
    const store = this.getStore();
    store.activities.unshift({
      id: `act-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: `Quotation ${data.quoteNo} drafted for ${data.customer} (${data.amount})`,
      type: 'quotation',
      link: '/quotations'
    });
    this.saveStore(store);
    return data;
  },

  async createRevisionRequest(data: {
    jobNo: string;
    reason: string;
    priority: 'HIGH' | 'CRITICAL';
    assignedManager: string;
  }) {
    const store = this.getStore();
    store.attentionItems.unshift({
      id: `att-${Date.now()}`,
      severity: data.priority,
      type: 'Revision',
      refNo: `REV-${data.jobNo}`,
      description: `Revision requested for ${data.jobNo}: ${data.reason}`,
      date: 'Today',
      status: 'Decision Required',
      actionLabel: 'Review',
      link: `/job-orders/${data.jobNo}`
    });

    store.activities.unshift({
      id: `act-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: `Revision request logged for ${data.jobNo} (Assigned to ${data.assignedManager})`,
      type: 'revision',
      link: `/job-orders/${data.jobNo}`
    });

    this.saveStore(store);
    return data;
  },

  async createDesignRequest(data: {
    jobNo: string;
    toolName: string;
    deadline: string;
    instructions: string;
  }) {
    const store = this.getStore();
    store.activities.unshift({
      id: `act-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: `Design request dispatched for ${data.jobNo} (${data.toolName})`,
      type: 'design',
      link: `/job-orders/${data.jobNo}`
    });
    this.saveStore(store);
    return data;
  }
};
