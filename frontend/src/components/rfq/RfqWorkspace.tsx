"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  RfqRecord, 
  RfqService, 
  DecisionAction 
} from '@/services/rfq.service';
import { JobRecord } from '@/types/rfq-job.types';
import { 
  rfqRecordToJobRecord, 
  jobRecordToRfqRecord, 
  createDefaultJobRfq 
} from '@/services/rfq-job-calculator.service';
import RfqJobWorkspace from './redesign/RfqJobWorkspace';
import DecisionModal from './DecisionModal';
import { Paperclip, History, LayoutDashboard, CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface RfqWorkspaceProps {
  rfq: RfqRecord | null; // null means creating a new RFQ
  onBack: () => void;
  onSaved: (savedRfq: RfqRecord) => void;
  currentUser?: string;
}

export default function RfqWorkspace({
  rfq,
  onBack,
  onSaved,
  currentUser = 'Alex Wong (Operation Manager)'
}: RfqWorkspaceProps) {
  const router = useRouter();
  // Active primary tab: hierarchy workspace vs supporting tabs
  const [activeTab, setActiveTab] = useState<'workspace' | 'attachments' | 'audit'>('workspace');
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState<JobRecord>(() => {
    if (rfq) {
      return rfqRecordToJobRecord(rfq);
    }
    const defaultJob = createDefaultJobRfq();
    defaultJob.preparedBy = currentUser;
    return defaultJob;
  });

  const [rfqState, setRfqState] = useState<RfqRecord>(() => {
    if (rfq) return rfq;
    return jobRecordToRfqRecord(currentJob);
  });

  // Handle saving the JobRecord
  const handleSaveJob = async (job: JobRecord) => {
    setCurrentJob(job);
    const convertedRfq = jobRecordToRfqRecord(job, rfqState);
    try {
      const saved = await RfqService.save(convertedRfq, currentUser);
      setRfqState(saved);
      onSaved(saved);
    } catch (err) {
      console.error('Failed to save RFQ job:', err);
    }
  };

  // Convert to Quotation & Redirect to dedicated Quotation Page
  const handleConvertToQuotation = async (job: JobRecord) => {
    try {
      const convertedRfq = jobRecordToRfqRecord(job, rfqState);
      const saved = await RfqService.save(convertedRfq, currentUser);
      const res = await RfqService.convertToQuotation(saved.id, currentUser);
      setRfqState(res.rfq);
      onSaved(res.rfq);
      router.push(`/quotations/${res.quotationNo}`);
    } catch (err: any) {
      alert(err.message || 'Error converting to quotation.');
    }
  };

  // Submit OM Decision
  const handleDecisionSubmit = async (decisionData: { action: DecisionAction; reason?: string; conditions?: string }) => {
    try {
      const updated = await RfqService.submitDecision(rfqState.id, decisionData, currentUser);
      setRfqState(updated);
      onSaved(updated);
      setIsDecisionModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to record decision.');
    }
  };

  // Simulate file upload
  const handleUploadAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const newAtt = {
      id: `att-${Date.now()}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.type || 'Engineering Drawing',
      uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      uploadedBy: currentUser
    };

    const updated = {
      ...rfqState,
      attachments: [...(rfqState.attachments || []), newAtt]
    };
    setRfqState(updated);
    RfqService.save(updated, currentUser);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Secondary Tab Navigator */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '6px 14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('workspace')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'workspace' ? '#EFF6FF' : 'transparent',
              color: activeTab === 'workspace' ? '#2563EB' : '#64748B',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <LayoutDashboard size={15} />
            <span>Job Feasibility & Production Planning</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attachments')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'attachments' ? '#EFF6FF' : 'transparent',
              color: activeTab === 'attachments' ? '#2563EB' : '#64748B',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Paperclip size={15} />
            <span>Attachments ({(rfqState.attachments || []).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'audit' ? '#EFF6FF' : 'transparent',
              color: activeTab === 'audit' ? '#2563EB' : '#64748B',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <History size={15} />
            <span>Audit Trail ({(rfqState.auditHistory || []).length})</span>
          </button>
        </div>

        {/* OM Decision Stamp */}
        {rfqState.decision && (
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#15803D',
              backgroundColor: '#DCFCE7',
              padding: '3px 10px',
              borderRadius: '6px'
            }}
          >
            <ShieldCheck size={14} />
            <span>OM Decision: {rfqState.decision.action} ({rfqState.decision.decidedAt})</span>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'workspace' && (
        <RfqJobWorkspace
          initialJob={currentJob}
          onBack={onBack}
          onSaveJob={handleSaveJob}
          onConvertToQuotation={handleConvertToQuotation}
          onOpenDecisionModal={() => setIsDecisionModalOpen(true)}
          currentUser={currentUser}
        />
      )}

      {/* Attachments Tab */}
      {activeTab === 'attachments' && (
        <div 
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                Engineering CAD & Specification Files
              </h3>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                Customer technical documents, STEP 3D models, and BOM specifications
              </span>
            </div>

            <label 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Paperclip size={15} />
              <span>Upload Document</span>
              <input type="file" onChange={handleUploadAttachment} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(rfqState.attachments || []).map((att) => (
              <div 
                key={att.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Paperclip size={16} style={{ color: '#2563EB' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#0F172A' }}>{att.name}</div>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      {att.size} • {att.type} • Uploaded {att.uploadDate} by {att.uploadedBy}
                    </span>
                  </div>
                </div>

                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert(`Simulated download for ${att.name}`); }}
                  style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit' && (
        <div 
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
            Internal Operation Manager Audit Trail
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(rfqState.auditHistory || []).map((log) => (
              <div 
                key={log.id}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#F8FAFC',
                  borderLeft: '3px solid #2563EB',
                  borderRadius: '0 8px 8px 0',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ color: '#0F172A' }}>{log.action}</strong>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>{log.timestamp}</span>
                </div>
                <div style={{ color: '#475569' }}>{log.details}</div>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                  Actor: {log.actor}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {isDecisionModalOpen && (
        <DecisionModal
          isOpen={isDecisionModalOpen}
          onClose={() => setIsDecisionModalOpen(false)}
          rfqNumber={currentJob.rfqNumber}
          projectName={`${currentJob.jobNumber} (${currentJob.tools.length} Tools)`}
          currentRecommendation={currentJob.overallFeasibility === 'FEASIBLE' ? 'FEASIBLE' : currentJob.overallFeasibility === 'AT_RISK' ? 'FEASIBLE WITH CONDITIONS' : 'NOT FEASIBLE'}
          currentUser={currentUser}
          onSubmit={handleDecisionSubmit}
        />
      )}
    </div>
  );
}
