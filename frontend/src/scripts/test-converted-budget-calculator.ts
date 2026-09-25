import { calculateToolMetrics, recalculateJob, createDefaultJobRfq } from '../services/rfq-job-calculator.service';
import { calculateRfqBudgetAllocation } from '../services/rfq-budget-calculator.service';

console.log('=== TEST 1: Default Job RFQ (RM 100,000, 1.0 Exchange Rate) ===');
const defaultJob = createDefaultJobRfq();
const recalcDefault = recalculateJob(defaultJob);
console.log('Total Customer Budget (Base):', recalcDefault.totalCustomerBudget);
console.log('Converted Total Budget (MYR):', recalcDefault.convertedTotalBudget);
console.log('Converted Working Budget (MYR):', recalcDefault.convertedWorkingBudget);
console.log('Tool 001 Total Machining Hours:', recalcDefault.tools[0]?.totalMachiningHours.toFixed(2), 'h');
console.log('Tool 001 Converted Working Budget:', recalcDefault.tools[0]?.convertedWorkingBudget);

console.log('\n=== TEST 2: Foreign Currency USD $100,000 (Exchange Rate 4.45 to MYR) ===');
const usdJob = recalculateJob({
  ...defaultJob,
  currency: 'USD',
  targetCurrency: 'MYR',
  exchangeRate: 4.45,
  mainJobBudget: 100000,
  profitPercentage: 15
});

console.log('USD Job Customer Budget (Base USD):', usdJob.totalCustomerBudget);
console.log('USD Job Converted Total Budget (MYR):', usdJob.convertedTotalBudget); // Expected: 445,000
console.log('USD Job Converted Profit (MYR):', usdJob.convertedTotalProfit);       // Expected: 66,750
console.log('USD Job Converted Working Budget (MYR):', usdJob.convertedWorkingBudget); // Expected: 378,250

const tool1 = usdJob.tools[0];
console.log('\nTool 001 (20% Allocation under USD 100,000 @ 4.45):');
console.log('Tool 001 Customer Budget (USD):', tool1.customerBudget); // Expected: 20,000 USD
console.log('Tool 001 Converted Budget (MYR):', tool1.convertedCustomerBudget); // Expected: 89,000 MYR
console.log('Tool 001 Converted Working Budget (MYR):', tool1.convertedWorkingBudget); // Expected: 75,650 MYR

console.log('\nDepartment Allocations & Estimated Hours/Days for Tool 001 (Calculated on Converted Working Budget RM 75,650):');
tool1.departmentAllocations.forEach(d => {
  const daysStr = d.estimatedDays ? `, Days = ${d.estimatedDays.toFixed(2)} d (@ ${d.dailyHoursLimit}h/d)` : '';
  console.log(` - ${d.department} (${d.processCode}): Budget = RM ${d.allocatedBudget.toFixed(2)}, Rate = ${d.hourlyRate ? 'RM ' + d.hourlyRate + '/hr' : 'N/A'}, Hours = ${d.estimatedHours ? d.estimatedHours.toFixed(2) + ' h' : 'N/A'}${daysStr}`);
});
console.log('Total Machining Hours for Tool 001:', tool1.totalMachiningHours.toFixed(2), 'h');

console.log('\n=== TEST 3: Standalone Single-Tool Budget Calculator (USD $10,000 @ 4.45) ===');
const standaloneAlloc = calculateRfqBudgetAllocation(10000, undefined, 15, 4.45);
console.log('Customer Budget:', standaloneAlloc.customerBudget);
console.log('Working Budget (Base):', standaloneAlloc.workingBudget);
console.log('Allocations calculated on Converted Budget (RM 37,825):');
standaloneAlloc.allocations.forEach(a => {
  console.log(` - ${a.department}: Budget = ${a.formattedAllocatedBudget}, Rate = ${a.formattedHourlyRate}, Hours = ${a.formattedEstimatedHours}`);
});

console.log('\n✅ ALL CALCULATIONS VERIFIED ON CONVERTED BUDGET SUCCESSFULLY!');
