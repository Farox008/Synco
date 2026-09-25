import React from 'react';
import { Card } from '../ui/Card';
import { MoreHorizontal, MapPin } from 'lucide-react';

interface Machine {
  id: string;
  tool: string;
  status: 'running' | 'idle' | 'setup' | 'error' | string;
}

interface FleetStatusProps {
  machines: Machine[];
}

export const FleetStatus: React.FC<FleetStatusProps> = ({ machines }) => {
  return (
    <Card title="Machine Tracking" subtitle="Fleet Status (Mapping)" extra={<MoreHorizontal size={16} color="var(--text-tertiary)" cursor="pointer" />}>
      <div className="fleet-scroll">
        <div className="fleet-list">
          {machines.slice(0, 8).map((m) => (
            <div key={m.id} className="fleet-item">
              <div className="fleet-info"><span className="fleet-id">{m.id}</span><span className="fleet-tool">→ {m.tool}</span></div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className={`fleet-status-dot status-${m.status}`} />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{m.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

interface Log {
  user: string;
  action: string;
  time: string;
  icon: React.ReactNode;
}

interface AuditLogProps {
  logs: Log[];
}

export const AuditLog: React.FC<AuditLogProps> = ({ logs }) => {
  return (
    <Card title="Audit Log Activity">
      <div className="compact-list">
        {logs.slice(0, 8).map((log, idx) => (
          <div key={idx} className="compact-item" style={{ padding: '12px 0' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
              <div className="icon-circle" style={{ width: '32px', height: '32px' }}>{log.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{log.user}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{log.time}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{log.action}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
