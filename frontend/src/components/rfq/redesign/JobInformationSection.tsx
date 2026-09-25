"use client";

import React, { useEffect } from 'react';
import { JobRecord, JobRfqStatus, JobLeadTimeSource } from '@/types/rfq-job.types';
import { useAuth } from '@/context/AuthContext';
import { addWorkingDays } from '@/services/rfq-job-calculator.service';
import { 
  FileText, 
  Calendar, 
  User, 
  Clock, 
  Hash, 
  CheckCircle2,
  XCircle,
  Tag,
  UserCheck,
  AlertTriangle,
  Flame,
  Check,
  Building
} from 'lucide-react';

interface JobInformationSectionProps {
  job: JobRecord;
  onChange: (updated: Partial<JobRecord>) => void;
  readOnly?: boolean;
  currentUser?: string;
}

export default function JobInformationSection({
  job,
  onChange,
  readOnly = false,
  currentUser
}: JobInformationSectionProps) {
  const { user } = useAuth();
  
  // Resolve logged-in operator
  const loggedInOperator = currentUser || (
    user?.username 
      ? `${user.username}${user.role ? ` (${user.role})` : ''}`
      : 'Alex Wong (Operation Manager)'
  );

  // Automatically assign default values on mount if missing
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const updates: Partial<JobRecord> = {};

    // 1. RFQ Date automatically assigned
    if (!job.rfqDate) {
      updates.rfqDate = today;
    }

    // 2. Made by automatically assigned to logged-in operator
    if (!job.madeBy) {
      updates.madeBy = loggedInOperator;
      updates.preparedBy = loggedInOperator;
    }

    // 3. Default status to 'Pending' if not set
    if (!job.status) {
      updates.status = 'Pending';
    }

    // 4. Default priority if not set
    if (!job.priority) {
      updates.priority = 'MEDIUM';
    }

    if (Object.keys(updates).length > 0) {
      onChange(updates);
    }
  }, []);

  // Handle status changes with automatic Job number assignment when Confirmed
  const handleStatusChange = (newStatus: JobRfqStatus) => {
    if (readOnly) return;
    const updates: Partial<JobRecord> = { status: newStatus };

    // When RFQ is confirmed, automatically assign Job Number if not already provided
    if (newStatus === 'Confirmed' && (!job.jobNumber || job.jobNumber.trim() === '')) {
      const generatedJobNo = job.rfqNumber && job.rfqNumber.trim() !== ''
        ? (job.rfqNumber.toUpperCase().startsWith('RFQ')
            ? job.rfqNumber.replace(/^RFQ-?/i, 'JOB-')
            : `JOB-${job.rfqNumber}`)
        : `JOB-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
      updates.jobNumber = generatedJobNo;
    }

    onChange(updates);
  };

  // Status configuration - strictly 3 options: Pending, Confirmed, Reject
  const statusOptions: {
    key: JobRfqStatus;
    label: string;
    icon: React.ElementType;
    activeBg: string;
    activeColor: string;
    activeBorder: string;
    badgeBg: string;
  }[] = [
    {
      key: 'Pending',
      label: 'Pending',
      icon: Clock,
      activeBg: '#FEF3C7',
      activeColor: '#B45309',
      activeBorder: '#F59E0B',
      badgeBg: '#FFFBEB'
    },
    {
      key: 'Confirmed',
      label: 'Confirmed',
      icon: CheckCircle2,
      activeBg: '#D1FAE5',
      activeColor: '#047857',
      activeBorder: '#10B981',
      badgeBg: '#ECFDF5'
    },
    {
      key: 'Reject',
      label: 'Reject',
      icon: XCircle,
      activeBg: '#FFE4E6',
      activeColor: '#BE123C',
      activeBorder: '#F43F5E',
      badgeBg: '#FFF1F2'
    }
  ];

  // Priority configuration
  const priorityOptions = [
    { value: 'LOW', label: 'Low', color: '#16A34A', bg: '#F0FDF4' },
    { value: 'MEDIUM', label: 'Medium', color: '#2563EB', bg: '#EFF6FF' },
    { value: 'HIGH', label: 'High', color: '#D97706', bg: '#FEF3C7' },
    { value: 'CRITICAL', label: 'Critical', color: '#DC2626', bg: '#FEF2F2' }
  ];

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
      {/* Header Bar */}
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
            1
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #0F172A)' }}>
              RFQ / JOB INFORMATION
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748B)' }}>
              Identification, confirmation workflow, metadata, and production schedule
            </span>
          </div>
        </div>

        {/* Quick Header Metadata Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span 
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: '#EEF2FF',
              color: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Hash size={12} /> {job.rfqNumber || 'Unassigned'}
          </span>

          {job.jobNumber ? (
            <span 
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: '#ECFDF5',
                color: '#047857',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Check size={12} /> {job.jobNumber}
            </span>
          ) : (
            <span 
              style={{
                fontSize: '11px',
                fontWeight: 500,
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: '#F1F5F9',
                color: '#64748B',
                border: '1px dashed #CBD5E1'
              }}
            >
              Job # Optional (Auto on Confirm)
            </span>
          )}

          {/* Status Badge in Header */}
          <span 
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: 
                job.status === 'Confirmed' ? '#D1FAE5' : 
                job.status === 'Reject' ? '#FFE4E6' : '#FEF3C7',
              color: 
                job.status === 'Confirmed' ? '#047857' : 
                job.status === 'Reject' ? '#BE123C' : '#B45309',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {job.status === 'Confirmed' && <CheckCircle2 size={12} />}
            {job.status === 'Reject' && <XCircle size={12} />}
            {job.status === 'Pending' && <Clock size={12} />}
            {job.status || 'Pending'}
          </span>
        </div>
      </div>

      {/* Form Fields Grid */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        
        {/* Row 1: RFQ Number, Job Number (Optional), Status (3 options only), Priority */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
          }}
        >
          {/* 1. RFQ Number */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              RFQ Number <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={job.rfqNumber || ''}
                onChange={(e) => onChange({ rfqNumber: e.target.value })}
                disabled={readOnly}
                placeholder="RFQ-2026-001"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: readOnly ? '#F8FAFC' : '#FFFFFF',
                  color: '#0F172A'
                }}
              />
              <FileText size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: '#64748B' }} />
            </div>
            <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
              Customer request tracking identifier
            </span>
          </div>

          {/* 2. Job Number (Optional - Auto-assigned when Confirmed) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                Job Number <span style={{ fontSize: '11px', fontWeight: 400, color: '#64748B' }}>(Optional)</span>
              </label>
              {job.status === 'Confirmed' && job.jobNumber && (
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#047857', backgroundColor: '#D1FAE5', padding: '1px 6px', borderRadius: '4px' }}>
                  Auto-Assigned
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={job.jobNumber || ''}
                onChange={(e) => onChange({ jobNumber: e.target.value })}
                disabled={readOnly}
                placeholder={job.status === 'Confirmed' ? 'e.g. JOB-2026-001' : 'Auto-assigned when confirmed'}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: '8px',
                  border: job.status === 'Confirmed' && job.jobNumber ? '1px solid #10B981' : '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontWeight: 700,
                  backgroundColor: job.status === 'Confirmed' && job.jobNumber ? '#F0FDF4' : (readOnly ? '#F8FAFC' : '#FFFFFF'),
                  color: job.status === 'Confirmed' && job.jobNumber ? '#065F46' : '#0F172A'
                }}
              />
              <Hash size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: job.status === 'Confirmed' && job.jobNumber ? '#10B981' : '#64748B' }} />
            </div>
            <span style={{ fontSize: '11px', color: job.status === 'Confirmed' ? '#047857' : '#94A3B8', marginTop: '4px', display: 'block' }}>
              {job.status === 'Confirmed' 
                ? '✓ Active production Job number assigned'
                : 'Auto-generates upon selecting "Confirmed" status'}
            </span>
          </div>

          {/* 3. Status (Strictly 3 options: Pending, Confirmed, Reject) */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Status <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4px',
                padding: '3px',
                backgroundColor: '#F1F5F9',
                borderRadius: '8px',
                border: '1px solid #E2E8F0'
              }}
            >
              {statusOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = (job.status || 'Pending') === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleStatusChange(opt.key)}
                    disabled={readOnly}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      padding: '7px 4px',
                      borderRadius: '6px',
                      border: isSelected ? `1px solid ${opt.activeBorder}` : '1px solid transparent',
                      backgroundColor: isSelected ? opt.activeBg : 'transparent',
                      color: isSelected ? opt.activeColor : '#64748B',
                      fontSize: '12px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: readOnly ? 'default' : 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <IconComponent size={13} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
              {job.status === 'Confirmed' && 'Confirmed: Job Number generated & ready for execution'}
              {job.status === 'Pending' && 'Pending review by Operation Manager'}
              {job.status === 'Reject' && 'Rejected: Feasibility or capacity unmet'}
            </span>
          </div>

          {/* 4. Priority */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Priority <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={job.priority || 'MEDIUM'}
                onChange={(e) => onChange({ priority: e.target.value as any })}
                disabled={readOnly}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: readOnly ? '#F8FAFC' : '#FFFFFF',
                  color: '#0F172A',
                  cursor: readOnly ? 'default' : 'pointer'
                }}
              >
                {priorityOptions.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label} Priority
                  </option>
                ))}
              </select>
              <Flame 
                size={15} 
                style={{ 
                  position: 'absolute', 
                  left: '10px', 
                  top: '11px', 
                  color: 
                    job.priority === 'CRITICAL' ? '#DC2626' : 
                    job.priority === 'HIGH' ? '#D97706' : 
                    job.priority === 'LOW' ? '#16A34A' : '#2563EB' 
                }} 
              />
            </div>
            <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
              Dictates machining line scheduling urgency
            </span>
          </div>
        </div>

        {/* Row 2: RFQ Date (Auto-assigned), Internal Reference Number, Made By (Auto-assigned) */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
          }}
        >
          {/* 5. RFQ Date (Automatically assigned) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                RFQ Date
              </label>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '1px 6px', borderRadius: '4px' }}>
                Auto-Assigned Date
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                value={job.rfqDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => onChange({ rfqDate: e.target.value })}
                disabled={readOnly}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: readOnly ? '#F8FAFC' : '#FFFFFF',
                  color: '#0F172A'
                }}
              />
              <Calendar size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: '#2563EB' }} />
            </div>
            <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
              Auto-stamped on creation
            </span>
          </div>

          {/* 6. Internal Reference Number */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Internal Reference Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={job.internalReference || ''}
                onChange={(e) => onChange({ internalReference: e.target.value })}
                disabled={readOnly}
                placeholder="e.g. INT-2026-001 or REF-9021"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: readOnly ? '#F8FAFC' : '#FFFFFF',
                  color: '#0F172A'
                }}
              />
              <Tag size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: '#64748B' }} />
            </div>
            <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
              Internal tracking or ERP linkage code
            </span>
          </div>

          {/* 7. Made By (Automatically assigned to logged-in operator) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                Made By
              </label>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#047857', backgroundColor: '#ECFDF5', padding: '1px 6px', borderRadius: '4px' }}>
                Logged-in Operator
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={job.madeBy || loggedInOperator}
                onChange={(e) => onChange({ madeBy: e.target.value, preparedBy: e.target.value })}
                disabled={readOnly}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: '#F8FAFC',
                  color: '#1E293B'
                }}
              />
              <UserCheck size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: '#059669' }} />
            </div>
            <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
              Automatically captured from active user session
            </span>
          </div>
        </div>

        {/* Row 3: Customer Details */}
        <div 
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={16} style={{ color: '#2563EB' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
              Customer Details
            </span>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px'
            }}
          >
            {/* Customer Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Customer Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={job.customer || ''}
                  onChange={(e) => onChange({ customer: e.target.value })}
                  disabled={readOnly}
                  placeholder="e.g. ABC Industries"
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: readOnly ? '#F8FAFC' : '#FFFFFF',
                    color: '#0F172A'
                  }}
                />
                <Building size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: '#64748B' }} />
              </div>
              <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
                Client organization placing the request
              </span>
            </div>

            {/* Customer ID */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Customer ID
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={job.customerId || ''}
                  onChange={(e) => onChange({ customerId: e.target.value })}
                  disabled={readOnly}
                  placeholder="e.g. CUST-001"
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: readOnly ? '#F8FAFC' : '#FFFFFF',
                    color: '#0F172A'
                  }}
                />
                <Hash size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: '#64748B' }} />
              </div>
              <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
                Unique client identifier or CRM account code
              </span>
            </div>

            {/* Customer Reference Number */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Customer Reference Number
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={job.customerReference || ''}
                  onChange={(e) => onChange({ customerReference: e.target.value })}
                  disabled={readOnly}
                  placeholder="e.g. PO-REQ-9921 or RFQ-CLIENT-08"
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: readOnly ? '#F8FAFC' : '#FFFFFF',
                    color: '#0F172A'
                  }}
                />
                <Tag size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: '#64748B' }} />
              </div>
              <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
                Client's internal PO or RFQ reference number
              </span>
            </div>

            {/* Customer Approximate Start Date */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Approximate Start Date
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={job.expectedStartDate || job.startingDate || ''}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    const updates: Partial<JobRecord> = {
                      startingDate: newStart,
                      expectedStartDate: newStart
                    };
                    if (newStart && job.customerLeadTimeDays && job.customerLeadTimeDays > 0) {
                      const calculatedEnd = addWorkingDays(newStart, job.customerLeadTimeDays);
                      updates.expectedEndDate = calculatedEnd;
                      updates.requiredCompletionDate = calculatedEnd;
                    }
                    onChange(updates);
                  }}
                  disabled={readOnly}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: readOnly ? '#F8FAFC' : '#FFFFFF',
                    color: '#0F172A'
                  }}
                />
                <Calendar size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: '#2563EB' }} />
              </div>
              <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
                Approximate target date to start tooling job
              </span>
            </div>

            {/* Customer Approximate End Date */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Approximate End Date
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={job.expectedEndDate || job.requiredCompletionDate || job.factoryEstimatedCompletion || ''}
                  onChange={(e) => {
                    const newEnd = e.target.value;
                    onChange({
                      expectedEndDate: newEnd,
                      requiredCompletionDate: newEnd
                    });
                  }}
                  disabled={readOnly}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: readOnly ? '#F8FAFC' : '#FFFFFF',
                    color: '#0F172A'
                  }}
                />
                <Calendar size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: '#16A34A' }} />
              </div>
              <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
                Approximate target date for job delivery completion
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
