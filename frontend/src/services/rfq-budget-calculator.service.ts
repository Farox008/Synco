// RFQ Budget Allocation & Department Hours Calculator Service
// Operation Manager Feasibility Engine — Synco Manufacturing Operations

import { 
  feasibilityRates, 
  DEFAULT_PROFIT_PERCENT, 
  FEASIBILITY_CATEGORY_ORDER, 
  FEASIBILITY_CATEGORY_METADATA,
  FeasibilityCategoryKey, 
  FeasibilityRatesConfig 
} from '@/config/feasibility-rates.config';

export interface DepartmentAllocationResult {
  key: FeasibilityCategoryKey;
  department: string;
  processCode: string;
  description: string;
  allocationPercent: number;
  allocatedBudget: number; // Raw floating-point amount
  hourlyRate: number | null;
  estimatedHours: number | null; // Raw floating-point hours (or null for non-hourly)
  
  // Formatted display values (2 decimal places)
  formattedAllocatedBudget: string;
  formattedEstimatedHours: string;
  formattedHourlyRate: string;
}

export interface BudgetCalculationValidation {
  isValid: boolean;
  error?: string;
  percentagesSum: number;
  isPercentageTotalValid: boolean;
  amountsSum: number;
  isAmountTotalValid: boolean;
}

export interface RfqBudgetAllocationResult {
  // Original Input (immutable)
  customerBudget: number;
  
  // Profit & Working Budget
  profitPercent: number;
  profitAmount: number;
  workingBudget: number;
  
  // Department Allocations
  allocations: DepartmentAllocationResult[];
  
  // Totals & Verification
  totalAllocatedBudget: number;
  totalEstimatedHours: number;
  totalAllocationPercent: number;
  allocationCheckPassed: boolean;
  
  // Formatted display strings
  display: {
    customerBudget: string;
    profitPercent: string;
    profitAmount: string;
    workingBudget: string;
    totalAllocatedBudget: string;
    totalEstimatedHours: string;
    totalAllocationPercent: string;
  };
  
  // Validation status
  validation: BudgetCalculationValidation;
}

/**
 * Helper to format currency numbers cleanly to 2 decimal places with comma separation.
 * Example: 1360 -> "$1,360.00" (or "$1,360" depending on requirement)
 */
export function formatCurrencyUsd(val: number, includeDecimals = true): string {
  if (isNaN(val) || !isFinite(val)) return 'RM 0.00';
  return 'RM ' + val.toLocaleString('en-US', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: 2
  });
}

/**
 * Helper to format hours to 2 decimal places.
 * Example: 7.771428... -> "7.77"
 */
export function formatHours(val: number | null): string {
  if (val === null || isNaN(val) || !isFinite(val)) return '—';
  return val.toFixed(2);
}

/**
 * Core Calculation Logic
 * Sequence:
 * 1. Validate customer budget (reject negative, reject invalid)
 * 2. Calculate Profit (15%)
 * 3. Calculate Working Budget (85%)
 * 4. Allocate Working Budget across 9 departments (100% total)
 * 5. Calculate Department Hours (Allocated Amount / Hourly Rate)
 * 6. Verify totals and return full precision state + display formatted values
 */
