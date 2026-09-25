// RFQ & Feasibility Assessment Service — Synco Manufacturing Operations
// Strictly an INTERNAL operations tool for the Operation Manager

export type RfqPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RfqStatus = 
  | 'DRAFT' 
  | 'UNDER ASSESSMENT' 
  | 'FEASIBLE' 
  | 'CONDITIONAL' 
  | 'ON HOLD' 
  | 'REJECTED' 
  | 'ACCEPTED';

export type FeasibilityRecommendation = 
  | 'FEASIBLE' 
  | 'FEASIBLE WITH CONDITIONS' 
  | 'NOT FEASIBLE' 
  | 'INSUFFICIENT DATA';

export type DecisionAction = 'PENDING' | 'CONFIRMED' | 'REJECT' | 'ACCEPT' | 'ACCEPT WITH CONDITIONS' | 'HOLD';

export type ProcessCode = 
  | 'DSN' 
  | 'MILL' 
  | 'CNC' 
  | 'GR' 
  | 'WC' 
  | 'ASSY' 
  | 'MATL' 
  | 'STD' 
  | 'OTHERS';

export interface ProcessEstimateItem {
  hours: number | null;
  days: number | null;
}

export interface RfqItem {
  id: string;
  partNumber: string;
  partName: string;
  partDescription: string;
  quantity: number;
  process: string;
  toolType: string;
  material: string;
  materialThickness: string;
  machineRequirement: string;
  specialRequirements: string;
}

export interface AttachmentItem {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadDate: string;
  uploadedBy: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

export interface CapacityCheckItem {
  process: ProcessCode;
  processName: string;
  requiredHours: number;
  availableHours: number | null;
  status: 'PASS' | 'SHORTAGE' | 'DATA_UNAVAILABLE';
  shortageHours?: number;
  notes?: string;
}

export interface FeasibilityResult {
  recommendation: FeasibilityRecommendation;
  evaluatedAt: string;
  evaluatedBy: string;
  marginPass: boolean;
  timelinePass: 'PASS' | 'AT_RISK' | 'FAIL';
  capacityPass: boolean;
  issues: string[];
  suggestedConditions: string[];
  capacityBreakdown: CapacityCheckItem[];
}

export interface OmDecision {
  action: DecisionAction;
  reason?: string;
  conditions?: string;
  decidedBy: string;
  decidedAt: string;
  feasibilitySnapshot: FeasibilityRecommendation;
}

export interface CustomerBudget {
  currency: 'RM' | 'MYR' | 'USD' | 'EUR' | 'SGD' | 'JPY' | 'INR' | 'GBP';
  customerBudget: number;
  profitPercentage?: number;
  exchangeRate: number;
  convertedBudget: number; // Stored separately for historical immutability
}

export interface RfqRecord {
  id: string;
  rfqNumber: string;
  rfqDate: string;
  internalReference: string;
  priority: RfqPriority;
  status: RfqStatus;
  preparedBy: string;
  notes: string;
  
  // Customer reference
  customerName: string;
  customerReference: string;
  
  // Requirement / Part items (support multi-items)
  projectName: string;
  items: RfqItem[];
  
  // Budget
  budget: CustomerBudget;
  
  // Timeline
  expectedStartDate: string;
  requiredEndDate: string;
  
  // Process Estimates (Hours & Days)
  processEstimates: Record<ProcessCode, ProcessEstimateItem>;
  
  // Cost Estimates
  processCosts: Record<ProcessCode, number>;
  
  // Calculated summaries (separate from raw inputs)
  calculated: {
    availableWorkingDays: number;
    estimatedLeadTimeDays: number;
    estimatedCompletionDate: string;
    bufferWorkingDays: number;
    totalInternalCost: number;
    expectedMargin: number;
    expectedMarginPercent: number;
    marginThresholdPercent: number;
    marginBelowTarget: boolean;
  };
  
  // Feasibility & Change Protection
  requirementsChanged: boolean;
  lastFeasibilityCheck: FeasibilityResult | null;
  
  // OM Decision
  decision: OmDecision | null;
  
  // Next Stage Reference
  quotationNo?: string;
  jobNo?: string;
  
  // Attachments & Audit
  attachments: AttachmentItem[];
  auditHistory: AuditLogEntry[];
  
