"use client";

import React from 'react';
import { ToolItem } from '@/types/rfq-job.types';
import { formatUsd, formatCurrencyAmount } from '@/services/rfq-job-calculator.service';
import { 
  Wrench, 
  DollarSign, 
  TrendingUp, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Layers,
  Check,
  AlertCircle,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface SelectedToolFeasibilityProps {
  tool: ToolItem | null;
  tools: ToolItem[];
  currency?: string;
  onSelectTool: (toolId: string) => void;
}

export default function SelectedToolFeasibility({
  tool,
  tools,
  currency = 'RM',
  onSelectTool
}: SelectedToolFeasibilityProps) {
  if (!tool) {
    return (
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #E2E8F0)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
          padding: '36px 20px',
          textAlign: 'center',
          color: '#94A3B8',
          marginBottom: '24px'
        }}
      >
        <Wrench size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#475569', margin: '0 0 6px' }}>
          No Tool Selected
        </h4>
        <p style={{ fontSize: '13px', margin: 0 }}>
          Select a tool from the list above or click &quot;View Tool&quot; to inspect its 9-department feasibility breakdown.
        </p>
      </div>
    );
  }

  // Calculate sum of allocated department budgets to verify 100% check
  const totalAllocatedBudget = tool.departmentAllocations.reduce(
    (acc, item) => acc + item.allocatedBudget, 
    0
  );
  const isAllocationMatch = Math.abs(totalAllocatedBudget - tool.workingBudget) < 0.05;

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
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px'
            }}
          >
            4
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #0F172A)' }}>
                SELECTED TOOL FEASIBILITY: {tool.toolNumber}
              </h3>
              <span 
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: '#DBEAFE',
                  color: '#1E40AF',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}
              >
                {tool.partName}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748B)' }}>
              15% profit subtraction, 85% working budget, and 9-department rate & hours breakdown
            </span>
          </div>
        </div>

        {/* Quick Tool Switcher Tabs */}
        {tools.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: '#64748B', marginRight: '4px' }}>Switch:</span>
            {tools.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTool(t.id)}
                style={{
                  border: t.id === tool.id ? '1px solid #2563EB' : '1px solid #E2E8F0',
                  backgroundColor: t.id === tool.id ? '#EFF6FF' : '#FFFFFF',
                  color: t.id === tool.id ? '#1E40AF' : '#475569',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t.toolNumber}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Tool Summary Highlight Bar */}
        <div 
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            alignItems: 'center'
          }}
        >
          {/* Tool Identity */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
              Tool Identification
            </span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
              {tool.toolNumber}
            </div>
            <span style={{ fontSize: '12px', color: '#475569' }}>{tool.partName}</span>
          </div>

          {/* Customer Budget */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
              Customer Budget ({currency})
            </span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
              {formatCurrencyAmount(tool.customerBudget, currency)}
            </div>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              {tool.allocationPercent.toFixed(1).replace('.0', '')}% of Job valuation
            </span>
          </div>

          {/* Profit Margin 15% */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', textTransform: 'uppercase' }}>
              Profit Margin (15%)
            </span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#B45309', marginTop: '2px' }}>
              {formatCurrencyAmount(tool.profitAmount, currency)}
            </div>
            <span style={{ fontSize: '11px', color: '#92400E' }}>
              Calculated FIRST
            </span>
          </div>

          {/* Working Budget 85% (Converted) */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
              Converted Working Budget (MYR)
            </span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>
              {formatUsd(tool.convertedWorkingBudget || tool.workingBudget)}
            </div>
            <span style={{ fontSize: '11px', color: '#166534' }}>
              Base for shopfloor department costs
            </span>
          </div>

          {/* Machining Hours */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
              Total Est. Machining
            </span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563EB', marginTop: '2px' }}>
              {tool.totalMachiningHours.toFixed(2)} h
            </div>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              Derived from converted MYR rates
            </span>
          </div>
        </div>

        {/* Tool Technical Specifications & Press Parameters Bar */}
        {(tool.toolingSizeLxbxh || tool.machineTonnage || tool.typeOfTooling || tool.stripInfo || tool.description) && (
          <div 
            style={{
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '10px',
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wrench size={15} style={{ color: '#2563EB' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Tool Technical Specifications & Press Parameters
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '2px' }}>
              {tool.typeOfTooling && (
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Type of Tooling:</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{tool.typeOfTooling}</div>
                </div>
              )}
              {tool.toolingSizeLxbxh && (
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Tooling Size (L x B x H):</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{tool.toolingSizeLxbxh}</div>
                </div>
              )}
              {tool.machineTonnage && (
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>M/C Tonnage:</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{tool.machineTonnage}</div>
                </div>
              )}
              {tool.stripInfo && (
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Strip Layout Spec:</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{tool.stripInfo}</div>
                </div>
              )}
              <div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Total Lead Time:</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#2563EB' }}>
                  {(() => {
                    const h = tool.totalMachiningHours || 0;
                    const days = h / 24;
                    const w = days / 5;
                    const daysStr = Number.isInteger(days) ? days.toString() : days.toFixed(1);
                    const wStr = Number.isInteger(w) ? w.toString() : w.toFixed(1);
                    return `${wStr} Weeks (${h.toFixed(1)} h / ${daysStr} Days)`;
                  })()}
                </div>
              </div>
              {(tool.expectedStartDate || tool.scheduledStartDate) && (
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Expected Start Date:</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E40AF' }}>{tool.expectedStartDate || tool.scheduledStartDate}</div>
                </div>
              )}
              {(tool.expectedEndDate || tool.scheduledEndDate) && (
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Expected Completion:</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#16A34A' }}>{tool.expectedEndDate || tool.scheduledEndDate}</div>
                </div>
              )}
            </div>

            {tool.description && (
              <div style={{ fontSize: '12px', color: '#334155', borderTop: '1px solid #DBEAFE', paddingTop: '6px', marginTop: '2px' }}>
                <strong>Description / Remarks:</strong> {tool.description}
              </div>
            )}
          </div>
        )}

        {/* Part Image & Drawing Attachments Display Card */}
        {(tool.partImageUrl || tool.partDrawingUrl) && (
          <div 
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ImageIcon size={15} style={{ color: '#2563EB' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Part Visuals & Technical Drawing Attachments
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {/* Part Image Attachment */}
              {tool.partImageUrl && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                  <img 
                    src={tool.partImageUrl} 
                    alt={tool.partImageName || 'Part Image'} 
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', flexShrink: 0 }} 
                  />
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block' }}>Part Photo / Image:</span>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                      {tool.partImageName || 'Part Image'}
                    </div>
                    <a 
                      href={tool.partImageUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', textDecoration: 'none', marginTop: '4px', display: 'inline-block' }}
                    >
                      View Full Image ↗
                    </a>
                  </div>
                </div>
              )}

              {/* Part Drawing Attachment */}
              {tool.partDrawingUrl && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '6px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block' }}>Technical 2D/3D Drawing:</span>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                      {tool.partDrawingName || 'Technical Drawing'}
                    </div>
                    <a 
                      href={tool.partDrawingUrl} 
                      download={tool.partDrawingName || 'Technical_Drawing'} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ fontSize: '11px', fontWeight: 700, color: '#D97706', textDecoration: 'none', marginTop: '4px', display: 'inline-block' }}
                    >
                      Open / Download Drawing ↗
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 9-Department Calculation Breakdown Table */}
        <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '12px' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Department</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Allocation %</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Allocated Budget (MYR)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Hourly Rate (MYR/hr)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Estimated Hours</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}>Daily Conversion (Days)</th>
              </tr>
            </thead>
            <tbody>
              {tool.departmentAllocations.map((item, idx) => {
                const isProcurement = item.hourlyRate === null;
                const formattedRate = item.hourlyRate ? `RM ${item.hourlyRate}/hr` : '—';
                const formattedHours = item.estimatedHours !== null ? item.estimatedHours.toFixed(2) + ' h' : '—';
                
                let formattedDays = '—';
                if (item.estimatedHours !== null && item.estimatedHours > 0) {
                  const limit = item.dailyHoursLimit || ((item.key === 'cnc' || item.key === 'wireCut') ? 22.5 : 8.5);
                  const daysVal = Math.ceil(item.estimatedDays ?? (item.estimatedHours / limit));
                  formattedDays = `${daysVal} ${daysVal === 1 ? 'day' : 'days'} (@ ${limit}h/d)`;
                }

                return (
                  <tr 
                    key={item.key}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                    }}
                  >
                    {/* Department Name & Process Code */}
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>{item.department}</span>
                        <span 
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#64748B',
                            backgroundColor: '#F1F5F9',
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          {item.processCode}
                        </span>
                        {isProcurement && (
                          <span style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic' }}>
                            (Cost allocation only)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Allocation Percent */}
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#1E40AF' }}>
                      {item.allocationPercent}%
                    </td>

                    {/* Allocated Budget */}
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>
                      {formatUsd(item.allocatedBudget)}
                    </td>

                    {/* Hourly Rate */}
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>
                      {formattedRate}
                    </td>

                    {/* Estimated Hours */}
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: item.estimatedHours ? '#2563EB' : '#94A3B8' }}>
                      {formattedHours}
                    </td>

                    {/* Estimated Days */}
                    <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 700, color: item.estimatedHours ? '#166534' : '#94A3B8' }}>
                      {formattedDays}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Table Bottom Verification Bar */}
          <div 
            style={{
              padding: '14px 20px',
              backgroundColor: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#64748B' }}>Working Budget: </span>
                <strong style={{ color: '#0F172A' }}>{formatUsd(tool.workingBudget)}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B' }}>Allocated Budget: </span>
                <strong style={{ color: '#0F172A' }}>{formatUsd(totalAllocatedBudget)}</strong>
              </div>
            </div>

            <div>
              {isAllocationMatch ? (
                <span 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#15803D',
                    backgroundColor: '#DCFCE7',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}
                >
                  <CheckCircle2 size={14} /> ✓ Allocation = 100%
                </span>
              ) : (
                <span 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#B91C1C',
                    backgroundColor: '#FEE2E2',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}
                >
                  <AlertCircle size={14} /> Allocation mismatch detected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
