"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Barcode as BarcodeIcon, Share2, Printer, MoreVertical, CheckCircle, ExternalLink } from 'lucide-react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '@/components/ui/Modal';
import type { DesignJob } from './JobMetadata';

// Header markup and local styles copied from job-orders/[...id]/page.tsx.
export function DesignerDetailHeader({ job, backHref = '/designer/jobs' }: { job: DesignJob; backHref?: string }) {
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [notice, setNotice] = useState('');
  const router = useRouter();
  const dbOrder = job;
  const metadata = job.headerMetadata ? Object.fromEntries(Object.entries(job.headerMetadata).map(([key, value]) => [key, value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)])) : undefined;
  const orderDetail = {
    id: job.id,
    customer: job.customer || job.customerName || 'Customer not recorded',
    product: job.name || job.projectName || 'Assembly',
    subId: job.id,
    status: (job.status || 'Pending').toUpperCase(),
    price: metadata?.['PO VALUE'] || '—',
  };
  async function copyLink() {
    try { await navigator.clipboard.writeText(window.location.href); setNotice('Job link copied.'); }
    catch { setNotice('Unable to copy. Copy the page address from your browser.'); }
  }
  return <>
      <div className="detail-header">
       <div className="header-top">
        <div className="header-left">
          <Link href={backHref} className="back-btn">
            <ChevronLeft size={20} />
          </Link>
          <div className="header-info">
            <div className="customer-avatar">
              {orderDetail.customer.charAt(0)}
            </div>
            <div className="title-group">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h2>{orderDetail.customer}</h2>
                <span className="id-badge">#{orderDetail.id.split('-')[1] || orderDetail.id}</span>
                {metadata?.['QUOTATION REF'] && (
                  <Link 
                    href={`/quotations/${metadata['QUOTATION REF']}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#E0F2FE',
                      color: '#0284C7',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      textDecoration: 'none'
                    }}
                    title="View Linked Quotation"
                  >
                    <span>Quote: {metadata['QUOTATION REF']}</span>
                    <ExternalLink size={11} />
                  </Link>
                )}
                {metadata?.['RFQ REF'] && (
                  <Link 
                    href="/rfqs"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      color: 'var(--accent-red)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      textDecoration: 'none'
                    }}
                    title="View Linked RFQ"
                  >
                    <span>RFQ: {metadata['RFQ REF']}</span>
                    <ExternalLink size={11} />
                  </Link>
                )}
              </div>
              <p>{orderDetail.product} <span className="sub-id">{orderDetail.subId}</span></p>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <div className="action-icons">
            <button onClick={() => setIsQrOpen(true)} title="Show QR"><BarcodeIcon size={18} /></button>
            <button aria-label="Copy job link" onClick={copyLink}><Share2 size={18} /></button>
            <button aria-label="Print job" onClick={() => window.print()}><Printer size={18} /></button>
            <button aria-label="View revisions" onClick={() => router.push('/designer/revisions')}><MoreVertical size={18} /></button>
          </div>
          <div className="status-pill-large">
            {orderDetail.status} <CheckCircle size={14} />
          </div>
          <button className="expand-btn" aria-label="Toggle job metadata" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
            <ChevronLeft size={20} style={{ transform: 'rotate(-90deg)' }} />
          </button>
        </div>
       </div> {/* End header-top */}

        {/* Meta Header / Excel Header Metadata Grid */}
        {expanded && (() => {
          const getStatusBadgeStyle = (status: string) => {
            const s = status.toLowerCase();
            if (s.includes('run') || s.includes('progress')) return { backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe' };
            if (s.includes('comp') || s.includes('pass')) return { backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #dcfce7' };
            if (s.includes('short') || s.includes('delay')) return { backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fee2e2' };
            return { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' };
          };

          const getPriorityBadgeStyle = (priority: string) => {
            const p = priority.toLowerCase();
            if (p.includes('crit') || p.includes('high')) return { backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5' };
            if (p.includes('medium')) return { backgroundColor: '#fef8e7', color: '#b25e00', border: '1px solid #fdf2d0' };
            return { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' };
          };

          return (
            <div className="header-metadata-card" style={{ margin: '0 32px 24px 32px', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.6fr auto', gap: '32px', width: '100%' }}>
                {/* Column 1: Project Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderRight: '1px solid var(--border-color)', paddingRight: '24px' }}>
                  <h4 style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-red)', textTransform: 'uppercase', margin: '0 0 6px 0', letterSpacing: '0.05em' }}>Project Profile</h4>
                  <div className="metadata-item">
                    <span className="metadata-label">Customer</span>
                    <span className="metadata-value" style={{ fontWeight: 700, fontSize: '14px' }}>{orderDetail.customer}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Project Name</span>
                    <span className="metadata-value" style={{ fontWeight: 700, fontSize: '14px' }}>{orderDetail.product}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Tool Number</span>
                    <span className="metadata-value" style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '14px' }}>{orderDetail.id}</span>
                  </div>
                </div>

                {/* Column 2: Status & Schedule */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderRight: '1px solid var(--border-color)', paddingRight: '24px' }}>
                  <h4 style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-red)', textTransform: 'uppercase', margin: '0 0 6px 0', letterSpacing: '0.05em' }}>Status & Timeline</h4>
                  <div className="metadata-item">
                    <span className="metadata-label">Job Order Status</span>
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        textTransform: 'uppercase',
                        ...getStatusBadgeStyle(orderDetail.status)
                      }}>
                        {orderDetail.status}
                      </span>
                    </div>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Priority Level</span>
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        textTransform: 'uppercase',
                        ...getPriorityBadgeStyle(dbOrder?.priority || '—')
                      }}>
                        {dbOrder?.priority || '—'}
                      </span>
                    </div>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Start Date</span>
                    <span className="metadata-value" style={{ fontSize: '14px' }}>{dbOrder?.startDate || '—'}</span>
                  </div>
                </div>

                {/* Column 3: Tech Specs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h4 style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-red)', textTransform: 'uppercase', margin: '0 0 6px 0', letterSpacing: '0.05em' }}>Excel Metadata Specifications</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Object.entries(metadata || {
                      'DRAWING NO': 'N/A',
                      'REV': '-',
                      'MATERIAL': 'NOT SPECIFIED',
                      'PO VALUE': orderDetail.price
                    }).map(([key, value]) => {
                      const label = key.startsWith('Info_') || key.startsWith('Field_') ? '' : key;
                      if (['CUSTOMER', 'PROJECT', 'JOB NO.', 'TOOL NO.', 'DATE', 'START', 'EXPECTED', 'DUE', 'STATUS', 'PRIORITY'].some(k => key.toUpperCase().includes(k))) {
                        return null;
                      }
                      return (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #f1f5f9', paddingBottom: '6px' }}>
                          {label && <span className="metadata-label" style={{ marginBottom: 0, textTransform: 'capitalize' }}>{label.toLowerCase()}</span>}
                          <span className="metadata-value" style={{ fontSize: '13px', fontWeight: 600 }}>{value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Column 4: Barcode */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', borderLeft: '1px solid var(--border-color)', paddingLeft: '24px' }}>
                  <span className="barcode-caption" style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Job Order SKU</span>
                  <div className="barcode-inner" style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '220px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <Barcode 
                      value={orderDetail.id} 
                      width={1.8} 
                      height={65} 
                      displayValue={false}
                      background="#ffffff"
                      margin={0}
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.5px' }}>{orderDetail.id}</span>
                </div>
              </div>
            </div>
          );
        })()}
        
      {notice && <p role="status" className="px-8 pb-4 text-sm">{notice}</p>}
      </div>
      <Modal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} title={`Job ${job.id}`} width="360px"><div className="flex flex-col items-center gap-4"><QRCodeSVG value={job.id} size={224} marginSize={4} title={`Job ${job.id}`} /><p className="font-mono text-sm">{job.id}</p></div></Modal>
<style jsx>{`.detail-header {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-color);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
        }
.header-top {
          display: flex;
          justify-content: space-between;
          padding: 24px 32px;
          background: white;
        }
.header-metadata-card {
          margin: 0 32px 24px 32px;
          padding: 24px;
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 40px;
        }
.metadata-barcode-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding-left: 32px;
          border-left: 1px solid #f1f5f9;
        }
.barcode-inner {
          background: #f8fafc;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid #f1f5f9;
        }
.barcode-caption {
          font-size: 9px;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
.metadata-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px 32px;
          flex: 1;
        }
.metadata-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
.header-left { display: flex; align-items: center; gap: 24px; }
.header-info { display: flex; align-items: center; gap: 16px; }
.customer-avatar {
          width: 48px; height: 48px; background: var(--accent-red); color: white; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px;
        }
.detail-header { flex-shrink: 0; padding-top: 0; }
@media (max-width: 1023px) { .header-top { flex-wrap: wrap; gap: 24px; } .header-metadata-card { overflow-x: auto; align-items: stretch; } }`}</style>
</>;
}
