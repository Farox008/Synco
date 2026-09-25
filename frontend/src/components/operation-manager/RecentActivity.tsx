"use client";

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ActivityItem } from '@/services/operation-manager.service';
import Link from 'next/link';

interface RecentActivityProps {
  activities: ActivityItem[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <div className="card" style={{ background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Recent Activity
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Chronological log of operational updates across departments
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {activities.map((act) => (
          <div 
            key={act.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-color)'
            }}
          >
            <div style={{
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--text-tertiary)',
              padding: '2px 6px',
              background: 'var(--bg-color)',
              borderRadius: '4px',
              marginTop: '1px',
              whiteSpace: 'nowrap'
            }}>
              {act.time}
            </div>

            <div style={{ flex: 1, fontSize: '13px', color: 'var(--text-primary)' }}>
              {act.description}
            </div>

            <Link
              href={act.link}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#1976D2',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                whiteSpace: 'nowrap'
              }}
            >
              View <ExternalLink size={11} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
