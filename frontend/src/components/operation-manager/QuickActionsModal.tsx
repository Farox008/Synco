"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { OperationManagerService } from '@/services/operation-manager.service';

interface QuickActionsModalProps {
  isOpen: boolean;
  actionType: 'job' | 'rfq' | 'quotation' | 'revision' | 'design' | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  isOpen,
  actionType,
  onClose,
  onSuccess
}) => {
  if (!isOpen || !actionType) return null;

  const [loading, setLoading] = useState(false);

  // Form states
  const [jobData, setJobData] = useState({
    jobNo: `JOB-00${Math.floor(Math.random() * 90) + 70}`,
    customer: '',
    project: '',
    priority: 'HIGH' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    plannedCompletion: '',
    estimatedHours: 80
  });

  const [rfqData, setRfqData] = useState({
    rfqNo: `RFQ-0${Math.floor(Math.random() * 90) + 110}`,
    customer: '',
    partName: '',
    targetDate: '',
    estimatedValue: '$25,000'
  });

  const [quotationData, setQuotationData] = useState({
    quoteNo: `QT-0${Math.floor(Math.random() * 90) + 100}`,
    customer: '',
    amount: '$35,000',
    validUntil: ''
  });

  const [revisionData, setRevisionData] = useState({
    jobNo: 'JOB-0045',
    reason: '',
    priority: 'HIGH' as 'HIGH' | 'CRITICAL',
    assignedManager: 'Design Manager John'
  });

  const [designData, setDesignData] = useState({
    jobNo: 'JOB-0046',
    toolName: 'Stamping Die Upper',
    deadline: '',
    instructions: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (actionType === 'job') {
        await OperationManagerService.createJob(jobData);
      } else if (actionType === 'rfq') {
        await OperationManagerService.createRFQ(rfqData);
      } else if (actionType === 'quotation') {
        await OperationManagerService.createQuotation(quotationData);
      } else if (actionType === 'revision') {
        await OperationManagerService.createRevisionRequest(revisionData);
      } else if (actionType === 'design') {
        await OperationManagerService.createDesignRequest(designData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (actionType) {
      case 'job': return 'Create Operational Job';
      case 'rfq': return 'Create Incoming RFQ';
      case 'quotation': return 'Create Commercial Quotation';
      case 'revision': return 'Create Revision Request';
      case 'design': return 'Create Design Request';
      default: return 'Quick Action';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        animation: 'fadeIn 0.15s ease'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FAFBFB'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            {getTitle()}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {actionType === 'job' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Job Number *
                </label>
                <input
                  type="text"
                  required
                  value={jobData.jobNo}
                  onChange={e => setJobData({ ...jobData, jobNo: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Aerospace Corp"
                  value={jobData.customer}
                  onChange={e => setJobData({ ...jobData, customer: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Project / Part Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Outer Die Cavity Base"
                  value={jobData.project}
                  onChange={e => setJobData({ ...jobData, project: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Priority *
                  </label>
                  <select
                    value={jobData.priority}
                    onChange={e => setJobData({ ...jobData, priority: e.target.value as any })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', background: 'white' }}
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    value={jobData.estimatedHours}
                    onChange={e => setJobData({ ...jobData, estimatedHours: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Planned Completion Date *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 28 Sep 2026"
                  value={jobData.plannedCompletion}
                  onChange={e => setJobData({ ...jobData, plannedCompletion: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                />
              </div>
            </div>
          )}

          {actionType === 'rfq' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  RFQ Reference *
                </label>
                <input
                  type="text"
                  required
                  value={rfqData.rfqNo}
                  onChange={e => setRfqData({ ...rfqData, rfqNo: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Precision Tech Motors"
                  value={rfqData.customer}
                  onChange={e => setRfqData({ ...rfqData, customer: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Part / Mold Requirement *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Progressive Stamping Tool"
                  value={rfqData.partName}
                  onChange={e => setRfqData({ ...rfqData, partName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Target Response Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Sep 2026"
                    value={rfqData.targetDate}
                    onChange={e => setRfqData({ ...rfqData, targetDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Estimated Value
                  </label>
                  <input
                    type="text"
                    value={rfqData.estimatedValue}
                    onChange={e => setRfqData({ ...rfqData, estimatedValue: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {actionType === 'quotation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Quotation Number *
                </label>
                <input
                  type="text"
                  required
                  value={quotationData.quoteNo}
                  onChange={e => setQuotationData({ ...quotationData, quoteNo: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Global Energy Ltd"
                  value={quotationData.customer}
                  onChange={e => setQuotationData({ ...quotationData, customer: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Quotation Amount *
                  </label>
                  <input
                    type="text"
                    required
                    value={quotationData.amount}
                    onChange={e => setQuotationData({ ...quotationData, amount: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Valid Until
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 30 Days"
                    value={quotationData.validUntil}
                    onChange={e => setQuotationData({ ...quotationData, validUntil: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {actionType === 'revision' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Related Job *
                </label>
                <input
                  type="text"
                  required
                  value={revisionData.jobNo}
                  onChange={e => setRevisionData({ ...revisionData, jobNo: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Revision Reason & Scope *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe engineering changes or dimensional corrections..."
                  value={revisionData.reason}
                  onChange={e => setRevisionData({ ...revisionData, reason: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Priority
                  </label>
                  <select
                    value={revisionData.priority}
                    onChange={e => setRevisionData({ ...revisionData, priority: e.target.value as any })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', background: 'white' }}
                  >
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Assigned Manager
                  </label>
                  <input
                    type="text"
                    value={revisionData.assignedManager}
                    onChange={e => setRevisionData({ ...revisionData, assignedManager: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {actionType === 'design' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Job Number *
                </label>
                <input
                  type="text"
                  required
                  value={designData.jobNo}
                  onChange={e => setDesignData({ ...designData, jobNo: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Tool / Assembly Name *
                </label>
                <input
                  type="text"
                  required
                  value={designData.toolName}
                  onChange={e => setDesignData({ ...designData, toolName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Design Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="CAD specifications, mold flow criteria..."
                  value={designData.instructions}
                  onChange={e => setDesignData({ ...designData, instructions: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                />
              </div>
            </div>
          )}

          {/* Actions Footer */}
          <div style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                background: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 20px',
                background: 'var(--text-primary)',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                color: 'white',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {loading ? 'Saving...' : 'Save & Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
