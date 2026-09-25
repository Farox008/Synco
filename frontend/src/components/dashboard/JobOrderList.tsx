import React from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

interface JobOrder {
  id: string;
  name: string;
  progress: number;
  items: string;
  activeJob: string;
}

interface JobOrderListProps {
  orders: JobOrder[];
}

export const JobOrderList: React.FC<JobOrderListProps> = ({ orders }) => {
  return (
    <Card title="Job Order Progress" style={{ flex: 1.5 }}>
      <div className="scrollable-content" style={{ maxHeight: '480px' }}>
        <div className="compact-list">
          {orders.map(order => (
            <div key={order.id} className="compact-item work-order-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <div className="compact-info">
                  <span className="compact-title">{order.name}</span>
                  <span className="compact-sub">{order.id}</span>
                </div>
                <div className="work-order-status-group">
                  <span className="active-tool-tag">Active: {order.activeJob}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{order.items}</span>
                </div>
              </div>
              <ProgressBar progress={order.progress} variant="success" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
