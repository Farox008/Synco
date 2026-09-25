// Direct ESM verification runner for RFQ Budget Allocation and Department Hours Calculation

const feasibilityRates = {
  design: {
    allocationPercent: 16,
    hourlyRate: 175
  },
  milling: {
    allocationPercent: 3,
    hourlyRate: 35
  },
  cnc: {
    allocationPercent: 15,
    hourlyRate: 105
  },
  grinding: {
    allocationPercent: 7,
    hourlyRate: 40
  },
  wireCut: {
    allocationPercent: 20,
    hourlyRate: 66
  },
  assembly: {
    allocationPercent: 6,
    hourlyRate: 35
  },
  material: {
    allocationPercent: 23
  },
  std: {
    allocationPercent: 8
  },
  others: {
    allocationPercent: 2
  }
};

const FEASIBILITY_CATEGORY_ORDER = [
  'design', 'milling', 'cnc', 'grinding', 'wireCut', 'assembly', 'material', 'std', 'others'
];

function formatCurrencyUsd(val, includeDecimals = true) {
  if (isNaN(val) || !isFinite(val)) return 'RM 0.00';
  return 'RM ' + val.toLocaleString('en-US', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: 2
  });
}

function formatHours(val) {
  if (val === null || isNaN(val) || !isFinite(val)) return '—';
  return val.toFixed(2);
}

