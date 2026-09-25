"use client";

import React, { useState } from 'react';
import { ToolItem, JobBudgetMode, ToolAllocationType } from '@/types/rfq-job.types';
import { formatUsd, formatHours, formatCurrencyAmount, countWorkingDays } from '@/services/rfq-job-calculator.service';
import AddEditToolModal from './AddEditToolModal';
import { 
  Plus, 
  Layers, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Clock,
  Briefcase,
  DollarSign,
  Percent,
  HelpCircle
} from 'lucide-react';

interface ToolListSectionProps {
  tools: ToolItem[];
  selectedToolId: string | null;
  onSelectTool: (toolId: string) => void;
  onAddTool: (toolData: {
    toolNumber: string;
    partName: string;
    partImageUrl?: string;
    partImageName?: string;
    partDrawingUrl?: string;
    partDrawingName?: string;
    customerBudget: number;
    allocationPercent: number;
    allocationType: ToolAllocationType;
    toolingSizeLxbxh?: string;
    machineTonnage?: string;
    typeOfTooling?: string;
    stripInfo?: string;
    customLeadTimeDays?: number;
    expectedStartDate?: string;
    expectedEndDate?: string;
    description?: string;
  }) => void;
  onUpdateTool: (toolData: {
    toolNumber: string;
    partName: string;
    partImageUrl?: string;
    partImageName?: string;
    partDrawingUrl?: string;
    partDrawingName?: string;
    customerBudget: number;
    allocationPercent: number;
    allocationType: ToolAllocationType;
    toolingSizeLxbxh?: string;
    machineTonnage?: string;
    typeOfTooling?: string;
    stripInfo?: string;
    customLeadTimeDays?: number;
    expectedStartDate?: string;
    expectedEndDate?: string;
    description?: string;
    existingId?: string;
  }) => void;
  onDeleteTool: (toolId: string) => void;
  jobBudgetMode: JobBudgetMode;
  mainJobBudget: number;
  currentAllocatedPercent: number;
  isBudgetAllocationValid?: boolean;
  budgetAllocationMessage?: string;
  currency?: string;
  targetCurrency?: string;
  exchangeRate?: number;
  onCurrencyChange?: (newCurrency: string) => void;
  readOnly?: boolean;
}

