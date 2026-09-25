"use client";

import React, { use, useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronDown, ChevronRight, ShoppingCart,
  CheckCircle, AlertCircle, Clock, Package, AlertTriangle,
  DollarSign, XCircle, Search, Filter, TrendingUp, User, FileText
} from 'lucide-react';
import Link from 'next/link';
import { useDatabase } from '@/context/DatabaseContext';

interface PageProps {
  params: Promise<{ id: string[] }>;
}

// ─── Status Helpers ───────────────────────────────────────────────────────────

const PURCHASE_STATUS_COLORS: Record<string, string> = {
  Arrived: 'var(--success-green)',
  Pending: '#F59E0B',
  'Partial Arrival': '#3B82F6',
  Delayed: 'var(--accent-red)',
  'Not Ordered': 'var(--text-tertiary)',
  Cancelled: '#374151',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  Paid: 'var(--success-green)',
  'Partially Paid': '#F59E0B',
  Unpaid: 'var(--accent-red)',
};

const StatusBadge = ({ status, colors }: { status: string; colors: Record<string, string> }) => {
  const color = colors[status] || 'var(--text-secondary)';
  return (
    <span style={{
      fontSize: '10px', fontWeight: 700, color, backgroundColor: `${color}15`,
      padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', whiteSpace: 'nowrap'
    }}>
      {status}
    </span>
  );
};

const ReadinessBadge = ({ label, color }: { label: string; color: string }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    fontSize: '11px', fontWeight: 700, color,
    backgroundColor: `${color}15`, padding: '4px 10px', borderRadius: '12px',
    textTransform: 'uppercase'
  }}>
    {label === 'Ready' && <CheckCircle size={12} />}
    {label === 'Awaiting Materials' && <Clock size={12} />}
    {label === 'Partial Ready' && <Package size={12} />}
    {label === 'Blocked' && <AlertCircle size={12} />}
    {label}
  </span>
);

const DecisionBadge = ({ decision }: { decision: string }) => {
  const map: Record<string, { color: string; icon: React.ReactNode }> = {
    'Can Proceed': { color: 'var(--success-green)', icon: <CheckCircle size={12} /> },
    'Proceed with Available': { color: '#F59E0B', icon: <AlertTriangle size={12} /> },
    'Wait for Delivery': { color: '#3B82F6', icon: <Clock size={12} /> },
    'Cannot Proceed': { color: 'var(--accent-red)', icon: <XCircle size={12} /> },
  };
  const { color, icon } = map[decision] || { color: 'var(--text-secondary)', icon: null };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      fontSize: '11px', fontWeight: 700, color,
      backgroundColor: `${color}15`, padding: '4px 10px', borderRadius: '12px', whiteSpace: 'nowrap'
    }}>
      {icon} {decision}
    </span>
  );
};

// ─── Mock Data Generator per Tool ──────────────────────────────────────────────

const OPERATIONS = ['CNC Milling', 'Milling', 'Heat Treatment', 'Grinding', 'Wire EDM', 'EDM Sinker', 'Assembly'];
const SUPPLIERS = ['Global Metals Co.', 'Fastener Hub', 'Precision Parts LTD', 'Local Tooling Co.', 'Apex Steel Works', 'Omega Alloys', 'TechFast Inc.'];
const BUYERS = ['Admin', 'J. Doe', 'S. Patel', 'M. Chen'];

