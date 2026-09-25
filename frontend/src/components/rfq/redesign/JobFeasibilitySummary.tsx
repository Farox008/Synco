"use client";

import React from 'react';
import { JobRecord, FeasibilityStatus } from '@/types/rfq-job.types';
import { formatUsd, formatCurrencyAmount } from '@/services/rfq-job-calculator.service';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  DollarSign, 
  Layers, 
  Clock, 
  Save, 
  Share2, 
  ShieldCheck, 
  FileCheck2,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';

interface JobFeasibilitySummaryProps {
  job: JobRecord;
  onSave: () => void;
  onConvertToQuotation: () => void;
  onOpenDecisionModal?: () => void;
  isSaving?: boolean;
  readOnly?: boolean;
}

export default function JobFeasibilitySummary({
  job,
  onSave,
  onConvertToQuotation,
  onOpenDecisionModal,
  isSaving = false,
  readOnly = false
}: JobFeasibilitySummaryProps) {
  const isFeasible = job.overallFeasibility === 'FEASIBLE';
  const isAtRisk = job.overallFeasibility === 'AT_RISK';
  const isNotFeasible = job.overallFeasibility === 'NOT_FEASIBLE';

  const getStatusBadge = () => {
    if (isFeasible) {
      return (
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#DCFCE7',
            color: '#15803D',
            border: '1px solid #86EFAC',
            padding: '8px 18px',
            borderRadius: '999px',
            fontSize: '15px',
            fontWeight: 800,
            letterSpacing: '0.5px'
          }}
        >
          <CheckCircle2 size={18} />
          <span>✓ FEASIBLE</span>
        </div>
      );
    }
    if (isAtRisk) {
      return (
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFEDD5',
            color: '#C2410C',
            border: '1px solid #FDBA74',
            padding: '8px 18px',
            borderRadius: '999px',
            fontSize: '15px',
            fontWeight: 800,
            letterSpacing: '0.5px'
          }}
        >
          <AlertTriangle size={18} />
          <span>⚠ AT RISK</span>
        </div>
      );
    }
    return (
      <div 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#FEE2E2',
          color: '#B91C1C',
          border: '1px solid #FCA5A5',
          padding: '8px 18px',
          borderRadius: '999px',
          fontSize: '15px',
          fontWeight: 800,
          letterSpacing: '0.5px'
        }}
      >
        <XCircle size={18} />
        <span>✕ NOT FEASIBLE</span>
      </div>
    );
  };

  return (
    <div 
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid var(--border-color, #E2E8F0)',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        marginBottom: '32px'
      }}
    >
      {/* Section Header */}
      <div 
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color, #E2E8F0)',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px'
            }}
          >
            6
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #0F172A)' }}>
              OVERALL RFQ / JOB FEASIBILITY EVALUATION
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748B)' }}>
              Holistic synthesis of tool budgets, shop-floor capacity, and lead-time delivery alignment
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div>{getStatusBadge()}</div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Executive Summary Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '20px'
          }}
        >
          {/* Total Customer Budget */}
          <div>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
              Total Customer Budget ({job.currency || 'RM'})
            </span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
              {formatCurrencyAmount(job.totalCustomerBudget, job.currency || 'RM', false)}
            </div>
          </div>

          {/* Customer Profit */}
          <div>
            <span style={{ fontSize: '12px', color: '#92400E', fontWeight: 700 }}>
              Profit Margin ({job.profitPercentage ?? 15}%)
            </span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#B45309', marginTop: '2px' }}>
              {formatCurrencyAmount(job.totalProfit, job.currency || 'RM', false)}
            </div>
          </div>

          {/* Working Budget */}
          <div>
            <span style={{ fontSize: '12px', color: '#166534', fontWeight: 700 }}>
              Working Budget ({(100 - (job.profitPercentage ?? 15)).toFixed(1).replace('.0', '')}%)
            </span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>
              {formatCurrencyAmount(job.totalWorkingBudget, job.currency || 'RM', false)}
            </div>
          </div>

          {/* Number of Tools */}
          <div>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
              Number of Tools
            </span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
              {job.tools.length} Tools
            </div>
          </div>

          {/* Budget Allocation */}
          <div>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
              Budget Allocation
            </span>
            <div 
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: job.isBudgetAllocationValid ? '#15803D' : '#EA580C',
                marginTop: '2px'
              }}
            >
              {job.budgetAllocationPercent.toFixed(1).replace('.0', '')}%
            </div>
          </div>
        </div>

        {/* Lead Time Delivery Comparison Row */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}
        >
          {/* Box 1: Customer Required vs Factory Completion */}
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${isFeasible ? '#BBF7D0' : isAtRisk ? '#FED7AA' : '#FECACA'}`,
              borderRadius: '10px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Delivery Schedule Verification
              </span>
              
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Factory Estimated Completion:</span>
                  <strong style={{ fontSize: '14px', color: '#0F172A' }}>
                    {job.factoryEstimatedCompletion || 'Pending Schedule'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Customer Required Date:</span>
                  <strong style={{ fontSize: '14px', color: job.requiredCompletionDate ? '#0F172A' : '#94A3B8' }}>
                    {job.requiredCompletionDate || 'Not specified (Factory lead time will be quoted)'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px dashed #E2E8F0' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Calculated Shop Lead Time:</span>
                  <strong style={{ fontSize: '14px', color: '#2563EB' }}>
                    {job.factoryCalculatedLeadTimeDays} Working Days
                  </strong>
                </div>
              </div>
            </div>

            {/* Shortfall or Feasible Feedback Banner */}
            <div style={{ marginTop: '14px' }}>
              {isFeasible ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803D', fontSize: '13px', fontWeight: 700 }}>
                  <CheckCircle2 size={16} />
                  <span>Factory can comfortably deliver on or ahead of schedule.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#B91C1C', fontSize: '13px', fontWeight: 700 }}>
                  <AlertOctagon size={16} />
                  <span>Shortfall: {job.shortfallWorkingDays} working days behind customer target date.</span>
                </div>
              )}
            </div>
          </div>

          {/* Box 2: Critical Capacity & Feasibility Observations */}
          <div 
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Operational Capacity & Issues
              </span>

              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {job.criticalIssues.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803D', fontSize: '13px' }}>
                    <CheckCircle2 size={14} />
                    <span>No departmental capacity bottlenecks or schedule conflicts detected.</span>
                  </div>
                ) : (
                  job.criticalIssues.map((issue, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px',
                        fontSize: '12px',
                        color: '#991B1B',
                        backgroundColor: '#FEF2F2',
                        padding: '6px 10px',
                        borderRadius: '6px'
                      }}
                    >
                      <AlertTriangle size={13} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{issue}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <span style={{ fontSize: '11px', color: '#64748B', marginTop: '12px' }}>
              Feasibility is derived dynamically from individual tool machining hours and existing factory commitments.
            </span>
          </div>
        </div>

        {/* Action Controls Bar for Operation Manager */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid #E2E8F0'
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Prepared by: <strong style={{ color: '#0F172A' }}>{job.preparedBy}</strong> • Status: <span style={{ fontWeight: 700, color: '#2563EB' }}>{job.status}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onOpenDecisionModal && (
              <button
                type="button"
                onClick={onOpenDecisionModal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <ShieldCheck size={16} style={{ color: '#4F46E5' }} />
                <span>Record OM Decision</span>
              </button>
            )}

            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
            >
              <Save size={16} />
              <span>{isSaving ? 'Saving...' : 'Save Job / RFQ'}</span>
            </button>

            <button
              type="button"
              onClick={onConvertToQuotation}
              disabled={!job.isBudgetAllocationValid && job.budgetMode === 'MAIN_JOB'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: (!job.isBudgetAllocationValid && job.budgetMode === 'MAIN_JOB') ? 'not-allowed' : 'pointer',
                opacity: (!job.isBudgetAllocationValid && job.budgetMode === 'MAIN_JOB') ? 0.6 : 1,
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
              }}
            >
              <FileCheck2 size={16} />
              <span>Proceed to Quotation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
