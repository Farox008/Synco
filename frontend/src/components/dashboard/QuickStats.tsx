import React from 'react';
import { Card } from '../ui/Card';

interface KPIMetric {
  title: string;
  value: string;
  sub: string;
  trend: 'up' | 'down';
}

interface KPIGridProps {
  metrics: KPIMetric[];
  isSmall?: boolean;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ metrics, isSmall = false }) => {
  return (
    <div className={`kpi-grid ${isSmall ? 'small' : ''}`} style={isSmall ? { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' } : { height: '100%', display: 'grid', gridTemplateRows: 'repeat(2, 1fr)' }}>
      {metrics.map((m, idx) => (
        <Card key={idx} className={`kpi-card ${isSmall ? 'small' : ''}`} style={isSmall ? { display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px', padding: '12px' } : { display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: '8px', padding: '20px' }}>
          <span className="kpi-title" style={isSmall ? { fontSize: '12px' } : undefined}>{m.title}</span>
          <span className="kpi-value" style={isSmall ? { fontSize: '20px' } : undefined}>{m.value}</span>
          <span className="kpi-sub" style={isSmall ? { fontSize: '10px' } : undefined}>
            vs Last Week <span className={m.trend === 'up' ? 'pill-green' : 'pill-red'}>{m.sub}</span>
          </span>
        </Card>
      ))}
    </div>
  );
};

interface JobBreakdownItem {
  label: string;
  value: number;
  color: string;
}

interface ToolStatusBreakdownProps {
  data: JobBreakdownItem[];
  total: number;
}

export const ToolStatusBreakdown: React.FC<ToolStatusBreakdownProps> = ({ data, total }) => {
  return (
    <Card title="Tool Status Breakdown" subtitle={`Total Tools: ${total}`}>
      <div className="segmented-bar" style={{ marginBottom: '16px' }}>
        {data.map((item) => (
          <div 
            key={item.label} 
            className="segment"
            style={{ flex: item.value, backgroundColor: item.color }} 
            title={`${item.label}: ${item.value}`} 
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '24px' }}>
        {data.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.label}</span>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