  // Multi-tool Job Feasibility Record
  jobRecord?: import('@/types/rfq-job.types').JobRecord;

  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'synco_rfqs_store_v1';

// Standard shop capacity reference (internal baseline from factory operations)
export const SHOP_CAPACITY_LIMITS: Record<ProcessCode, { name: string; capacityHours: number; committedHours: number } | null> = {
  DSN: { name: 'Design', capacityHours: 400, committedHours: 328 },        // 72h available
  MILL: { name: 'Milling', capacityHours: 200, committedHours: 160 },      // 40h available
  CNC: { name: 'CNC Machining', capacityHours: 400, committedHours: 376 }, // 24h available
  GR: { name: 'Grinding', capacityHours: 250, committedHours: 220 },       // 30h available
  WC: { name: 'Wire Cut', capacityHours: 300, committedHours: 276 },       // 24h available
  ASSY: { name: 'Assembly', capacityHours: 250, committedHours: 220 },     // 30h available
  MATL: null, // Tracked via procurement, not machine hours
  STD: null,  // Standard components
  OTHERS: null
};

export const PROCESS_LABELS: Record<ProcessCode, string> = {
  DSN: 'Design (DSN)',
  MILL: 'Milling (MILL)',
  CNC: 'CNC Machining (CNC)',
  GR: 'Grinding (GR)',
  WC: 'Wire Cut (WC)',
  ASSY: 'Assembly (ASSY)',
  MATL: 'Material (MATL)',
  STD: 'Standard Parts (STD)',
  OTHERS: 'Others (OTHERS)'
};

// Working days calculator (excludes weekends: Saturday 6, Sunday 0)
export function calculateWorkingDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;

  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

// Add working days to a starting date
export function addWorkingDays(startDateStr: string, daysToAdd: number): string {
  if (!startDateStr) return '';
  const date = new Date(startDateStr);
  if (isNaN(date.getTime()) || daysToAdd <= 0) return startDateStr;

  let added = 0;
  while (added < daysToAdd) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) {
      added++;
    }
  }
  return date.toISOString().split('T')[0];
}

