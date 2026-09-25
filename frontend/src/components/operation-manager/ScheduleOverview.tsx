"use client";

import { ArrowRight } from 'lucide-react';
import { ScheduleItem } from '@/services/operation-manager.service';
import Link from 'next/link';

interface ScheduleOverviewProps {
  items: ScheduleItem[];
  onViewJob: (jobNo: string) => void;
}

export const ScheduleOverview: React.FC<ScheduleOverviewProps> = ({ items, onViewJob }) => {
  const overdue = items.filter(i => i.urgency === 'Overdue');
  const dueToday = items.filter(i => i.urgency === 'Due Today');
  const dueWithin3Days = items.filter(i => i.urgency === 'Due within 3 days');
  const dueThisWeek = items.filter(i => i.urgency === 'Due this week');

  return (
    <div className="card" style={{ background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Schedule & Deadlines
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Upcoming operational deliveries this week
          </span>
        </div>
        <Link 
          href="/timeline" 
          style={{ fontSize: '12px', fontWeight: 700, color: '#1976D2', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          Planning View <ArrowRight size={13} />
        </Link>
      </div>

      {/* Week Timeline Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        background: 'var(--bg-color)',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-red)', textTransform: 'uppercase' }}>Overdue</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-red)', marginTop: '2px' }}>{overdue.length}</div>
        </div>
        <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--warning-orange)', textTransform: 'uppercase' }}>Today</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--warning-orange)', marginTop: '2px' }}>{dueToday.length}</div>
        </div>
        <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>3 Days</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{dueWithin3Days.length}</div>
        </div>
        <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>This Week</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '2px' }}>{dueThisWeek.length}</div>
        </div>
      </div>

      {/* Deadline Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item) => {
          const isOverdue = item.urgency === 'Overdue';
          const isToday = item.urgency === 'Due Today';

          return (
            <div
              key={item.id}
              onClick={() => onViewJob(item.jobNo)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: isOverdue ? '#FFF5F5' : 'white',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#1976D2'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '13px', color: isOverdue ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                    {item.jobNo}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>•</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {item.customer}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {item.task}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: isOverdue ? 'var(--accent-red)' : (isToday ? 'var(--warning-orange)' : 'var(--text-secondary)')
                }}>
                  {item.dueDate}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
