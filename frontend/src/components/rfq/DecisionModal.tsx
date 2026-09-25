"use client";

import React, { useState } from 'react';
import { DecisionAction, FeasibilityRecommendation } from '@/services/rfq.service';
import { CheckCircle2, Clock, XCircle, ShieldAlert, X } from 'lucide-react';

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfqNumber: string;
  projectName: string;
  currentRecommendation: FeasibilityRecommendation;
  currentUser: string;
  onSubmit: (decision: { action: DecisionAction; reason?: string; conditions?: string }) => void;
}

export default function DecisionModal({
  isOpen,
  onClose,
  rfqNumber,
  projectName,
  currentRecommendation,
  currentUser,
  onSubmit
}: DecisionModalProps) {
  const [selectedAction, setSelectedAction] = useState<DecisionAction>('CONFIRMED');
  const [conditions, setConditions] = useState('');
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (selectedAction === 'REJECT' && !reason.trim()) {
      setValidationError('Please specify the reason for rejecting this RFQ.');
      return;
    }

    onSubmit({
      action: selectedAction,
      reason: reason.trim() || undefined
    });
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div 
        className="modal-content"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Operation Manager Decision
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {rfqNumber} · {projectName}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Current Feasibility Snapshot Info */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px'
          }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>System Feasibility:</span>
              <strong style={{ marginLeft: '8px', color: 'var(--text-primary)' }}>
                {currentRecommendation}
              </strong>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Signer: <strong>{currentUser}</strong>
            </div>
          </div>

          {/* Action Selector Buttons - Strictly 3 Options: Pending, Confirmed, Reject */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              SELECT DECISION *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {/* 1. Pending */}
              <button
                type="button"
                onClick={() => { setSelectedAction('PENDING'); setValidationError(null); }}
                style={{
                  padding: '12px 6px',
                  borderRadius: '8px',
                  border: (selectedAction === 'PENDING' || selectedAction === 'HOLD') ? '2px solid #F59E0B' : '1px solid var(--border-color)',
                  backgroundColor: (selectedAction === 'PENDING' || selectedAction === 'HOLD') ? '#FEF3C7' : '#FFFFFF',
                  color: (selectedAction === 'PENDING' || selectedAction === 'HOLD') ? '#B45309' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Clock size={16} /> Pending
              </button>

              {/* 2. Confirmed */}
              <button
                type="button"
                onClick={() => { setSelectedAction('CONFIRMED'); setValidationError(null); }}
                style={{
                  padding: '12px 6px',
                  borderRadius: '8px',
                  border: (selectedAction === 'CONFIRMED' || selectedAction === 'ACCEPT') ? '2px solid #10B981' : '1px solid var(--border-color)',
                  backgroundColor: (selectedAction === 'CONFIRMED' || selectedAction === 'ACCEPT') ? '#D1FAE5' : '#FFFFFF',
                  color: (selectedAction === 'CONFIRMED' || selectedAction === 'ACCEPT') ? '#047857' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <CheckCircle2 size={16} /> Confirmed
              </button>

              {/* 3. Reject */}
              <button
                type="button"
                onClick={() => { setSelectedAction('REJECT'); setValidationError(null); }}
                style={{
                  padding: '12px 6px',
                  borderRadius: '8px',
                  border: selectedAction === 'REJECT' ? '2px solid #F43F5E' : '1px solid var(--border-color)',
                  backgroundColor: selectedAction === 'REJECT' ? '#FFE4E6' : '#FFFFFF',
                  color: selectedAction === 'REJECT' ? '#BE123C' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <XCircle size={16} /> Reject
              </button>
            </div>
          </div>

          {/* Rejection Reason */}
          {selectedAction === 'REJECT' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--accent-red)', textTransform: 'uppercase', marginBottom: '6px' }}>
                REJECTION REASON *
              </label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Specify commercial, shopfloor capacity, or technical non-feasibility reason..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '13px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
          )}

          {/* Pending Notes */}
          {selectedAction === 'PENDING' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#B45309', textTransform: 'uppercase', marginBottom: '6px' }}>
                PENDING REVIEW NOTES (OPTIONAL)
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Specify pending customer clarifications, technical design checks, or material availability..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '13px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
          )}

          {/* Confirmation Notes */}
          {(selectedAction === 'CONFIRMED' || selectedAction === 'ACCEPT') && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#047857', textTransform: 'uppercase', marginBottom: '6px' }}>
                CONFIRMATION & APPROVAL NOTES (OPTIONAL)
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Operational notes for Quotation, Job Order generation, and Production Scheduling..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '13px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
          )}

          {/* Validation Error Banner */}
          {validationError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12px',
              color: 'var(--accent-red)',
              backgroundColor: 'var(--accent-red-light)',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #FECACA'
            }}>
              <ShieldAlert size={16} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: selectedAction === 'REJECT' ? 'var(--accent-red)' : selectedAction === 'ACCEPT' ? 'var(--success-green)' : '#1A1D1F',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Confirm {selectedAction}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
