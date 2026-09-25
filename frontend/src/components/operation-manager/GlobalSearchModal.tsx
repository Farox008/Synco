"use client";

import React, { useState, useEffect } from 'react';
import { Search, X, Layers, FileText, MessageSquare } from 'lucide-react';
import { ActiveJob } from '@/services/operation-manager.service';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: ActiveJob[];
  onSelectResult: (type: string, id: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  jobs,
  onSelectResult
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Search items across Job, RFQ, Quotation, Customer, Part
  const jobResults = jobs.filter(j => 
    j.jobNo.toLowerCase().includes(query.toLowerCase()) ||
    j.project.toLowerCase().includes(query.toLowerCase()) ||
    j.customer.toLowerCase().includes(query.toLowerCase())
  );

  const rfqResults = [
    { id: 'RFQ-0124', title: 'Door Inner Panel Stamping Die', customer: 'ABC Automotive', type: 'RFQ' },
    { id: 'RFQ-0238', title: 'Steel Plates & Billets Kit', customer: 'Global Energy', type: 'RFQ' },
    { id: 'RFQ-0112', title: 'Surgical Tray Injection Mold', customer: 'BioMedical Systems', type: 'RFQ' }
  ].filter(r => 
    r.id.toLowerCase().includes(query.toLowerCase()) ||
    r.title.toLowerCase().includes(query.toLowerCase()) ||
    r.customer.toLowerCase().includes(query.toLowerCase())
  );

  const quotationResults = [
    { id: 'QT-0088', title: 'Turbine Rotor Flange Tooling', customer: 'Global Energy', amount: '$48,500', type: 'Quotation' },
    { id: 'QT-0092', title: 'Bracket Tooling Prototype', customer: 'XYZ Motors', amount: '$18,200', type: 'Quotation' }
  ].filter(q => 
    q.id.toLowerCase().includes(query.toLowerCase()) ||
    q.title.toLowerCase().includes(query.toLowerCase()) ||
    q.customer.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      zIndex: 1100,
      paddingTop: '100px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '600px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        overflow: 'hidden'
      }}>
        {/* Search Input Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <Search size={18} color="var(--text-tertiary)" />
          <input
            type="text"
            autoFocus
            placeholder="Search by Job, RFQ, Quotation, Customer, or Part..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: 'var(--text-primary)'
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '12px 16px' }}>
          {/* Jobs */}
          {jobResults.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '8px' }}>
                Jobs ({jobResults.length})
              </div>
              {jobResults.map(job => (
                <div
                  key={job.jobNo}
                  onClick={() => { onSelectResult('job', job.jobNo); onClose(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-color)'}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Layers size={15} color="#1976D2" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {job.jobNo} — {job.project}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {job.customer} • Stage: {job.stage}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#EFF6FF', color: '#1D4ED8', padding: '2px 6px', borderRadius: '4px' }}>
                    Job
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* RFQs */}
          {rfqResults.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '8px' }}>
                RFQs ({rfqResults.length})
              </div>
              {rfqResults.map(rfq => (
                <div
                  key={rfq.id}
                  onClick={() => { onSelectResult('rfq', rfq.id); onClose(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-color)'}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={15} color="#059669" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {rfq.id} — {rfq.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {rfq.customer}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#ECFDF5', color: '#047857', padding: '2px 6px', borderRadius: '4px' }}>
                    RFQ
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quotations */}
          {quotationResults.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '8px' }}>
                Quotations ({quotationResults.length})
              </div>
              {quotationResults.map(qt => (
                <div
                  key={qt.id}
                  onClick={() => { onSelectResult('quotation', qt.id); onClose(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-color)'}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MessageSquare size={15} color="#7C3AED" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {qt.id} — {qt.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {qt.customer} • Value: {qt.amount}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#F5F3FF', color: '#6D28D9', padding: '2px 6px', borderRadius: '4px' }}>
                    Quotation
                  </span>
                </div>
              ))}
            </div>
          )}

          {jobResults.length === 0 && rfqResults.length === 0 && quotationResults.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No operational items match &quot;{query}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
