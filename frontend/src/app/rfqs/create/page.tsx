"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { RfqRecord } from '@/services/rfq.service';
import RfqWorkspace from '@/components/rfq/RfqWorkspace';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function CreateRfqPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const { user } = useAuth();
  const currentUser = user?.username ? `${user.username} (${user.role || 'Operation Manager'})` : 'Alex Wong (Operation Manager)';

  if (!hasPermission('rfq.create') && !hasPermission('rfq.view')) {
    return (
      <div style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-color)' }}>
        <div style={{
          maxWidth: '480px',
          margin: '0 auto',
          padding: '24px',
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
        }}>
          <ShieldAlert size={36} style={{ color: 'var(--accent-red, #FF4D4D)', margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '18px', margin: '0 0 8px', color: 'var(--text-primary)' }}>Access Restricted</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            You do not have permission to create an RFQ.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="rfq-page-scroll-container" 
      style={{ 
        flex: 1, 
        height: '100%', 
        overflowY: 'auto', 
        padding: '24px 32px 64px 32px', 
        backgroundColor: 'var(--bg-color)' 
      }}
    >
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <RfqWorkspace
          rfq={null}
          onBack={() => {
            router.push('/rfqs');
          }}
          onSaved={(_saved: RfqRecord) => {
            router.push('/rfqs');
          }}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}
