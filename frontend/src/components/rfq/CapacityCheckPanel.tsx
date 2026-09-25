"use client";

import React from 'react';
import { CapacityCheckItem } from '@/services/rfq.service';
import { CheckCircle2, AlertOctagon, HelpCircle, ArrowRight, RefreshCw } from 'lucide-react';

interface CapacityCheckPanelProps {
  breakdown: CapacityCheckItem[];
  onRunCheck?: () => void;
  isRunning?: boolean;
}

export default function CapacityCheckPanel({
  breakdown,
  onRunCheck,
  isRunning = false
}: CapacityCheckPanelProps) {
  const hasShortages = breakdown.some(b => b.status === 'SHORTAGE');

  return (
    <div className="capacity-check-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Shop Floor Machine Capacity Evaluation
          </h4>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Compares required process hours against uncommitted factory workload
          </span>
        </div>
        {onRunCheck && (
          <button
            type="button"
            onClick={onRunCheck}
            disabled={isRunning}
            style={{ 
              fontSize: '12px', 
              fontWeight: 600,
              padding: '6px 14px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={12} className={isRunning ? 'spin' : ''} />
            <span>{isRunning ? 'Checking Capacity...' : 'Re-check Capacity'}</span>
          </button>
        )}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '14px' 
      }}>
        {breakdown.map((item) => {
          const isShortage = item.status === 'SHORTAGE';
          const isPass = item.status === 'PASS';
          const isUnavailable = item.status === 'DATA_UNAVAILABLE';

          return (
            <div
              key={item.process}
              style={{
                backgroundColor: '#FFFFFF',
                border: `1px solid ${
                  isShortage 
                    ? '#FECACA' 
                    : isPass 
                    ? 'var(--border-color)' 
                    : 'var(--border-color)'
                }`,
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isShortage ? '0 2px 8px rgba(255, 77, 77, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.02)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                    {item.processName}
                  </span>
                  
                  {isPass && (
                    <span className="pill-green">
                      <CheckCircle2 size={12} /> PASS
                    </span>
                  )}

                  {isShortage && (
                    <span className="pill-red">
                      <AlertOctagon size={12} /> SHORTAGE
                    </span>
                  )}

                  {isUnavailable && (
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      fontSize: '11px', 
                      color: 'var(--text-tertiary)',
                      backgroundColor: '#F1F5F9',
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      <HelpCircle size={12} /> N/A
                    </span>
                  )}
                </div>

                {isUnavailable ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '10px 0' }}>
                    Capacity data unavailable (Procurement / Outside machine schedule)
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '10px 0', fontSize: '12px' }}>
                    <div style={{ backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Required</div>
                      <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '14px', color: 'var(--text-primary)', marginTop: '2px' }}>
                        {item.requiredHours} hrs
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Available</div>
                      <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '14px', color: isShortage ? 'var(--accent-red)' : 'var(--text-primary)', marginTop: '2px' }}>
                        {item.availableHours !== null ? `${item.availableHours} hrs` : '—'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isShortage && item.shortageHours && (
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '12px', 
                  color: 'var(--accent-red)',
                  backgroundColor: 'var(--accent-red-light)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontWeight: 500
                }}>
                  Deficit: <strong>{item.shortageHours} hrs</strong> over committed load
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasShortages && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px 16px', 
          backgroundColor: 'var(--accent-red-light)', 
          border: '1px solid #FECACA', 
          borderRadius: '8px',
          fontSize: '13px',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertOctagon size={18} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
          <span>
            <strong>Shop Capacity Alert:</strong> One or more production lines exceed available capacity. Consider subcontracting or scheduling weekend overtime shifts before committing.
          </span>
        </div>
      )}
    </div>
  );
}
