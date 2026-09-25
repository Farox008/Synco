"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  JobRecord, 
  ToolItem, 
  ToolAllocationType 
} from '@/types/rfq-job.types';
import { 
  recalculateJob, 
  createDefaultJobRfq, 
  calculateToolMetrics 
} from '@/services/rfq-job-calculator.service';
import JobInformationSection from './JobInformationSection';
import JobBudgetSection from './JobBudgetSection';
import ToolListSection from './ToolListSection';
import SelectedToolFeasibility from './SelectedToolFeasibility';
import FactoryGanttChart from './FactoryGanttChart';
import JobFeasibilitySummary from './JobFeasibilitySummary';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Printer, 
  Share2 
} from 'lucide-react';

interface RfqJobWorkspaceProps {
  initialJob?: JobRecord | null;
  onBack: () => void;
  onSaveJob: (job: JobRecord) => void;
  onConvertToQuotation?: (job: JobRecord) => void;
  onOpenDecisionModal?: (job: JobRecord) => void;
  currentUser?: string;
  readOnly?: boolean;
}

export default function RfqJobWorkspace({
  initialJob,
  onBack,
  onSaveJob,
  onConvertToQuotation,
  onOpenDecisionModal,
  currentUser = 'Alex Wong (Operation Manager)',
  readOnly = false
}: RfqJobWorkspaceProps) {
  // Initialize state with initialJob or default multi-tool Job RFQ
  const [jobState, setJobState] = useState<JobRecord>(() => {
    if (initialJob) {
      return recalculateJob(initialJob);
    }
    const defaultJob = createDefaultJobRfq();
    if (currentUser) {
      defaultJob.preparedBy = currentUser;
    }
    return defaultJob;
  });

  // Track active tool selected for detailed feasibility inspection
  const [selectedToolId, setSelectedToolId] = useState<string | null>(() => {
    if (initialJob && initialJob.tools.length > 0) {
      return initialJob.tools[0].id;
    }
    return 'tool-001';
  });

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Keep selectedToolId valid if tools change
  useEffect(() => {
    if (jobState.tools.length > 0) {
      const exists = jobState.tools.some(t => t.id === selectedToolId);
      if (!exists) {
        setSelectedToolId(jobState.tools[0].id);
      }
    } else {
      setSelectedToolId(null);
    }
  }, [jobState.tools, selectedToolId]);

  // Update Job state and trigger auto-recalculation
  const handleJobChange = (updates: Partial<JobRecord>) => {
    setJobState(prev => recalculateJob({ ...prev, ...updates }));
  };

  // Add Tool handler
  const handleAddTool = (data: {
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
  }) => {
    let createdId = '';
    setJobState(prev => {
      const isNonRm = prev.currency !== 'RM' && prev.currency !== 'MYR';
      const conversionRate = isNonRm ? (prev.exchangeRate || 1.0) : 1.0;

      const targetMainBudget = isNonRm
        ? Math.round(((prev.mainJobBudget || 0) * conversionRate) * 100) / 100
        : (prev.mainJobBudget || 0);

      const convertedExistingTools = prev.tools.map(t => {
        if (!isNonRm) return t;
        const convertedBudget = Math.round((t.customerBudget * conversionRate) * 100) / 100;
        return {
          ...t,
          customerBudget: convertedBudget
        };
      });

      const savedCustomerBudget = isNonRm
        ? Math.round((data.customerBudget * conversionRate) * 100) / 100
        : data.customerBudget;

      const newTool = calculateToolMetrics(
        data.toolNumber,
        data.partName,
        savedCustomerBudget,
        data.allocationPercent,
        data.allocationType,
        undefined,
        prev.profitPercentage,
        1.0,
        {
          partImageUrl: data.partImageUrl,
          partImageName: data.partImageName,
          partDrawingUrl: data.partDrawingUrl,
          partDrawingName: data.partDrawingName,
          toolingSizeLxbxh: data.toolingSizeLxbxh,
          machineTonnage: data.machineTonnage,
          typeOfTooling: data.typeOfTooling,
          stripInfo: data.stripInfo,
          customLeadTimeDays: data.customLeadTimeDays,
          expectedStartDate: data.expectedStartDate,
          expectedEndDate: data.expectedEndDate,
          description: data.description
        }
      );

      createdId = newTool.id;
      const updatedTools = [...convertedExistingTools, newTool];

      return recalculateJob({
        ...prev,
        currency: 'RM',
        targetCurrency: 'MYR',
        exchangeRate: 1.0,
        mainJobBudget: targetMainBudget,
        tools: updatedTools
      });
    });

    if (createdId) {
      setSelectedToolId(createdId);
    }
  };

  // Update Tool handler
  const handleUpdateTool = (data: {
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
  }) => {
    if (!data.existingId) return;

    setJobState(prev => {
      const isNonRm = prev.currency !== 'RM' && prev.currency !== 'MYR';
      const conversionRate = isNonRm ? (prev.exchangeRate || 1.0) : 1.0;

      const targetMainBudget = isNonRm
        ? Math.round(((prev.mainJobBudget || 0) * conversionRate) * 100) / 100
        : (prev.mainJobBudget || 0);

      const updatedTools = prev.tools.map(t => {
        if (t.id === data.existingId) {
          const savedCustomerBudget = isNonRm
            ? Math.round((data.customerBudget * conversionRate) * 100) / 100
            : data.customerBudget;

          return calculateToolMetrics(
            data.toolNumber,
            data.partName,
            savedCustomerBudget,
            data.allocationPercent,
            data.allocationType,
            data.existingId,
            prev.profitPercentage,
            1.0,
            {
              partImageUrl: data.partImageUrl,
              partImageName: data.partImageName,
              partDrawingUrl: data.partDrawingUrl,
              partDrawingName: data.partDrawingName,
              toolingSizeLxbxh: data.toolingSizeLxbxh,
              machineTonnage: data.machineTonnage,
              typeOfTooling: data.typeOfTooling,
              stripInfo: data.stripInfo,
              customLeadTimeDays: data.customLeadTimeDays,
              expectedStartDate: data.expectedStartDate,
              expectedEndDate: data.expectedEndDate,
              description: data.description
            }
          );
        } else if (isNonRm) {
          const convertedBudget = Math.round((t.customerBudget * conversionRate) * 100) / 100;
          return calculateToolMetrics(
            t.toolNumber,
            t.partName,
            convertedBudget,
            t.allocationPercent,
            t.allocationType,
            t.id,
            prev.profitPercentage,
            1.0,
            {
              partImageUrl: t.partImageUrl,
              partImageName: t.partImageName,
              partDrawingUrl: t.partDrawingUrl,
              partDrawingName: t.partDrawingName,
              toolingSizeLxbxh: t.toolingSizeLxbxh,
              machineTonnage: t.machineTonnage,
              typeOfTooling: t.typeOfTooling,
              stripInfo: t.stripInfo,
              customLeadTimeDays: t.customLeadTimeDays,
              expectedStartDate: t.expectedStartDate,
              expectedEndDate: t.expectedEndDate,
              description: t.description
            }
          );
        }
        return t;
      });

      return recalculateJob({
        ...prev,
        currency: 'RM',
        targetCurrency: 'MYR',
        exchangeRate: 1.0,
        mainJobBudget: targetMainBudget,
        tools: updatedTools
      });
    });
  };

  // Delete Tool handler
  const handleDeleteTool = (toolId: string) => {
    setJobState(prev => {
      const updatedTools = prev.tools.filter(t => t.id !== toolId);
      return recalculateJob({
        ...prev,
        tools: updatedTools
      });
    });
  };

  // Save handler
  const handleSave = () => {
    setIsSaving(true);
    const refreshed = recalculateJob({
      ...jobState,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });
    setJobState(refreshed);
    onSaveJob(refreshed);

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccessMsg(`Job ${refreshed.jobNumber} saved successfully!`);
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }, 400);
  };

  const handleConvert = () => {
    if (jobState.budgetMode === 'MAIN_JOB' && !jobState.isBudgetAllocationValid) {
      alert('Budget allocation must equal 100% before converting this Job to quotation.');
      return;
    }
    if (onConvertToQuotation) {
      onConvertToQuotation(jobState);
    }
  };

  const selectedTool = useMemo(() => {
    return jobState.tools.find(t => t.id === selectedToolId) || null;
  }, [jobState.tools, selectedToolId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Top Workspace Navigation Bar */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to RFQs</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                {jobState.rfqNumber} / {jobState.jobNumber}
              </h2>
              <span 
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  padding: '3px 10px',
                  borderRadius: '12px'
                }}
              >
                {jobState.customer}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              Multi-Tool Job Feasibility, Capacity & Production Scheduling Workspace
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Printer size={15} />
            <span>Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || readOnly}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
            }}
          >
            <Save size={15} />
            <span>{isSaving ? 'Saving...' : 'Save Job / RFQ'}</span>
          </button>
        </div>
      </div>

      {/* Save feedback banner */}
      {saveSuccessMsg && (
        <div 
          style={{
            backgroundColor: '#DCFCE7',
            border: '1px solid #86EFAC',
            color: '#15803D',
            padding: '12px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 1. RFQ / JOB INFORMATION */}
      <JobInformationSection
        job={jobState}
        onChange={handleJobChange}
        readOnly={readOnly}
      />

      {/* 2. JOB BUDGET */}
      <JobBudgetSection
        job={jobState}
        onChange={handleJobChange}
        readOnly={readOnly}
      />

      {/* 3. TOOLS */}
      <ToolListSection
        tools={jobState.tools}
        selectedToolId={selectedToolId}
        onSelectTool={(toolId) => setSelectedToolId(toolId)}
        onAddTool={handleAddTool}
        onUpdateTool={handleUpdateTool}
        onDeleteTool={handleDeleteTool}
        jobBudgetMode={jobState.budgetMode}
        mainJobBudget={jobState.mainJobBudget || 0}
        currentAllocatedPercent={jobState.budgetAllocationPercent}
        isBudgetAllocationValid={jobState.isBudgetAllocationValid}
        budgetAllocationMessage={jobState.budgetAllocationMessage}
        currency={jobState.currency}
        targetCurrency={jobState.targetCurrency}
        exchangeRate={jobState.exchangeRate}
        onCurrencyChange={(newCur) => handleJobChange({ currency: newCur })}
        readOnly={readOnly}
      />

      {/* 4. SELECTED TOOL FEASIBILITY */}
      <SelectedToolFeasibility
        tool={selectedTool}
        tools={jobState.tools}
        currency={jobState.currency}
        onSelectTool={(toolId) => setSelectedToolId(toolId)}
      />

      {/* 5. FACTORY TIMELINE (GANTT CHART) */}
      <FactoryGanttChart
        startingDate={jobState.startingDate}
        tools={jobState.tools}
        requiredCompletionDate={jobState.requiredCompletionDate}
        factoryEstimatedCompletion={jobState.factoryEstimatedCompletion}
      />

      {/* 6. FEASIBILITY SUMMARY */}
      <JobFeasibilitySummary
        job={jobState}
        onSave={handleSave}
        onConvertToQuotation={handleConvert}
        onOpenDecisionModal={() => onOpenDecisionModal && onOpenDecisionModal(jobState)}
        isSaving={isSaving}
        readOnly={readOnly}
      />
    </div>
  );
}