export default function ToolListSection({
  tools,
  selectedToolId,
  onSelectTool,
  onAddTool,
  onUpdateTool,
  onDeleteTool,
  jobBudgetMode,
  mainJobBudget,
  currentAllocatedPercent,
  isBudgetAllocationValid,
  budgetAllocationMessage,
  currency = 'RM',
  targetCurrency = 'MYR',
  exchangeRate = 1.0,
  onCurrencyChange,
  readOnly = false
}: ToolListSectionProps) {
  const isMainMode = jobBudgetMode === 'MAIN_JOB';
  const allocPercent = currentAllocatedPercent;
  const isValid = typeof isBudgetAllocationValid === 'boolean'
    ? isBudgetAllocationValid
    : Math.abs(allocPercent - 100) < 0.01;
  const message = budgetAllocationMessage || (isValid ? '✓ Budget fully allocated' : '⚠ Allocation does not equal 100%');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolItem | null>(null);

  const handleOpenAdd = () => {
    setEditingTool(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tool: ToolItem) => {
    setEditingTool(tool);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: {
    toolNumber: string;
    partName: string;
    customerBudget: number;
    allocationPercent: number;
    allocationType: ToolAllocationType;
    existingId?: string;
  }) => {
    if (data.existingId) {
      onUpdateTool(data);
    } else {
      onAddTool(data);
    }
  };

  const getFeasibilityPill = (status: 'FEASIBLE' | 'AT_RISK' | 'NOT_FEASIBLE') => {
    switch (status) {
      case 'FEASIBLE':
        return (
          <span 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#15803D',
              backgroundColor: '#DCFCE7',
              padding: '3px 8px',
              borderRadius: '6px'
            }}
          >
            <CheckCircle2 size={12} /> ✓ Feasible
          </span>
        );
      case 'AT_RISK':
        return (
          <span 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#C2410C',
              backgroundColor: '#FFEDD5',
              padding: '3px 8px',
              borderRadius: '6px'
            }}
          >
            <AlertTriangle size={12} /> ⚠ At Risk
          </span>
        );
      case 'NOT_FEASIBLE':
        return (
          <span 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#B91C1C',
              backgroundColor: '#FEE2E2',
              padding: '3px 8px',
              borderRadius: '6px'
            }}
          >
            <XCircle size={12} /> ✕ Unfeasible
          </span>
        );
    }
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
              backgroundColor: '#F3E8FF',
              color: '#7E22CE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px'
            }}
          >
            3
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #0F172A)' }}>
                JOB TOOLS
              </h3>
              <span 
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#E2E8F0',
                  color: '#334155',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}
              >
                {tools.length} {tools.length === 1 ? 'Tool' : 'Tools'}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748B)' }}>
              Tools configured for this Job, respective budgets, profit deductions, and estimated hours
            </span>
          </div>
        </div>

        {/* Obvious "+ Add Tool" Button */}
        {!readOnly && (
          <button
            type="button"
            onClick={handleOpenAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={16} />
            <span>+ Add Tool</span>
          </button>
        )}
      </div>

      {/* Tool Budget Allocation Progress Bar & Validation Status Banner */}
      <div style={{ padding: '16px 24px 8px 24px' }}>
        <div 
          style={{
            backgroundColor: '#F8FAFC',
            border: `1px solid ${isValid ? '#BBF7D0' : allocPercent > 100 ? '#FECACA' : '#FED7AA'}`,
            borderRadius: '10px',
            padding: '14px 18px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Percent size={16} style={{ color: '#475569' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                Tool Budget Allocation:
              </span>
              <span 
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: isValid ? '#16A34A' : allocPercent > 100 ? '#DC2626' : '#EA580C'
                }}
              >
                Allocated: {allocPercent.toFixed(1).replace('.0', '')}%
              </span>
            </div>

            <div>
              {isValid ? (
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
                  <CheckCircle2 size={14} /> Budget fully allocated (100%)
                </span>
              ) : (
                <span 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: allocPercent > 100 ? '#B91C1C' : '#C2410C',
                    backgroundColor: allocPercent > 100 ? '#FEE2E2' : '#FFEDD5',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}
                >
                  <AlertTriangle size={14} /> {message}
                </span>
              )}
            </div>
          </div>

          {/* Allocation Progress Bar */}
          <div 
            style={{
              height: '10px',
              backgroundColor: '#E2E8F0',
              borderRadius: '999px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div 
              style={{
                width: `${Math.min(allocPercent, 100)}%`,
                height: '100%',
                backgroundColor: isValid ? '#10B981' : allocPercent > 100 ? '#EF4444' : '#F59E0B',
                borderRadius: '999px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>

          {/* Helper notice */}
          {isMainMode && !isValid && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={14} />
              <span>
                Under Main Job Budget mode, the total tool allocation must equal exactly <strong>100%</strong> before this RFQ can be approved or converted.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Table of Tools */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '12px' }}>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Tool / Part Name</th>
              <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>
                Budget {currency !== targetCurrency ? `(${targetCurrency})` : ''}
              </th>
              <th style={{ padding: '12px 12px', fontWeight: 700, textAlign: 'right', color: '#2563EB' }}>
                Design <span style={{ fontSize: '10px', fontWeight: 500, color: '#64748B', display: 'block' }}>(8.5h/d)</span>
              </th>
              <th style={{ padding: '12px 12px', fontWeight: 700, textAlign: 'right', color: '#2563EB' }}>
                Milling <span style={{ fontSize: '10px', fontWeight: 500, color: '#64748B', display: 'block' }}>(8.5h/d)</span>
              </th>
              <th style={{ padding: '12px 12px', fontWeight: 700, textAlign: 'right', color: '#2563EB' }}>
                CNC <span style={{ fontSize: '10px', fontWeight: 500, color: '#64748B', display: 'block' }}>(22.5h/d)</span>
              </th>
              <th style={{ padding: '12px 12px', fontWeight: 700, textAlign: 'right', color: '#2563EB' }}>
                Grinding <span style={{ fontSize: '10px', fontWeight: 500, color: '#64748B', display: 'block' }}>(8.5h/d)</span>
              </th>
              <th style={{ padding: '12px 12px', fontWeight: 700, textAlign: 'right', color: '#2563EB' }}>
                Wire Cut <span style={{ fontSize: '10px', fontWeight: 500, color: '#64748B', display: 'block' }}>(22.5h/d)</span>
              </th>
              <th style={{ padding: '12px 12px', fontWeight: 700, textAlign: 'right', color: '#2563EB' }}>
                Assembly <span style={{ fontSize: '10px', fontWeight: 500, color: '#64748B', display: 'block' }}>(8.5h/d)</span>
              </th>
              <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right', color: '#0F172A' }}>Total Lead Time</th>
              <th style={{ padding: '12px 12px', fontWeight: 700, textAlign: 'center' }}>Feasibility</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tools.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ padding: '40px 20px', textAlign: 'center', color: '#94A3B8' }}>
                  <Layers size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>No tools added to this Job yet</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>Click &quot;+ Add Tool&quot; above to add the first tooling cavity or assembly.</div>
                </td>
              </tr>
            ) : (
              tools.map((tool) => {
                const isSelected = tool.id === selectedToolId;
                const convertedCust = tool.convertedCustomerBudget ?? (tool.customerBudget * exchangeRate);
                const isConverted = currency !== targetCurrency;

                const getDeptDaysInfo = (key: 'design' | 'milling' | 'cnc' | 'grinding' | 'wireCut' | 'assembly') => {
                  const dept = tool.departmentAllocations?.find(d => d.key === key);
                  if (!dept || dept.estimatedHours === null || isNaN(dept.estimatedHours) || dept.estimatedHours === 0) {
                    return { daysStr: '—', hoursSubtext: '' };
                  }
                  const divisor = (key === 'cnc' || key === 'wireCut') ? 22.5 : 8.5;
                  const rawDays = dept.estimatedDays ?? (dept.estimatedHours / divisor);
                  const daysCeil = Math.ceil(rawDays);
                  return {
                    daysStr: `${daysCeil} ${daysCeil === 1 ? 'day' : 'days'}`,
                    hoursSubtext: `${dept.estimatedHours.toFixed(1)} h`
                  };
                };

                const dsn = getDeptDaysInfo('design');
                const mill = getDeptDaysInfo('milling');
                const cnc = getDeptDaysInfo('cnc');
                const gr = getDeptDaysInfo('grinding');
                const wc = getDeptDaysInfo('wireCut');
                const assy = getDeptDaysInfo('assembly');

                return (
                  <tr
                    key={tool.id}
                    onClick={() => onSelectTool(tool.id)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {/* 1. Tool / Part */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div 
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: isSelected ? '#2563EB' : 'transparent',
                            flexShrink: 0
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '13px' }}>
                            {tool.toolNumber}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>
                            {tool.partName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Budget */}
                    <td style={{ padding: '14px 14px', textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                        {formatCurrencyAmount(convertedCust, targetCurrency, false)}
                      </div>
                      {isConverted && (
                        <div style={{ fontSize: '10px', fontWeight: 500, color: '#64748B' }}>
                          ({formatCurrencyAmount(tool.customerBudget, currency, false)})
                        </div>
                      )}
                    </td>

                    {/* 3. Design */}
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '12px' }}>{dsn.daysStr}</div>
                      {dsn.hoursSubtext && <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 500 }}>({dsn.hoursSubtext})</div>}
                    </td>

                    {/* 4. Milling */}
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '12px' }}>{mill.daysStr}</div>
                      {mill.hoursSubtext && <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 500 }}>({mill.hoursSubtext})</div>}
                    </td>

                    {/* 5. CNC */}
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '12px' }}>{cnc.daysStr}</div>
                      {cnc.hoursSubtext && <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 500 }}>({cnc.hoursSubtext})</div>}
                    </td>

                    {/* 6. Grinding */}
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '12px' }}>{gr.daysStr}</div>
                      {gr.hoursSubtext && <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 500 }}>({gr.hoursSubtext})</div>}
                    </td>

                    {/* 7. Wire Cut */}
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '12px' }}>{wc.daysStr}</div>
                      {wc.hoursSubtext && <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 500 }}>({wc.hoursSubtext})</div>}
                    </td>

                    {/* 8. Assembly */}
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '12px' }}>{assy.daysStr}</div>
                      {assy.hoursSubtext && <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 500 }}>({assy.hoursSubtext})</div>}
                    </td>

                    {/* 9. Total Lead Time (Weeks) - Total Hours / 24 = Days, Days / 5 = Weeks */}
                    <td style={{ padding: '14px 14px', textAlign: 'right' }}>
                      {(() => {
                        const totalHours = tool.totalMachiningHours || 0;
                        // User Formula: total hours / 24 = days, days / 5 = weeks
                        const derivedDays = totalHours / 24;
                        const weeksFromHours = derivedDays / 5;
                        
                        const daysStr = Number.isInteger(derivedDays) 
                          ? derivedDays.toString() 
                          : derivedDays.toFixed(1);
                        const weeksStr = Number.isInteger(weeksFromHours) 
                          ? `${weeksFromHours} weeks` 
                          : `${weeksFromHours.toFixed(1)} weeks`;
                        return (
                          <>
                            <div style={{ fontWeight: 800, color: '#2563EB', fontSize: '13px' }}>
                              {weeksStr}
                            </div>
                            <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 500 }}>
                              ({totalHours.toFixed(1)} h / {daysStr} {derivedDays === 1 ? 'day' : 'days'})
                            </div>
                          </>
                        );
                      })()}
                    </td>

                    {/* 10. Feasibility */}
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      {getFeasibilityPill(tool.feasibilityStatus)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onSelectTool(tool.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: isSelected ? '1px solid #2563EB' : '1px solid #CBD5E1',
                            backgroundColor: isSelected ? '#2563EB' : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : '#334155',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={12} />
                          <span>View Tool</span>
                        </button>

                        {!readOnly && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(tool)}
                              title="Edit Tool"
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#FFFFFF',
                                color: '#64748B',
                                cursor: 'pointer'
                              }}
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove ${tool.toolNumber} (${tool.partName}) from this Job?`)) {
                                  onDeleteTool(tool.id);
                                }
                              }}
                              title="Remove Tool"
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: '1px solid #FEE2E2',
                                backgroundColor: '#FFFFFF',
                                color: '#DC2626',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Adding / Editing Tool */}
      <AddEditToolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        jobBudgetMode={jobBudgetMode}
        mainJobBudget={mainJobBudget}
        initialTool={editingTool}
        currentAllocatedPercent={currentAllocatedPercent}
        currency={currency}
        targetCurrency={targetCurrency}
        exchangeRate={exchangeRate}
        onCurrencyChange={onCurrencyChange}
      />
    </div>
  );
}
