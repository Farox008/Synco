// RFQ / Job Feasibility Calculation & Scheduling Service
// Synchronizes Job budgets, tool allocations, department hours, and production timeline

import { 
  JobRecord, 
  ToolItem, 
  ToolDepartmentAllocation, 
  DepartmentKey, 
  FeasibilityStatus,
  ExistingFactoryJob,
  JobRfqStatus
} from '@/types/rfq-job.types';

// Central configuration for rates and allocations as specified
export const DEPARTMENT_CONFIG: Record<DepartmentKey, {
  label: string;
  processCode: string;
  allocationPercent: number;
  hourlyRate: number | null;
  dailyHoursLimit: number | null;
}> = {
  design: { label: 'Design', processCode: 'DSN', allocationPercent: 16, hourlyRate: 175, dailyHoursLimit: 8.5 },
  milling: { label: 'Milling', processCode: 'MILL', allocationPercent: 3, hourlyRate: 35, dailyHoursLimit: 8.5 },
  cnc: { label: 'CNC', processCode: 'CNC', allocationPercent: 15, hourlyRate: 105, dailyHoursLimit: 22.5 },
  grinding: { label: 'Grinding', processCode: 'GR', allocationPercent: 7, hourlyRate: 40, dailyHoursLimit: 8.5 },
  wireCut: { label: 'Wire Cut', processCode: 'WC', allocationPercent: 20, hourlyRate: 66, dailyHoursLimit: 22.5 },
  assembly: { label: 'Assembly', processCode: 'ASSY', allocationPercent: 6, hourlyRate: 35, dailyHoursLimit: 8.5 },
  material: { label: 'Material', processCode: 'MATL', allocationPercent: 23, hourlyRate: null, dailyHoursLimit: null },
  std: { label: 'STD', processCode: 'STD', allocationPercent: 8, hourlyRate: null, dailyHoursLimit: null },
  others: { label: 'Others', processCode: 'OTHERS', allocationPercent: 2, hourlyRate: null, dailyHoursLimit: null },
};

export const DEPARTMENT_KEYS: DepartmentKey[] = [
  'design',
  'milling',
  'cnc',
  'grinding',
  'wireCut',
  'assembly',
  'material',
  'std',
  'others'
];

export const PROFIT_PERCENTAGE = 15; // 15%
export const WORKING_BUDGET_PERCENTAGE = 85; // 85%

// Central Currency configuration & conversion helpers
export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'MYR', name: 'Malaysian Ringgit (RM)', symbol: 'RM ' },
  { code: 'RM', name: 'Ringgit Malaysia (RM)', symbol: 'RM ' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
];

export const DEFAULT_USD_RATES: Record<string, number> = {
  USD: 1.0,
  MYR: 4.22,
  RM: 4.22,
  SGD: 1.34,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 148.5,
  CNY: 7.18,
  INR: 83.5,
  AUD: 1.52,
  THB: 35.8,
};

export function getCurrencySymbol(code?: string): string {
  const normalized = (!code || code === 'RM' || code === 'MYR') ? 'MYR' : code;
  const c = SUPPORTED_CURRENCIES.find(cur => cur.code === normalized);
  return c ? c.symbol : `${code || 'RM'} `;
}

export function getDefaultExchangeRate(from: string = 'RM', to: string = 'MYR'): number {
  if (from === to || (from === 'RM' && to === 'MYR') || (from === 'MYR' && to === 'RM')) return 1.0;
  const fromRate = DEFAULT_USD_RATES[from] ?? 1.0;
  const toRate = DEFAULT_USD_RATES[to] ?? 1.0;
  const rate = toRate / fromRate;
  return Math.round(rate * 10000) / 10000;
}

export function formatCurrencyAmount(amount: number, currencyCode: string = 'RM', includeDecimals = true): string {
  if (isNaN(amount) || !isFinite(amount)) amount = 0;
  const symbol = getCurrencySymbol(currencyCode);
  return symbol + amount.toLocaleString('en-US', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: 2
  });
}

// Helper: Format default / base currency (defaults to RM / MYR across all pages)
export function formatUsd(amount: number, includeDecimals = true): string {
  return formatCurrencyAmount(amount, 'RM', includeDecimals);
}

// Helper: Format Hours
export function formatHours(hours: number | null): string {
  if (hours === null || isNaN(hours) || !isFinite(hours)) return '—';
  return hours.toFixed(2) + ' h';
}

// Working days calendar utility (excludes Saturday & Sunday)
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function addWorkingDays(startDateStr: string, daysToAdd: number): string {
  if (!startDateStr) return '';
  const date = new Date(startDateStr);
  if (isNaN(date.getTime()) || daysToAdd <= 0) return startDateStr;

  let added = 0;
  while (added < daysToAdd) {
    date.setDate(date.getDate() + 1);
    if (!isWeekend(date)) {
      added++;
    }
  }
  return date.toISOString().split('T')[0];
}

