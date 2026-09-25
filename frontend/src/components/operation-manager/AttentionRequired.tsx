"use client";

import React from 'react';
import { 
  AlertCircle, ArrowRight, CheckCircle2, 
  FileText, MessageSquare, RefreshCw, Layers 
} from 'lucide-react';
import { AttentionItem } from '@/services/operation-manager.service';

interface AttentionRequiredProps {
  items: AttentionItem[];
  onActionClick: (item: AttentionItem) => void;
}

export const AttentionRequired: React.FC<AttentionRequiredProps> = ({ items, onActionClick }) => {
  const getSeverityBadge = (severity: AttentionItem['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: '#FEE2E2',
            color: '#B91C1C',
            fontSize: '11px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '10px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#DC2626' }} />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: '#FFEDD5',
            color: '#C2410C',
            fontSize: '11px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '10px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EA580C' }} />
            HIGH
          </span>
        );
      case 'WARNING':
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: '#FEF3C7',
            color: '#B45309',
            fontSize: '11px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '10px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D97706' }} />
            WARNING
          </span>
        );
    }
  };

  const getTypeIcon = (type: AttentionItem['type']) => {
    switch (type) {
      case 'Job':
        return <Layers size={14} color="#1976D2" />;
      case 'Quotation':
        return <MessageSquare size={14} color="#7C3AED" />;
      case 'Revision':
        return <RefreshCw size={14} color="var(--warning-orange)" />;
      case 'RFQ':
        return <FileText size={14} color="#059669" />;
      default:
        return <AlertCircle size={14} color="var(--accent-red)" />;
    }
  };

  return (
    <div className="card table-card" style={{ border: '1px solid #FECACA', background: 'white' }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        background: '#FEF2F2',
        borderBottom: '1px solid #FEE2E2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} color="var(--accent-red)" />
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-red)', margin: 0 }}>
            Attention Required
          </h2>
          <span style={{
            background: 'var(--accent-red)',
            color: 'white',
            fontSize: '11px',
            fontWeight: 800,
            padding: '1px 7px',
            borderRadius: '10px'
          }}>
            {items.length}
          </span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Items requiring Operation Manager decision or review today
        </span>
      </div>

      {/* Items List / Table */}
      {items.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid var(--border-color)',
                textAlign: 'left',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                background: '#FAFBFB'
              }}>
                <th style={{ padding: '10px 20px', width: '100px' }}>Severity</th>
                <th style={{ padding: '10px 16px', width: '120px' }}>Type & Ref</th>
                <th style={{ padding: '10px 16px' }}>Issue Description</th>
                <th style={{ padding: '10px 16px', width: '130px' }}>Date / Deadline</th>
                <th style={{ padding: '10px 16px', width: '130px' }}>Status</th>
                <th style={{ padding: '10px 20px', width: '110px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr 
                  key={item.id}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-color)'}
                  onMouseOut={e => e.currentTarget.style.background = 'white'}
                >
                  <td style={{ padding: '14px 20px' }}>
                    {getSeverityBadge(item.severity)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {getTypeIcon(item.type)}
                      <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                        {item.refNo}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-primary)' }}>
                    {item.description}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {item.date}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      background: 'var(--bg-color)',
                      color: 'var(--text-primary)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => onActionClick(item)}
                      style={{
                        padding: '6px 14px',
                        background: item.severity === 'CRITICAL' ? 'var(--accent-red)' : 'white',
                        color: item.severity === 'CRITICAL' ? 'white' : 'var(--text-primary)',
                        border: item.severity === 'CRITICAL' ? 'none' : '1px solid var(--border-color)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'opacity 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                      onMouseOut={e => e.currentTarget.style.opacity = '1'}
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <CheckCircle2 size={36} color="var(--success-green)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            No overdue jobs or critical issues
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Great — all active jobs, quotations, and revisions are currently on schedule.
          </p>
        </div>
      )}
    </div>
  );
};
