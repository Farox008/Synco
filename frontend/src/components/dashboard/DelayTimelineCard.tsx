import React from 'react';
import { Card } from '../ui/Card';
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';

interface DelaySummary {
  totalDelay: string;
  activeDelays: number;
  trend: string;
  status: string;
}

interface DelayTimelineCardProps {
  summary: DelaySummary;
}

export const DelayTimelineCard: React.FC<DelayTimelineCardProps> = ({ summary }) => {
  return (
    <Card title="Timeline Awareness" subtitle="Overall Production Lag">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '16px',
          backgroundColor: 'var(--accent-red-light)',
          borderRadius: '8px',
          border: '1px solid #FFCDD2'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-red)', textTransform: 'uppercase' }}>Total Delay</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-red)' }}>{summary.totalDelay}</div>
          </div>
          <AlertTriangle size={32} color="var(--accent-red)" opacity={0.5} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <TrendingUp size={14} color="var(--accent-red)" />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)' }}>Trend</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>{summary.trend}</div>
          </div>
          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Activity size={14} color="#1976D2" />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)' }}>Active Issues</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>{summary.activeDelays} Tools</div>
          </div>
        </div>

        <div style={{ 
          padding: '12px', 
          backgroundColor: 'var(--bg-color)', 
          borderRadius: '8px', 
          fontSize: '13px', 
          fontWeight: 600,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-red)' }} />
          Status: {summary.status}
        </div>
      </div>
    </Card>
  );
};
