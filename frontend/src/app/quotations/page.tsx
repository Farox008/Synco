"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileCheck, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  Send, 
  FileEdit, 
  Eye, 
  Printer, 
  DollarSign, 
  Briefcase,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { QuotationRecord, QuotationService, QuotationStatus } from '@/services/quotation.service';
import { usePermissions } from '@/hooks/usePermissions';

export default function QuotationsPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [quotations, setQuotations] = useState<QuotationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const data = await QuotationService.getAll();
      setQuotations(data);
    } catch (err) {
      console.error('Failed to load quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  // Filtered quotations
  const filtered = quotations.filter(q => {
    const matchesSearch = 
      q.quotationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.rfqNumber && q.rfqNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (q.jobOrderId && q.jobOrderId.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return q.status === statusFilter;
  });

  // Calculate KPIs
  const totalValue = quotations.reduce((acc, q) => acc + (q.financials?.grandTotal || 0), 0);
  const pendingCount = quotations.filter(q => q.status === 'Pending Approval' || q.status === 'Draft').length;
  const acceptedCount = quotations.filter(q => q.status === 'Accepted').length;
  const sentCount = quotations.filter(q => q.status === 'Sent').length;

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'Draft':
        return { color: '#64748B', bg: '#F1F5F9', border: '#CBD5E1', icon: FileEdit };
      case 'Pending Approval':
        return { color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', icon: Clock };
      case 'Approved':
        return { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: CheckCircle2 };
      case 'Sent':
        return { color: '#0284C7', bg: '#E0F2FE', border: '#BAE6FD', icon: Send };
      case 'Accepted':
        return { color: '#16A34A', bg: '#DCFCE7', border: '#86EFAC', icon: CheckCircle2 };
      case 'Revised':
        return { color: '#9333EA', bg: '#F3E8FF', border: '#E9D5FF', icon: RefreshCw };
      default:
        return { color: '#64748B', bg: '#F1F5F9', border: '#CBD5E1', icon: FileCheck };
    }
  };

  return (
    <div 
      className="quotations-page-scroll" 
      style={{ 
        flex: 1, 
        height: '100%', 
        overflowY: 'auto', 
        padding: '24px 32px 64px 32px', 
        backgroundColor: 'var(--bg-color)' 
      }}
    >
      <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--accent-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileCheck size={22} />
              </div>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                  Quotations & Estimates
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Manage formal commercial quotations, price breakdowns, and synchronizations with Job Orders.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => router.push('/rfqs')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <Briefcase size={15} />
              <span>Convert from RFQ</span>
            </button>

            <button
              onClick={() => router.push('/rfqs/create')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--accent-red)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
              }}
            >
              <Plus size={16} />
              <span>Create New RFQ / Quote</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '16px' 
        }}>
          {/* Card 1: Total Quotations */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Quotations
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileCheck size={18} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {quotations.length}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Pipeline active quotes
            </div>
          </div>

          {/* Card 2: Total Pipeline Value */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Pipeline Value
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={18} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
              ${totalValue.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>
              Across {quotations.length} customer projects
            </div>
          </div>

          {/* Card 3: Pending Approval */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Awaiting Sign-off
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {pendingCount}
            </div>
            <div style={{ fontSize: '12px', color: '#D97706' }}>
              Requires OM or Director review
            </div>
          </div>

          {/* Card 4: Sent / Won */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Sent & Won
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={18} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {sentCount + acceptedCount}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {acceptedCount} closed won, {sentCount} active client review
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {['ALL', 'Draft', 'Pending Approval', 'Sent', 'Accepted'].map(st => {
              const active = statusFilter === st;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: active ? 700 : 500,
                    backgroundColor: active ? 'var(--accent-red)' : 'var(--bg-color)',
                    color: active ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {st === 'ALL' ? 'All Quotes' : st}
                  {st === 'ALL' && ` (${quotations.length})`}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              placeholder="Search Quote #, Customer, RFQ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Quotations Table */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px' }} />
              <div>Loading quotations...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <FileCheck size={42} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px', opacity: 0.6 }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                No Quotations Found
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
                {searchTerm || statusFilter !== 'ALL' 
                  ? 'No quotations match the active search or filters.' 
                  : 'Convert an RFQ to create your first formal quotation.'}
              </p>
              <button
                onClick={() => router.push('/rfqs')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--accent-red)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Go to RFQs
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Quotation #</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Customer & Project</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Linked RFQ</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Linked Job Order</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Total Amount</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Date / Valid Until</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((q) => {
                    const badge = getStatusBadge(q.status);
                    const StatusIcon = badge.icon;
                    const currencySymbol = q.currency === 'USD' ? '$' : q.currency === 'RM' || q.currency === 'MYR' ? 'RM ' : `${q.currency} `;
                    const grandTotal = q.financials?.grandTotal || 0;

                    return (
                      <tr 
                        key={q.id}
                        style={{ 
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background-color 0.15s'
                        }}
                        className="hover-row"
                      >
                        {/* Quotation No */}
                        <td style={{ padding: '14px 16px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                          <Link 
                            href={`/quotations/${q.quotationNo}`}
                            style={{ 
                              color: 'var(--accent-blue, #2563EB)', 
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>{q.quotationNo}</span>
                            <ChevronRight size={14} opacity={0.6} />
                          </Link>
                        </td>

                        {/* Customer & Project */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
                            {q.customer}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {q.projectName} ({q.items?.length || 0} items)
                          </div>
                        </td>

                        {/* Linked RFQ */}
                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                          {q.rfqNumber ? (
                            <Link 
                              href="/rfqs"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: 'var(--accent-red)',
                                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                textDecoration: 'none'
                              }}
                              title="Go to RFQ workspace"
                            >
                              <span>{q.rfqNumber}</span>
                              <ExternalLink size={11} />
                            </Link>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>—</span>
                          )}
                        </td>

                        {/* Linked Job Order */}
                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                          {q.jobOrderId ? (
                            <Link 
                              href={`/job-orders/${q.jobOrderId}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#0284C7',
                                backgroundColor: '#E0F2FE',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                textDecoration: 'none'
                              }}
                              title="View Job Order in Production"
                            >
                              <span>{q.jobOrderId}</span>
                              <ExternalLink size={11} />
                            </Link>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>—</span>
                          )}
                        </td>

                        {/* Total Amount */}
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px', whiteSpace: 'nowrap' }}>
                          {currencySymbol}{grandTotal.toLocaleString()}
                        </td>

                        {/* Dates */}
                        <td style={{ padding: '14px 16px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                            {q.quotationDate}
                          </div>
                          <div style={{ color: 'var(--text-tertiary)', fontSize: '11px', marginTop: '2px' }}>
                            Valid until {q.validityDate}
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            color: badge.color,
                            backgroundColor: badge.bg,
                            border: `1px solid ${badge.border}`
                          }}>
                            <StatusIcon size={12} />
                            <span>{q.status}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <Link
                              href={`/quotations/${q.quotationNo}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--card-bg)',
                                color: 'var(--text-primary)',
                                fontSize: '12px',
                                fontWeight: 600,
                                textDecoration: 'none',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Eye size={13} />
                              <span>View / Edit</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
