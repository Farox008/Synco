import React, { useState, useEffect } from 'react';
import { ToolItem, JobBudgetMode, ToolAllocationType } from '@/types/rfq-job.types';
import { formatUsd, SUPPORTED_CURRENCIES, formatCurrencyAmount, addWorkingDays, countWorkingDays } from '@/services/rfq-job-calculator.service';
import { 
  X, 
  Layers, 
  DollarSign, 
  Percent, 
  AlertCircle, 
  Maximize2, 
  Gauge, 
  Wrench, 
  Ruler, 
  Clock, 
  FileText,
  Globe,
  Image as ImageIcon,
  Upload,
  Trash2,
  Calendar
} from 'lucide-react';

interface AddEditToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (toolData: {
    toolNumber: string;
    partName: string;
    partImageUrl?: string;
    partImageName?: string;
    partDrawingUrl?: string;
    partDrawingName?: string;
    customerBudget: number;
    allocationPercent: number;
    allocationType: ToolAllocationType;
    toolCurrency?: string;
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
  jobBudgetMode: JobBudgetMode;
  mainJobBudget: number;
  initialTool?: ToolItem | null;
  currentAllocatedPercent: number;
  currency?: string;
  targetCurrency?: string;
  exchangeRate?: number;
  onCurrencyChange?: (newCurrency: string) => void;
}

export default function AddEditToolModal({
  isOpen,
  onClose,
  onSave,
  jobBudgetMode,
  mainJobBudget,
  initialTool,
  currentAllocatedPercent,
  currency = 'USD',
  targetCurrency = 'MYR',
  exchangeRate = 1.0,
  onCurrencyChange
}: AddEditToolModalProps) {
  const isEditing = Boolean(initialTool);

  const [toolNumber, setToolNumber] = useState('');
  const [partName, setPartName] = useState('');
  const [partImageUrl, setPartImageUrl] = useState('');
  const [partImageName, setPartImageName] = useState('');
  const [partDrawingUrl, setPartDrawingUrl] = useState('');
  const [partDrawingName, setPartDrawingName] = useState('');
  
  const [toolingSizeLxbxh, setToolingSizeLxbxh] = useState('');
  const [machineTonnage, setMachineTonnage] = useState('');
  const [typeOfTooling, setTypeOfTooling] = useState('Progressive Stamping Die');
  const [stripInfo, setStripInfo] = useState('');
  const [customLeadTimeDays, setCustomLeadTimeDays] = useState<string>('25');
  const [expectedStartDate, setExpectedStartDate] = useState<string>('');
  const [expectedEndDate, setExpectedEndDate] = useState<string>('');
  const [description, setDescription] = useState('');
  
  const [selectedCurrency, setSelectedCurrency] = useState<string>(currency);
  const [allocationType, setAllocationType] = useState<ToolAllocationType>('PERCENTAGE');
  const [percentInput, setPercentInput] = useState<string>('20');
  const [amountInput, setAmountInput] = useState<string>('20000');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCurrency(currency);
  }, [currency]);

  // Remaining allocation available for advice
  const editingOldPercent = initialTool ? initialTool.allocationPercent : 0;
  const remainingBudgetPercent = Math.max(0, 100 - (currentAllocatedPercent - editingOldPercent));

  useEffect(() => {
    if (isOpen) {
      const todayStr = new Date().toISOString().split('T')[0];

      if (initialTool) {
        setToolNumber(initialTool.toolNumber || '');
        setPartName(initialTool.partName || '');
        setPartImageUrl(initialTool.partImageUrl || '');
        setPartImageName(initialTool.partImageName || '');
        setPartDrawingUrl(initialTool.partDrawingUrl || '');
        setPartDrawingName(initialTool.partDrawingName || '');
        setToolingSizeLxbxh(initialTool.toolingSizeLxbxh || '');
        setMachineTonnage(initialTool.machineTonnage || '');
        setTypeOfTooling(initialTool.typeOfTooling || 'Progressive Stamping Die');
        setStripInfo(initialTool.stripInfo || '');
        
        const lTime = initialTool.customLeadTimeDays ? initialTool.customLeadTimeDays.toString() : '25';
        setCustomLeadTimeDays(lTime);

        const sDate = initialTool.expectedStartDate || initialTool.scheduledStartDate || todayStr;
        setExpectedStartDate(sDate);

        const eDate = initialTool.expectedEndDate || initialTool.scheduledEndDate || addWorkingDays(sDate, parseInt(lTime, 10) || 25);
        setExpectedEndDate(eDate);

        setDescription(initialTool.description || '');
        setAllocationType(initialTool.allocationType || 'PERCENTAGE');
        setPercentInput(initialTool.allocationPercent ? initialTool.allocationPercent.toString() : '0');
        setAmountInput(initialTool.customerBudget ? initialTool.customerBudget.toString() : '0');
      } else {
        const defaultPercent = remainingBudgetPercent > 0 ? Math.min(25, remainingBudgetPercent) : 20;
        setToolNumber(`Tool ${Math.floor(100 + Math.random() * 900)}`);
        setPartName('');
        setPartImageUrl('');
        setPartImageName('');
        setPartDrawingUrl('');
        setPartDrawingName('');
        setToolingSizeLxbxh('450 x 350 x 280 mm');
        setMachineTonnage('250 T');
        setTypeOfTooling('Progressive Stamping Die');
        setStripInfo('120mm Width x 45mm Pitch');
        setCustomLeadTimeDays('25');
        setExpectedStartDate(todayStr);
        setExpectedEndDate(addWorkingDays(todayStr, 25));
        setDescription('');
        setAllocationType(jobBudgetMode === 'MAIN_JOB' ? 'PERCENTAGE' : 'FIXED_AMOUNT');
        setPercentInput(defaultPercent.toString());
        const calculatedAmount = mainJobBudget > 0 ? (mainJobBudget * (defaultPercent / 100)) : 20000;
        setAmountInput((Math.round(calculatedAmount * 100) / 100).toString());
      }
      setError(null);
    }
  }, [isOpen, initialTool, jobBudgetMode, mainJobBudget, remainingBudgetPercent]);

  if (!isOpen) return null;

  // File Upload Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPartImageName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPartImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrawingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPartDrawingName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPartDrawingUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle change in Percentage input: Auto-calculate Amount
  const handlePercentChange = (valStr: string) => {
    setPercentInput(valStr);
    const num = parseFloat(valStr);
    if (!isNaN(num) && mainJobBudget > 0) {
      const calculated = (mainJobBudget * (num / 100));
      setAmountInput((Math.round(calculated * 100) / 100).toString());
    }
  };

  // Handle change in Amount input: Auto-calculate Percentage
  const handleAmountChange = (valStr: string) => {
    setAmountInput(valStr);
    const num = parseFloat(valStr);
    if (!isNaN(num) && mainJobBudget > 0) {
      const calculatedPct = (num / mainJobBudget) * 100;
      setPercentInput((Math.round(calculatedPct * 100) / 100).toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolNumber.trim()) {
      setError('Tool / Part No. is required.');
      return;
    }
    if (!partName.trim()) {
      setError('Part Name is required.');
      return;
    }

    const numAmount = parseFloat(amountInput);
    const numPercent = parseFloat(percentInput);
    const numLeadTime = parseInt(customLeadTimeDays, 10);

    if (isNaN(numAmount) || numAmount < 0) {
      setError('Please provide a valid budget amount.');
      return;
    }

    onSave({
      toolNumber: toolNumber.trim(),
      partName: partName.trim(),
      partImageUrl,
      partImageName,
      partDrawingUrl,
      partDrawingName,
      customerBudget: numAmount,
      allocationPercent: isNaN(numPercent) ? 0 : numPercent,
      allocationType,
      toolCurrency: selectedCurrency,
      toolingSizeLxbxh: toolingSizeLxbxh.trim(),
      machineTonnage: machineTonnage.trim(),
      typeOfTooling: typeOfTooling.trim(),
      stripInfo: stripInfo.trim(),
      customLeadTimeDays: isNaN(numLeadTime) ? 25 : Math.max(1, numLeadTime),
      expectedStartDate,
      expectedEndDate,
      description: description.trim(),
      existingId: initialTool?.id
    });

    onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        padding: '20px'
      }}
    >
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div 
          style={{
            padding: '18px 24px',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Layers size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                {isEditing ? 'Edit Tool Technical Specs & Budget' : 'Add Tool to Job'}
              </h3>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                Define tool dimensions, tonnage, strip layout, lead time, and budget
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body Scrollable Area */}
        <form 
          onSubmit={handleSubmit} 
          style={{ 
            padding: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px',
            overflowY: 'auto'
          }}
        >
          {error && (
            <div 
              style={{
                backgroundColor: '#FEE2E2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#991B1B',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Tool & Part Identification */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {/* Tool / Part No. */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Part / Tool No. *
              </label>
              <input
                type="text"
                value={toolNumber}
                onChange={(e) => setToolNumber(e.target.value)}
                placeholder="e.g. Tool 001 or P-001"
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A'
                }}
              />
            </div>

            {/* Part Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Part Name *
              </label>
              <input
                type="text"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                placeholder="e.g. Main Cavity or Core Insert Block"
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  color: '#0F172A'
                }}
              />
            </div>
          </div>

          {/* Section 2: Technical & Press Specifications */}
          <div 
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Tool Technical & Press Specifications
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {/* Type of Tooling */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Type of Tooling
                </label>
                <select
                  value={typeOfTooling}
                  onChange={(e) => setTypeOfTooling(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="Progressive Stamping Die">Progressive Stamping Die</option>
                  <option value="Injection Mold Cavity">Injection Mold Cavity</option>
                  <option value="Transfer Tooling Sub-Assy">Transfer Tooling Sub-Assy</option>
                  <option value="Single Cavity Die">Single Cavity Die</option>
                  <option value="Multi-Cavity Mold">Multi-Cavity Mold</option>
                  <option value="Prototype Mold / Fixture">Prototype Mold / Fixture</option>
                  <option value="Custom Tooling">Custom Tooling</option>
                </select>
              </div>

              {/* Tooling Size (L x B x H) */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Tooling Size (L x B x H)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={toolingSizeLxbxh}
                    onChange={(e) => setToolingSizeLxbxh(e.target.value)}
                    placeholder="e.g. 450 x 350 x 280 mm"
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 30px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#0F172A'
                    }}
                  />
                  <Maximize2 size={13} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748B' }} />
                </div>
              </div>

              {/* M/C Tonnage */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  M/C Tonnage
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={machineTonnage}
                    onChange={(e) => setMachineTonnage(e.target.value)}
                    placeholder="e.g. 250 T"
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 30px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#0F172A'
                    }}
                  />
                  <Gauge size={13} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748B' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {/* Strip Info */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Strip / Strip Layout Specification
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={stripInfo}
                    onChange={(e) => setStripInfo(e.target.value)}
                    placeholder="e.g. 120mm Width x 45mm Pitch"
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 30px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      color: '#0F172A'
                    }}
                  />
                  <Ruler size={13} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748B' }} />
                </div>
              </div>

              {/* Lead Time (Working Days) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                    Lead Time (Working Days)
                  </label>
                  {customLeadTimeDays && !isNaN(parseInt(customLeadTimeDays, 10)) && (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '1px 6px', borderRadius: '4px' }}>
                      = {(parseInt(customLeadTimeDays, 10) / 5).toFixed(1).replace('.0', '')} Weeks
                    </span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={customLeadTimeDays}
                    onChange={(e) => {
                      const newLt = e.target.value;
                      setCustomLeadTimeDays(newLt);
                      const numLt = parseInt(newLt, 10);
                      if (!isNaN(numLt) && expectedStartDate) {
                        setExpectedEndDate(addWorkingDays(expectedStartDate, numLt));
                      }
                    }}
                    placeholder="25"
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 30px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#0F172A'
                    }}
                  />
                  <Clock size={13} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748B' }} />
                </div>
              </div>
            </div>

            {/* Expected Start Date & Expected End Date Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {/* Expected Start Date */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Expected Start Date
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    value={expectedStartDate}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setExpectedStartDate(newStart);
                      const numLt = parseInt(customLeadTimeDays, 10);
                      if (newStart && !isNaN(numLt)) {
                        setExpectedEndDate(addWorkingDays(newStart, numLt));
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 30px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#0F172A'
                    }}
                  />
                  <Calendar size={13} style={{ position: 'absolute', left: '10px', top: '10px', color: '#2563EB' }} />
                </div>
              </div>

              {/* Expected End Date */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Expected End Date
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    value={expectedEndDate}
                    onChange={(e) => {
                      const newEnd = e.target.value;
                      setExpectedEndDate(newEnd);
                      if (expectedStartDate && newEnd) {
                        const calculatedDays = countWorkingDays(expectedStartDate, newEnd);
                        if (calculatedDays > 0) {
                          setCustomLeadTimeDays(calculatedDays.toString());
                        }
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 30px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#0F172A'
                    }}
                  />
                  <Calendar size={13} style={{ position: 'absolute', left: '10px', top: '10px', color: '#16A34A' }} />
                </div>
              </div>
            </div>

            {/* Description / Remarks */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Tool Engineering Description & Remarks
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter tool material specs, cavity details, surface treatment or engineering notes..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12px',
                  color: '#0F172A',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {/* Section 3: Budget Allocation Share */}
          <div 
            style={{
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Budget Allocation Share & Currency
              </span>
              <span style={{ fontSize: '11px', color: '#1D4ED8', fontWeight: 600 }}>
                Job Budget Mode: {jobBudgetMode === 'MAIN_JOB' ? 'Main Job Budget Share' : 'Tool-Specific Budget'}
              </span>
            </div>

            {/* Currency Selector & Allocation Type */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  <Globe size={13} style={{ color: '#2563EB' }} />
                  <span>Select Currency</span>
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => {
                    const newCur = e.target.value;
                    setSelectedCurrency(newCur);
                    if (onCurrencyChange) onCurrencyChange(newCur);
                  }}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  {SUPPORTED_CURRENCIES.map(cur => (
                    <option key={cur.code} value={cur.code}>
                      {cur.code} — {cur.name} ({cur.symbol.trim()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Allocation Type Switcher */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Allocation Method
                </label>
                <div style={{ display: 'flex', gap: '16px', paddingTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: '#1E293B', fontWeight: 600 }}>
                    <input
                      type="radio"
                      name="allocationType"
                      checked={allocationType === 'PERCENTAGE'}
                      onChange={() => setAllocationType('PERCENTAGE')}
                      style={{ accentColor: '#2563EB' }}
                    />
                    Percentage (%)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: '#1E293B', fontWeight: 600 }}>
                    <input
                      type="radio"
                      name="allocationType"
                      checked={allocationType === 'FIXED_AMOUNT'}
                      onChange={() => setAllocationType('FIXED_AMOUNT')}
                      style={{ accentColor: '#2563EB' }}
                    />
                    Fixed Amount ({selectedCurrency})
                  </label>
                </div>
              </div>
            </div>

            {allocationType === 'PERCENTAGE' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>
                      Budget Allocation (%)
                    </label>
                    {jobBudgetMode === 'MAIN_JOB' && (
                      <span style={{ fontSize: '11px', color: '#64748B' }}>
                        Unallocated: {remainingBudgetPercent.toFixed(1).replace('.0', '')}%
                      </span>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={percentInput}
                      onChange={(e) => handlePercentChange(e.target.value)}
                      placeholder="20"
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 30px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF'
                      }}
                    />
                    <Percent size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748B' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
                    Calculated Tool Budget ({selectedCurrency}):
                  </label>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#166534' }}>
                    {formatCurrencyAmount(parseFloat(amountInput) || 0, selectedCurrency)}
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>
                    {jobBudgetMode === 'MAIN_JOB' 
                      ? `(${percentInput || 0}% of Main Job Budget ${formatCurrencyAmount(mainJobBudget, selectedCurrency, false)})`
                      : 'Tool-Specific Budget Amount'
                    }
                  </span>
                  {selectedCurrency !== 'RM' && selectedCurrency !== 'MYR' && (
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', marginTop: '4px', backgroundColor: '#EFF6FF', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}>
                      ≈ {formatCurrencyAmount((parseFloat(amountInput) || 0) * (exchangeRate || 1.0), 'RM')} (Auto-converted to RM on save)
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Tool Budget Amount ({selectedCurrency})
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={amountInput}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="20000"
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 30px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF'
                      }}
                    />
                    <DollarSign size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748B' }} />
                  </div>
                  {selectedCurrency !== 'RM' && selectedCurrency !== 'MYR' && (
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', marginTop: '4px', backgroundColor: '#EFF6FF', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}>
                      ≈ {formatCurrencyAmount((parseFloat(amountInput) || 0) * (exchangeRate || 1.0), 'RM')} (Auto-converted to RM on save)
                    </div>
                  )}
                </div>

                {jobBudgetMode === 'MAIN_JOB' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
                      Calculated Allocation Share:
                    </label>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#1E40AF' }}>
                      {percentInput}%
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      ({formatCurrencyAmount(parseFloat(amountInput) || 0, selectedCurrency, false)} of {formatCurrencyAmount(mainJobBudget, selectedCurrency, false)})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 4: Part Image & Technical Drawing Uploads (Bottom of Modal) */}
          <div 
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Part Image & Technical Drawing Attachments
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {/* 1. Upload Part Image */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={14} style={{ color: '#2563EB' }} />
                  <span>Upload Part Image</span>
                </label>

                {partImageUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px' }}>
                    <img 
                      src={partImageUrl} 
                      alt="Part Preview" 
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }} 
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {partImageName || 'Part Image'}
                      </div>
                      <span style={{ fontSize: '10px', color: '#166534', fontWeight: 700 }}>✓ Image Uploaded</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setPartImageUrl(''); setPartImageName(''); }}
                      style={{ padding: '6px', background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', borderRadius: '4px' }}
                      title="Remove Image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <label 
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '14px 16px',
                      border: '2px dashed #CBD5E1',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <Upload size={18} style={{ color: '#2563EB', marginBottom: '4px' }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B' }}>Click to Upload Part Image</span>
                    <span style={{ fontSize: '10px', color: '#64748B' }}>PNG, JPG, WEBP formats</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                )}
              </div>

              {/* 2. Upload Part Technical Drawing */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} style={{ color: '#D97706' }} />
                  <span>Upload Part Technical Drawing</span>
                </label>

                {partDrawingUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '6px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={22} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {partDrawingName || 'Technical Drawing'}
                      </div>
                      <span style={{ fontSize: '10px', color: '#B45309', fontWeight: 700 }}>✓ Drawing Uploaded</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setPartDrawingUrl(''); setPartDrawingName(''); }}
                      style={{ padding: '6px', background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', borderRadius: '4px' }}
                      title="Remove Drawing"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <label 
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '14px 16px',
                      border: '2px dashed #CBD5E1',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <Upload size={18} style={{ color: '#D97706', marginBottom: '4px' }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B' }}>Click to Upload Technical Drawing</span>
                    <span style={{ fontSize: '10px', color: '#64748B' }}>PDF, DWG, DXF, STEP, CAD files</span>
                    <input 
                      type="file" 
                      accept=".pdf,.dwg,.dxf,.step,.stp,.png,.jpg,.jpeg" 
                      onChange={handleDrawingUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div 
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '10px',
              marginTop: '10px'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '9px 22px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
              }}
            >
              {isEditing ? 'Save Spec Updates' : '+ Add Tool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
