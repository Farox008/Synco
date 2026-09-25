// RFQ / Job / Tool Feasibility Hierarchy Data Models
// Operation Manager Feasibility & Production Planning Workspace

export type JobLeadTimeSource = 'CUSTOMER' | 'FACTORY';
export type JobBudgetMode = 'MAIN_JOB' | 'TOOL_SPECIFIC';
export type ToolAllocationType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export type FeasibilityStatus = 'FEASIBLE' | 'AT_RISK' | 'NOT_FEASIBLE';

export type DepartmentKey = 
  | 'design' 
  | 'milling' 
  | 'cnc' 
  | 'grinding' 
  | 'wireCut' 
  | 'assembly' 
  | 'material' 
  | 'std' 
  | 'others';

export interface ToolDepartmentAllocation {
  key: DepartmentKey;
  department: string;
  processCode: string;
  allocationPercent: number; // e.g. 16 for 16%
  allocatedBudget: number;   // Calculated from working budget
  hourlyRate: number | null; // e.g. 175 for Design, null for material/std/others
  estimatedHours: number | null; // allocatedBudget / hourlyRate
  dailyHoursLimit?: number | null; // e.g. 8.5 for Design/Milling/Grinding/Assembly, 22.5 for CNC/Wire Cut
  estimatedDays?: number | null;  // estimatedHours / dailyHoursLimit
}

export interface ToolItem {
  id: string;
  toolNumber: string;        // e.g. "Tool 001", "P-001"
  partName: string;          // e.g. "Main Cavity"
  partImageUrl?: string;     // URL or Base64 Image
  partImageName?: string;    // Original Part Image Filename
  partDrawingUrl?: string;   // URL or Base64 Technical Drawing
  partDrawingName?: string;  // Original Part Drawing Filename
  toolingSizeLxbxh?: string;  // L x B x H (mm), e.g. "450 x 350 x 280 mm"
  machineTonnage?: string;    // M/C Tonnage (Tons), e.g. "250 T"
  typeOfTooling?: string;     // Type of Tooling, e.g. "Progressive Stamping Die"
  stripInfo?: string;         // Strip layout / info, e.g. "120mm Width x 45mm Pitch"
  customLeadTimeDays?: number; // Custom lead time in working days
  expectedStartDate?: string;  // Expected Start Date (YYYY-MM-DD)
  expectedEndDate?: string;    // Expected End Date (YYYY-MM-DD)
  description?: string;       // Tool description / technical remarks
  allocationType: ToolAllocationType;
  allocationPercent: number; // e.g. 20 (20%)
  customerBudget: number;    // e.g. 20000 (RM 20,000)
  profitAmount: number;      // 15% = RM 3,000
  workingBudget: number;     // 85% = RM 17,000
  convertedCustomerBudget?: number; // Budget in target currency (MYR)
  convertedProfitAmount?: number;   // Profit in target currency (MYR)
  convertedWorkingBudget?: number;  // Working budget in target currency (MYR)
  departmentAllocations: ToolDepartmentAllocation[];
  totalMachiningHours: number; // Sum of estimated hours across departments
  scheduledStartDate: string;  // e.g. "2026-09-28"
  scheduledEndDate: string;    // e.g. "2026-10-09"
  leadTimeWorkingDays: number;
  feasibilityStatus: FeasibilityStatus;
  feasibilityIssues: string[];
}

export interface ExistingFactoryJob {
  jobId: string;
  jobName: string;
  customerName: string;
  startDate: string;
  endDate: string;
  status: 'In Progress' | 'Scheduled' | 'Pending Material';
  progressPercent: number;
  departmentFocus: string;
  machineUsage?: {
    cnc?: number;
    milling?: number;
    grinding?: number;
    wireCut?: number;
  };
}

export type JobRfqStatus = 'Pending' | 'Confirmed' | 'Reject';

export interface JobRecord {
  id: string;
  rfqNumber: string;         // e.g. "RFQ-2026-001"
  jobNumber?: string;        // Optional, automatically created if confirmed
  internalReference?: string;// Internal reference number, e.g. "INT-2026-001"
  customer: string;          // e.g. "ABC Industries"
  customerId?: string;       // Customer ID, e.g. "CUST-001"
  customerReference?: string;// Customer Reference Number, e.g. "PO-REQ-9921"
  rfqDate: string;           // RFQ created date (auto-filled, cannot be changed)
  startingDate: string;      // YYYY-MM-DD
  expectedStartDate?: string;// Expected Start Date alias (YYYY-MM-DD)
  expectedEndDate?: string;  // Expected End Date alias (YYYY-MM-DD)
  
  // Lead Time & Completion
  leadTimeSource: JobLeadTimeSource;
  customerLeadTimeDays?: number;      // Working days provided by customer
  requiredCompletionDate?: string;    // YYYY-MM-DD
  
  // Budget
  budgetMode: JobBudgetMode;          // 'MAIN_JOB' or 'TOOL_SPECIFIC'
  mainJobBudget?: number;             // When in MAIN_JOB mode, e.g. 100000
  profitPercentage?: number;          // Customer profit percentage, e.g. 15 (default: 15)
  totalCustomerBudget: number;        // Job customer budget (RM)
  totalProfit: number;                // Customer profit (RM)
  totalWorkingBudget: number;         // Working budget (RM)
  
  // Currency Conversion
  currency?: string;                  // Base/Customer currency, e.g. 'RM' or 'MYR'
  targetCurrency?: string;            // Target conversion currency, e.g. 'MYR'
  exchangeRate?: number;              // Exchange rate, e.g. 1.0
  convertedTotalBudget?: number;      // Budget in target currency
  convertedTotalProfit?: number;      // Profit in target currency
  convertedWorkingBudget?: number;    // Working budget in target currency
  
  // Budget Validation
  budgetAllocationPercent: number;    // Sum of tool percentages (Target 100%)
  isBudgetAllocationValid: boolean;   // Exactly 100% (within 0.01 tolerance)
  budgetAllocationMessage: string;    // e.g. "✓ Budget fully allocated" or "⚠ 15% of the Job budget has not been allocated."
  
  // Tools
  tools: ToolItem[];
  
  // Scheduling & Feasibility
  factoryCalculatedLeadTimeDays: number; // Lead time derived by factory sequence
  factoryEstimatedCompletion: string;   // YYYY-MM-DD
  overallFeasibility: FeasibilityStatus;
  shortfallWorkingDays: number;         // Positive if factory exceeds customer date
  criticalIssues: string[];
  
  // Status & Metadata
  status: JobRfqStatus;      // 'Pending' | 'Confirmed' | 'Reject' (default 'Pending')
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  madeBy: string;            // Created by user / OM
  preparedBy: string;        // Compatibility alias
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
