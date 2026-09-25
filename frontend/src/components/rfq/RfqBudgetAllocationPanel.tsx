"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  calculateRfqBudgetAllocation, 
  RfqBudgetAllocationResult, 
  formatCurrencyUsd, 
  formatHours 
} from '@/services/rfq-budget-calculator.service';
import { 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Clock, 
  Percent, 
  ArrowRight,
  Info,
  Check
} from 'lucide-react';

interface RfqBudgetAllocationPanelProps {
  initialBudget?: number;
  onBudgetChange?: (budget: number) => void;
  onApplyToEstimates?: (data: {
    allocations: RfqBudgetAllocationResult['allocations'];
    hoursMap: Record<string, number>;
    costsMap: Record<string, number>;
  }) => void;
  readOnly?: boolean;
}

export default function RfqBudgetAllocationPanel({
  initialBudget = 10000,
  onBudgetChange,
  onApplyToEstimates,
  readOnly = false
}: RfqBudgetAllocationPanelProps) {
  // Budget input raw string state for smooth typing including decimals
  const [budgetInput, setBudgetInput] = useState<string>(
    initialBudget && initialBudget > 0 ? initialBudget.toString() : '10000'
  );
  const [profitInput, setProfitInput] = useState<string>('15');
  const [appliedFeedback, setAppliedFeedback] = useState(false);

  // Sync if parent initialBudget changes externally
  useEffect(() => {
    if (initialBudget !== undefined && initialBudget !== null) {
      const currentNum = parseFloat(budgetInput.replace(/[$, ]/g, ''));
      if (initialBudget !== currentNum && !isNaN(initialBudget)) {
        setBudgetInput(initialBudget.toString());
      }
    }
  }, [initialBudget]);

  // Automatic recalculation on input change
  const calcResult: RfqBudgetAllocationResult = useMemo(() => {
    const pNum = parseFloat(profitInput);
    const profitPct = isNaN(pNum) || pNum < 0 ? 15 : pNum;
    return calculateRfqBudgetAllocation(budgetInput, undefined, profitPct);
  }, [budgetInput, profitInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setBudgetInput(rawVal);
    
    // Notify parent if valid
    const num = parseFloat(rawVal.replace(/[$, ]/g, ''));
    if (!isNaN(num) && num >= 0 && onBudgetChange) {
      onBudgetChange(num);
    }
  };

  const handleApply = () => {
    if (!onApplyToEstimates || !calcResult.validation.isValid) return;

    const hoursMap: Record<string, number> = {};
    const costsMap: Record<string, number> = {};

    calcResult.allocations.forEach(item => {
      costsMap[item.processCode] = Number(item.allocatedBudget.toFixed(2));
      if (item.estimatedHours !== null) {
        hoursMap[item.processCode] = Number(item.estimatedHours.toFixed(2));
      }
    });

    onApplyToEstimates({
      allocations: calcResult.allocations,
      hoursMap,
      costsMap
    });

    setAppliedFeedback(true);
    setTimeout(() => setAppliedFeedback(false), 3000);
  };

  const handleQuickPreset = (amount: number) => {
    if (readOnly) return;
    setBudgetInput(amount.toString());
    if (onBudgetChange) onBudgetChange(amount);
  };

  const isInvalid = !calcResult.validation.isValid;

  return (
    <div 
      className="card rfq-budget-allocation-panel" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
        padding: '24px'
      }}
    >
      {/* Header & Description */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              backgroundColor: '#EFF6FF', 
              color: '#2563EB', 
              padding: '4px 8px', 
              borderRadius: '6px', 
              fontSize: '11px', 
              fontWeight: 700, 
              letterSpacing: '0.04em' 
            }}>
              OPERATION MANAGER FEASIBILITY
            </span>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
              RFQ Budget Allocation & Department Hours Calculation
            </h3>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            System sequence: Customer Budget → 15% Profit Allocation → 85% Working Budget → 100% Department Allocation → Hourly Rate Calculations
          </p>
        </div>

        {/* Quick presets */}
        {!readOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>PRESETS:</span>
            {[5000, 10000, 25000, 50000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickPreset(val)}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  backgroundColor: budgetInput === val.toString() ? '#1E293B' : '#F1F5F9',
                  color: budgetInput === val.toString() ? '#FFFFFF' : '#475569',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ${(val / 1000)}k
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 1. Customer Budget Input Field */}
      <div style={{
        backgroundColor: '#F8FAFC',
        border: `1px solid ${isInvalid ? 'var(--accent-red)' : '#E2E8F0'}`,
        borderRadius: '10px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <label 
              htmlFor="customer-budget-input" 
              style={{ 
                fontSize: '13px', 
                fontWeight: 700, 
                color: 'var(--text-primary)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px' 
              }}
            >
              <DollarSign size={16} style={{ color: 'var(--accent-red)' }} />
              Customer Budget (RM)
            </label>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Enter the total customer RFQ budget. Starting point for all department allocations.
            </span>
          </div>

          {/* Currency Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                position: 'absolute', 
                left: '10px', 
                fontSize: '14px', 
                fontWeight: 700, 
                color: isInvalid ? 'var(--accent-red)' : '#64748B',
                pointerEvents: 'none'
              }}>
                RM
              </span>
              <input
                id="customer-budget-input"
                type="number"
                min="0"
                step="any"
                disabled={readOnly}
                placeholder="10000.00"
                value={budgetInput}
                onChange={handleInputChange}
                style={{
                  padding: '8px 14px 8px 36px',
                  fontSize: '16px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  width: '200px',
                  backgroundColor: '#FFFFFF',
                  border: `2px solid ${isInvalid ? 'var(--accent-red)' : '#CBD5E1'}`,
                  borderRadius: '8px',
                  color: isInvalid ? 'var(--accent-red)' : 'var(--text-primary)',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Validation Error Message */}
        {isInvalid && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '12px', 
            color: 'var(--accent-red)', 
            fontWeight: 600 
          }}>
            <AlertTriangle size={14} />
            <span>{calcResult.validation.error}</span>
          </div>
        )}
      </div>

      {/* 2. Top Metric Cards: Customer Budget | Profit Allocation (15%) | Working Budget */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {/* Customer Budget */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
            CUSTOMER BUDGET
          </div>
          <div style={{ 
            fontSize: '22px', 
            fontWeight: 800, 
            fontFamily: 'monospace', 
            color: isInvalid ? 'var(--text-tertiary)' : 'var(--text-primary)' 
          }}>
            {calcResult.display.customerBudget}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
            Original starting figure (100%)
          </div>
        </div>

        {/* Profit Allocation */}
        <div style={{
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#166534' }}>
              PROFIT ALLOCATION
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={profitInput}
                onChange={(e) => !readOnly && setProfitInput(e.target.value)}
                disabled={readOnly}
                title="Edit profit percentage (Default: 15%)"
                style={{
                  width: '48px',
                  padding: '2px 4px',
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor: '#DCFCE7',
                  color: '#15803D',
                  border: '1px solid #86EFAC',
                  borderRadius: '6px',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803D' }}>%</span>
            </div>
          </div>
          <div style={{ 
            fontSize: '22px', 
            fontWeight: 800, 
            fontFamily: 'monospace', 
            color: isInvalid ? 'var(--text-tertiary)' : '#15803D' 
          }}>
            {calcResult.display.profitAmount}
          </div>
          <div style={{ fontSize: '11px', color: '#166534' }}>
            Reserved customer profit margin
          </div>
        </div>

        {/* Working Budget */}
        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1E40AF' }}>
              WORKING BUDGET
            </span>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: 800, 
              backgroundColor: '#DBEAFE', 
              color: '#1D4ED8', 
              padding: '2px 8px', 
              borderRadius: '999px' 
            }}>
              85%
            </span>
          </div>
          <div style={{ 
            fontSize: '22px', 
            fontWeight: 800, 
            fontFamily: 'monospace', 
            color: isInvalid ? 'var(--text-tertiary)' : '#1E40AF' 
          }}>
            {calcResult.display.workingBudget}
          </div>
          <div style={{ fontSize: '11px', color: '#1E40AF' }}>
            Available for department operations
          </div>
        </div>
      </div>

      {/* 3. Budget Allocation Table */}
      <div style={{ overflowX: 'auto' }}>
        <table 
          style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            fontSize: '13px',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)'
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Department
              </th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right', width: '90px' }}>
                %
              </th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right', width: '170px' }}>
                Allocated Budget
              </th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right', width: '140px' }}>
                Hourly Rate
              </th>
              <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right', width: '160px' }}>
                Estimated Hours
              </th>
            </tr>
          </thead>
          <tbody>
            {calcResult.allocations.map((item, index) => {
              const isNonMachining = item.hourlyRate === null;
              return (
                <tr 
                  key={item.key}
                  style={{ 
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FBFCFD'
                  }}
                >
                  {/* Department Name */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>
                        {item.department}
                      </strong>
                      <span style={{ 
                        fontSize: '11px', 
                        fontFamily: 'monospace', 
                        color: 'var(--text-tertiary)', 
                        backgroundColor: '#F1F5F9',
                        padding: '1px 5px',
                        borderRadius: '4px'
                      }}>
                        {item.processCode}
                      </span>
                    </div>
                  </td>

                  {/* Allocation % */}
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.allocationPercent}%
                  </td>

                  {/* Allocated Budget */}
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.formattedAllocatedBudget}
                  </td>

                  {/* Hourly Rate */}
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: isNonMachining ? 'var(--text-tertiary)' : 'var(--text-secondary)', fontFamily: isNonMachining ? 'inherit' : 'monospace', fontWeight: 500 }}>
                    {item.formattedHourlyRate}
                  </td>

                  {/* Estimated Hours */}
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: isNonMachining ? 'inherit' : 'monospace', fontWeight: 700, color: isNonMachining ? 'var(--text-tertiary)' : '#0F766E' }}>
                    {isNonMachining ? '—' : `${item.formattedEstimatedHours} hrs`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Bottom Summary Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '16px 20px',
        backgroundColor: '#F8FAFC',
        border: '1px solid var(--border-color)',
        borderRadius: '10px'
      }}>
        {/* Working Budget vs Allocated Budget */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Working Budget:
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
              {calcResult.display.workingBudget}
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-color)' }} />

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Allocated Budget:
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
              {calcResult.display.totalAllocatedBudget}
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-color)' }} />

          {/* Allocation Check */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Allocation Check:
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '15px', 
              fontWeight: 800, 
              color: calcResult.allocationCheckPassed ? 'var(--success-green)' : 'var(--accent-red)' 
            }}>
              {calcResult.allocationCheckPassed ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>✓ {calcResult.display.totalAllocationPercent}</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} />
                  <span>{calcResult.display.totalAllocationPercent} (Mismatch)</span>
                </>
              )}
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-color)' }} />

          {/* Total Machining & Labor Hours */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Machining & Labor Hours:
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'monospace', color: '#0F766E' }}>
              {calcResult.display.totalEstimatedHours} hrs
            </div>
          </div>
        </div>

        {/* Action: Sync to RFQ Process Matrix */}
        {onApplyToEstimates && (
          <button
            type="button"
            onClick={handleApply}
            disabled={isInvalid || readOnly}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 700,
              backgroundColor: appliedFeedback ? 'var(--success-green)' : 'var(--accent-red)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              cursor: isInvalid || readOnly ? 'not-allowed' : 'pointer',
              opacity: isInvalid || readOnly ? 0.6 : 1,
              transition: 'background-color 0.2s'
            }}
          >
            {appliedFeedback ? <Check size={16} /> : <ArrowRight size={16} />}
            <span>{appliedFeedback ? 'Hours & Costs Applied to RFQ!' : 'Apply Hours to RFQ Matrix'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