export function calculateRfqBudgetAllocation(
  rawBudgetInput: number | string,
  customRates: FeasibilityRatesConfig = feasibilityRates,
  customProfitPercent: number = DEFAULT_PROFIT_PERCENT,
  exchangeRate: number = 1.0
): RfqBudgetAllocationResult {
  // 1. Validation of customer budget
  const numericBudget = typeof rawBudgetInput === 'string' 
    ? parseFloat(rawBudgetInput.replace(/[$, ]/g, '')) 
    : rawBudgetInput;

  let validationError: string | undefined = undefined;
  let isValid = true;

  if (rawBudgetInput === '' || rawBudgetInput === null || rawBudgetInput === undefined || isNaN(numericBudget)) {
    isValid = false;
    validationError = 'Customer budget is required and must be a valid number.';
  } else if (numericBudget < 0) {
    isValid = false;
    validationError = 'Customer budget cannot be negative.';
  }

  const customerBudget = isValid ? numericBudget : 0;
  const profitPercent = customProfitPercent;
  const rate = typeof exchangeRate === 'number' && exchangeRate > 0 ? exchangeRate : 1.0;

  // 2. Profit Allocation & Converted Working Budget
  const profitAmount = customerBudget * (profitPercent / 100);
  const workingBudget = customerBudget - profitAmount;

  // Converted budgets (in target currency, MYR)
  const convertedWorkingBudget = workingBudget * rate;

  // Verify rates percentage sum
  const percentagesSum = FEASIBILITY_CATEGORY_ORDER.reduce((sum, key) => {
    return sum + (customRates[key]?.allocationPercent || 0);
  }, 0);
  const isPercentageTotalValid = Math.abs(percentagesSum - 100) < 0.0001;

  // 4 & 5. Working Budget Allocation & Department Hour Calculations (ON CONVERTED WORKING BUDGET)
  let totalAllocatedBudget = 0;
  let totalEstimatedHours = 0;

  const allocations: DepartmentAllocationResult[] = FEASIBILITY_CATEGORY_ORDER.map(key => {
    const rateConfig = customRates[key];
    const meta = FEASIBILITY_CATEGORY_METADATA[key];
    const allocPercent = rateConfig?.allocationPercent || 0;
    
    // IMPORTANT: Allocated Amount calculated on Converted Working Budget in Target Currency (MYR)
    const allocatedBudget = convertedWorkingBudget * (allocPercent / 100);
    totalAllocatedBudget += allocatedBudget;

    const hourlyRate = 'hourlyRate' in rateConfig ? (rateConfig.hourlyRate as number) : null;
    
    // Department Hours = Converted Allocated Amount / Hourly Rate (MYR/hr)
    let estimatedHours: number | null = null;
    if (hourlyRate && hourlyRate > 0) {
      estimatedHours = allocatedBudget / hourlyRate;
      totalEstimatedHours += estimatedHours;
    }

    return {
      key,
      department: meta.label,
      processCode: meta.processCode,
      description: meta.description,
      allocationPercent: allocPercent,
      allocatedBudget,
      hourlyRate,
      estimatedHours,
      formattedAllocatedBudget: formatCurrencyUsd(allocatedBudget, true),
      formattedEstimatedHours: formatHours(estimatedHours),
      formattedHourlyRate: hourlyRate ? `$${hourlyRate}/hr` : '—'
    };
  });

  // Verify amounts sum matches converted working budget within rounding tolerance
  const isAmountTotalValid = Math.abs(totalAllocatedBudget - convertedWorkingBudget) < 0.01;
  const allocationCheckPassed = isPercentageTotalValid && isAmountTotalValid;

  return {
    customerBudget,
    profitPercent,
    profitAmount,
    workingBudget,
    allocations,
    totalAllocatedBudget,
    totalEstimatedHours,
    totalAllocationPercent: percentagesSum,
    allocationCheckPassed,
    display: {
      customerBudget: formatCurrencyUsd(customerBudget, true),
      profitPercent: `${profitPercent}%`,
      profitAmount: formatCurrencyUsd(profitAmount, true),
      workingBudget: formatCurrencyUsd(workingBudget, true),
      totalAllocatedBudget: formatCurrencyUsd(totalAllocatedBudget, true),
      totalEstimatedHours: formatHours(totalEstimatedHours),
      totalAllocationPercent: `${percentagesSum}%`
    },
    validation: {
      isValid,
      error: validationError,
      percentagesSum,
      isPercentageTotalValid,
      amountsSum: totalAllocatedBudget,
      isAmountTotalValid
    }
  };
}
