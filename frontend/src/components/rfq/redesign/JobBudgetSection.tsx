"use client";

import React from 'react';
import { JobRecord, JobBudgetMode } from '@/types/rfq-job.types';
import { 
  formatCurrencyAmount, 
  getCurrencySymbol, 
  getDefaultExchangeRate, 
  SUPPORTED_CURRENCIES 
} from '@/services/rfq-job-calculator.service';
import { 
  DollarSign, 
  TrendingUp, 
  Briefcase, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Percent, 
  ShieldCheck,
  HelpCircle,
  ArrowRightLeft,
  RefreshCw,
  Coins
} from 'lucide-react';

interface JobBudgetSectionProps {
  job: JobRecord;
  onChange: (updated: Partial<JobRecord>) => void;
  readOnly?: boolean;
}

export default function JobBudgetSection({
  job,
  onChange,
  readOnly = false
}: JobBudgetSectionProps) {
  const isMainMode = job.budgetMode === 'MAIN_JOB';
  const allocPercent = job.budgetAllocationPercent;
  const isValid = job.isBudgetAllocationValid;

  const currentCurrency = job.currency || 'RM';
  const currentTargetCurrency = job.targetCurrency || 'MYR';
  const currentExchangeRate = typeof job.exchangeRate === 'number' && job.exchangeRate > 0 
    ? job.exchangeRate 
    : getDefaultExchangeRate(currentCurrency, currentTargetCurrency);

  const customerSymbol = getCurrencySymbol(currentCurrency);
  const targetSymbol = getCurrencySymbol(currentTargetCurrency);

  const handleCustomerCurrencyChange = (newCurrency: string) => {
    if (readOnly) return;
    const newRate = getDefaultExchangeRate(newCurrency, currentTargetCurrency);
    onChange({
      currency: newCurrency,
      exchangeRate: newRate
    });
  };

  const handleTargetCurrencyChange = (newTarget: string) => {
    if (readOnly) return;
    const newRate = getDefaultExchangeRate(currentCurrency, newTarget);
    onChange({
      targetCurrency: newTarget,
      exchangeRate: newRate
    });
  };

  const handleExchangeRateChange = (valStr: string) => {
    if (readOnly) return;
    const num = parseFloat(valStr);
    onChange({
      exchangeRate: isNaN(num) || num <= 0 ? 1 : num
    });
  };

  const handleResetRate = () => {
    if (readOnly) return;
    const stdRate = getDefaultExchangeRate(currentCurrency, currentTargetCurrency);
    onChange({
      exchangeRate: stdRate
    });
  };

  return (
    <div 
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid var(--border-color, #E2E8F0)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden',
        marginBottom: '24px'
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
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px'
            }}
          >
            2
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #0F172A)' }}>
              JOB BUDGET & ALLOCATION
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748B)' }}>
              Customer currency conversion, total valuation, {job.profitPercentage ?? 15}% profit margin, and tool allocation validation
            </span>
          </div>
        </div>

        {/* Budget Mode Switcher */}
        <div 
          style={{
            display: 'flex',
            backgroundColor: '#E2E8F0',
            padding: '3px',
            borderRadius: '8px',
            gap: '2px'
          }}
        >
          <button
            type="button"
            onClick={() => !readOnly && onChange({ budgetMode: 'MAIN_JOB' })}
            style={{
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: readOnly ? 'default' : 'pointer',
              backgroundColor: isMainMode ? '#FFFFFF' : 'transparent',
              color: isMainMode ? '#0F172A' : '#64748B',
              boxShadow: isMainMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Mode A — Main Job Budget
          </button>
          <button
            type="button"
            onClick={() => !readOnly && onChange({ budgetMode: 'TOOL_SPECIFIC' })}
            style={{
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: readOnly ? 'default' : 'pointer',
              backgroundColor: !isMainMode ? '#FFFFFF' : 'transparent',
              color: !isMainMode ? '#0F172A' : '#64748B',
              boxShadow: !isMainMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Mode B — Tool-Specific Budget
          </button>
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Currency & Conversion Configuration Panel */}
        <div 
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Coins size={18} style={{ color: '#2563EB' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                Currency & Conversion Configuration
              </span>
              <span style={{ fontSize: '11px', color: '#047857', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                Default Target: MYR (RM)
              </span>
            </div>

            {/* Quick Live Exchange Rate Formula Badge */}
            <div 
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#1E293B',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '6px',
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>1 {currentCurrency}</span>
              <ArrowRightLeft size={12} style={{ color: '#2563EB' }} />
              <span style={{ fontWeight: 800, color: '#1D4ED8' }}>{currentExchangeRate} {currentTargetCurrency}</span>
            </div>
          </div>

          {/* Controls: Customer Currency -> Target Currency -> Exchange Rate */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              alignItems: 'flex-end'
            }}
          >
            {/* 1. Customer Currency */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.4px' }}>
                Customer Currency
              </label>
              <select
                value={currentCurrency}
                onChange={(e) => handleCustomerCurrencyChange(e.target.value)}
                disabled={readOnly}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: readOnly ? '#F1F5F9' : '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  cursor: readOnly ? 'default' : 'pointer'
                }}
              >
                {SUPPORTED_CURRENCIES.map(cur => (
                  <option key={cur.code} value={cur.code}>
                    {cur.code} — {cur.name} ({cur.symbol.trim()})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Desired / Target Currency (Default MYR) */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.4px' }}>
                Desired Currency (Default: MYR / RM)
              </label>
              <select
                value={currentTargetCurrency}
                onChange={(e) => handleTargetCurrencyChange(e.target.value)}
                disabled={readOnly}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: readOnly ? '#F1F5F9' : '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  cursor: readOnly ? 'default' : 'pointer'
                }}
              >
                {SUPPORTED_CURRENCIES.map(cur => (
                  <option key={cur.code} value={cur.code}>
                    {cur.code === 'MYR' ? 'MYR (RM) — Malaysian Ringgit (Default)' : `${cur.code} — ${cur.name} (${cur.symbol.trim()})`}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Exchange Rate */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Exchange Rate
                </label>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={handleResetRate}
                    title="Reset to benchmark rate"
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#2563EB',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      padding: 0
                    }}
                  >
                    <RefreshCw size={10} /> Reset
                  </button>
                )}
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={currentExchangeRate}
                  onChange={(e) => handleExchangeRateChange(e.target.value)}
                  disabled={readOnly}
                  placeholder="4.22"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: readOnly ? '#F1F5F9' : '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0F172A',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
            </div>

            {/* 4. Conversion Calculation Preview Box */}
            <div 
              style={{
                backgroundColor: '#F1F5F9',
                border: '1px dashed #CBD5E1',
                borderRadius: '6px',
                padding: '8px 12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                Converted Valuation ({currentTargetCurrency}):
              </span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#166534', fontFamily: 'monospace' }}>
                {formatCurrencyAmount(job.convertedTotalBudget || (job.totalCustomerBudget * currentExchangeRate), currentTargetCurrency)}
              </span>
            </div>
          </div>
        </div>

        {/* Top 3 KPI Cards: Total Customer Budget, Profit 15%, Working Budget 85% */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}
        >
          {/* Card 1: Customer Budget */}
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '18px 20px',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Customer Total Budget ({currentCurrency})
              </span>
              <DollarSign size={16} style={{ color: '#2563EB' }} />
            </div>

            {isMainMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>{customerSymbol.trim()}</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={job.mainJobBudget || ''}
                    onChange={(e) => onChange({ mainJobBudget: parseFloat(e.target.value) || 0 })}
                    disabled={readOnly}
                    placeholder="100000"
                    style={{
                      fontSize: '20px',
                      fontWeight: 800,
                      color: '#0F172A',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      width: '100%',
                      backgroundColor: readOnly ? '#F8FAFC' : '#FFFFFF'
                    }}
                  />
                </div>
                {currentCurrency !== currentTargetCurrency && (
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E40AF', marginTop: '4px' }}>
                    ≈ {formatCurrencyAmount(job.convertedTotalBudget || (job.totalCustomerBudget * currentExchangeRate), currentTargetCurrency)}
                    <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748B', marginLeft: '4px' }}>
                      (@ {currentExchangeRate})
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>
                  {formatCurrencyAmount(job.totalCustomerBudget, currentCurrency, false)}
                </div>
                {currentCurrency !== currentTargetCurrency && (
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E40AF', marginTop: '2px' }}>
                    ≈ {formatCurrencyAmount(job.convertedTotalBudget || (job.totalCustomerBudget * currentExchangeRate), currentTargetCurrency)}
                  </div>
                )}
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748B', marginTop: '2px', display: 'block' }}>
                  (Aggregated from {job.tools.length} individual tool budgets)
                </span>
              </div>
            )}
          </div>

          {/* Card 2: Profit Margin (Editable Margin %) */}
          <div 
            style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '10px',
              padding: '18px 20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Profit Margin
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={job.profitPercentage ?? 15}
                  onChange={(e) => {
                    if (readOnly) return;
                    const val = parseFloat(e.target.value);
                    onChange({ profitPercentage: isNaN(val) ? 0 : Math.max(0, Math.min(100, val)) });
                  }}
                  disabled={readOnly}
                  title="Click to change profit percentage (Default: 15%)"
                  style={{
                    width: '56px',
                    padding: '2px 6px',
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#B45309',
                    backgroundColor: readOnly ? 'transparent' : '#FEF3C7',
                    border: '1.5px solid #F59E0B',
                    borderRadius: '6px',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400E' }}>%</span>
              </div>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#B45309' }}>
              {formatCurrencyAmount(job.totalProfit, currentCurrency, false)}
            </div>
            {currentCurrency !== currentTargetCurrency && (
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400E', marginTop: '2px' }}>
                ≈ {formatCurrencyAmount(job.convertedTotalProfit || (job.totalProfit * currentExchangeRate), currentTargetCurrency)}
              </div>
            )}
            <span style={{ fontSize: '11px', color: '#92400E', marginTop: '4px', display: 'block' }}>
              Deducted first before departmental breakdown
            </span>
          </div>

          {/* Card 3: Working Budget */}
          <div 
            style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '10px',
              padding: '18px 20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Working Budget ({(100 - (job.profitPercentage ?? 15)).toFixed(1).replace('.0', '')}%)
              </span>
              <Briefcase size={16} style={{ color: '#16A34A' }} />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#15803D' }}>
              {formatCurrencyAmount(job.totalWorkingBudget, currentCurrency, false)}
            </div>
            {currentCurrency !== currentTargetCurrency && (
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#166534', marginTop: '2px' }}>
                ≈ {formatCurrencyAmount(job.convertedWorkingBudget || (job.totalWorkingBudget * currentExchangeRate), currentTargetCurrency)}
              </div>
            )}
            <span style={{ fontSize: '11px', color: '#166534', marginTop: '4px', display: 'block' }}>
              Shopfloor allocation budget in {currentTargetCurrency} (used for factory hourly rates)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
