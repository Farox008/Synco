"use client";

import React from 'react';
import { 
  TrendingUp, Clock, Layers, FileText, 
  MessageSquare, AlertCircle, RefreshCw 
} from 'lucide-react';
import { KpiData } from '@/services/operation-manager.service';

interface KPIGridProps {
  data: KpiData;
  onFilterClick?: (filterType: string, filterValue?: string) => void;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ data, onFilterClick }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      width: '100%'
    }}>
      {/* 1. Active Jobs */}
      <div 
        className="card kpi-card"
        onClick={() => onFilterClick && onFilterClick('status', 'ACTIVE')}
        style={{
          cursor: 'pointer',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
          background: 'white'
        }}
        onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'}
        onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Active Jobs
          </span>
          <Layers size={16} color="#1976D2" />
        </div>
        <div style={{ marginTop: '10px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {data.activeJobs.value}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px' }}>
            <span style={{ color: 'var(--success-green)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <TrendingUp size={12} style={{ marginRight: '2px' }} /> +{data.activeJobs.change}%
            </span>
            <span style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span style={{ color: 'var(--warning-orange)', fontWeight: 600 }}>
              {data.activeJobs.highPriority} high priority
            </span>
          </div>
        </div>
      </div>

      {/* 2. RFQs */}
      <div 
        className="card kpi-card"
        onClick={() => onFilterClick && onFilterClick('module', 'rfqs')}
        style={{
          cursor: 'pointer',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
          background: 'white'
        }}
        onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'}
        onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            RFQs
          </span>
          <FileText size={16} color="#059669" />
        </div>
        <div style={{ marginTop: '10px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {data.rfqs.new + data.rfqs.awaitingAction}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{data.rfqs.new} new</span>
            <span style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span style={{ color: 'var(--warning-orange)', fontWeight: 600 }}>{data.rfqs.nearingDeadline} nearing deadline</span>
          </div>
        </div>
      </div>

      {/* 3. Quotations */}
      <div 
        className="card kpi-card"
        onClick={() => onFilterClick && onFilterClick('module', 'quotations')}
        style={{
          cursor: 'pointer',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
          background: 'white'
        }}
        onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'}
        onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Quotations
          </span>
          <MessageSquare size={16} color="#7C3AED" />
        </div>
        <div style={{ marginTop: '10px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {data.quotations.draft + data.quotations.awaitingApproval + data.quotations.sent}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px' }}>
            <span style={{ color: 'var(--warning-orange)', fontWeight: 600 }}>
              {data.quotations.awaitingApproval} awaiting approval
            </span>
            <span style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span style={{ color: 'var(--text-secondary)' }}>{data.quotations.sent} sent</span>
          </div>
        </div>
      </div>

      {/* 4. Overdue Jobs (Visually Prominent) */}
      <div 
        className="card kpi-card"
        onClick={() => onFilterClick && onFilterClick('status', 'OVERDUE')}
        style={{
          cursor: 'pointer',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
          background: '#FFF5F5',
          border: '1.5px solid var(--accent-red)'
        }}
        onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(239, 68, 68, 0.15)'}
        onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Overdue Jobs
          </span>
          <AlertCircle size={17} color="var(--accent-red)" />
        </div>
        <div style={{ marginTop: '10px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-red)', lineHeight: 1 }}>
            {data.overdueJobs.value}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px' }}>
            <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>
              {data.overdueJobs.critical} CRITICAL
            </span>
            <span style={{ color: 'var(--accent-red)' }}>• Immediate Action</span>
          </div>
        </div>
      </div>

      {/* 5. Revision Requests */}
      <div 
        className="card kpi-card"
        onClick={() => onFilterClick && onFilterClick('module', 'revisions')}
        style={{
          cursor: 'pointer',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
          background: 'white'
        }}
        onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'}
        onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Revisions
          </span>
          <RefreshCw size={16} color="var(--warning-orange)" />
        </div>
        <div style={{ marginTop: '10px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {data.revisions.pending}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px' }}>
            <span style={{ color: 'var(--warning-orange)', fontWeight: 600 }}>
              {data.revisions.highPriority} high priority
            </span>
            <span style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {data.revisions.timelineAffecting} affect timeline
            </span>
          </div>
        </div>
      </div>

      {/* 6. Due Soon (3 Working Days) */}
      <div 
        className="card kpi-card"
        onClick={() => onFilterClick && onFilterClick('status', 'DUE_SOON')}
        style={{
          cursor: 'pointer',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
          background: 'white'
        }}
        onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'}
        onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Due Soon
          </span>
          <Clock size={16} color="#475569" />
        </div>
        <div style={{ marginTop: '10px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {data.dueSoon.value}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Within {data.dueSoon.days} working days</span>
            <span style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span style={{ color: 'var(--text-secondary)' }}>Monitor delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
};