export function formatCurrency(amount: number, currency: string = 'RM'): string {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'RM' || currency === 'MYR' ? 'RM ' : currency + ' ';
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

import { createDefaultJobRfq, jobRecordToRfqRecord } from './rfq-job-calculator.service';

// Initial realistic manufacturing RFQs
const initialRfqs: RfqRecord[] = [
  // Flagship multi-tool Job RFQ as specified in the redesign requirements
  jobRecordToRfqRecord(createDefaultJobRfq()),
  {
    id: 'rfq-124',
    rfqNumber: 'RFQ-2026-00124',
    rfqDate: '2026-09-08',
    internalReference: 'INT-FUSION-01',
    priority: 'HIGH',
    status: 'CONDITIONAL',
    preparedBy: 'Alex Wong (Operation Manager)',
    notes: 'Customer requires high-precision automotive tooling with tight concentricity tolerance (±0.005mm).',
    customerName: 'ABC Automotive Solutions',
    customerReference: 'PO-REQ-88912',
    projectName: 'Part Fusion',
    items: [
      {
        id: 'item-1',
        partNumber: '1234-4567-89',
        partName: 'Part Fusion Core Die',
        partDescription: 'Multi-cavity hardened tool steel core insert',
        quantity: 1,
        process: 'Tooling',
        toolType: 'Progressive Stamping Die',
        material: 'SKD11 / D2 Tool Steel',
        materialThickness: '12.5mm',
        machineRequirement: '5-Axis High Precision CNC + Wire Cut',
        specialRequirements: 'Vacuum heat treatment to 58-60 HRC; mirror surface finish.'
      },
      {
        id: 'item-2',
        partNumber: '1234-4567-90',
        partName: 'Cavity Ejector Sub-Plate',
        partDescription: 'Ground stripper & ejector plate assembly',
        quantity: 1,
        process: 'Tooling',
        toolType: 'Auxiliary Stripper',
        material: 'S50C Carbon Steel',
        materialThickness: '25.0mm',
        machineRequirement: 'VMC CNC & Surface Grinding',
        specialRequirements: 'Pre-machined dowel holes with ground finish.'
      }
    ],
    budget: {
      currency: 'RM',
      customerBudget: 120016.8,
      exchangeRate: 1.0,
      convertedBudget: 120016.8
    },
    expectedStartDate: '2026-09-10',
    requiredEndDate: '2026-09-30',
    processEstimates: {
      DSN: { hours: 110, days: 13 },
      MILL: { hours: 103, days: 12 },
      CNC: { hours: 171, days: 8 },
      GR: { hours: 210, days: 25 },
      WC: { hours: 364, days: 16 },
      ASSY: { hours: 206, days: 24 },
      MATL: { hours: null, days: null },
      STD: { hours: null, days: null },
      OTHERS: { hours: null, days: null }
    },
    processCosts: {
      DSN: 9601.34,
      MILL: 2400.34,
      CNC: 14850.00,
      GR: 8400.00,
      WC: 16200.00,
      ASSY: 7200.00,
      MATL: 18500.00,
      STD: 4200.00,
      OTHERS: 1500.00
    },
    calculated: {
      availableWorkingDays: 15,
      estimatedLeadTimeDays: 14,
      estimatedCompletionDate: '2026-09-29',
      bufferWorkingDays: 1,
      totalInternalCost: 82851.68,
      expectedMargin: 37165.12,
      expectedMarginPercent: 30.97,
      marginThresholdPercent: 20.0,
      marginBelowTarget: false
    },
    requirementsChanged: false,
    lastFeasibilityCheck: {
      recommendation: 'FEASIBLE WITH CONDITIONS',
      evaluatedAt: '2026-09-08 09:46',
      evaluatedBy: 'Alex Wong (Operation Manager)',
      marginPass: true,
      timelinePass: 'AT_RISK',
      capacityPass: false,
      issues: [
        'Mill capacity short by 63 hours against current committed schedule (Required: 103h, Available: 40h)',
        'CNC capacity short by 147 hours against current committed schedule (Required: 171h, Available: 24h)',
        'Delivery buffer is only 1 working day (Timeline at risk if any machining delays occur)'
      ],
      suggestedConditions: [
        'Outsource 80 hours of rough CNC/Milling to approved subcontractor',
        'Negotiate delivery extension to 05 Oct 2026 (+4 working days buffer)'
      ],
      capacityBreakdown: [
        { process: 'DSN', processName: 'Design', requiredHours: 110, availableHours: 72, status: 'SHORTAGE', shortageHours: 38 },
        { process: 'MILL', processName: 'Milling', requiredHours: 103, availableHours: 40, status: 'SHORTAGE', shortageHours: 63 },
        { process: 'CNC', processName: 'CNC Machining', requiredHours: 171, availableHours: 24, status: 'SHORTAGE', shortageHours: 147 },
        { process: 'GR', processName: 'Grinding', requiredHours: 210, availableHours: 30, status: 'SHORTAGE', shortageHours: 180 },
        { process: 'WC', processName: 'Wire Cut', requiredHours: 364, availableHours: 24, status: 'SHORTAGE', shortageHours: 340 },
        { process: 'ASSY', processName: 'Assembly', requiredHours: 206, availableHours: 30, status: 'SHORTAGE', shortageHours: 176 },
        { process: 'MATL', processName: 'Material', requiredHours: 0, availableHours: null, status: 'DATA_UNAVAILABLE', notes: 'Procured via supplier catalog' },
        { process: 'STD', processName: 'Standard Parts', requiredHours: 0, availableHours: null, status: 'DATA_UNAVAILABLE', notes: 'Commercial off-the-shelf' },
        { process: 'OTHERS', processName: 'Others', requiredHours: 0, availableHours: null, status: 'DATA_UNAVAILABLE' }
      ]
    },
    decision: null,
    quotationNo: undefined,
    attachments: [
      { id: 'att-1', name: 'ABC_Fusion_CAD_Rev2.stp', size: '14.2 MB', type: 'STEP 3D Model', uploadDate: '2026-09-08 08:30', uploadedBy: 'Alex Wong' },
      { id: 'att-2', name: 'Customer_Technical_RFQ_Spec.pdf', size: '2.4 MB', type: 'PDF Document', uploadDate: '2026-09-08 08:32', uploadedBy: 'Alex Wong' }
    ],
    auditHistory: [
      { id: 'log-1', timestamp: '2026-09-08 08:30', actor: 'Alex Wong (Operation Manager)', action: 'RFQ Created', details: 'Initial RFQ created from customer email specification.' },
      { id: 'log-2', timestamp: '2026-09-08 09:20', actor: 'Alex Wong', action: 'Budget Updated', details: 'Customer budget confirmed at USD $28,440.00 (Ex. Rate 4.22 -> RM 120,016.80).' },
      { id: 'log-3', timestamp: '2026-09-08 09:45', actor: 'Alex Wong', action: 'Feasibility Assessed', details: 'System generated recommendation: FEASIBLE WITH CONDITIONS (Capacity constraints identified).' }
    ],
    createdAt: '2026-09-08 08:30',
    updatedAt: '2026-09-08 09:46'
  },
  {
    id: 'rfq-125',
    rfqNumber: 'RFQ-2026-00125',
    rfqDate: '2026-09-07',
    internalReference: 'INT-BRK-09',
    priority: 'MEDIUM',
    status: 'FEASIBLE',
    preparedBy: 'Alex Wong (Operation Manager)',
    notes: 'Structural mounting bracket tool for EV battery enclosure.',
    customerName: 'Nexus Robotics',
    customerReference: 'NR-RFQ-402',
    projectName: 'Bracket Tool',
    items: [
      {
        id: 'item-1',
        partNumber: 'BRK-7712-A',
        partName: 'Lower Bracket Former',
        partDescription: 'Hardened form punch and die block',
        quantity: 1,
        process: 'Tooling',
        toolType: 'Bending Die',
        material: 'Cr12MoV',
        materialThickness: '8.0mm',
        machineRequirement: 'CNC Milling & Wire Cut',
        specialRequirements: 'HRC 56-58, surface roughness Ra 0.8'
      }
    ],
    budget: {
      currency: 'RM',
      customerBudget: 114699.6,
      exchangeRate: 1.0,
      convertedBudget: 114699.6
    },
    expectedStartDate: '2026-09-12',
    requiredEndDate: '2026-10-05',
    processEstimates: {
      DSN: { hours: 40, days: 5 },
      MILL: { hours: 30, days: 4 },
      CNC: { hours: 20, days: 3 },
      GR: { hours: 15, days: 2 },
      WC: { hours: 20, days: 3 },
      ASSY: { hours: 25, days: 3 },
      MATL: { hours: null, days: null },
      STD: { hours: null, days: null },
      OTHERS: { hours: null, days: null }
    },
    processCosts: {
      DSN: 3200.00,
      MILL: 1800.00,
      CNC: 4200.00,
      GR: 1200.00,
      WC: 2400.00,
      ASSY: 2000.00,
      MATL: 12000.00,
      STD: 2500.00,
      OTHERS: 800.00
    },
    calculated: {
      availableWorkingDays: 16,
      estimatedLeadTimeDays: 10,
      estimatedCompletionDate: '2026-09-25',
      bufferWorkingDays: 6,
      totalInternalCost: 30100.00,
      expectedMargin: 84599.60,
      expectedMarginPercent: 73.76,
      marginThresholdPercent: 20.0,
      marginBelowTarget: false
    },
    requirementsChanged: false,
    lastFeasibilityCheck: {
      recommendation: 'FEASIBLE',
      evaluatedAt: '2026-09-07 14:10',
      evaluatedBy: 'Alex Wong (Operation Manager)',
      marginPass: true,
      timelinePass: 'PASS',
      capacityPass: true,
      issues: [],
      suggestedConditions: [],
      capacityBreakdown: [
        { process: 'DSN', processName: 'Design', requiredHours: 40, availableHours: 72, status: 'PASS' },
        { process: 'MILL', processName: 'Milling', requiredHours: 30, availableHours: 40, status: 'PASS' },
        { process: 'CNC', processName: 'CNC Machining', requiredHours: 20, availableHours: 24, status: 'PASS' },
        { process: 'GR', processName: 'Grinding', requiredHours: 15, availableHours: 30, status: 'PASS' },
        { process: 'WC', processName: 'Wire Cut', requiredHours: 20, availableHours: 24, status: 'PASS' },
        { process: 'ASSY', processName: 'Assembly', requiredHours: 25, availableHours: 30, status: 'PASS' }
      ]
    },
    decision: {
      action: 'ACCEPT',
      reason: 'Strong healthy margin of 73.8% and all production stages fit within available capacity.',
      decidedBy: 'Alex Wong (Operation Manager)',
      decidedAt: '2026-09-07 15:00',
      feasibilitySnapshot: 'FEASIBLE'
    },
    quotationNo: 'QT-0088',
    attachments: [
      { id: 'att-3', name: 'Nexus_Bracket_Drawings.dwg', size: '8.1 MB', type: 'AutoCAD DWG', uploadDate: '2026-09-07 11:20', uploadedBy: 'Alex Wong' }
    ],
    auditHistory: [
      { id: 'log-10', timestamp: '2026-09-07 11:15', actor: 'Alex Wong', action: 'RFQ Created', details: 'RFQ created for Nexus Robotics.' },
      { id: 'log-11', timestamp: '2026-09-07 14:10', actor: 'Alex Wong', action: 'Feasibility Assessed', details: 'Result: FEASIBLE.' },
      { id: 'log-12', timestamp: '2026-09-07 15:00', actor: 'Alex Wong', action: 'Decision: ACCEPTED', details: 'Operation Manager accepted RFQ. Linked to Quotation QT-0088.' }
    ],
    createdAt: '2026-09-07 11:15',
    updatedAt: '2026-09-07 15:00'
  },
  {
    id: 'rfq-126',
    rfqNumber: 'RFQ-2026-00126',
    rfqDate: '2026-09-06',
    internalReference: 'INT-PNL-10',
    priority: 'CRITICAL',
    status: 'REJECTED',
    preparedBy: 'Alex Wong (Operation Manager)',
    notes: 'Low customer budget with extremely aggressive turnaround requested.',
    customerName: 'Global Energy Tech',
    customerReference: 'GET-PANEL-099',
    projectName: 'Panel Tool',
    items: [
      {
        id: 'item-1',
        partNumber: 'PNL-5520-X',
        partName: 'Front Panel Trim Die',
        partDescription: 'Perforating and notching die set',
        quantity: 1,
        process: 'Tooling',
        toolType: 'Punching / Notching',
        material: 'DC53',
        materialThickness: '4.0mm',
        machineRequirement: 'High speed CNC & Precision EDM',
        specialRequirements: 'Fast-track delivery required.'
      }
    ],
    budget: {
      currency: 'RM',
      customerBudget: 50640.0,
      exchangeRate: 1.0,
      convertedBudget: 50640.0
    },
    expectedStartDate: '2026-09-08',
    requiredEndDate: '2026-09-18',
    processEstimates: {
      DSN: { hours: 60, days: 7 },
      MILL: { hours: 50, days: 6 },
      CNC: { hours: 80, days: 8 },
      GR: { hours: 40, days: 4 },
      WC: { hours: 60, days: 6 },
      ASSY: { hours: 40, days: 5 },
      MATL: { hours: null, days: null },
      STD: { hours: null, days: null },
      OTHERS: { hours: null, days: null }
    },
    processCosts: {
      DSN: 5400.00,
      MILL: 3500.00,
      CNC: 9600.00,
      GR: 3200.00,
      WC: 4800.00,
      ASSY: 3600.00,
      MATL: 18000.00,
      STD: 3500.00,
      OTHERS: 1200.00
    },
    calculated: {
      availableWorkingDays: 9,
      estimatedLeadTimeDays: 14,
      estimatedCompletionDate: '2026-09-28',
      bufferWorkingDays: -5,
      totalInternalCost: 52800.00,
      expectedMargin: -2160.00,
      expectedMarginPercent: -4.27,
      marginThresholdPercent: 20.0,
      marginBelowTarget: true
    },
    requirementsChanged: false,
    lastFeasibilityCheck: {
      recommendation: 'NOT FEASIBLE',
      evaluatedAt: '2026-09-06 16:30',
      evaluatedBy: 'Alex Wong (Operation Manager)',
      marginPass: false,
      timelinePass: 'FAIL',
      capacityPass: false,
      issues: [
        'Expected Margin is negative (-4.27%). Estimated internal cost (RM 52,800) exceeds customer budget (RM 50,640)',
        'Timeline shortfall of 5 working days (Required: 9 days, Estimated Lead Time: 14 days)',
        'CNC capacity short by 56 hours',
        'Wire Cut capacity short by 36 hours'
      ],
      suggestedConditions: [
        'Customer must increase budget by at least 35% (minimum $16,500 USD)',
        'Customer must extend completion date to at least 30 Sep 2026'
      ],
      capacityBreakdown: [
        { process: 'DSN', processName: 'Design', requiredHours: 60, availableHours: 72, status: 'PASS' },
        { process: 'MILL', processName: 'Milling', requiredHours: 50, availableHours: 40, status: 'SHORTAGE', shortageHours: 10 },
        { process: 'CNC', processName: 'CNC Machining', requiredHours: 80, availableHours: 24, status: 'SHORTAGE', shortageHours: 56 },
        { process: 'GR', processName: 'Grinding', requiredHours: 40, availableHours: 30, status: 'SHORTAGE', shortageHours: 10 },
        { process: 'WC', processName: 'Wire Cut', requiredHours: 60, availableHours: 24, status: 'SHORTAGE', shortageHours: 36 },
        { process: 'ASSY', processName: 'Assembly', requiredHours: 40, availableHours: 30, status: 'SHORTAGE', shortageHours: 10 }
      ]
    },
    decision: {
      action: 'REJECT',
      reason: 'Customer declined budget renegotiation and cannot extend deadline. Negative projected margin and severe timeline deficit.',
      decidedBy: 'Alex Wong (Operation Manager)',
      decidedAt: '2026-09-06 17:15',
      feasibilitySnapshot: 'NOT FEASIBLE'
    },
    attachments: [],
    auditHistory: [
      { id: 'log-20', timestamp: '2026-09-06 15:00', actor: 'Alex Wong', action: 'RFQ Created', details: 'RFQ created from urgent customer inquiry.' },
      { id: 'log-21', timestamp: '2026-09-06 16:30', actor: 'Alex Wong', action: 'Feasibility Assessed', details: 'Result: NOT FEASIBLE (Negative margin & 5-day shortfall).' },
      { id: 'log-22', timestamp: '2026-09-06 17:15', actor: 'Alex Wong', action: 'Decision: REJECTED', details: 'Operation Manager rejected RFQ due to negative margin.' }
    ],
    createdAt: '2026-09-06 15:00',
    updatedAt: '2026-09-06 17:15'
  }
];

export const RfqService = {
  getStore(): RfqRecord[] {
    if (typeof window === 'undefined') {
      return initialRfqs;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRfqs));
      return initialRfqs;
    }
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRfqs));
      return initialRfqs;
    }
  },

  saveStore(rfqs: RfqRecord[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rfqs));
    }
  },

  async getAll(): Promise<RfqRecord[]> {
    return this.getStore();
  },

  async getById(id: string): Promise<RfqRecord | null> {
    const rfqs = this.getStore();
    return rfqs.find(r => r.id === id || r.rfqNumber === id) || null;
  },

  // Calculate all derived metrics from raw inputs
  calculateMetrics(rfq: Partial<RfqRecord>): RfqRecord['calculated'] {
    const budgetAmount = rfq.budget?.customerBudget || 0;
    const rate = rfq.budget?.exchangeRate || 1;
    const convertedBudget = Number((budgetAmount * rate).toFixed(2));

    // Calculate total internal cost
    let totalInternalCost = 0;
    if (rfq.processCosts) {
      Object.values(rfq.processCosts).forEach(cost => {
        if (typeof cost === 'number' && !isNaN(cost)) {
          totalInternalCost += cost;
        }
      });
    }
    totalInternalCost = Number(totalInternalCost.toFixed(2));

    // Working days available
    const availableWorkingDays = calculateWorkingDays(
      rfq.expectedStartDate || '',
      rfq.requiredEndDate || ''
    );

    // Calculate lead time:
    // Factory rule: Serial sequence: Design -> Max(Milling, CNC, Grinding, WireCut) -> Assembly
    // Material and Std procurement run concurrently with Design
    const est = rfq.processEstimates;
    const dsnDays = est?.DSN?.days || 0;
    const machiningMaxDays = Math.max(
      est?.MILL?.days || 0,
      est?.CNC?.days || 0,
      est?.GR?.days || 0,
      est?.WC?.days || 0
    );
    const assyDays = est?.ASSY?.days || 0;
    const calculatedLeadTime = dsnDays + machiningMaxDays + assyDays;
    // Fallback: If no breakdown, use sum of any positive process days
    const fallbackSum = Object.values(est || {}).reduce((acc, curr) => acc + (curr?.days || 0), 0);
    const estimatedLeadTimeDays = calculatedLeadTime > 0 ? calculatedLeadTime : (fallbackSum > 0 ? Math.ceil(fallbackSum / 2) : 0);

    const estimatedCompletionDate = rfq.expectedStartDate 
      ? addWorkingDays(rfq.expectedStartDate, estimatedLeadTimeDays)
      : '';

    const bufferWorkingDays = availableWorkingDays - estimatedLeadTimeDays;

    const expectedMargin = Number((convertedBudget - totalInternalCost).toFixed(2));
    const expectedMarginPercent = convertedBudget > 0
      ? Number(((expectedMargin / convertedBudget) * 100).toFixed(2))
      : 0;

    const marginThresholdPercent = rfq.calculated?.marginThresholdPercent ?? 20.0;
    const marginBelowTarget = expectedMarginPercent < marginThresholdPercent;

    return {
      availableWorkingDays,
      estimatedLeadTimeDays,
      estimatedCompletionDate,
      bufferWorkingDays,
      totalInternalCost,
      expectedMargin,
      expectedMarginPercent,
      marginThresholdPercent,
      marginBelowTarget
    };
  },

  // Perform multi-factor feasibility evaluation
  runFeasibilityCheck(rfq: RfqRecord, evaluatedBy: string = 'Alex Wong (Operation Manager)'): FeasibilityResult {
    const calc = this.calculateMetrics(rfq);
    const issues: string[] = [];
    const suggestedConditions: string[] = [];
    const capacityBreakdown: CapacityCheckItem[] = [];

    // 1. Check data sufficiency
    const hasBudget = (rfq.budget?.customerBudget || 0) > 0;
    const hasTimeline = Boolean(rfq.expectedStartDate && rfq.requiredEndDate);
    const totalHours = Object.values(rfq.processEstimates).reduce((acc, curr) => acc + (curr?.hours || 0), 0);

    if (!hasBudget || !hasTimeline || totalHours === 0) {
      if (!hasBudget) issues.push('Customer budget is missing or zero.');
      if (!hasTimeline) issues.push('Required completion timeline dates are incomplete.');
      if (totalHours === 0) issues.push('No process estimation hours have been entered.');

      return {
        recommendation: 'INSUFFICIENT DATA',
        evaluatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        evaluatedBy,
        marginPass: false,
        timelinePass: 'FAIL',
        capacityPass: false,
        issues,
        suggestedConditions: ['Enter all required commercial and technical estimates before assessing.'],
        capacityBreakdown: []
      };
    }

    // 2. Commercial / Margin Check
    const marginPass = !calc.marginBelowTarget;
    if (calc.expectedMargin < 0) {
      issues.push(`Expected margin is negative (${calc.expectedMarginPercent}%). Internal cost exceeds customer budget.`);
      suggestedConditions.push(`Request customer budget increase of at least ${formatCurrency(Math.abs(calc.expectedMargin) * 1.25, rfq.budget.currency)}`);
    } else if (calc.marginBelowTarget) {
      issues.push(`Expected margin (${calc.expectedMarginPercent}%) is below company target of ${calc.marginThresholdPercent}%.`);
      suggestedConditions.push('Review material or subcontracting costs to recover target margin.');
    }

    // 3. Timeline Check
    let timelinePass: 'PASS' | 'AT_RISK' | 'FAIL' = 'PASS';
    if (calc.bufferWorkingDays < 0) {
      timelinePass = 'FAIL';
      issues.push(`Timeline shortfall: Completion will exceed deadline by ${Math.abs(calc.bufferWorkingDays)} working days.`);
      suggestedConditions.push(`Negotiate customer completion extension of at least ${Math.abs(calc.bufferWorkingDays) + 2} working days.`);
    } else if (calc.bufferWorkingDays <= 2) {
      timelinePass = 'AT_RISK';
      issues.push(`Timeline at risk: Delivery buffer is only ${calc.bufferWorkingDays} working day(s).`);
      suggestedConditions.push('Prioritize on critical machine path or arrange selective overtime.');
    }

    // 4. Shop Capacity Check
    let allCapacityPass = true;
    (Object.keys(SHOP_CAPACITY_LIMITS) as ProcessCode[]).forEach(proc => {
      const config = SHOP_CAPACITY_LIMITS[proc];
      const reqHours = rfq.processEstimates[proc]?.hours || 0;

      if (!config) {
        capacityBreakdown.push({
          process: proc,
          processName: PROCESS_LABELS[proc],
          requiredHours: reqHours,
          availableHours: null,
          status: 'DATA_UNAVAILABLE',
          notes: 'Capacity data unavailable (Managed via procurement)'
        });
      } else {
        const availableHours = Math.max(0, config.capacityHours - config.committedHours);
        if (reqHours > availableHours) {
          allCapacityPass = false;
          const shortage = reqHours - availableHours;
          capacityBreakdown.push({
            process: proc,
            processName: config.name,
            requiredHours: reqHours,
            availableHours,
            status: 'SHORTAGE',
            shortageHours: shortage
          });
          issues.push(`${config.name} capacity short by ${shortage} hours (Required: ${reqHours}h, Available: ${availableHours}h).`);
          suggestedConditions.push(`Outsource ${shortage} hours of ${config.name} or schedule weekend overtime shift.`);
        } else {
          capacityBreakdown.push({
            process: proc,
            processName: config.name,
            requiredHours: reqHours,
            availableHours,
            status: 'PASS'
          });
        }
      }
    });

    // 5. Synthesize Recommendation
    let recommendation: FeasibilityRecommendation;
    if (calc.expectedMargin < 0 || timelinePass === 'FAIL') {
      recommendation = 'NOT FEASIBLE';
    } else if (!allCapacityPass || timelinePass === 'AT_RISK' || !marginPass) {
      recommendation = 'FEASIBLE WITH CONDITIONS';
    } else {
      recommendation = 'FEASIBLE';
    }

    return {
      recommendation,
      evaluatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      evaluatedBy,
      marginPass,
      timelinePass,
      capacityPass: allCapacityPass,
      issues,
      suggestedConditions,
      capacityBreakdown
    };
  },

  // Save alias pointing to saveRfq
  async save(rfqData: Partial<RfqRecord>, actor: string = 'Alex Wong (Operation Manager)'): Promise<RfqRecord> {
    return this.saveRfq(rfqData, actor);
  },

  // Save or update an RFQ with automatic calculation & change detection
  async saveRfq(rfqData: Partial<RfqRecord>, actor: string = 'Alex Wong (Operation Manager)'): Promise<RfqRecord> {
    const rfqs = this.getStore();
    const existingIndex = rfqs.findIndex(r => r.id === rfqData.id);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    let record: RfqRecord;

    if (existingIndex >= 0) {
      const existing = rfqs[existingIndex];
      
      // Change detection: Check if critical inputs have changed
      const budgetChanged = existing.budget?.customerBudget !== rfqData.budget?.customerBudget ||
        existing.budget?.exchangeRate !== rfqData.budget?.exchangeRate;
      const datesChanged = existing.expectedStartDate !== rfqData.expectedStartDate ||
        existing.requiredEndDate !== rfqData.requiredEndDate;
      const estimatesChanged = JSON.stringify(existing.processEstimates) !== JSON.stringify(rfqData.processEstimates) ||
        JSON.stringify(existing.processCosts) !== JSON.stringify(rfqData.processCosts);
      const itemsChanged = JSON.stringify(existing.items) !== JSON.stringify(rfqData.items);

      const criticalChanged = budgetChanged || datesChanged || estimatesChanged || itemsChanged;

      // Calculate new metrics
      const calculated = this.calculateMetrics({
        ...existing,
        ...rfqData
      });

      // Maintain or invalidate feasibility
      const requirementsChanged = criticalChanged ? true : (rfqData.requirementsChanged ?? existing.requirementsChanged);

      // Log changes to audit
      const newAudit = [...existing.auditHistory];
      if (budgetChanged) {
        newAudit.unshift({
          id: `log-${Date.now()}-b`,
          timestamp: now,
          actor,
          action: 'Budget Changed',
          details: `${formatCurrency(existing.budget.customerBudget, existing.budget.currency)} → ${formatCurrency(rfqData.budget?.customerBudget || 0, rfqData.budget?.currency || 'RM')}`
        });
      }
      if (datesChanged) {
        newAudit.unshift({
          id: `log-${Date.now()}-d`,
          timestamp: now,
          actor,
          action: 'Timeline Changed',
          details: `End Date: ${existing.requiredEndDate || 'N/A'} → ${rfqData.requiredEndDate || 'N/A'}`
        });
      }
      if (criticalChanged && existing.lastFeasibilityCheck) {
        newAudit.unshift({
          id: `log-${Date.now()}-inv`,
          timestamp: now,
          actor,
          action: 'Feasibility Invalidated',
          details: 'Core requirements altered. Previous feasibility assessment marked invalid.'
        });
      }

      record = {
        ...existing,
        ...rfqData,
        calculated,
        requirementsChanged,
        auditHistory: newAudit,
        updatedAt: now
      } as RfqRecord;

      rfqs[existingIndex] = record;
    } else {
      // Create new RFQ
      const id = rfqData.id || `rfq-${Date.now().toString().slice(-5)}`;
      const rfqNumber = rfqData.rfqNumber || `RFQ-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      const calculated = this.calculateMetrics(rfqData);

      record = {
        id,
        rfqNumber,
        rfqDate: rfqData.rfqDate || now.split(' ')[0],
        internalReference: rfqData.internalReference || `INT-${id.toUpperCase()}`,
        priority: rfqData.priority || 'MEDIUM',
        status: rfqData.status || 'DRAFT',
        preparedBy: rfqData.preparedBy || actor,
        notes: rfqData.notes || '',
        customerName: rfqData.customerName || '',
        customerReference: rfqData.customerReference || '',
        projectName: rfqData.projectName || 'New Project',
        items: rfqData.items || [],
        budget: rfqData.budget || { currency: 'RM', customerBudget: 0, exchangeRate: 1.0, convertedBudget: 0 },
        expectedStartDate: rfqData.expectedStartDate || now.split(' ')[0],
        requiredEndDate: rfqData.requiredEndDate || '',
        processEstimates: rfqData.processEstimates || {
          DSN: { hours: null, days: null },
          MILL: { hours: null, days: null },
          CNC: { hours: null, days: null },
          GR: { hours: null, days: null },
          WC: { hours: null, days: null },
          ASSY: { hours: null, days: null },
          MATL: { hours: null, days: null },
          STD: { hours: null, days: null },
          OTHERS: { hours: null, days: null }
        },
        processCosts: rfqData.processCosts || {
          DSN: 0, MILL: 0, CNC: 0, GR: 0, WC: 0, ASSY: 0, MATL: 0, STD: 0, OTHERS: 0
        },
        calculated,
        requirementsChanged: false,
        lastFeasibilityCheck: null,
        decision: null,
        attachments: rfqData.attachments || [],
        auditHistory: [
          {
            id: `log-${Date.now()}`,
            timestamp: now,
            actor,
            action: 'RFQ Created',
            details: `Internal RFQ ${rfqNumber} created by ${actor}.`
          }
        ],
        createdAt: now,
        updatedAt: now
      };

      rfqs.unshift(record);
    }

    this.saveStore(rfqs);
    return record;
  },

  // Run and persist Feasibility Assessment
  async assessFeasibility(rfqId: string, actor: string = 'Alex Wong (Operation Manager)'): Promise<RfqRecord> {
    const rfqs = this.getStore();
    const rfq = rfqs.find(r => r.id === rfqId);
    if (!rfq) throw new Error('RFQ not found');

    const result = this.runFeasibilityCheck(rfq, actor);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // Update status based on feasibility recommendation
    let newStatus: RfqStatus = rfq.status;
    if (result.recommendation === 'FEASIBLE') newStatus = 'FEASIBLE';
    else if (result.recommendation === 'FEASIBLE WITH CONDITIONS') newStatus = 'CONDITIONAL';
    else if (result.recommendation === 'NOT FEASIBLE') newStatus = 'UNDER ASSESSMENT';

    rfq.lastFeasibilityCheck = result;
    rfq.requirementsChanged = false;
    rfq.status = newStatus;
    rfq.updatedAt = now;

    rfq.auditHistory.unshift({
      id: `log-${Date.now()}-eval`,
      timestamp: now,
      actor,
      action: 'Feasibility Assessed',
      details: `Recommendation: ${result.recommendation}. (${result.issues.length} issue(s) flagged)`
    });

    this.saveStore(rfqs);
    return rfq;
  },

  // Submit Operation Manager Decision
  async submitDecision(
    rfqId: string, 
    decisionData: { action: DecisionAction; reason?: string; conditions?: string },
    actor: string = 'Alex Wong (Operation Manager)'
  ): Promise<RfqRecord> {
    const rfqs = this.getStore();
    const rfq = rfqs.find(r => r.id === rfqId);
    if (!rfq) throw new Error('RFQ not found');

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const snapshot = rfq.lastFeasibilityCheck?.recommendation || 'INSUFFICIENT DATA';

    const decision: OmDecision = {
      action: decisionData.action,
      reason: decisionData.reason || '',
      conditions: decisionData.conditions || '',
      decidedBy: actor,
      decidedAt: now,
      feasibilitySnapshot: snapshot
    };

    let newStatus: RfqStatus = rfq.status;
    if (decisionData.action === 'CONFIRMED' || decisionData.action === 'ACCEPT') newStatus = 'ACCEPTED';
    else if (decisionData.action === 'REJECT') newStatus = 'REJECTED';
    else if (decisionData.action === 'PENDING') newStatus = 'UNDER ASSESSMENT';
    else if (decisionData.action === 'ACCEPT WITH CONDITIONS') newStatus = 'CONDITIONAL';
    else if (decisionData.action === 'HOLD') newStatus = 'ON HOLD';

    rfq.decision = decision;
    rfq.status = newStatus;
    rfq.updatedAt = now;

    rfq.auditHistory.unshift({
      id: `log-${Date.now()}-dec`,
      timestamp: now,
      actor,
      action: `Decision: ${decisionData.action}`,
      details: `${decisionData.reason || decisionData.conditions || 'Decision confirmed by Operation Manager.'} (Feasibility snapshot: ${snapshot})`
    });

    this.saveStore(rfqs);
    return rfq;
  },

  // Convert RFQ to Quotation Stage & Auto-generate Job Order
  async convertToQuotation(rfqId: string, actor: string = 'Alex Wong (Operation Manager)'): Promise<{ rfq: RfqRecord; quotationNo: string; jobNo: string }> {
    const rfqs = this.getStore();
    const rfq = rfqs.find(r => r.id === rfqId);
    if (!rfq) throw new Error('RFQ not found');

    // If RFQ is not yet accepted, automatically mark it as accepted upon quotation generation
    if (rfq.status !== 'ACCEPTED' && rfq.status !== 'CONDITIONAL') {
      rfq.status = 'ACCEPTED';
      rfq.decision = {
        action: 'ACCEPT',
        reason: 'Operation Manager approved RFQ and proceeded to quotation stage.',
        decidedBy: actor,
        decidedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        feasibilitySnapshot: rfq.lastFeasibilityCheck?.recommendation || 'FEASIBLE'
      };
    }

    const { QuotationService } = await import('./quotation.service');
    const { quotation, jobOrder } = await QuotationService.createFromRfq(rfq, (rfq as any).jobRecord, actor);

    rfq.quotationNo = quotation.quotationNo;
    rfq.jobNo = jobOrder.id;
    this.saveStore(rfqs);

    return { rfq, quotationNo: quotation.quotationNo, jobNo: jobOrder.id };
  }
};
