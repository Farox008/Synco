"use client";

import React from 'react';
import { ProcessCode, PROCESS_LABELS, CustomerBudget, formatCurrency } from '@/services/rfq.service';
import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp } from 'lucide-react';

interface CostEstimationTableProps {
  processCosts: Record<ProcessCode, number>;
  budget: CustomerBudget;
  marginThresholdPercent?: number;
  onChange: (costs: Record<ProcessCode, number>) => void;
  onThresholdChange?: (threshold: number) => void;
  readOnly?: boolean;
}

const PROCESS_ORDER: ProcessCode[] = ['DSN', 'MILL', 'CNC', 'GR', 'WC', 'ASSY', 'MATL', 'STD', 'OTHERS'];

export default function CostEstimationTable({
  processCosts,
  budget,
  marginThresholdPercent = 20.0,
  onChange,
  onThresholdChange,
  readOnly = false
}: CostEstimationTableProps) {
  const handleCostChange = (proc: ProcessCode, valStr: string) => {
    const val = parseFloat(valStr);
    onChange({
      ...processCosts,
      [proc]: isNaN(val) ? 0 : val
    });
  };

  const totalCost = PROCESS_ORDER.reduce((acc, proc) => acc + (processCosts[proc] || 0), 0);
  const convertedBudget = budget.convertedBudget || (budget.customerBudget * budget.exchangeRate);
  const expectedMargin = convertedBudget - totalCost;
  const marginPercent = convertedBudget > 0 ? (expectedMargin / convertedBudget) * 100 : 0;
  const isMarginBelowTarget = marginPercent < marginThresholdPercent;
  const isNegativeMargin = expectedMargin < 0;

  return (
    <div className="cost-estimation-wrapper" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: '20px' }}>
      {/* Left: Process-wise Cost Table */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Internal Cost Estimation
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Base calculation currency: RM
            </span>
          </div>
        </div>

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
              <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>PROCESS</th>
              <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>DESCRIPTION</th>
              <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right', width: '150px' }}>EST. COST (RM)</th>
            </tr>
          </thead>
          <tbody>
            {PROCESS_ORDER.map((proc, index) => {
              const cost = processCosts[proc] || 0;
              return (
                <tr 
                  key={proc}
                  style={{ 
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FBFCFD'
                  }}
                >
                  <td style={{ padding: '8px 14px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                    {proc}
                  </td>
                  <td style={{ padding: '8px 14px', color: 'var(--text-secondary)' }}>
                    {PROCESS_LABELS[proc]}
                  </td>
                  <td style={{ padding: '6px 14px', textAlign: 'right' }}>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={readOnly}
                      value={cost > 0 ? cost : ''}
                      placeholder="0.00"
                      onChange={(e) => handleCostChange(proc, e.target.value)}
                      style={{
                        width: '130px',
                        padding: '6px 10px',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        textAlign: 'right',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        outline: 'none'
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#F8FAFC', borderTop: '2px solid var(--border-color)', fontWeight: 700 }}>
              <td colSpan={2} style={{ padding: '12px 14px', color: 'var(--text-primary)' }}>
                TOTAL ESTIMATED INTERNAL COST
              </td>
              <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--accent-red)', fontSize: '14px' }}>
                {formatCurrency(totalCost, 'RM')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Right: Commercial Comparison & Margin Analysis */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Commercial Viability
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Target Margin vs Internal Estimates
            </span>
          </div>

          {onThresholdChange && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Target:</span>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={marginThresholdPercent}
                onChange={(e) => onThresholdChange(Number(e.target.value) || 20)}
                style={{
                  width: '48px',
                  padding: '4px 6px',
                  fontSize: '12px',
                  textAlign: 'center',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  color: 'var(--text-primary)'
                }}
              />
              <span>%</span>
            </div>
          )}
        </div>

        <div 
          style={{ 
            backgroundColor: '#FFFFFF', 
            border: '1px solid var(--border-color)', 
            borderRadius: '8px', 
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          {/* Customer Budget display */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: '12px', borderBottom: '1px dashed var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Customer Budget</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {formatCurrency(budget.customerBudget, budget.currency)} @ rate {budget.exchangeRate}
              </div>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
              {formatCurrency(convertedBudget, 'RM')}
            </div>
          </div>

          {/* Total Internal Cost display */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: '12px', borderBottom: '1px dashed var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Estimated Internal Cost</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                All machining & material lines
              </div>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-red)' }}>
              {formatCurrency(totalCost, 'RM')}
            </div>
          </div>

          {/* Expected Margin display */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: '12px', borderBottom: '2px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Expected Margin (RM)</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Converted Budget − Total Cost
              </div>
            </div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 800, 
              fontFamily: 'monospace', 
              color: isNegativeMargin ? 'var(--accent-red)' : 'var(--success-green)' 
            }}>
              {formatCurrency(expectedMargin, 'RM')}
            </div>
          </div>

          {/* Expected Margin % and Target Indicator */}
          <div style={{ 
            backgroundColor: isMarginBelowTarget ? 'var(--accent-red-light)' : 'var(--success-green-light)',
            border: `1px solid ${isMarginBelowTarget ? '#FECACA' : '#A7F3D0'}`,
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isMarginBelowTarget ? (
                <TrendingDown size={28} style={{ color: 'var(--accent-red)' }} />
              ) : (
                <TrendingUp size={28} style={{ color: 'var(--success-green)' }} />
              )}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Projected Margin
                </div>
                <div style={{ 
                  fontSize: '22px', 
                  fontWeight: 800, 
                  fontFamily: 'monospace',
                  color: isMarginBelowTarget ? 'var(--accent-red)' : 'var(--success-green)'
                }}>
                  {marginPercent.toFixed(1)}%
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Target: <strong>{marginThresholdPercent}%</strong></div>
              {isMarginBelowTarget ? (
                <div className="pill-red" style={{ marginTop: '6px' }}>
                  <AlertTriangle size={12} />
                  <span>Margin below target</span>
                </div>
              ) : (
                <div className="pill-green" style={{ marginTop: '6px' }}>
                  <CheckCircle size={12} />
                  <span>Target achieved</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