function generateJobProcurementData(tools: any[], jobOrderId: string) {
  const materialPool = [
    { code: 'MAT-001', name: 'DC53 Tool Steel Billet', unit: 'blocks' },
    { code: 'MAT-002', name: 'M3 Hex Bolts (Grade 12.9)', unit: 'pcs' },
    { code: 'MAT-003', name: 'Copper EDM Wire (0.25mm)', unit: 'spools' },
    { code: 'MAT-004', name: 'M6 Dowel Pins (Hardened)', unit: 'pcs' },
    { code: 'MAT-005', name: 'SKD11 Die Base Plate', unit: 'blocks' },
    { code: 'MAT-006', name: 'Carbide End Mill Set', unit: 'sets' },
    { code: 'MAT-007', name: 'Hydraulic Seal Kit', unit: 'kits' },
    { code: 'MAT-008', name: 'Synthetic Coolant (5L)', unit: 'cans' },
  ];
  const purchaseStatuses: Array<'Arrived' | 'Pending' | 'Delayed' | 'Not Ordered' | 'Partial Arrival'> = 
    ['Arrived', 'Pending', 'Delayed', 'Not Ordered', 'Partial Arrival'];
  const paymentStatuses = ['Paid', 'Partially Paid', 'Unpaid'];

  return tools.map((tool, jIdx) => {
    const opName = OPERATIONS[jIdx % OPERATIONS.length];
    const matCount = 2 + (jIdx % 3); // 2–4 materials per tool
    const materials = materialPool.slice(jIdx % materialPool.length, (jIdx % materialPool.length) + matCount).map((mat, mIdx) => {
      const baseStatus = purchaseStatuses[(jIdx + mIdx) % purchaseStatuses.length];
      const reqQty = 5 + mIdx * 10;
      let ordQty = reqQty;
      let recQty = 0;

      if (baseStatus === 'Arrived') { recQty = reqQty; }
      else if (baseStatus === 'Partial Arrival') { recQty = Math.floor(reqQty / 2); }
      else if (baseStatus === 'Not Ordered') { ordQty = 0; }

      const pendingQty = ordQty - recQty;
      const unitCost = 10 + mIdx * 25;
      const totalCost = unitCost * ordQty;
      const supplier = SUPPLIERS[(jIdx + mIdx) % SUPPLIERS.length];
      const buyer = BUYERS[(jIdx + mIdx) % BUYERS.length];
      const paymentStatus = paymentStatuses[(jIdx + mIdx) % paymentStatuses.length];

      return {
        matCode: mat.code,
        matName: mat.name,
        unit: mat.unit,
        supplier,
        poNum: ordQty > 0 ? `PO-${jobOrderId}-${jIdx + 1}${mIdx + 1}` : '-',
        orderDate: ordQty > 0 ? '2026-07-01' : '-',
        expectedDelivery: ordQty > 0 ? `2026-08-${String(10 + mIdx + jIdx).padStart(2, '0')}` : '-',
        actualDelivery: baseStatus === 'Arrived' ? '2026-08-10' : '-',
        reqQty, ordQty, recQty, pendingQty,
        unitCost, totalCost,
        invoiceNum: baseStatus === 'Arrived' ? `INV-${1000 + jIdx * 10 + mIdx}` : '-',
        buyer,
        paymentStatus: baseStatus === 'Not Ordered' ? '-' : paymentStatus,
        purchaseStatus: baseStatus,
      };
    });

    // Compute readiness
    const arrived = materials.filter(m => m.purchaseStatus === 'Arrived').length;
    const pending = materials.filter(m => m.purchaseStatus === 'Pending').length;
    const delayed = materials.filter(m => m.purchaseStatus === 'Delayed').length;
    const notOrdered = materials.filter(m => m.purchaseStatus === 'Not Ordered').length;
    const partial = materials.filter(m => m.purchaseStatus === 'Partial Arrival').length;
    const total = materials.length;

    let readiness = '';
    let readinessColor = '';
    let decision = '';
    if (delayed > 0 || notOrdered > 0) { readiness = 'Blocked'; readinessColor = 'var(--accent-red)'; decision = 'Cannot Proceed'; }
    else if (arrived === total) { readiness = 'Ready'; readinessColor = 'var(--success-green)'; decision = 'Can Proceed'; }
    else if (partial > 0 && arrived > 0) { readiness = 'Partial Ready'; readinessColor = '#F59E0B'; decision = 'Proceed with Available'; }
    else { readiness = 'Awaiting Materials'; readinessColor = '#3B82F6'; decision = 'Wait for Delivery'; }

    const totalPOValue = materials.reduce((s, m) => s + m.totalCost, 0);
    const totalPaid = materials.filter(m => m.paymentStatus === 'Paid').reduce((s, m) => s + m.totalCost, 0);

    return {
      jobId: tool.id,
      operation: opName,
      materials,
      counts: { arrived, pending, delayed, notOrdered, partial, total },
      readiness, readinessColor, decision,
      totalPOValue, totalPaid,
    };
  });
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PurchaseDetailPage({ params }: PageProps) {
  const { getJobOrderById, isMounted } = useDatabase();
  const resolvedParams = use(params);
  const idArray = resolvedParams.id;
  const id = Array.isArray(idArray) ? idArray.join('/') : idArray;

  const dbOrder = getJobOrderById(id);

  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [activeMaterialFilter, setActiveMaterialFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const tools = dbOrder?.tools || [
    { id: `${id}/1`, name: 'PUNCH SHOE' },
    { id: `${id}/2`, name: 'PUNCH PLATE' },
    { id: `${id}/3`, name: 'UPPER DIE BLOCK' },
    { id: `${id}/4`, name: 'LOWER PUNCH' },
  ];

  const jobData = useMemo(() => generateJobProcurementData(tools, id), [tools, id]);

  // Overall WO KPIs
  const woKPIs = useMemo(() => {
    const allMats = jobData.flatMap(j => j.materials);
    return {
      totalPOs: allMats.filter(m => m.poNum !== '-').length,
      arrived: allMats.filter(m => m.purchaseStatus === 'Arrived').length,
      pending: allMats.filter(m => m.purchaseStatus === 'Pending').length,
      delayed: allMats.filter(m => m.purchaseStatus === 'Delayed').length,
      notOrdered: allMats.filter(m => m.purchaseStatus === 'Not Ordered').length,
      totalValue: allMats.reduce((s, m) => s + m.totalCost, 0),
      paid: allMats.filter(m => m.paymentStatus === 'Paid').reduce((s, m) => s + m.totalCost, 0),
    };
  }, [jobData]);

  const filteredJobData = useMemo(() => {
    return jobData.filter(j =>
      j.jobId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.operation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [jobData, searchTerm]);

  if (!isMounted) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading...</div>;

  const order = dbOrder || { id, customer: 'Customer', dueDate: 'TBD' };

  return (
    <div className="detail-page purchase-details-page">
      {/* ── Page Header ── */}
      <div className="detail-header">
        <div className="header-top">
          <div className="header-left">
            <Link href="/purchases" className="back-btn"><ChevronLeft size={20} /></Link>
            <div className="header-info">
              <div className="customer-avatar">{order.customer?.charAt(0) || 'W'}</div>
              <div className="title-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2>{order.customer || 'Job Order'}</h2>
                  <span className="id-badge">#{id}</span>
                </div>
                <p>Procurement Control Center <span className="sub-id">Purchase Details</span></p>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <ShoppingCart size={14} /> Purchase Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* ── WO-Level KPI Summary ── */}
        <div style={{ margin: '0 32px 24px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Total POs', value: woKPIs.totalPOs, color: 'var(--text-primary)' },
            { label: 'Arrived', value: woKPIs.arrived, color: 'var(--success-green)' },
            { label: 'Pending', value: woKPIs.pending, color: '#F59E0B' },
            { label: 'Delayed', value: woKPIs.delayed, color: 'var(--accent-red)' },
            { label: 'Not Ordered', value: woKPIs.notOrdered, color: 'var(--text-tertiary)' },
            { label: 'Total PO Value', value: `$${woKPIs.totalValue.toLocaleString()}`, color: 'var(--text-primary)', isText: true },
            { label: 'Paid', value: `$${woKPIs.paid.toLocaleString()}`, color: 'var(--success-green)', isText: true },
            { label: 'Outstanding', value: `$${(woKPIs.totalValue - woKPIs.paid).toLocaleString()}`, color: 'var(--accent-red)', isText: true },
          ].map(k => (
            <div key={k.label} style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</span>
              <span style={{ fontSize: k.isText ? '18px' : '28px', fontWeight: 700, color: k.color }}>{k.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ── Search + Filter Bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, maxWidth: '400px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', gap: '8px' }}>
            <Search size={16} color="var(--text-tertiary)" />
            <input
              type="text"
              placeholder="Search job orders or operations..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', width: '100%' }}
            />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
            <Filter size={14} /> Sort
          </button>
        </div>

        {/* ── Job Order Readiness Table ── */}
        <div className="tool-readiness-overview" style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Job Order Readiness Overview</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>{filteredJobData.length} Job Orders</span>
          </div>
          <div className="tool-readiness-table-scroll" tabIndex={0} aria-label="Scrollable tool readiness table">
          <table className="tool-readiness-table" style={{ borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              {/* Group header */}
              <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <th style={{ width: '40px' }} rowSpan={2}></th>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 700, color: 'var(--text-secondary)', verticalAlign: 'middle' }} rowSpan={2}>Job Order</th>
                <th style={{ textAlign: 'center', padding: '10px 16px', fontWeight: 700, color: 'var(--text-secondary)', verticalAlign: 'middle' }} rowSpan={2}>Total Materials</th>
                <th colSpan={4} style={{ textAlign: 'center', padding: '8px 16px', fontWeight: 800, color: 'var(--accent-blue)', borderBottom: '1px solid var(--accent-blue)', fontSize: '10px', letterSpacing: '0.06em' }}>
                  MATERIAL STATUS
                </th>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 700, color: 'var(--text-secondary)', verticalAlign: 'middle' }} rowSpan={2}>Material Readiness</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 700, color: 'var(--text-secondary)', verticalAlign: 'middle' }} rowSpan={2}>Production Decision</th>
              </tr>
              <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <th style={{ textAlign: 'center', padding: '6px 12px', fontWeight: 700, color: 'var(--success-green)', borderBottom: '2px solid var(--success-green)', fontSize: '11px' }}>Arrived</th>
                <th style={{ textAlign: 'center', padding: '6px 12px', fontWeight: 700, color: '#F59E0B', borderBottom: '2px solid #F59E0B', fontSize: '11px' }}>Pending</th>
                <th style={{ textAlign: 'center', padding: '6px 12px', fontWeight: 700, color: 'var(--accent-red)', borderBottom: '2px solid var(--accent-red)', fontSize: '11px' }}>Delayed</th>
                <th style={{ textAlign: 'center', padding: '6px 12px', fontWeight: 700, color: 'var(--text-tertiary)', borderBottom: '2px solid var(--text-tertiary)', fontSize: '11px' }}>Not Ordered</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobData.map((jd) => {
                const isExpanded = expandedJob === jd.jobId;
                return (
                  <React.Fragment key={jd.jobId}>
                    {/* Main Row */}
                    <tr
                      style={{ cursor: 'pointer', backgroundColor: isExpanded ? `${jd.readinessColor}08` : 'transparent', borderTop: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                      onClick={() => setExpandedJob(isExpanded ? null : jd.jobId)}
                      onMouseOver={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }}
                      onMouseOut={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = `${isExpanded ? jd.readinessColor : ''}08`; }}
                    >
                      <td style={{ textAlign: 'center', padding: '14px 8px', color: 'var(--text-tertiary)', borderLeft: `3px solid ${jd.readinessColor}` }}>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--accent-red)', fontFamily: 'monospace' }}>{jd.jobId}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--text-primary)' }}>{jd.counts.total}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--success-green)' }}>{jd.counts.arrived}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700, color: '#F59E0B' }}>{jd.counts.pending}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--accent-red)' }}>{jd.counts.delayed}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--text-tertiary)' }}>{jd.counts.notOrdered}</td>
                      <td style={{ padding: '14px 16px' }}><ReadinessBadge label={jd.readiness} color={jd.readinessColor} /></td>
                      <td style={{ padding: '14px 16px' }}><DecisionBadge decision={jd.decision} /></td>
                    </tr>

                    {/* Expanded Detail - Premium Redesign */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={9} style={{ padding: 0 }}>
                          <div style={{
                            background: `linear-gradient(135deg, ${jd.readinessColor}06 0%, var(--bg-color) 60%)`,
                            borderLeft: `4px solid ${jd.readinessColor}`,
                            borderBottom: `1px solid ${jd.readinessColor}30`,
                            padding: '28px 36px 32px 36px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '28px',
                          }}>

                            {/* ── Section Header with Tool Info ── */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: `${jd.readinessColor}18`, border: `1.5px solid ${jd.readinessColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Package size={20} color={jd.readinessColor} />
                                </div>
                                <div>
                                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{jd.jobId}</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <ReadinessBadge label={jd.readiness} color={jd.readinessColor} />
                                <DecisionBadge decision={jd.decision} />
                              </div>
                            </div>

                            {/* ── KPI Cards Row - Premium Glass Style ── */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '12px' }}>
                              {[
                                { label: 'Total', value: jd.counts.total, color: 'var(--text-primary)', icon: '📦' },
                                { label: 'Arrived', value: jd.counts.arrived, color: 'var(--success-green)', icon: '✅' },
                                { label: 'Pending', value: jd.counts.pending, color: '#F59E0B', icon: '⏳' },
                                { label: 'Delayed', value: jd.counts.delayed, color: 'var(--accent-red)', icon: '🔴' },
                                { label: 'Not Ordered', value: jd.counts.notOrdered, color: '#6B7280', icon: '⚪' },
                                { label: 'PO Value', value: `$${jd.totalPOValue.toLocaleString()}`, color: 'var(--text-primary)', isText: true, icon: '💰' },
                                { label: 'Paid', value: `$${jd.totalPaid.toLocaleString()}`, color: 'var(--success-green)', isText: true, icon: '✔' },
                                { label: 'Outstanding', value: `$${(jd.totalPOValue - jd.totalPaid).toLocaleString()}`, color: 'var(--accent-red)', isText: true, icon: '⚠' },
                              ].map(k => (
                                <div key={k.label} style={{
                                  backgroundColor: 'var(--bg-panel)',
                                  border: `1px solid ${k.color === 'var(--text-primary)' ? 'var(--border-color)' : `${k.color}30`}`,
                                  borderRadius: '10px',
                                  padding: '14px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px',
                                  boxShadow: `0 2px 8px ${k.color === 'var(--text-primary)' ? 'rgba(0,0,0,0.04)' : `${k.color}10`}`,
                                  transition: 'transform 0.15s ease',
                                }}>
                                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</div>
                                  <div style={{ fontSize: k.isText ? '14px' : '24px', fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</div>
                                  {!k.isText && jd.counts.total > 0 && (
                                    <div style={{ height: '3px', borderRadius: '2px', backgroundColor: 'var(--border-color)', marginTop: '4px', overflow: 'hidden' }}>
                                      <div style={{ height: '100%', width: `${Math.round((Number(k.value) / jd.counts.total) * 100)}%`, backgroundColor: k.color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* ── Purchase Order Details Table ── */}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                <div style={{ width: '3px', height: '18px', borderRadius: '2px', backgroundColor: 'var(--accent-red)' }} />
                                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Purchase Order Details</span>
                              </div>
                              <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflowX: 'auto', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                  <thead>
                                    <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                                      {['Material', 'Supplier', 'PO Number', 'Order Date', 'Exp. Delivery', 'Act. Delivery', 'Req', 'Ord', 'Rec', 'Rem', 'Unit $', 'Total $', 'Invoice', 'Buyer', 'Payment', 'Status'].map(h => (
                                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {jd.materials
                                      .filter(m => !activeMaterialFilter || m.purchaseStatus === activeMaterialFilter)
                                      .map((mat, mIdx) => {
                                        const sc = PURCHASE_STATUS_COLORS[mat.purchaseStatus] || 'var(--text-secondary)';
                                        return (
                                          <tr key={`${mat.matCode}-po`} style={{ borderTop: '1px solid var(--border-color)', backgroundColor: mIdx % 2 === 0 ? 'transparent' : 'var(--bg-secondary)40' }}>
                                            <td style={{ padding: '12px 14px' }}>
                                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '12px' }}>{mat.matName}</div>
                                              <div style={{ fontSize: '10px', color: '#3B82F6', fontFamily: 'monospace', fontWeight: 600 }}>{mat.matCode}</div>
                                            </td>
                                            <td style={{ padding: '12px 14px' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: 'var(--text-tertiary)', flexShrink: 0 }}>
                                                  {mat.supplier.charAt(0)}
                                                </div>
                                                {mat.supplier}
                                              </div>
                                            </td>
                                            <td style={{ padding: '12px 14px' }}>
                                              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#3B82F6', cursor: 'pointer', fontSize: '12px' }}>{mat.poNum}</span>
                                            </td>
                                            <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: '12px' }}>{mat.orderDate}</td>
                                            <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: '12px' }}>{mat.expectedDelivery}</td>
                                            <td style={{ padding: '12px 14px', fontSize: '12px' }}>
                                              <span style={{ color: mat.actualDelivery !== '-' ? 'var(--success-green)' : 'var(--text-tertiary)', fontWeight: mat.actualDelivery !== '-' ? 600 : 400 }}>
                                                {mat.actualDelivery}
                                              </span>
                                            </td>
                                            {[mat.reqQty, mat.ordQty, mat.recQty, mat.pendingQty].map((v, vi) => (
                                              <td key={vi} style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, color: vi === 3 && v > 0 ? '#F59E0B' : 'var(--text-secondary)' }}>{v}</td>
                                            ))}
                                            <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>RM {mat.unitCost}</td>
                                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: 'var(--text-primary)' }}>RM {mat.totalCost.toLocaleString()}</td>
                                            <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-tertiary)' }}>{mat.invoiceNum}</td>
                                            <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 700, color: 'var(--text-tertiary)' }}>
                                                  {mat.buyer.charAt(0)}
                                                </div>
                                                {mat.buyer}
                                              </div>
                                            </td>
                                            <td style={{ padding: '12px 14px' }}>
                                              {mat.paymentStatus !== '-' ? <StatusBadge status={mat.paymentStatus} colors={PAYMENT_STATUS_COLORS} /> : <span style={{ color: 'var(--text-tertiary)' }}>–</span>}
                                            </td>
                                            <td style={{ padding: '12px 14px' }}>
                                              <StatusBadge status={mat.purchaseStatus} colors={PURCHASE_STATUS_COLORS} />
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}
