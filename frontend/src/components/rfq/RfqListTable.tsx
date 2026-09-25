"use client";

import React, { useState } from 'react';
import { RfqRecord, RfqStatus, RfqPriority, FeasibilityRecommendation, formatCurrency } from '@/services/rfq.service';
import { Search, Filter, Plus, ArrowUpRight, CheckCircle2, AlertTriangle, XCircle, HelpCircle, FileText, ChevronRight, Share2 } from 'lucide-react';

interface RfqListTableProps {
  rfqs: RfqRecord[];
  onSelectRfq: (rfq: RfqRecord) => void;
  onCreateNew: () => void;
  onOpenDecision: (rfq: RfqRecord) => void;
  onConvertToQuotation: (rfq: RfqRecord) => void;
}

export default function RfqListTable({
  rfqs,
  onSelectRfq,
  onCreateNew,
  onOpenDecision,
  onConvertToQuotation
}: RfqListTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [feasibilityFilter, setFeasibilityFilter] = useState<string>('ALL');
  const [customerFilter, setCustomerFilter] = useState<string>('ALL');

  // Distinct customers for filter
  const uniqueCustomers = Array.from(new Set(rfqs.map(r => r.customerName).filter(Boolean)));

  const filteredRfqs = rfqs.filter(rfq => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      rfq.rfqNumber.toLowerCase().includes(q) ||
      rfq.projectName.toLowerCase().includes(q) ||
      rfq.customerName.toLowerCase().includes(q) ||
      rfq.items.some(i => i.partNumber.toLowerCase().includes(q) || i.partName.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || rfq.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || rfq.priority === priorityFilter;
    const matchesFeasibility = 
      feasibilityFilter === 'ALL' || 
      (rfq.lastFeasibilityCheck?.recommendation || 'INSUFFICIENT DATA') === feasibilityFilter;
    const matchesCustomer = customerFilter === 'ALL' || rfq.customerName === customerFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesFeasibility && matchesCustomer;
  });

  const getFeasibilityBadge = (rec?: FeasibilityRecommendation) => {
    switch (rec) {
      case 'FEASIBLE':
        return (
          <span className="pill-green">
            <CheckCircle2 size={12} /> Feasible
          </span>
        );
      case 'FEASIBLE WITH CONDITIONS':
        return (
          <span className="pill-orange">
            <AlertTriangle size={12} /> Conditional / Risk
          </span>
        );
      case 'NOT FEASIBLE':
        return (
          <span className="pill-red">
            <XCircle size={12} /> Not Feasible
          </span>
        );
      default:
        return (
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '4px', 
            fontSize: '11px', 
            color: 'var(--text-tertiary)',
            backgroundColor: '#F1F5F9',
            padding: '3px 8px',
            borderRadius: '6px'
          }}>
            <HelpCircle size={12} /> Pending
          </span>
        );
    }
  };

  const getStatusBadge = (status: RfqStatus) => {
    const norm = status.toLowerCase().replace(' ', '-');
    return (
      <span className={`status-pill status-${norm}`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority: RfqPriority) => {
    let color = 'var(--text-secondary)';
    if (priority === 'CRITICAL') color = 'var(--accent-red)';
    else if (priority === 'HIGH') color = 'var(--warning-orange)';
    else if (priority === 'MEDIUM') color = '#2563EB';

    return (
      <span style={{ fontSize: '12px', fontWeight: 700, color }}>
        {priority}
      </span>
    );
  };

  const selectStyle: React.CSSProperties = {
    padding: '6px 12px',
    fontSize: '13px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    outline: 'none',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
  };

  return (
    <div className="rfq-management-list-flow" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Header Card */}
      <div 
        className="card"
        style={{ 
          padding: '20px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            RFQ & Feasibility Assessment
          </h1>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Internal Operation Manager workspace for job viability, internal cost comparison, and shop floor capacity screening
          </div>
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '13px', 
            fontWeight: 600,
            padding: '10px 20px',
            backgroundColor: 'var(--accent-red)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(255, 77, 77, 0.25)'
          }}
        >
          <Plus size={16} />
          <span>+ Create RFQ</span>
        </button>
      </div>

      {/* Filter and Search Bar Card */}
      <div 
        className="card"
        style={{ 
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search by RFQ No, Part No, Project, Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="UNDER ASSESSMENT">UNDER ASSESSMENT</option>
            <option value="FEASIBLE">FEASIBLE</option>
            <option value="CONDITIONAL">CONDITIONAL</option>
            <option value="ON HOLD">ON HOLD</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        {/* Feasibility Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Feasibility:</span>
          <select
            value={feasibilityFilter}
            onChange={(e) => setFeasibilityFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="ALL">All Recommendations</option>
            <option value="FEASIBLE">🟢 Feasible</option>
            <option value="FEASIBLE WITH CONDITIONS">🟡 Conditional / Risk</option>
            <option value="NOT FEASIBLE">🔴 Not Feasible</option>
            <option value="INSUFFICIENT DATA">⚪ Pending Data</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Customer Filter */}
        {uniqueCustomers.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Customer:</span>
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              style={{ ...selectStyle, maxWidth: '180px' }}
            >
              <option value="ALL">All Customers</option>
              {uniqueCustomers.map(cust => (
                <option key={cust} value={cust}>{cust}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Manufacturing RFQ Table Card */}
      <div 
        className="card"
        style={{ 
          padding: 0, 
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>RFQ NO</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>CUSTOMER / PROJECT NAME</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>BUDGET (CUSTOMER BUDGET)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>NUMBER OF TOOLS</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ESTIMATED END DATE</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>WORKING DAYS</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>STATUS</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredRfqs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px' }}>
                    No RFQs match the search or filter criteria. Click <strong>+ Create RFQ</strong> to enter customer requirements.
                  </td>
                </tr>
              ) : (
                filteredRfqs.map((rfq, idx) => {
                  const toolCount = rfq.items ? rfq.items.length : 0;
                  const estimatedEndDate = rfq.calculated?.estimatedCompletionDate || rfq.requiredEndDate || 'Not set';
                  const workingDays = rfq.calculated?.availableWorkingDays ?? 0;

                  return (
                    <tr
                      key={rfq.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FBFCFD'
                      }}
                    >
                      {/* 1. RFQ No */}
                      <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => onSelectRfq(rfq)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            fontFamily: 'inherit',
                            fontWeight: 'inherit',
                            color: 'var(--accent-red)',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          {rfq.rfqNumber}
                        </button>
                      </td>

                      {/* 2. Customer/Project name */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rfq.customerName || 'No customer'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{rfq.projectName}</div>
                      </td>

                      {/* 3. Budget (customer budget) */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontWeight: 600, color: '#047857' }}>
                        {rfq.budget ? formatCurrency(rfq.budget.customerBudget, rfq.budget.currency) : 'RM 0.00'}
                      </td>

                      {/* 4. Number of tools */}
                      <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          backgroundColor: '#F1F5F9',
                          color: '#334155',
                          fontWeight: 700,
                          fontSize: '12px'
                        }}>
                          {toolCount} {toolCount === 1 ? 'tool' : 'tools'}
                        </span>
                      </td>

                      {/* 5. Estimated End Date */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                          {estimatedEndDate}
                        </div>
                      </td>

                      {/* 6. Working days */}
                      <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {workingDays} days
                        </div>
                      </td>

                      {/* 7. Status */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        {getStatusBadge(rfq.status)}
                      </td>

                      {/* 8. Action */}
                      <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => onSelectRfq(rfq)}
                            style={{ 
                              fontSize: '12px', 
                              fontWeight: 600,
                              padding: '5px 10px',
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #CBD5E1',
                              borderRadius: '6px',
                              color: 'var(--text-primary)',
                              cursor: 'pointer'
                            }}
                            title="Open Feasibility Assessment Workspace"
                          >
                            Assess / View
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenDecision(rfq)}
                            style={{ 
                              fontSize: '12px', 
                              fontWeight: 600,
                              padding: '5px 10px',
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #CBD5E1',
                              borderRadius: '6px',
                              color: 'var(--text-primary)',
                              cursor: 'pointer'
                            }}
                            title="Record Operation Manager Decision"
                          >
                            Decide
                          </button>

                          {rfq.status === 'ACCEPTED' && !rfq.quotationNo && (
                            <button
                              type="button"
                              onClick={() => onConvertToQuotation(rfq)}
                              style={{ 
                                fontSize: '12px', 
                                fontWeight: 600,
                                padding: '5px 10px',
                                backgroundColor: 'var(--success-green)',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                              title="Generate Quotation"
                            >
                              → Quotation
                            </button>
                          )}

                          {rfq.quotationNo && (
                            <span className="pill-green" style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                              {rfq.quotationNo}
                            </span>
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
      </div>
    </div>
  );
}
