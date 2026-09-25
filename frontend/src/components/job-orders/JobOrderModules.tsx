import React from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { StatusPill } from '../ui/StatusPill';
import { Search, Filter, ArrowUpDown, MoreHorizontal, ChevronRight, Upload } from 'lucide-react';

interface Metric {
  title: string;
  value: string;
  sub: string;
  trend: 'up' | 'down';
}

interface JobOrderStatsProps {
  metrics: Metric[];
}

export const JobOrderStats: React.FC<JobOrderStatsProps> = ({ metrics }) => {
  return (
    <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
      {metrics.map((m, idx) => (
        <Card key={idx} className="kpi-card">
          <span className="kpi-title">{m.title}</span>
          <span className="kpi-value">{m.value}</span>
          <span className="kpi-sub">
            vs Last Month <span className={m.trend === 'up' ? 'pill-green' : 'pill-red'}>{m.sub}</span>
          </span>
        </Card>
      ))}
    </div>
  );
};

interface FilterBarProps {
  onNewJobOrder: () => void;
  onUploadExcel: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ onNewJobOrder, onUploadExcel }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '16px',
      gap: '16px' 
    }}>
      <div className="search-bar" style={{ flex: 1, maxWidth: '400px' }}>
        <Search size={16} />
        <input type="text" placeholder="Search Job Orders, Customers, or IDs..." style={{ width: '100%' }} />
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="header-tab active" style={{ padding: '8px 16px', borderRadius: '8px' }}>
          <Filter size={16} /> Filter
        </button>
        <button className="header-tab" style={{ padding: '8px 16px', borderRadius: '8px' }} onClick={onUploadExcel}>
          <Upload size={16} /> Upload Data File
        </button>
        <button className="pro-btn" style={{ width: 'auto', background: 'var(--accent-red)', color: 'white' }} onClick={onNewJobOrder}>
          + New Job Order
        </button>
      </div>
    </div>
  );
};

import Link from 'next/link';

interface JobOrder {
  id: string;
  customer: string;
  name?: string;
  priority: string;
  progress: number;
  items: string;
  dueDate: string;
  status: string;
  activeJob: string;
  headerMetadata?: Record<string, any>;
}

interface JobOrderTableProps {
  orders: JobOrder[];
}

export const JobOrderTable: React.FC<JobOrderTableProps> = ({ orders }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'var(--accent-red)';
      case 'high': return 'var(--warning-orange)';
      case 'medium': return '#1976D2';
      default: return 'var(--text-tertiary)';
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <table className="matrix-table" style={{ margin: 0, borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-color)' }}>
          <tr>
            <th style={{ background: 'var(--accent-red-light)', position: 'sticky', top: 0 }}>Order ID <ArrowUpDown size={12} /></th>
            <th style={{ background: 'var(--accent-red-light)', position: 'sticky', top: 0 }}>Customer <ArrowUpDown size={12} /></th>
            <th style={{ background: 'var(--accent-red-light)', position: 'sticky', top: 0 }}>Priority</th>
            <th style={{ background: 'var(--accent-red-light)', position: 'sticky', top: 0 }}>Progress</th>
            <th style={{ background: 'var(--accent-red-light)', position: 'sticky', top: 0 }}>Items</th>
            <th style={{ background: 'var(--accent-red-light)', position: 'sticky', top: 0 }}>Due Date <ArrowUpDown size={12} /></th>
            <th style={{ background: 'var(--accent-red-light)', position: 'sticky', top: 0 }}>Status</th>
            <th style={{ background: 'var(--accent-red-light)', position: 'sticky', top: 0 }}></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="work-order-row">
              <td style={{ fontWeight: 700, color: 'var(--accent-red)', minWidth: '120px' }}>
                <Link 
                  href={`/job-orders/${order.id}`} 
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {order.id} <ChevronRight size={14} opacity={0.5} />
                  </div>
                  {order.headerMetadata?.['QUOTATION REF'] && (
                    <div style={{ fontSize: '10px', color: '#0284C7', fontWeight: 700, marginTop: '2px' }}>
                      Quote: {order.headerMetadata['QUOTATION REF']}
                    </div>
                  )}
                </Link>
              </td>
              <td style={{ fontWeight: 600, minWidth: '200px' }}>
                <div>{order.customer}</div>
                {order.name && (
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '2px' }}>
                    {order.name}
                  </div>
                )}
              </td>
              <td style={{ minWidth: '100px' }}>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  color: getPriorityColor(order.priority),
                  backgroundColor: `${getPriorityColor(order.priority)}15`,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap'
                }}>
                  {order.priority}
                </span>
              </td>
              <td style={{ width: '220px', paddingRight: '40px' }}>
                <ProgressBar progress={order.progress} showLabel />
              </td>
              <td style={{ fontWeight: 600, color: 'var(--text-secondary)', width: '100px' }}>{order.items}</td>
              <td style={{ fontSize: '13px', width: '120px' }}>{order.dueDate}</td>
              <td style={{ minWidth: '140px' }}>
                <StatusPill status={order.status} />
              </td>
              <td>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                  <MoreHorizontal size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Endless Scroll Indicator */}
      <div style={{ 
        padding: '48px 0', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        gap: '12px',
        color: 'var(--text-tertiary)',
        borderTop: '1px solid var(--border-color)',
        marginTop: '32px'
      }}>
        <div className="loading-spinner-simple" style={{ 
          width: '20px', 
          height: '20px', 
          border: '2px solid var(--border-color)', 
          borderTopColor: 'var(--accent-red)', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ fontSize: '13px', fontWeight: 500 }}>Loading more job orders...</span>
      </div>
    </div>
  );
};
