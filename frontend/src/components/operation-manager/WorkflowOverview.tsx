"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface WorkflowOverviewProps {
  distribution: Record<string, number>;
  selectedStage?: string;
  onSelectStage: (stage: string) => void;
}

export const WorkflowOverview: React.FC<WorkflowOverviewProps> = ({
  distribution,
  selectedStage,
  onSelectStage
}) => {
  const [expandProduction, setExpandProduction] = useState(true);

  const mainStages = [
    { name: 'Design', count: distribution['Design'] || 0, color: '#1976D2' },
    { name: 'Purchasing', count: distribution['Purchasing'] || 0, color: '#D97706' },
    { 
      name: 'Production', 
      count: distribution['Production'] || 0, 
      color: '#0284C7',
      subStages: [
        { name: 'Production - CNC', label: 'CNC', count: distribution['Production - CNC'] || 0 },
        { name: 'Production - Grinding', label: 'Grinding', count: distribution['Production - Grinding'] || 0 },
        { name: 'Production - Wire Cut', label: 'Wire Cut', count: distribution['Production - Wire Cut'] || 0 },
        { name: 'Production - Assembly', label: 'Assembly', count: distribution['Production - Assembly'] || 0 }
      ]
    },
    { name: 'QI', count: distribution['QI'] || 0, color: '#059669' },
    { name: 'Quotation', count: distribution['Quotation'] || 0, color: '#7C3AED' },
    { name: 'RFQ', count: distribution['RFQ'] || 0, color: '#64748B' }
  ];

  const total = (distribution['Design'] || 0) + 
                (distribution['Purchasing'] || 0) + 
                (distribution['Production'] || 0) + 
                (distribution['QI'] || 0) +
                (distribution['Quotation'] || 0) +
                (distribution['RFQ'] || 0);

  return (
    <div className="card" style={{ background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Operational Pipeline
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Department distribution (Design → Purchasing → Production → QI)
          </span>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Active: {total}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {mainStages.map((st) => {
          const isSelected = selectedStage === st.name;
          const hasSub = !!st.subStages;

          return (
            <div key={st.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: `1.5px solid ${isSelected ? st.color : 'transparent'}`,
                  background: isSelected ? '#EFF6FF' : 'var(--bg-color)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => onSelectStage(isSelected ? '' : st.name)}
                onMouseOver={e => {
                  if (!isSelected) e.currentTarget.style.background = '#F1F5F9';
                }}
                onMouseOut={e => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--bg-color)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {hasSub ? (
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandProduction(!expandProduction);
                      }}
                      style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    >
                      {expandProduction ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  ) : (
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: st.color
                    }} />
                  )}
                  <span style={{ fontSize: '13px', fontWeight: isSelected ? 800 : 700, color: 'var(--text-primary)' }}>
                    {st.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: st.count > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    minWidth: '20px',
                    textAlign: 'right'
                  }}>
                    {st.count}
                  </span>
                </div>
              </div>

              {/* Sub-processes (CNC, Grinding, Wire Cut, Assembly) */}
              {hasSub && expandProduction && (
                <div style={{
                  marginLeft: '16px',
                  paddingLeft: '12px',
                  borderLeft: '2px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  marginTop: '2px'
                }}>
                  {st.subStages!.map(sub => {
                    const isSubSelected = selectedStage === sub.name;
                    return (
                      <div
                        key={sub.name}
                        onClick={() => onSelectStage(isSubSelected ? '' : sub.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          border: `1px solid ${isSubSelected ? '#0284C7' : 'transparent'}`,
                          background: isSubSelected ? '#F0F9FF' : 'transparent',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: isSubSelected ? '#0284C7' : 'var(--text-secondary)'
                        }}
                        onMouseOver={e => {
                          if (!isSubSelected) e.currentTarget.style.background = '#F8FAFC';
                        }}
                        onMouseOut={e => {
                          if (!isSubSelected) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span style={{ fontWeight: isSubSelected ? 700 : 500 }}>
                          • {sub.label}
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {sub.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