export function countWorkingDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;

  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    if (!isWeekend(cur)) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

// Calculate full Tool metrics given its customer budget
export function calculateToolMetrics(
  toolNumber: string,
  partName: string,
  customerBudget: number,
  allocationPercent: number,
  allocationType: 'PERCENTAGE' | 'FIXED_AMOUNT' = 'PERCENTAGE',
  existingId?: string,
  profitPercentage: number = 15,
  exchangeRate: number = 1.0,
  toolSpecData?: {
    partImageUrl?: string;
    partImageName?: string;
    partDrawingUrl?: string;
    partDrawingName?: string;
    toolingSizeLxbxh?: string;
    machineTonnage?: string;
    typeOfTooling?: string;
    stripInfo?: string;
    customLeadTimeDays?: number;
    expectedStartDate?: string;
    expectedEndDate?: string;
    description?: string;
  }
): ToolItem {
  const safeBudget = Math.max(0, customerBudget || 0);
  const profitPct = typeof profitPercentage === 'number' && profitPercentage >= 0 ? profitPercentage : 15;
  const rate = typeof exchangeRate === 'number' && exchangeRate > 0 ? exchangeRate : 1.0;
  
  // 1. Tool Customer Budget -> Profit % -> Working Budget (in Customer Currency)
  const profitAmount = safeBudget * (profitPct / 100);
  const workingBudget = safeBudget * ((100 - profitPct) / 100);

  // 2. Converted Budget (in Target Currency, e.g. MYR / RM)
  const convertedCustomerBudget = Math.round((safeBudget * rate) * 100) / 100;
  const convertedProfitAmount = Math.round((convertedCustomerBudget * (profitPct / 100)) * 100) / 100;
  const convertedWorkingBudget = Math.round((convertedCustomerBudget * ((100 - profitPct) / 100)) * 100) / 100;

  // 3. Department allocations & hours (Calculated ON CONVERTED WORKING BUDGET in Target Currency)
  let totalMachiningHours = 0;
  const departmentAllocations: ToolDepartmentAllocation[] = DEPARTMENT_KEYS.map(key => {
    const config = DEPARTMENT_CONFIG[key];
    // Allocated budget in Target Currency (MYR) for shopfloor rate evaluation
    const allocatedBudget = convertedWorkingBudget * (config.allocationPercent / 100);
    
    let estimatedHours: number | null = null;
    let estimatedDays: number | null = null;
    if (config.hourlyRate && config.hourlyRate > 0) {
      estimatedHours = allocatedBudget / config.hourlyRate;
      totalMachiningHours += estimatedHours;
      if (config.dailyHoursLimit && config.dailyHoursLimit > 0) {
        estimatedDays = Math.ceil(estimatedHours / config.dailyHoursLimit);
      }
    }

    return {
      key,
      department: config.label,
      processCode: config.processCode,
      allocationPercent: config.allocationPercent,
      allocatedBudget,
      hourlyRate: config.hourlyRate,
      estimatedHours,
      dailyHoursLimit: config.dailyHoursLimit,
      estimatedDays
    };
  });

  return {
    id: existingId || `tool-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    toolNumber,
    partName,
    partImageUrl: toolSpecData?.partImageUrl || '',
    partImageName: toolSpecData?.partImageName || '',
    partDrawingUrl: toolSpecData?.partDrawingUrl || '',
    partDrawingName: toolSpecData?.partDrawingName || '',
    toolingSizeLxbxh: toolSpecData?.toolingSizeLxbxh || '',
    machineTonnage: toolSpecData?.machineTonnage || '',
    typeOfTooling: toolSpecData?.typeOfTooling || '',
    stripInfo: toolSpecData?.stripInfo || '',
    customLeadTimeDays: toolSpecData?.customLeadTimeDays,
    expectedStartDate: toolSpecData?.expectedStartDate,
    expectedEndDate: toolSpecData?.expectedEndDate,
    description: toolSpecData?.description || '',
    allocationType,
    allocationPercent,
    customerBudget: safeBudget,
    profitAmount,
    workingBudget,
    convertedCustomerBudget,
    convertedProfitAmount,
    convertedWorkingBudget,
    departmentAllocations,
    totalMachiningHours,
    scheduledStartDate: '',
    scheduledEndDate: '',
    leadTimeWorkingDays: 0,
    feasibilityStatus: 'FEASIBLE',
    feasibilityIssues: []
  };
}

// Default mock factory workload for the Gantt Chart
export const DEFAULT_EXISTING_JOBS: ExistingFactoryJob[] = [
  {
    jobId: 'JOB-101',
    jobName: 'Aerospace Structural Bracket (4x)',
    customerName: 'AeroDynamics Global',
    startDate: '2026-09-15',
    endDate: '2026-09-28',
    status: 'In Progress',
    progressPercent: 65,
    departmentFocus: '5-Axis CNC & Wire Cut',
    machineUsage: {
      cnc: 4,
      milling: 2,
      grinding: 1,
      wireCut: 3
    }
  },
  {
    jobId: 'JOB-102',
    jobName: 'Medical Endoscopic Housing Die',
    customerName: 'MediPrecision Labs',
    startDate: '2026-09-19',
    endDate: '2026-10-04',
    status: 'In Progress',
    progressPercent: 40,
    departmentFocus: 'Surface Grinding & EDM',
    machineUsage: {
      cnc: 2,
      milling: 3,
      grinding: 4,
      wireCut: 2
    }
  },
  {
    jobId: 'JOB-103',
    jobName: 'Automotive Connector Module',
    customerName: 'Bosch Tier-1 Auto',
    startDate: '2026-09-24',
    endDate: '2026-10-05',
    status: 'Scheduled',
    progressPercent: 15,
    departmentFocus: 'Design & Milling',
    machineUsage: {
      cnc: 3,
      milling: 5,
      grinding: 2,
      wireCut: 1
    }
  },
  {
    jobId: 'JOB-104',
    jobName: 'Semiconductor Lead Frame Insert',
    customerName: 'SilicoPrecision',
    startDate: '2026-09-28',
    endDate: '2026-10-10',
    status: 'Pending Material',
    progressPercent: 0,
    departmentFocus: '5-Axis CNC & Assembly',
    machineUsage: {
      cnc: 5,
      milling: 1,
      grinding: 2,
      wireCut: 4
    }
  }
];

// Gantt tool scheduler
export function scheduleToolsForJob(
  startingDate: string,
  tools: ToolItem[]
): {
  scheduledTools: ToolItem[];
  factoryEstimatedCompletion: string;
  factoryCalculatedLeadTimeDays: number;
} {
  if (!startingDate || tools.length === 0) {
    return {
      scheduledTools: tools,
      factoryEstimatedCompletion: startingDate || '',
      factoryCalculatedLeadTimeDays: 0
    };
  }

  let latestCompletionDate = startingDate;

  const scheduledTools = tools.map((tool, idx) => {
    // Derived days formula: Total Machining Hours / 24 = Days
    const derivedDays = Math.max(1, Math.ceil(tool.totalMachiningHours / 24));
    
    // Stagger tool start dates if multiple tools exist or use user-provided expected dates
    const staggerOffsetDays = idx * 2;
    const toolStartDate = tool.expectedStartDate || addWorkingDays(startingDate, staggerOffsetDays);
    
    let baseLeadTimeDays = tool.customLeadTimeDays;
    if ((!baseLeadTimeDays || baseLeadTimeDays <= 0) && tool.expectedStartDate && tool.expectedEndDate) {
      baseLeadTimeDays = countWorkingDays(tool.expectedStartDate, tool.expectedEndDate);
    }
    if (!baseLeadTimeDays || baseLeadTimeDays <= 0) {
      baseLeadTimeDays = derivedDays;
    }

    const toolEndDate = tool.expectedEndDate || addWorkingDays(toolStartDate, baseLeadTimeDays);
    const actualWorkingDays = countWorkingDays(toolStartDate, toolEndDate);
    const finalLeadTimeDays = actualWorkingDays > 0 ? actualWorkingDays : baseLeadTimeDays;

    if (toolEndDate > latestCompletionDate) {
      latestCompletionDate = toolEndDate;
    }

    // Evaluate machine capacity warnings
    const issues: string[] = [];
    const cncAlloc = tool.departmentAllocations.find(d => d.key === 'cnc');
    const wcAlloc = tool.departmentAllocations.find(d => d.key === 'wireCut');

    if (cncAlloc && cncAlloc.estimatedHours && cncAlloc.estimatedHours > 50) {
      issues.push(`CNC machining requires ${cncAlloc.estimatedHours.toFixed(1)}h; potential spindle bottleneck in Week 2`);
    }
    if (wcAlloc && wcAlloc.estimatedHours && wcAlloc.estimatedHours > 60) {
      issues.push(`Wire EDM load high (${wcAlloc.estimatedHours.toFixed(1)}h); recommend splitting across 2 machines`);
    }

    let feasibilityStatus: FeasibilityStatus = 'FEASIBLE';
    if (issues.length > 0) {
      feasibilityStatus = 'AT_RISK';
    }

    return {
      ...tool,
      scheduledStartDate: toolStartDate,
      scheduledEndDate: toolEndDate,
      leadTimeWorkingDays: finalLeadTimeDays,
      feasibilityStatus,
      feasibilityIssues: issues
    };
  });

  const factoryCalculatedLeadTimeDays = countWorkingDays(startingDate, latestCompletionDate);

  return {
    scheduledTools,
    factoryEstimatedCompletion: latestCompletionDate,
    factoryCalculatedLeadTimeDays
  };
}

// Master Job recalculator
export function recalculateJob(job: JobRecord): JobRecord {
  const profitPercentage = typeof job.profitPercentage === 'number' && job.profitPercentage >= 0 ? job.profitPercentage : 15;
  const workingBudgetPct = 100 - profitPercentage;

  const currency = job.currency || 'RM';
  const targetCurrency = job.targetCurrency || 'MYR';
  const exchangeRate = typeof job.exchangeRate === 'number' && job.exchangeRate > 0
    ? job.exchangeRate
    : getDefaultExchangeRate(currency, targetCurrency);

  let updatedTools = [...job.tools];
  let totalCustomerBudget = 0;
  let totalProfit = 0;
  let totalWorkingBudget = 0;
  let budgetAllocationPercent = 0;

  if (job.budgetMode === 'MAIN_JOB') {
    const mainBudget = Math.max(0, job.mainJobBudget || 0);
    totalCustomerBudget = mainBudget;
    totalProfit = mainBudget * (profitPercentage / 100);
    totalWorkingBudget = mainBudget * (workingBudgetPct / 100);

    // Sum allocation percentages
    budgetAllocationPercent = updatedTools.reduce((acc, t) => acc + (t.allocationPercent || 0), 0);
    
    // Recalculate each tool's budget based on percentage of main budget, passing exchangeRate & toolSpecData
    updatedTools = updatedTools.map(tool => {
      const toolBudget = mainBudget * (tool.allocationPercent / 100);
      return calculateToolMetrics(
        tool.toolNumber,
        tool.partName,
        toolBudget,
        tool.allocationPercent,
        tool.allocationType,
        tool.id,
        profitPercentage,
        exchangeRate,
        {
          partImageUrl: tool.partImageUrl,
          partImageName: tool.partImageName,
          partDrawingUrl: tool.partDrawingUrl,
          partDrawingName: tool.partDrawingName,
          toolingSizeLxbxh: tool.toolingSizeLxbxh,
          machineTonnage: tool.machineTonnage,
          typeOfTooling: tool.typeOfTooling,
          stripInfo: tool.stripInfo,
          customLeadTimeDays: tool.customLeadTimeDays,
          description: tool.description
        }
      );
    });
  } else {
    // TOOL_SPECIFIC mode
    totalCustomerBudget = updatedTools.reduce((acc, t) => acc + (t.customerBudget || 0), 0);
    totalProfit = totalCustomerBudget * (profitPercentage / 100);
    totalWorkingBudget = totalCustomerBudget * (workingBudgetPct / 100);

    // Derive allocation percentage of each tool, passing exchangeRate & toolSpecData
    updatedTools = updatedTools.map(tool => {
      const percent = totalCustomerBudget > 0 ? (tool.customerBudget / totalCustomerBudget) * 100 : 0;
      return calculateToolMetrics(
        tool.toolNumber,
        tool.partName,
        tool.customerBudget,
        percent,
        tool.allocationType,
        tool.id,
        profitPercentage,
        exchangeRate,
        {
          partImageUrl: tool.partImageUrl,
          partImageName: tool.partImageName,
          partDrawingUrl: tool.partDrawingUrl,
          partDrawingName: tool.partDrawingName,
          toolingSizeLxbxh: tool.toolingSizeLxbxh,
          machineTonnage: tool.machineTonnage,
          typeOfTooling: tool.typeOfTooling,
          stripInfo: tool.stripInfo,
          customLeadTimeDays: tool.customLeadTimeDays,
          description: tool.description
        }
      );
    });

    budgetAllocationPercent = updatedTools.length > 0 ? 100 : 0;
  }

  // Round percentages cleanly
  budgetAllocationPercent = Math.round(budgetAllocationPercent * 100) / 100;
  const isBudgetAllocationValid = Math.abs(budgetAllocationPercent - 100) < 0.01;

  let budgetAllocationMessage = '';
  if (job.budgetMode === 'MAIN_JOB') {
    if (budgetAllocationPercent < 100) {
      const diff = (100 - budgetAllocationPercent).toFixed(1).replace('.0', '');
      budgetAllocationMessage = `⚠ ${diff}% of the Job budget has not been allocated.`;
    } else if (budgetAllocationPercent > 100) {
      const diff = (budgetAllocationPercent - 100).toFixed(1).replace('.0', '');
      budgetAllocationMessage = `⚠ Tool budget allocation exceeds 100% by ${diff}%.`;
    } else {
      budgetAllocationMessage = '✓ Budget fully allocated';
    }
  } else {
    budgetAllocationMessage = '✓ Tool-Specific Budget Mode: Total aggregated from tools';
  }

  // Schedule tools against factory
  const { 
    scheduledTools, 
    factoryEstimatedCompletion, 
    factoryCalculatedLeadTimeDays 
  } = scheduleToolsForJob(job.startingDate, updatedTools);

  // Compute lead time requirement and feasibility
  let requiredCompletionDate = job.requiredCompletionDate || '';
  if (job.leadTimeSource === 'CUSTOMER') {
    if (job.customerLeadTimeDays && job.customerLeadTimeDays > 0) {
      requiredCompletionDate = addWorkingDays(job.startingDate, job.customerLeadTimeDays);
    }
  } else {
    // FACTORY Calculated
    requiredCompletionDate = factoryEstimatedCompletion;
  }

  // Delivery evaluation: compare Factory Estimated Completion vs Customer Required Date
  let overallFeasibility: FeasibilityStatus = 'FEASIBLE';
  let shortfallWorkingDays = 0;
  const criticalIssues: string[] = [];

  if (job.leadTimeSource === 'CUSTOMER' && requiredCompletionDate && factoryEstimatedCompletion) {
    if (factoryEstimatedCompletion > requiredCompletionDate) {
      shortfallWorkingDays = countWorkingDays(requiredCompletionDate, factoryEstimatedCompletion) - 1;
      if (shortfallWorkingDays <= 2) {
        overallFeasibility = 'AT_RISK';
        criticalIssues.push(`Delivery timeline at risk: 2 working days shortfall against customer required date.`);
      } else {
        overallFeasibility = 'NOT_FEASIBLE';
        criticalIssues.push(`Factory schedule cannot meet required date. Shortfall: ${shortfallWorkingDays} working days.`);
      }
    }
  }

  // Check if any tools have bottleneck issues
  const toolIssues = scheduledTools.flatMap(t => t.feasibilityIssues);
  if (toolIssues.length > 0) {
    if (overallFeasibility === 'FEASIBLE') {
      overallFeasibility = 'AT_RISK';
    }
    criticalIssues.push(...toolIssues);
  }

  if (!isBudgetAllocationValid && job.budgetMode === 'MAIN_JOB') {
    if (overallFeasibility === 'FEASIBLE') {
      overallFeasibility = 'AT_RISK';
    }
    criticalIssues.push(budgetAllocationMessage);
  }

  const convertedTotalBudget = Math.round((totalCustomerBudget * exchangeRate) * 100) / 100;
  const convertedTotalProfit = Math.round((totalProfit * exchangeRate) * 100) / 100;
  const convertedWorkingBudget = Math.round((totalWorkingBudget * exchangeRate) * 100) / 100;

  return {
    ...job,
    profitPercentage,
    currency,
    targetCurrency,
    exchangeRate,
    convertedTotalBudget,
    convertedTotalProfit,
    convertedWorkingBudget,
    totalCustomerBudget,
    totalProfit,
    totalWorkingBudget,
    budgetAllocationPercent,
    isBudgetAllocationValid,
    budgetAllocationMessage,
    tools: scheduledTools,
    requiredCompletionDate,
    factoryCalculatedLeadTimeDays,
    factoryEstimatedCompletion,
    overallFeasibility,
    shortfallWorkingDays: Math.max(0, shortfallWorkingDays),
    criticalIssues
  };
}

// Initial default multi-tool Job RFQ as given in the user prompt
export function createDefaultJobRfq(): JobRecord {
  const today = '2026-09-15';
  
  // Prompt Example:
  // RFQ-2026-001 / JOB-2026-015
  // Customer: ABC Industries
  // Customer Budget: RM 100,000
  // Tools:
  // Tool 001 -> 20% (RM 20,000)
  // Tool 002 -> 35% (RM 35,000)
  // Tool 003 -> 25% (RM 25,000)
  // Tool 004 -> 20% (RM 20,000)
  const initialTools: ToolItem[] = [
    calculateToolMetrics('Tool 001', 'Main Cavity', 20000, 20, 'PERCENTAGE', 'tool-001', 15, 1.0, {
      toolingSizeLxbxh: '450 x 350 x 280 mm',
      machineTonnage: '250 T',
      typeOfTooling: 'Progressive Stamping Die',
      stripInfo: '120mm Width x 45mm Pitch',
      customLeadTimeDays: 25,
      description: 'Main cavity die plate with D2 insert blocks and precision guide pins.'
    }),
    calculateToolMetrics('Tool 002', 'Core Insert Block', 35000, 35, 'PERCENTAGE', 'tool-002', 15, 1.0, {
      toolingSizeLxbxh: '380 x 300 x 220 mm',
      machineTonnage: '180 T',
      typeOfTooling: 'Injection Mold Cavity',
      stripInfo: 'Single Strip Layout',
      customLeadTimeDays: 20,
      description: 'High-precision core insert punch block for complex geometry.'
    }),
    calculateToolMetrics('Tool 003', 'Stripper Plate & Guide', 25000, 25, 'PERCENTAGE', 'tool-003', 15, 1.0, {
      toolingSizeLxbxh: '500 x 400 x 320 mm',
      machineTonnage: '300 T',
      typeOfTooling: 'Transfer Tooling Sub-Assy',
      stripInfo: '150mm Width x 60mm Pitch',
      customLeadTimeDays: 28,
      description: 'Stripper plate & precision guide pin sub-assembly for heavy press run.'
    }),
    calculateToolMetrics('Tool 004', 'Ejector Housing Sub-Assy', 20000, 20, 'PERCENTAGE', 'tool-004', 15, 1.0, {
      toolingSizeLxbxh: '420 x 320 x 250 mm',
      machineTonnage: '200 T',
      typeOfTooling: 'Ejector Die Housing',
      stripInfo: '100mm Width x 40mm Pitch',
      customLeadTimeDays: 22,
      description: 'Bottom ejector housing sub-assembly with return pins.'
    }),
  ];

  const baseJob: JobRecord = {
    id: 'rfq-job-001',
    rfqNumber: 'RFQ-2026-001',
    jobNumber: 'JOB-2026-015',
    customer: 'ABC Industries',
    customerId: 'CUST-001',
    customerReference: 'PO-REQ-88912',
    rfqDate: '2026-09-11',
    startingDate: today,
    leadTimeSource: 'CUSTOMER',
    customerLeadTimeDays: 25, // e.g. Customer requests 25 working days -> ~20 Oct 2026
    requiredCompletionDate: '2026-10-20',
    budgetMode: 'MAIN_JOB',
    mainJobBudget: 100000,
    profitPercentage: 15,
    totalCustomerBudget: 100000,
    totalProfit: 15000,
    totalWorkingBudget: 85000,
    currency: 'RM',
    targetCurrency: 'MYR',
    exchangeRate: 1.0,
    convertedTotalBudget: 100000,
    convertedTotalProfit: 15000,
    convertedWorkingBudget: 85000,
    budgetAllocationPercent: 100,
    isBudgetAllocationValid: true,
    budgetAllocationMessage: '✓ Budget fully allocated',
    tools: initialTools,
    factoryCalculatedLeadTimeDays: 23,
    factoryEstimatedCompletion: '2026-10-18',
    overallFeasibility: 'FEASIBLE',
    shortfallWorkingDays: 0,
    criticalIssues: [],
    status: 'Pending',
    priority: 'HIGH',
    madeBy: 'Alex Wong (Operation Manager)',
    preparedBy: 'Alex Wong (Operation Manager)',
    notes: 'Multi-cavity tooling package for ABC Industries. Production scheduled across CNC, EDM and Wire Cut suites.',
    createdAt: '2026-09-11 10:00',
    updatedAt: '2026-09-11 14:30'
  };

  return recalculateJob(baseJob);
}

// Convert a legacy or existing RfqRecord to JobRecord
export function rfqRecordToJobRecord(rfq: any): JobRecord {
  if (rfq.jobRecord) {
    return recalculateJob(rfq.jobRecord);
  }

  // If RFQ is the flagship demo RFQ-2026-001 or has no tools yet
  if (rfq.rfqNumber === 'RFQ-2026-001' || rfq.rfqNumber === 'RFQ-2026-00124') {
    if (rfq.rfqNumber === 'RFQ-2026-001') {
      const defaultJob = createDefaultJobRfq();
      return recalculateJob({
        ...defaultJob,
        id: rfq.id || defaultJob.id,
        preparedBy: rfq.preparedBy || defaultJob.preparedBy
      });
    }
  }

  // Convert items in RfqRecord to ToolItems
  const items = Array.isArray(rfq.items) && rfq.items.length > 0 ? rfq.items : [];
  const customerBudgetTotal = rfq.budget?.customerBudget || 100000;
  
  const tools: ToolItem[] = items.length > 0 
    ? items.map((item: any, idx: number) => {
        const percent = items.length > 0 ? 100 / items.length : 100;
        const toolBudget = customerBudgetTotal * (percent / 100);
        return calculateToolMetrics(
          item.partNumber || `Tool 00${idx + 1}`,
          item.partName || `Part ${idx + 1}`,
          toolBudget,
          percent,
          'PERCENTAGE',
          item.id || `tool-${idx + 1}`
        );
      })
    : [
        calculateToolMetrics('Tool 001', 'Main Cavity', customerBudgetTotal * 0.2, 20, 'PERCENTAGE', 'tool-001'),
        calculateToolMetrics('Tool 002', 'Core Insert Block', customerBudgetTotal * 0.35, 35, 'PERCENTAGE', 'tool-002'),
        calculateToolMetrics('Tool 003', 'Stripper Plate & Guide', customerBudgetTotal * 0.25, 25, 'PERCENTAGE', 'tool-003'),
        calculateToolMetrics('Tool 004', 'Ejector Housing Sub-Assy', customerBudgetTotal * 0.2, 20, 'PERCENTAGE', 'tool-004'),
      ];

  const currency = rfq.budget?.currency || 'RM';
  const targetCurrency = 'MYR';
  const exchangeRate = typeof rfq.budget?.exchangeRate === 'number' && rfq.budget.exchangeRate > 0
    ? rfq.budget.exchangeRate
    : getDefaultExchangeRate(currency, targetCurrency);
  const convertedTotalBudget = rfq.budget?.convertedBudget || (customerBudgetTotal * exchangeRate);
  const profitPercentage = typeof rfq.budget?.profitPercentage === 'number' && rfq.budget.profitPercentage >= 0
    ? rfq.budget.profitPercentage
    : 15;
  const workingBudgetPct = 100 - profitPercentage;

  const baseJob: JobRecord = {
    id: rfq.id || `job-${Date.now()}`,
    rfqNumber: rfq.rfqNumber || 'RFQ-2026-001',
    jobNumber: rfq.jobNo || `JOB-2026-${Math.floor(100 + Math.random() * 900)}`,
    customer: rfq.customerName || 'ABC Industries',
    customerId: rfq.customerId || 'CUST-001',
    customerReference: rfq.customerReference || 'PO-REQ-88912',
    rfqDate: rfq.rfqDate || new Date().toISOString().split('T')[0],
    startingDate: rfq.expectedStartDate || '2026-09-15',
    leadTimeSource: rfq.requiredEndDate ? 'CUSTOMER' : 'FACTORY',
    customerLeadTimeDays: rfq.calculated?.availableWorkingDays || 25,
    requiredCompletionDate: rfq.requiredEndDate || '2026-10-20',
    budgetMode: 'MAIN_JOB',
    mainJobBudget: customerBudgetTotal,
    profitPercentage,
    totalCustomerBudget: customerBudgetTotal,
    totalProfit: customerBudgetTotal * (profitPercentage / 100),
    totalWorkingBudget: customerBudgetTotal * (workingBudgetPct / 100),
    currency,
    targetCurrency,
    exchangeRate,
    convertedTotalBudget,
    convertedTotalProfit: (customerBudgetTotal * (profitPercentage / 100)) * exchangeRate,
    convertedWorkingBudget: (customerBudgetTotal * (workingBudgetPct / 100)) * exchangeRate,
    budgetAllocationPercent: 100,
    isBudgetAllocationValid: true,
    budgetAllocationMessage: '✓ Budget fully allocated',
    tools,
    factoryCalculatedLeadTimeDays: 23,
    factoryEstimatedCompletion: '2026-10-18',
    overallFeasibility: (rfq.lastFeasibilityCheck?.recommendation === 'NOT FEASIBLE' ? 'NOT_FEASIBLE' : rfq.lastFeasibilityCheck?.recommendation === 'FEASIBLE WITH CONDITIONS' ? 'AT_RISK' : 'FEASIBLE') as FeasibilityStatus,
    shortfallWorkingDays: 0,
    criticalIssues: [],
    status: (rfq.status === 'ACCEPTED' ? 'Confirmed' : rfq.status === 'REJECTED' ? 'Reject' : 'Pending') as JobRfqStatus,
    priority: (rfq.priority as any) || 'MEDIUM',
    madeBy: rfq.madeBy || rfq.preparedBy || 'Alex Wong (Operation Manager)',
    preparedBy: rfq.preparedBy || 'Alex Wong (Operation Manager)',
    notes: rfq.notes || '',
    createdAt: rfq.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return recalculateJob(baseJob);
}

// Convert JobRecord to RfqRecord for storage compatibility
export function jobRecordToRfqRecord(job: JobRecord, originalRfq?: any): any {
  const items = job.tools.map((t) => ({
    id: t.id,
    partNumber: t.toolNumber,
    partName: t.partName,
    partDescription: `${t.partName} tooling module for ${job.customer}`,
    quantity: 1,
    process: 'Tooling',
    toolType: 'Injection / Stamping Die',
    material: 'SKD11 / S50C Tool Steel',
    materialThickness: 'Various',
    machineRequirement: '5-Axis CNC / Wire Cut',
    specialRequirements: 'Precision ground tolerance ±0.005mm'
  }));

  // Aggregate departmental hours across all tools
  const processEstimates: Record<string, { hours: number | null; days: number | null }> = {
    DSN: { hours: 0, days: 0 },
    MILL: { hours: 0, days: 0 },
    CNC: { hours: 0, days: 0 },
    GR: { hours: 0, days: 0 },
    WC: { hours: 0, days: 0 },
    ASSY: { hours: 0, days: 0 },
    MATL: { hours: null, days: null },
    STD: { hours: null, days: null },
    OTHERS: { hours: null, days: null }
  };

  const processCosts: Record<string, number> = {
    DSN: 0, MILL: 0, CNC: 0, GR: 0, WC: 0, ASSY: 0, MATL: 0, STD: 0, OTHERS: 0
  };

  job.tools.forEach(tool => {
    tool.departmentAllocations.forEach(alloc => {
      const code = alloc.processCode;
      processCosts[code] = (processCosts[code] || 0) + alloc.allocatedBudget;
      if (alloc.estimatedHours !== null && processEstimates[code]) {
        processEstimates[code].hours = (processEstimates[code].hours || 0) + alloc.estimatedHours;
        processEstimates[code].days = Math.ceil((processEstimates[code].hours || 0) / 8);
      }
    });
  });

  const profitPct = job.profitPercentage ?? 15;

  return {
    ...(originalRfq || {}),
    id: job.id,
    rfqNumber: job.rfqNumber,
    jobNo: job.jobNumber,
    rfqDate: job.rfqDate,
    internalReference: job.jobNumber || job.rfqNumber,
    priority: job.priority,
    status: (job.status === 'Confirmed' ? 'ACCEPTED' : job.status === 'Reject' ? 'REJECTED' : 'UNDER ASSESSMENT') as any,
    preparedBy: job.preparedBy,
    notes: job.notes || '',
    customerName: job.customer,
    customerId: job.customerId || '',
    customerReference: job.customerReference || `PO-REQ-${(job.jobNumber || job.rfqNumber).slice(-4)}`,
    projectName: `${job.jobNumber || job.rfqNumber} (${job.tools.length} Tools)`,
    items,
    budget: {
      currency: (job.currency as any) || 'RM',
      customerBudget: job.totalCustomerBudget,
      profitPercentage: profitPct,
      exchangeRate: job.exchangeRate || 1.0,
      convertedBudget: job.convertedTotalBudget || (job.totalCustomerBudget * (job.exchangeRate || 1.0))
    },
    expectedStartDate: job.startingDate,
    requiredEndDate: job.requiredCompletionDate || job.factoryEstimatedCompletion,
    processEstimates,
    processCosts,
    calculated: {
      availableWorkingDays: countWorkingDays(job.startingDate, job.requiredCompletionDate || job.factoryEstimatedCompletion),
      estimatedLeadTimeDays: job.factoryCalculatedLeadTimeDays,
      estimatedCompletionDate: job.factoryEstimatedCompletion,
      bufferWorkingDays: Math.max(0, -job.shortfallWorkingDays),
      totalInternalCost: job.totalWorkingBudget,
      expectedMargin: job.totalProfit,
      expectedMarginPercent: profitPct,
      marginThresholdPercent: 15,
      marginBelowTarget: false
    },
    requirementsChanged: false,
    lastFeasibilityCheck: {
      recommendation: job.overallFeasibility === 'FEASIBLE' ? 'FEASIBLE' : job.overallFeasibility === 'AT_RISK' ? 'FEASIBLE WITH CONDITIONS' : 'NOT FEASIBLE',
      evaluatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      evaluatedBy: job.preparedBy,
      marginPass: true,
      timelinePass: job.overallFeasibility === 'FEASIBLE' ? 'PASS' : job.overallFeasibility === 'AT_RISK' ? 'AT_RISK' : 'FAIL',
      capacityPass: job.overallFeasibility === 'FEASIBLE',
      issues: job.criticalIssues,
      suggestedConditions: job.overallFeasibility === 'AT_RISK' ? ['Outsource rough machining to balance CNC queue', 'Monitor wire EDM slots'] : [],
      capacityBreakdown: []
    },
    decision: null,
    attachments: originalRfq?.attachments || [],
    auditHistory: originalRfq?.auditHistory || [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        actor: job.preparedBy,
        action: 'Job RFQ Assessed',
        details: `Configured ${job.tools.length} tools. Total valuation: ${formatUsd(job.totalCustomerBudget, false)}.`
      }
    ],
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    jobRecord: job
  };
}

