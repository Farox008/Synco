"use client";

import React from 'react';
import { ProcessCode, ProcessEstimateItem, PROCESS_LABELS } from '@/services/rfq.service';

interface ProcessEstimationTableProps {
  estimates: Record<ProcessCode, ProcessEstimateItem>;
  onChange: (estimates: Record<ProcessCode, ProcessEstimateItem>) => void;
  readOnly?: boolean;
}

const PROCESS_ORDER: ProcessCode[] = ['DSN', 'MILL', 'CNC', 'GR', 'WC', 'ASSY', 'MATL', 'STD', 'OTHERS'];

export default function ProcessEstimationTable({
  estimates,
  onChange,
  readOnly = false
}: ProcessEstimationTableProps) {
  const handleInputChange = (
    proc: ProcessCode,
    field: 'hours' | 'days',
    valueStr: string
  ) => {
    const val = valueStr === '' ? null : Number(valueStr);
    const updated = {
      ...estimates,
      [proc]: {
        ...estimates[proc],
        [field]: isNaN(val as number) ? null : val
      }
    };
    onChange(updated);
  };

  // Calculate totals
  const totalHours = PROCESS_ORDER.reduce(
    (acc, proc) => acc + (estimates[proc]?.hours || 0),
    0
  );
  const totalDays = PROCESS_ORDER.reduce(
    (acc, proc) => acc + (estimates[proc]?.days || 0),
    0
  );

  return (
    <div className="process-estimation-container" style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Process Hours & Days Estimation Matrix
          </h4>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Standard manufacturing costing breakdown for engineering & machine lines
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
            <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right', width: '140px' }}>HOURS</th>
            <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right', width: '140px' }}>DAYS</th>
          </tr>
        </thead>
        <tbody>
          {PROCESS_ORDER.map((proc, index) => {
            const isProcNonMachining = proc === 'MATL' || proc === 'STD' || proc === 'OTHERS';
            const item = estimates[proc] || { hours: null, days: null };

            return (
              <tr 
                key={proc} 
                style={{ 
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FBFCFD'
                }}
              >
                <td style={{ padding: '10px 14px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                  {proc}
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                  {PROCESS_LABELS[proc]}
                  {isProcNonMachining && (
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: '6px' }}>
                      (Procurement / Non-machine)
                    </span>
                  )}
                </td>
                <td style={{ padding: '8px 14px', textAlign: 'right' }}>
                  {isProcNonMachining ? (
                    <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', paddingRight: '8px' }}>—</span>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      disabled={readOnly}
                      value={item.hours !== null ? item.hours : ''}
                      placeholder="0"
                      onChange={(e) => handleInputChange(proc, 'hours', e.target.value)}
                      style={{
                        width: '110px',
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
                  )}
                </td>
                <td style={{ padding: '8px 14px', textAlign: 'right' }}>
                  {isProcNonMachining ? (
                    <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', paddingRight: '8px' }}>—</span>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      step="1"
                      disabled={readOnly}
                      value={item.days !== null ? item.days : ''}
                      placeholder="0"
                      onChange={(e) => handleInputChange(proc, 'days', e.target.value)}
                      style={{
                        width: '110px',
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
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: '#F8FAFC', borderTop: '2px solid var(--border-color)', fontWeight: 700 }}>
            <td colSpan={2} style={{ padding: '12px 14px', color: 'var(--text-primary)' }}>
              TOTAL ESTIMATED PROCESS DURATION
            </td>
            <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'monospace', fontSize: '14px', color: 'var(--accent-red)' }}>
              {totalHours.toLocaleString()} hrs
            </td>
            <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'monospace', fontSize: '14px', color: 'var(--text-primary)' }}>
              {totalDays} days (sum)
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
