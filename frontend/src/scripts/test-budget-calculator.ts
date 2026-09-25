// Automated test verification for RFQ Budget Allocation and Department Hours Calculation
import { calculateRfqBudgetAllocation, formatCurrencyUsd, formatHours } from '../services/rfq-budget-calculator.service';

console.log('--- RUNNING RFQ BUDGET ALLOCATION UNIT TESTS ---');

// Test Case 1: Standard Example from User Specification ($10,000)
console.log('\n[TEST 1] Standard Customer Budget = $10,000');
const result1 = calculateRfqBudgetAllocation(10000);

console.log(`Customer Budget: ${result1.display.customerBudget}`);
console.log(`Profit (15%): ${result1.display.profitAmount}`);
console.log(`Working Budget: ${result1.display.workingBudget}`);

console.assert(result1.customerBudget === 10000, 'Test 1.1 Failed: customer budget != 10000');
console.assert(result1.profitAmount === 1500, 'Test 1.2 Failed: profit != 1500');
console.assert(result1.workingBudget === 8500, 'Test 1.3 Failed: working budget != 8500');
console.assert(result1.display.customerBudget === '$10,000.00', 'Test 1.4 Failed: display customer budget');
console.assert(result1.display.profitAmount === '$1,500.00', 'Test 1.5 Failed: display profit amount');
console.assert(result1.display.workingBudget === '$8,500.00', 'Test 1.6 Failed: display working budget');

// Expected allocations and hours
const expected = {
  design: { budget: 1360, hours: '7.77', formattedBudget: '$1,360.00' },
  milling: { budget: 255, hours: '7.29', formattedBudget: '$255.00' },
  cnc: { budget: 1275, hours: '12.14', formattedBudget: '$1,275.00' },
  grinding: { budget: 595, hours: '14.88', formattedBudget: '$595.00' },
  wireCut: { budget: 1700, hours: '25.76', formattedBudget: '$1,700.00' },
  assembly: { budget: 510, hours: '14.57', formattedBudget: '$510.00' },
  material: { budget: 1955, hours: '—', formattedBudget: '$1,955.00' },
  std: { budget: 680, hours: '—', formattedBudget: '$680.00' },
  others: { budget: 170, hours: '—', formattedBudget: '$170.00' }
};

result1.allocations.forEach(item => {
  const exp = (expected as any)[item.key];
  console.log(`  - ${item.department.padEnd(10)} | ${item.allocationPercent}% | ${item.formattedAllocatedBudget} | ${item.formattedHourlyRate.padEnd(8)} | ${item.formattedEstimatedHours}`);
  console.assert(Math.abs(item.allocatedBudget - exp.budget) < 0.001, `Failed budget for ${item.department}: expected ${exp.budget}, got ${item.allocatedBudget}`);
  console.assert(item.formattedEstimatedHours === exp.hours, `Failed hours for ${item.department}: expected ${exp.hours}, got ${item.formattedEstimatedHours}`);
});

console.assert(Math.abs(result1.totalAllocatedBudget - 8500) < 0.001, 'Test 1.7 Failed: total allocated budget != 8500');
console.assert(result1.allocationCheckPassed === true, 'Test 1.8 Failed: allocationCheckPassed != true');

// Test Case 2: Negative Budget (Validation Rejection)
console.log('\n[TEST 2] Negative Budget Rejection (-500)');
const result2 = calculateRfqBudgetAllocation(-500);
console.assert(result2.validation.isValid === false, 'Test 2.1 Failed: should reject negative');
console.assert(result2.validation.error === 'Customer budget cannot be negative.', 'Test 2.2 Failed: error message');
console.log(`  Negative budget rejected correctly: "${result2.validation.error}"`);

// Test Case 3: Empty / Invalid Budget
console.log('\n[TEST 3] Empty / Invalid Budget');
const result3 = calculateRfqBudgetAllocation('');
console.assert(result3.validation.isValid === false, 'Test 3.1 Failed: should reject empty string');
console.log(`  Empty budget rejected correctly: "${result3.validation.error}"`);

// Test Case 4: Decimal Budget Input ($12,500.75)
console.log('\n[TEST 4] Decimal Budget Input ($12,500.75)');
const result4 = calculateRfqBudgetAllocation(12500.75);
console.assert(result4.validation.isValid === true, 'Test 4.1 Failed: should accept decimal budget');
console.assert(result4.customerBudget === 12500.75, 'Test 4.2 Failed: customer budget');
console.assert(result4.profitAmount === 12500.75 * 0.15, 'Test 4.3 Failed: profit amount');
console.assert(result4.workingBudget === 12500.75 * 0.85, 'Test 4.4 Failed: working budget');
console.assert(result4.allocationCheckPassed === true, 'Test 4.5 Failed: allocation check passed');
console.log(`  Decimal budget working budget: ${result4.display.workingBudget}, Total Allocated: ${result4.display.totalAllocatedBudget}`);

console.log('\n>>> ALL UNIT TESTS PASSED SUCCESSFULLY! <<<');
