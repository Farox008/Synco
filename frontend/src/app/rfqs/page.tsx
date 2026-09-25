"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RfqRecord, RfqService, DecisionAction } from '@/services/rfq.service';
import RfqListTable from '@/components/rfq/RfqListTable';
import RfqWorkspace from '@/components/rfq/RfqWorkspace';
import DecisionModal from '@/components/rfq/DecisionModal';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function RfqsPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const { user } = useAuth();
  const currentUser = user?.username ? `${user.username} (${user.role || 'Operation Manager'})` : 'Alex Wong (Operation Manager)';

  const [rfqs, setRfqs] = useState<RfqRecord[]>([]);
  const [selectedRfq, setSelectedRfq] = useState<RfqRecord | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [decisionRfq, setDecisionRfq] = useState<RfqRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load RFQs from service
  const loadRfqs = async () => {
    setIsLoading(true);
    try {
      const data = await RfqService.getAll();
      setRfqs(data);
    } catch (err) {
      console.error('Failed to load RFQs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRfqs();
  }, []);

  // Handle saving an RFQ from workspace
  const handleRfqSaved = (saved: RfqRecord) => {
    setRfqs(prev => {
      const idx = prev.findIndex(r => r.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    setSelectedRfq(saved);
    setIsCreatingNew(false);
  };

  // Convert to quotation directly from list
  const handleConvertToQuotation = async (rfq: RfqRecord) => {
    try {
      const res = await RfqService.convertToQuotation(rfq.id, currentUser);
      setRfqs(prev => prev.map(r => r.id === rfq.id ? res.rfq : r));
      if (selectedRfq?.id === rfq.id) {
        setSelectedRfq(res.rfq);
      }
      router.push(`/quotations/${res.quotationNo}`);
    } catch (err: any) {
      alert(err.message || 'Failed to convert to quotation.');
    }
  };

  // Submit decision directly from list modal
  const handleDecisionSubmit = async (decisionData: { action: DecisionAction; reason?: string; conditions?: string }) => {
    if (!decisionRfq) return;
    try {
      const updated = await RfqService.submitDecision(decisionRfq.id, decisionData, currentUser);
      setRfqs(prev => prev.map(r => r.id === decisionRfq.id ? updated : r));
      if (selectedRfq?.id === decisionRfq.id) {
        setSelectedRfq(updated);
      }
      setDecisionRfq(null);
    } catch (err: any) {
      alert(err.message || 'Failed to record decision.');
    }
  };

  // Check read permission
  if (!hasPermission('rfq.view')) {
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
            You do not have the <code>rfq.view</code> permission required to access the internal Operation Manager RFQ & Feasibility Assessment workspace.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)', color: 'var(--text-tertiary)' }}>
        <RefreshCw size={28} className="spin" style={{ marginBottom: '12px', color: 'var(--accent-red, #FF4D4D)' }} />
        <div style={{ fontSize: '14px', fontWeight: 500 }}>Loading RFQ database...</div>
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
        {selectedRfq || isCreatingNew ? (
          <RfqWorkspace
            rfq={selectedRfq}
            onBack={() => {
              setSelectedRfq(null);
              setIsCreatingNew(false);
              loadRfqs();
            }}
            onSaved={handleRfqSaved}
            currentUser={currentUser}
          />
        ) : (
          <RfqListTable
            rfqs={rfqs}
            onSelectRfq={(rfq) => {
              setSelectedRfq(rfq);
              setIsCreatingNew(false);
            }}
            onCreateNew={() => {
              router.push('/rfqs/create');
            }}
            onOpenDecision={(rfq) => setDecisionRfq(rfq)}
            onConvertToQuotation={handleConvertToQuotation}
          />
        )}

        {/* Decision modal opened from list table */}
        {decisionRfq && (
          <DecisionModal
            isOpen={Boolean(decisionRfq)}
            onClose={() => setDecisionRfq(null)}
            rfqNumber={decisionRfq.rfqNumber}
            projectName={decisionRfq.projectName}
            currentRecommendation={decisionRfq.lastFeasibilityCheck?.recommendation || 'INSUFFICIENT DATA'}
            currentUser={currentUser}
            onSubmit={handleDecisionSubmit}
          />
        )}
      </div>
    </div>
  );
}