function calculateRfqBudgetAllocation(rawBudgetInput, customRates = feasibilityRates, customProfitPercent = 15) {
  const numericBudget = typeof rawBudgetInput === 'string' 
    ? parseFloat(rawBudgetInput.replace(/[$, ]/g, '')) 
    : rawBudgetInput;

  let validationError = undefined;
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
  const profitAmount = customerBudget * (profitPercent / 100);
  const workingBudget = customerBudget - profitAmount;

  const percentagesSum = FEASIBILITY_CATEGORY_ORDER.reduce((sum, key) => {
    return sum + (customRates[key]?.allocationPercent || 0);
  }, 0);
  const isPercentageTotalValid = Math.abs(percentagesSum - 100) < 0.0001;

  let totalAllocatedBudget = 0;
  let totalEstimatedHours = 0;

  const allocations = FEASIBILITY_CATEGORY_ORDER.map(key => {
    const rateConfig = customRates[key];
    const allocPercent = rateConfig?.allocationPercent || 0;
    const allocatedBudget = workingBudget * (allocPercent / 100);
    totalAllocatedBudget += allocatedBudget;

    const hourlyRate = rateConfig.hourlyRate || null;
    let estimatedHours = null;
    if (hourlyRate && hourlyRate > 0) {
      estimatedHours = allocatedBudget / hourlyRate;
      totalEstimatedHours += estimatedHours;
    }

    return {
      key,
      department: key.charAt(0).toUpperCase() + key.slice(1),
      allocationPercent: allocPercent,
      allocatedBudget,
      hourlyRate,
      estimatedHours,
      formattedAllocatedBudget: formatCurrencyUsd(allocatedBudget, true),
      formattedEstimatedHours: formatHours(estimatedHours),
      formattedHourlyRate: hourlyRate ? `$${hourlyRate}/hr` : '—'
    };
  });

  const isAmountTotalValid = Math.abs(totalAllocatedBudget - workingBudget) < 0.01;
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

console.log('--- VERIFYING RFQ BUDGET ALLOCATION MATHEMATICS ---');

// Test Case 1: Standard Customer Budget = $10,000
console.log('\n[TEST 1] Standard Customer Budget = $10,000');
const res1 = calculateRfqBudgetAllocation(10000);

console.log(`CUSTOMER BUDGET:   ${res1.display.customerBudget}`);
console.log(`PROFIT ALLOCATION: ${res1.display.profitPercent} -> ${res1.display.profitAmount}`);
console.log(`WORKING BUDGET:    ${res1.display.workingBudget}`);

if (res1.customerBudget !== 10000) throw new Error('Customer budget mismatch');
if (res1.profitAmount !== 1500) throw new Error('Profit amount mismatch');
if (res1.workingBudget !== 8500) throw new Error('Working budget mismatch');

console.log('\nDEPARTMENT ALLOCATION TABLE:');
console.log('Department'.padEnd(12) + '| %  | Allocated Budget | Hourly Rate | Estimated Hours');
console.log('---------------------------------------------------------------');

const expected = {
  design: { budget: 1360, hours: '7.77', rate: '$175/hr' },
  milling: { budget: 255, hours: '7.29', rate: '$35/hr' },
  cnc: { budget: 1275, hours: '12.14', rate: '$105/hr' },
  grinding: { budget: 595, hours: '14.88', rate: '$40/hr' },
  wireCut: { budget: 1700, hours: '25.76', rate: '$66/hr' },
  assembly: { budget: 510, hours: '14.57', rate: '$35/hr' },
  material: { budget: 1955, hours: '—', rate: '—' },
  std: { budget: 680, hours: '—', rate: '—' },
  others: { budget: 170, hours: '—', rate: '—' }
};

for (const item of res1.allocations) {
  const exp = expected[item.key];
  console.log(
    item.department.padEnd(12) + '| ' +
    `${item.allocationPercent}%`.padEnd(4) + '| ' +
    item.formattedAllocatedBudget.padEnd(17) + '| ' +
    item.formattedHourlyRate.padEnd(12) + '| ' +
    item.formattedEstimatedHours
  );

  if (Math.abs(item.allocatedBudget - exp.budget) > 0.001) {
    throw new Error(`Budget mismatch for ${item.key}: expected ${exp.budget}, got ${item.allocatedBudget}`);
  }
  if (item.formattedEstimatedHours !== exp.hours) {
    throw new Error(`Hours mismatch for ${item.key}: expected ${exp.hours}, got ${item.formattedEstimatedHours}`);
  }
  if (item.formattedHourlyRate !== exp.rate) {
    throw new Error(`Rate mismatch for ${item.key}: expected ${exp.rate}, got ${item.formattedHourlyRate}`);
  }
}

console.log('---------------------------------------------------------------');
console.log(`Working Budget:   ${res1.display.workingBudget}`);
console.log(`Allocated Budget: ${res1.display.totalAllocatedBudget}`);
console.log(`Allocation Check: ${res1.allocationCheckPassed ? '✓' : '✗'} ${res1.display.totalAllocationPercent}`);

if (!res1.allocationCheckPassed) throw new Error('Allocation check failed');
if (Math.abs(res1.totalAllocatedBudget - 8500) > 0.001) throw new Error('Allocated total != working budget');

// Test Case 2: Negative budget
console.log('\n[TEST 2] Negative Budget rejection (-1000):');
const res2 = calculateRfqBudgetAllocation(-1000);
if (res2.validation.isValid !== false) throw new Error('Failed to reject negative budget');
console.log(`  Rejected successfully: "${res2.validation.error}"`);

// Test Case 3: Empty budget
console.log('\n[TEST 3] Empty Budget rejection (""):');
const res3 = calculateRfqBudgetAllocation('');
if (res3.validation.isValid !== false) throw new Error('Failed to reject empty budget');
console.log(`  Rejected successfully: "${res3.validation.error}"`);

// Test Case 4: Decimal budget ($24,567.89)
console.log('\n[TEST 4] Decimal Budget ($24,567.89):');
const res4 = calculateRfqBudgetAllocation(24567.89);
if (res4.validation.isValid !== true) throw new Error('Failed to accept decimal budget');
console.log(`  Working budget: ${res4.display.workingBudget}, Total allocated: ${res4.display.totalAllocatedBudget}, Check: ${res4.allocationCheckPassed ? '✓' : '✗'}`);

console.log('\n>>> ALL SPECIFICATION CHECKS PASSED WITH 100% ACCURACY! <<<');
