"use client";

import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { WorkloadItem } from '@/services/operation-manager.service';

interface WorkloadOverviewProps {
  workload: WorkloadItem[];
}

export const WorkloadOverview: React.FC<WorkloadOverviewProps> = ({ workload }) => {
  const [expandedProduction, setExpandedProduction] = useState(true);

  return (
    <div className="card" style={{ background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Department Workload
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Allocated hours vs capacity across operations
          </span>
        </div>
      </div>

      {workload.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {workload.map((wl) => {
            const isOverloaded = wl.loadPercent > 90;
            const isNearCapacity = wl.loadPercent > 75 && !isOverloaded;

            const barColor = isOverloaded 
              ? 'var(--accent-red)' 
              : (isNearCapacity ? 'var(--warning-orange)' : '#1976D2');

            const hasSubCenters = wl.subCenters && wl.subCenters.length > 0;

            return (
              <div key={wl.department} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* Main Department Header & Progress */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      cursor: hasSubCenters ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                    onClick={() => {
                      if (hasSubCenters) setExpandedProduction(!expandedProduction);
                    }}
                  >
                    {hasSubCenters && (
                      <span style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}>
                        {expandedProduction ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                    )}
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                      {wl.department}
                    </span>
                    {isOverloaded && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: 'var(--accent-red)',
                        background: '#FEE2E2',
                        padding: '1px 5px',
                        borderRadius: '4px'
                      }}>
                        OVERLOADED
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {wl.allocatedHours} / {wl.capacityHours}h
                    </span>
                    <span style={{ fontWeight: 800, color: barColor, minWidth: '36px', textAlign: 'right' }}>
                      {wl.loadPercent}%
                    </span>
                  </div>
                </div>

                <div className="progress-container" style={{ height: '8px' }}>
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${Math.min(wl.loadPercent, 100)}%`,
                      background: barColor
                    }} 
                  />
                </div>

                {/* Sub-centers for Production (CNC, Grinding, Wire Cut, Assembly) */}
                {hasSubCenters && expandedProduction && (
                  <div style={{
                    marginTop: '8px',
                    marginLeft: '12px',
                    paddingLeft: '12px',
                    borderLeft: '2px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    {wl.subCenters!.map((sub) => {
                      const isSubOver = sub.loadPercent > 90;
                      const isSubNear = sub.loadPercent > 75 && !isSubOver;
                      const subColor = isSubOver 
                        ? 'var(--accent-red)' 
                        : (isSubNear ? 'var(--warning-orange)' : '#0284C7');

                      return (
                        <div key={sub.name}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                              • {sub.name}
                            </span>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                                {sub.allocatedHours}/{sub.capacityHours}h
                              </span>
                              <span style={{ fontWeight: 700, color: subColor }}>
                                {sub.loadPercent}%
                              </span>
                            </div>
                          </div>
                          <div className="progress-container" style={{ height: '5px', background: '#F1F5F9' }}>
                            <div 
                              className="progress-fill" 
                              style={{ 
                                width: `${Math.min(sub.loadPercent, 100)}%`,
                                background: subColor
                              }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Activity size={32} color="var(--text-tertiary)" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: '13px', margin: 0 }}>No workload data currently logged.</p>
        </div>
      )}
    </div>
  );
};
