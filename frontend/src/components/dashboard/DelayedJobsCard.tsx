import React from 'react';
import { Card } from '../ui/Card';
import { AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface DelayedJob {
  id: string;
  name: string;
  reason: string;
  timeLost: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical' | string;
}

interface DelayedJobsCardProps {
  tools: DelayedJob[];
}

export const DelayedJobsCard: React.FC<DelayedJobsCardProps> = ({ tools }) => {
  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'critical': return 'var(--accent-red)';
      case 'high': return '#E67E22';
      case 'medium': return 'var(--warning-orange)';
      default: return 'var(--text-tertiary)';
    }
  };

  return (
    <Card title="Delayed Tools" subtitle="Active Bottlenecks" extra={<AlertCircle size={16} color="var(--accent-red)" />}>
      <div className="scrollable-content" style={{ maxHeight: '320px' }}>
        <div className="compact-list">
          {tools.map(tool => (
            <Link key={tool.id} href={`/tools/${tool.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="compact-item" style={{ padding: '12px 0', cursor: 'pointer' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', width: '100%' }}>
                  <div style={{ 
                    width: '4px', 
                    height: '40px', 
                    borderRadius: '2px', 
                    backgroundColor: getImpactColor(tool.impact) 
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{tool.name}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: getImpactColor(tool.impact), textTransform: 'uppercase' }}>
                        {tool.impact}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{tool.reason}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                        <Clock size={12} />
                        <span>{tool.timeLost}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
};
