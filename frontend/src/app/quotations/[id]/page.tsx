"use client";

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  QuotationRecord, 
  QuotationItem, 
  QuotationService, 
  QuotationStatus 
} from '@/services/quotation.service';
import { dbService } from '@/services/db';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/context/AuthContext';
import { 
  FileCheck, 
  ChevronLeft, 
  Printer, 
  Edit3, 
  Eye, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Send, 
  AlertCircle, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Layers, 
  DollarSign, 
  Calendar, 
  ShieldCheck,
  Briefcase
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function QuotationDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const quotationId = decodeURIComponent(resolvedParams.id);
  const { hasPermission } = usePermissions();
  const { user } = useAuth();
  const currentUser = user?.username ? `${user.username} (${user.role || 'Operation Manager'})` : 'Alex Wong (Operation Manager)';

  const [quotation, setQuotation] = useState<QuotationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<QuotationRecord | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load quotation data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await QuotationService.getById(quotationId);
        if (data) {
          setQuotation(data);
          setEditForm(JSON.parse(JSON.stringify(data)));
        }
      } catch (err) {
        console.error('Error loading quotation:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quotationId]);

  if (loading) {
    return (
      <div style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Loading quotation details...</div>
      </div>
    );
  }

  if (!quotation || !editForm) {
    return (
      <div style={{ flex: 1, height: '100%', padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-color)' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <AlertCircle size={36} style={{ color: 'var(--accent-red)', margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '18px', margin: '0 0 8px' }}>Quotation Not Found</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
            No quotation record exists for reference <code>{quotationId}</code>.
          </p>
          <Link href="/quotations" className="back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
            <ChevronLeft size={16} /> Back to Quotations
          </Link>
        </div>
      </div>
    );
  }

  // Recalculate financial summary for editForm
  const recalculateFinancials = (form: QuotationRecord) => {
    const subtotal = form.items.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
    const discountAmount = Math.round((subtotal * (Number(form.financials.discountPercent) || 0)) / 100);
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round((taxableAmount * (Number(form.financials.taxPercent) || 0)) / 100);
    const grandTotal = taxableAmount + taxAmount;

    return {
      ...form.financials,
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal
    };
  };

  // Handle line item edit
  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    setEditForm(prev => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev)) as QuotationRecord;
      const item = copy.items[index];
      (item as any)[field] = value;

      if (field === 'quantity' || field === 'unitPrice') {
        const qty = Number(field === 'quantity' ? value : item.quantity) || 1;
        const price = Number(field === 'unitPrice' ? value : item.unitPrice) || 0;
        item.totalPrice = qty * price;
      }

      copy.financials = recalculateFinancials(copy);
      return copy;
    });
  };

  // Add line item
  const handleAddItem = () => {
    setEditForm(prev => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev)) as QuotationRecord;
      const newItem: QuotationItem = {
        id: `item-${Date.now()}`,
        toolNumber: `TOOL-00${copy.items.length + 1}`,
        partName: 'New Tooling Module',
        description: 'Custom precision tooling module',
        specifications: '300 x 200 x 150 mm | Material: SKD11',
        material: 'SKD11 Die Steel',
        quantity: 1,
        unitPrice: 5000,
        totalPrice: 5000,
        leadTimeDays: 14
      };
      copy.items.push(newItem);
      copy.financials = recalculateFinancials(copy);
      return copy;
    });
  };

  // Remove line item
  const handleRemoveItem = (index: number) => {
    if (editForm.items.length <= 1) {
      alert('A quotation must contain at least one line item.');
      return;
    }
    setEditForm(prev => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev)) as QuotationRecord;
      copy.items.splice(index, 1);
      copy.financials = recalculateFinancials(copy);
      return copy;
    });
  };

  // Save changes
  const handleSaveEdits = async () => {
    setErrorMsg('');
    try {
      const saved = await QuotationService.save(editForm, currentUser);
      setQuotation(saved);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save quotation changes.');
    }
  };

  // Update status quickly
  const handleStatusUpdate = async (newStatus: QuotationStatus) => {
    try {
      const updated = await QuotationService.updateStatus(quotation.id, newStatus, currentUser);
      setQuotation(updated);
      setEditForm(JSON.parse(JSON.stringify(updated)));
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const currencySymbol = quotation.currency === 'USD' ? '$' : quotation.currency === 'RM' || quotation.currency === 'MYR' ? 'RM ' : `${quotation.currency} `;

  return (
    <div 
      className="quotation-detail-page-scroll" 
      style={{ 
        flex: 1, 
        height: '100%', 
        overflowY: 'auto', 
        padding: '24px 32px 64px 32px', 
        backgroundColor: 'var(--bg-color)' 
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Navigation & Action Bar (Hidden in Print) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link 
              href="/quotations" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                color: 'var(--text-secondary)', 
                textDecoration: 'none', 
                fontSize: '13px', 
                fontWeight: 600,
                backgroundColor: 'var(--card-bg)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}
            >
              <ChevronLeft size={16} /> All Quotations
            </Link>

            {quotation.rfqNumber && (
              <Link 
                href="/rfqs"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: 'var(--accent-red)',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
              >
                <span>Linked RFQ: {quotation.rfqNumber}</span>
                <ExternalLink size={12} />
              </Link>
            )}

            {quotation.jobOrderId && (
              <Link 
                href={`/job-orders/${quotation.jobOrderId}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#0284C7',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: '#E0F2FE',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  border: '1px solid #BAE6FD'
                }}
              >
                <Briefcase size={13} />
                <span>Job Order: {quotation.jobOrderId}</span>
                <ExternalLink size={12} />
              </Link>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Mode Switcher / Action Buttons */}
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => window.print()}
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
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={15} />
                  <span>Print / PDF</span>
                </button>

                {quotation.status !== 'Approved' && quotation.status !== 'Accepted' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('Approved')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <ShieldCheck size={15} />
                    <span>Approve Quotation</span>
                  </button>
                )}

                {quotation.status === 'Approved' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('Sent')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#0284C7',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Send size={15} />
                    <span>Mark as Sent</span>
                  </button>
                )}

                {quotation.status === 'Sent' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('Accepted')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#16A34A',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Customer Accepted</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
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
                    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)'
                  }}
                >
                  <Edit3 size={15} />
                  <span>Edit Details</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditForm(JSON.parse(JSON.stringify(quotation)));
                    setIsEditing(false);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <X size={15} />
                  <span>Cancel</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveEdits}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#16A34A',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                  }}
                >
                  <Save size={15} />
                  <span>Save Changes</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Feedback banners */}
        {saveSuccess && (
          <div style={{
            backgroundColor: '#DCFCE7',
            border: '1px solid #86EFAC',
            color: '#15803D',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} />
            <span>Quotation details successfully updated and synchronized with linked Job Order.</span>
          </div>
        )}

        {errorMsg && (
          <div style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#B91C1C',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600
          }}>
            {errorMsg}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 1: DISPLAY MODE (Formal Printable Engineering Quotation Document)    */}
        {/* ========================================================================= */}
        {!isEditing ? (
          <div 
            className="quotation-print-sheet" 
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '40px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '32px'
            }}
          >
            {/* Quotation Header & Company Letterhead */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              borderBottom: '2px solid var(--border-color)', 
              paddingBottom: '24px',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: 'var(--accent-red)', fontSize: '28px', fontWeight: 900 }}>⬢</div>
                  <span style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                    SYNCO PRECISION ENGINEERING
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
                  Synco Software & Precision Tooling Sdn. Bhd. (Reg No: 202401019283)<br />
                  Plot 48, Precision Machining Zone, High-Tech Industrial Estate, 40000 Shah Alam, Malaysia<br />
                  Tel: +60 3-5521 8800 | Email: sales@synco-precision.com | Web: www.synco-precision.com<br />
                  <strong>ISO 9001:2015 & AS9100D Certified Aerospace Tooling Facility</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: 900, 
                  color: 'var(--accent-red)', 
                  letterSpacing: '0.5px' 
                }}>
                  QUOTATION
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {quotation.quotationNo}
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  marginTop: '8px',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  backgroundColor: quotation.status === 'Accepted' ? '#DCFCE7' : quotation.status === 'Sent' ? '#E0F2FE' : '#FEF3C7',
                  color: quotation.status === 'Accepted' ? '#16A34A' : quotation.status === 'Sent' ? '#0284C7' : '#D97706'
                }}>
                  <span>STATUS: {quotation.status.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Client & Commercial Details Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: '24px' 
            }}>
              {/* Customer Box */}
              <div style={{
                backgroundColor: 'var(--bg-color)',
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.5px' }}>
                  PREPARED FOR (CLIENT)
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {quotation.customer}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <strong>Attn:</strong> {quotation.customerContact.contactPerson}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong>Email:</strong> {quotation.customerContact.email}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong>Phone:</strong> {quotation.customerContact.phone}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  {quotation.customerContact.companyAddress}
                </div>
              </div>

              {/* Quotation Metadata Box */}
              <div style={{
                backgroundColor: 'var(--bg-color)',
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Quotation Date</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{quotation.quotationDate}</div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Valid Until</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{quotation.validityDate}</div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Project Reference</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{quotation.projectName}</div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Est. Delivery Date</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#16A34A', marginTop: '2px' }}>{quotation.deliveryDate}</div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Payment Terms</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '2px' }}>{quotation.paymentTerms}</div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Delivery Terms</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '2px' }}>{quotation.deliveryTerms}</div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Linked RFQ</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-red)', marginTop: '2px' }}>
                    {quotation.rfqNumber || 'N/A'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Linked Job Order</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0284C7', marginTop: '2px' }}>
                    <Link href={`/job-orders/${quotation.jobOrderId}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                      {quotation.jobOrderId}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Tooling & Precision Machining Scope
              </div>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', width: '40px' }}>#</th>
                    <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Tool / Item Description</th>
                    <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Specifications & Material</th>
                    <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', textAlign: 'center', width: '60px' }}>Qty</th>
                    <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', textAlign: 'right', width: '120px' }}>Unit Price ({quotation.currency})</th>
                    <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', textAlign: 'right', width: '130px' }}>Total Amount ({quotation.currency})</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px', fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)' }}>{idx + 1}</td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.toolNumber} — {item.partName}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                          {item.description}
                        </div>
                        {/* Process breakdown tags if present */}
                        {item.departmentAllocations && item.departmentAllocations.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                            {item.departmentAllocations.map((alloc, aidx) => (
                              <span 
                                key={aidx} 
                                style={{ 
                                  fontSize: '10px', 
                                  fontWeight: 600, 
                                  backgroundColor: 'var(--bg-color)', 
                                  border: '1px solid var(--border-color)', 
                                  padding: '2px 6px', 
                                  borderRadius: '4px',
                                  color: 'var(--text-secondary)'
                                }}
                              >
                                {alloc.department}: {currencySymbol}{alloc.allocatedBudget.toLocaleString()} {alloc.estimatedHours ? `(${alloc.estimatedHours}h)` : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <div>{item.specifications}</div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '11px', marginTop: '2px' }}>
                          Material: {item.material} | Lead Time: {item.leadTimeDays} working days
                        </div>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>
                        {currencySymbol}{item.unitPrice.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {currencySymbol}{item.totalPrice.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary & Notes Area */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: '24px',
              alignItems: 'start'
            }}>
              {/* Notes & Terms */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Remarks & Technical Notes:
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-secondary)', 
                    backgroundColor: 'var(--bg-color)', 
                    padding: '12px 14px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-color)',
                    lineHeight: 1.5
                  }}>
                    {quotation.notes || 'Standard manufacturing and inspection protocols apply.'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Commercial Terms & Conditions:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {quotation.termsAndConditions.map((term, tidx) => (
                      <li key={tidx}>{term}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Price Calculation Box */}
              <div style={{
                backgroundColor: 'var(--bg-color)',
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {currencySymbol}{quotation.financials.subtotal.toLocaleString()}
                  </span>
                </div>

                {quotation.financials.discountPercent > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Discount ({quotation.financials.discountPercent}%):</span>
                    <span style={{ fontWeight: 600, color: '#16A34A' }}>
                      -{currencySymbol}{quotation.financials.discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                {quotation.financials.taxPercent > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>SST / Tax ({quotation.financials.taxPercent}%):</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      +{currencySymbol}{quotation.financials.taxAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div style={{ 
                  borderTop: '2px solid var(--border-color)', 
                  paddingTop: '12px', 
                  marginTop: '4px',
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'baseline' 
                }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      GRAND TOTAL:
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      Net payable in {quotation.currency}
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent-red)' }}>
                    {currencySymbol}{quotation.financials.grandTotal.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures & Approvals Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '40px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '32px',
              marginTop: '16px'
            }}>
              {/* Issued By */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '40px' }}>
                  ISSUED BY (SYNCO PRECISION)
                </div>
                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {quotation.preparedBy}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Operation Manager / Authorized Technical Signatory
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Timestamp: {quotation.createdAt}
                  </div>
                </div>
              </div>

              {/* Customer Acceptance */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '40px' }}>
                  CUSTOMER ACCEPTANCE & CONFIRMATION
                </div>
                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                    Authorized Signature & Company Stamp
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Date: ________________________
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* ========================================================================= */
          /* MODE 2: EDIT MODE (Interactive Quotation Form & Tool Customization)      */
          /* ========================================================================= */
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Edit Quotation Details — {editForm.quotationNo}
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  Update client details, line items, pricing, delivery commitments, and terms.
                </p>
              </div>

              {/* Status selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Status:</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as QuotationStatus })}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  <option value="Draft">Draft</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Sent">Sent</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Revised">Revised</option>
                </select>
              </div>
            </div>

            {/* General & Client Info Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Customer Name</label>
                <input
                  type="text"
                  value={editForm.customer}
                  onChange={(e) => setEditForm({ ...editForm, customer: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Contact Person (Attn)</label>
                <input
                  type="text"
                  value={editForm.customerContact.contactPerson}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    customerContact: { ...editForm.customerContact, contactPerson: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Client Email</label>
                <input
                  type="email"
                  value={editForm.customerContact.email}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    customerContact: { ...editForm.customerContact, email: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Client Phone</label>
                <input
                  type="text"
                  value={editForm.customerContact.phone}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    customerContact: { ...editForm.customerContact, phone: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Project Name</label>
                <input
                  type="text"
                  value={editForm.projectName}
                  onChange={(e) => setEditForm({ ...editForm, projectName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Estimated Delivery Date</label>
                <input
                  type="date"
                  value={editForm.deliveryDate}
                  onChange={(e) => setEditForm({ ...editForm, deliveryDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Validity Date</label>
                <input
                  type="date"
                  value={editForm.validityDate}
                  onChange={(e) => setEditForm({ ...editForm, validityDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Currency</label>
                <select
                  value={editForm.currency}
                  onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                >
                  <option value="RM">RM (Malaysian Ringgit)</option>
                  <option value="MYR">MYR (Ringgit Malaysia)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="SGD">SGD (Singapore Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
            </div>

            {/* Line Items Editor */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Line Items ({editForm.items.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px dashed var(--accent-red)',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    color: 'var(--accent-red)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={14} /> Add Line Item
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {editForm.items.map((item, idx) => (
                  <div 
                    key={item.id || idx}
                    style={{
                      backgroundColor: 'var(--bg-color)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '14px',
                      display: 'grid',
                      gridTemplateColumns: '120px 1.5fr 1fr 60px 110px 110px 32px',
                      gap: '10px',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <input
                        type="text"
                        placeholder="Tool #"
                        value={item.toolNumber}
                        onChange={(e) => handleItemChange(idx, 'toolNumber', e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', fontWeight: 600 }}
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Part Name"
                        value={item.partName}
                        onChange={(e) => handleItemChange(idx, 'partName', e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', fontWeight: 600 }}
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Specifications / Dimensions"
                        value={item.specifications}
                        onChange={(e) => handleItemChange(idx, 'specifications', e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px' }}
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', textAlign: 'center' }}
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        min="0"
                        placeholder="Unit Price"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', textAlign: 'right' }}
                      />
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {currencySymbol}{item.totalPrice.toLocaleString()}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-tertiary)',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Remove Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Adjustments */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.financials.discountPercent}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setEditForm(prev => {
                      if (!prev) return prev;
                      const copy = { ...prev, financials: { ...prev.financials, discountPercent: val } };
                      copy.financials = recalculateFinancials(copy);
                      return copy;
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>SST / Tax (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.financials.taxPercent}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setEditForm(prev => {
                      if (!prev) return prev;
                      const copy = { ...prev, financials: { ...prev.financials, taxPercent: val } };
                      copy.financials = recalculateFinancials(copy);
                      return copy;
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Payment Terms</label>
                <input
                  type="text"
                  value={editForm.paymentTerms}
                  onChange={(e) => setEditForm({ ...editForm, paymentTerms: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Grand Total</label>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  fontSize: '16px',
                  fontWeight: 900,
                  color: 'var(--accent-red)'
                }}>
                  {currencySymbol}{editForm.financials.grandTotal.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Notes textarea */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Engineering Notes & Remarks
              </label>
              <textarea
                rows={3}
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={() => {
                  setEditForm(JSON.parse(JSON.stringify(quotation)));
                  setIsEditing(false);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--card-bg)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveEdits}
                style={{
                  padding: '8px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
