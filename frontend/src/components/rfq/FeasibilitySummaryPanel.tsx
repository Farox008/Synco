"use client";

import React from 'react';
import { FeasibilityResult, FeasibilityRecommendation } from '@/services/rfq.service';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, RefreshCw, AlertOctagon, Lightbulb } from 'lucide-react';

interface FeasibilitySummaryPanelProps {
  feasibility: FeasibilityResult | null;
  requirementsChanged: boolean;
  onRunCheck: () => void;
  isLoading?: boolean;
}

export default function FeasibilitySummaryPanel({
  feasibility,
  requirementsChanged,
  onRunCheck,
  isLoading = false
}: FeasibilitySummaryPanelProps) {
  const recommendation = feasibility?.recommendation || 'INSUFFICIENT DATA';

  const getRecommendationBadge = (rec: FeasibilityRecommendation) => {
    switch (rec) {
      case 'FEASIBLE':
        return {
          icon: <CheckCircle2 size={18} />,
          text: 'FEASIBLE',
          color: 'var(--success-green)',
          bg: 'var(--success-green-light)',
          border: '#A7F3D0'
        };
      case 'FEASIBLE WITH CONDITIONS':
        return {
          icon: <AlertTriangle size={18} />,
          text: 'FEASIBLE WITH CONDITIONS',
          color: 'var(--warning-orange)',
          bg: 'var(--warning-orange-light)',
          border: '#FDE68A'
        };
      case 'NOT FEASIBLE':
        return {
          icon: <XCircle size={18} />,
          text: 'NOT FEASIBLE',
          color: 'var(--accent-red)',
          bg: 'var(--accent-red-light)',
          border: '#FECACA'
        };
      case 'INSUFFICIENT DATA':
      default:
        return {
          icon: <HelpCircle size={18} />,
          text: 'INSUFFICIENT DATA',
          color: 'var(--text-tertiary)',
          bg: '#F8FAFC',
          border: 'var(--border-color)'
        };
    }
  };

  const badge = getRecommendationBadge(recommendation);

  return (
    <div 
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Header with Title and Run Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Feasibility Assessment
          </h3>
          {feasibility && (
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Evaluated {feasibility.evaluatedAt} by {feasibility.evaluatedBy}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onRunCheck}
          disabled={isLoading}
          style={{ 
            fontSize: '12px', 
            fontWeight: 600,
            padding: '7px 14px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px',
            backgroundColor: requirementsChanged ? 'var(--accent-red)' : '#1A1D1F',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
          <span>{isLoading ? 'Assessing...' : 'Run Feasibility Check'}</span>
        </button>
      </div>

      {/* Requirement Change Protection Alert */}
      {requirementsChanged && (
        <div style={{
          backgroundColor: 'var(--accent-red-light)',
          border: '1px solid #FECACA',
          borderRadius: '8px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <AlertOctagon size={20} style={{ color: 'var(--accent-red)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '13px', flex: 1 }}>
            <strong style={{ color: 'var(--accent-red)', display: 'block', marginBottom: '2px' }}>
              ⚠ Requirements Changed
            </strong>
            <span style={{ color: 'var(--text-secondary)' }}>
              Core inputs (budget, dates, or process estimates) have changed. The previous feasibility assessment is no longer valid.
            </span>
          </div>
          <button
            type="button"
            onClick={onRunCheck}
            disabled={isLoading}
            style={{ 
              fontSize: '11px', 
              fontWeight: 600,
              padding: '4px 10px', 
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              flexShrink: 0 
            }}
          >
            Re-Assess
          </button>
        </div>
      )}

      {/* Detailed Line-by-Line Checks */}
      <div style={{
        backgroundColor: '#F8FAFC',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px 24px',
        fontSize: '13px'
      }}>
        {/* Budget Check */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Customer Budget</span>
          {feasibility && feasibility.recommendation !== 'INSUFFICIENT DATA' ? (
            <span className="pill-green" style={{ fontSize: '11px', padding: '2px 6px' }}>
              <CheckCircle2 size={11} /> PASS
            </span>
          ) : (
            <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', fontSize: '12px' }}>Pending</span>
          )}
        </div>

        {/* Margin Check */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Target Margin</span>
          {feasibility ? (
            feasibility.marginPass ? (
              <span className="pill-green" style={{ fontSize: '11px', padding: '2px 6px' }}>
                <CheckCircle2 size={11} /> PASS
              </span>
            ) : (
              <span className="pill-red" style={{ fontSize: '11px', padding: '2px 6px' }}>
                <XCircle size={11} /> BELOW
              </span>
            )
          ) : (
            <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', fontSize: '12px' }}>Pending</span>
          )}
        </div>

        {/* Timeline Check */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Timeline Buffer</span>
          {feasibility ? (
            feasibility.timelinePass === 'PASS' ? (
              <span className="pill-green" style={{ fontSize: '11px', padding: '2px 6px' }}>
                <CheckCircle2 size={11} /> PASS
              </span>
            ) : feasibility.timelinePass === 'AT_RISK' ? (
              <span className="pill-orange" style={{ fontSize: '11px', padding: '2px 6px' }}>
                <AlertTriangle size={11} /> AT RISK
              </span>
            ) : (
              <span className="pill-red" style={{ fontSize: '11px', padding: '2px 6px' }}>
                <XCircle size={11} /> SHORTFALL
              </span>
            )
          ) : (
            <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', fontSize: '12px' }}>Pending</span>
          )}
        </div>

        {/* Capacity Checks from Breakdown */}
        {feasibility?.capacityBreakdown.filter(c => c.status !== 'DATA_UNAVAILABLE').map((cap) => (
          <div key={cap.process} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{cap.processName}</span>
            {cap.status === 'PASS' ? (
              <span className="pill-green" style={{ fontSize: '11px', padding: '2px 6px' }}>
                <CheckCircle2 size={11} /> PASS
              </span>
            ) : (
              <span className="pill-red" style={{ fontSize: '11px', padding: '2px 6px' }}>
                <XCircle size={11} /> SHORTAGE
              </span>
            )}
          </div>
        ))}
      </div>

      {/* OVERALL RECOMMENDATION BANNER */}
      <div style={{
        backgroundColor: badge.bg,
        border: `1px solid ${badge.border}`,
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
            System Recommendation
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 800, 
            color: badge.color, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginTop: '3px'
          }}>
            {badge.icon}
            <span>{badge.text}</span>
          </div>
        </div>

        <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '280px' }}>
          {recommendation === 'FEASIBLE' && 'All critical checks pass. Job meets commercial margin and capacity criteria.'}
          {recommendation === 'FEASIBLE WITH CONDITIONS' && 'Viable if specific capacity shortages or buffer risks are mitigated.'}
          {recommendation === 'NOT FEASIBLE' && 'Critical constraints failed (negative margin or impossible deadline).'}
          {recommendation === 'INSUFFICIENT DATA' && 'Complete customer budget, timelines, and estimates to assess.'}
        </div>
      </div>

      {/* Flagged Issues List */}
      {feasibility && feasibility.issues.length > 0 && (
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          border: '1px solid var(--border-color)', 
          borderRadius: '8px', 
          padding: '14px' 
        }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-red)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Flagged Issues ({feasibility.issues.length}):
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-primary)' }}>
            {feasibility.issues.map((issue, idx) => (
              <li key={idx} style={{ marginBottom: '6px', lineHeight: 1.4 }}>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Mitigations / Conditions */}
      {feasibility && feasibility.suggestedConditions.length > 0 && (
        <div style={{ 
          backgroundColor: 'var(--warning-orange-light)', 
          border: '1px solid #FDE68A', 
          borderRadius: '8px', 
          padding: '14px' 
        }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--warning-orange)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Lightbulb size={14} />
            <span>Suggested Conditions & Actions:</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-primary)' }}>
            {feasibility.suggestedConditions.map((cond, idx) => (
              <li key={idx} style={{ marginBottom: '6px', lineHeight: 1.4 }}>
                {cond}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
