"use client";

import React, { useState } from 'react';
import { designerToolHref, toolKey, toolName } from '@/services/designerTools';
import { 
  ChevronLeft, MoreVertical, Share2, Printer, 
  Layers, Package, Info, CheckCircle, Clock, 
  AlertCircle, ChevronRight, FileText, Barcode as BarcodeIcon,
  Cpu, MapPin, User, Activity, Maximize,
  DollarSign, ShieldCheck, TrendingUp, Settings,
  Plus, Upload, Download, FilePlus, Users, AlertTriangle, Eye, X, Check, ClipboardList, ExternalLink
} from 'lucide-react';
import Barcode from 'react-barcode';
import { QrDisplayModal } from '@/components/job-orders/QrDisplayModal';
import Link from 'next/link';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { JobOrderList } from '@/components/dashboard/JobOrderList';
import { usePermissions } from '@/hooks/usePermissions';

import { useDatabase } from '@/context/DatabaseContext';

interface PageProps {
  jobId: string;
  designer?: boolean;
}

const defaultPurchases = [
  { 
    id: "MAT-001", 
    name: "DC53 Tool Steel Billet", 
    specs: "400 x 500 x 20 mm", 
    qty: 4, 
    unit: "blocks", 
    suggested: "Global Metals Co.", 
    final: "Global Metals Co.", 
    unitCost: 220, 
    totalCost: 880, 
    eta: "2026-06-15", 
    status: "In Transit", 
    risk: "On Schedule", 
    prNum: "PR-2026-904", 
    poNum: "PO-2026-4401",
    requestDate: "2026-06-05", 
    orderDate: "2026-06-08", 
    actualArrivalDate: "-", 
    leadTime: "7 days", 
    blocking: false 
  },
  { 
    id: "MAT-002", 
    name: "M3 Hex Bolts (High Tensile)", 
    specs: "10mm Length - Grade 12.9", 
    qty: 200, 
    unit: "pcs", 
    suggested: "Fastener Hub", 
    final: "Fastener Hub", 
    unitCost: 0.45, 
    totalCost: 90, 
    eta: "2026-06-10", 
    status: "Arrived", 
    risk: "On Schedule", 
    prNum: "PR-2026-891", 
    poNum: "PO-2026-4389",
    requestDate: "2026-06-01", 
    orderDate: "2026-06-03", 
    actualArrivalDate: "2026-06-10", 
    leadTime: "7 days", 
    blocking: false 
  },
  { 
    id: "MAT-003", 
    name: "Copper EDM Wire", 
    specs: "0.25mm Diameter - 5kg Spool", 
    qty: 12, 
    unit: "spools", 
    suggested: "Precision Parts LTD", 
    final: "", 
    unitCost: 95, 
    totalCost: 1140, 
    eta: "2026-06-09", 
    status: "Purchase Pending", 
    risk: "Critical Delay", 
    prNum: "PR-2026-915", 
    poNum: "-",
    requestDate: "2026-06-06", 
    orderDate: "-", 
    actualArrivalDate: "-", 
    leadTime: "N/A", 
    blocking: true 
  },
  { 
    id: "MAT-004", 
    name: "M6 Dowel Pins", 
    specs: "30mm Length - Hardened Steel", 
    qty: 50, 
    unit: "pcs", 
    suggested: "Local Tooling Co.", 
    final: "Local Tooling Co.", 
    unitCost: 1.80, 
    totalCost: 90, 
    eta: "2026-06-12", 
    status: "Awaiting Approval", 
    risk: "At Risk", 
    prNum: "PR-2026-928", 
    poNum: "-",
    requestDate: "2026-06-09", 
    orderDate: "-", 
    actualArrivalDate: "-", 
    leadTime: "3 days", 
    blocking: true 
  },
  { 
    id: "MAT-005", 
    name: "SKD11 Die Base Plate", 
    specs: "600 x 800 x 45 mm", 
    qty: 1, 
    unit: "block", 
    suggested: "Apex Steel Works", 
    final: "Apex Steel Works", 
    unitCost: 650, 
    totalCost: 650, 
    eta: "2026-06-14", 
    status: "Ordered", 
    risk: "On Schedule", 
    prNum: "PR-2026-910", 
    poNum: "PO-2026-4408",
    requestDate: "2026-06-06", 
    orderDate: "2026-06-09", 
    actualArrivalDate: "-", 
    leadTime: "5 days", 
    blocking: false 
  }
];

export default function JobOrderDetailView({ jobId, designer = false }: PageProps) {
  const { getJobOrderById, isMounted } = useDatabase();
  const { hasPermission } = usePermissions();
  const id = jobId;

  const [activeTab, setActiveTab] = useState<'parts' | 'department' | 'machines' | 'purchase' | 'expenditure' | 'timeline' | 'revisions' | 'hours'>('parts');
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any | null>(null);

  // Attempt to load from persistent DB
  const dbOrder = getJobOrderById(id);

  const dynamicSpecs = dbOrder?.headerMetadata && Object.keys(dbOrder.headerMetadata).length > 0
    ? Object.keys(dbOrder.headerMetadata).map(key => ({
        label: key === '' ? 'Header Info' : key,
        value: dbOrder.headerMetadata[key]
      }))
    : [
      { label: "Width", value: "590 cm" },
      { label: "Height", value: "50 cm" },
      { label: "Depth", value: "900 cm" },
      { label: "Material", value: "MS / DC53" },
      { label: "Tool NO.", value: dbOrder?.id || "68-972-01" },
    ];

  // Fallback / Mock detail data
  const orderDetail = dbOrder ? {
    id: dbOrder.id,
    customer: dbOrder.customer,
    product: dbOrder.name || "Assembly",
    subId: dbOrder.id,
    status: dbOrder.status.toUpperCase(),
    price: dbOrder.headerMetadata?.['PO VALUE'] || "$1,267",
    specs: dynamicSpecs,
    included: [
      { label: "PUNCH SHOE", value: "1 pcs" },
      { label: "PUNCH PLATE", value: "1 pcs" },
      { label: "UPPER DIE BLOCK", value: "4 pcs" },
      { label: "LOWER PUNCH", value: "2 pcs" },
    ],
    tools: dbOrder.tools?.map((tool: Parameters<typeof toolKey>[0], index: number) => ({ ...tool, id: toolKey(tool, index), name: toolName(tool) })) || [
      { id: `${id}/1`, name: "PUNCH SHOE", specs: "590.0 x 50.0 x 900.0", weight: "22 kg", status: "Running" },
      { id: `${id}/2`, name: "PUNCH PLATE", specs: "20.0 x 450.0 x 760.0", weight: "8 kg", status: "Pending" },
      { id: `${id}/3`, name: "UPPER DIE BLOCK-1", specs: "30.0 x 450.0 x 131.0", weight: "12 kg", status: "Running" },
      { id: `${id}/4`, name: "LOWER PUNCH-1", specs: "30.0 x 314.0 x 186.0", weight: "2 kg", status: "Passed" },
    ],
    history: [
      { action: "Job Order Created", user: "System", role: "Automated", time: "10:00 AM", date: "14.08.2024", type: "system", description: "Job Order WO-2026-001 created." },
      { action: "Excel Log Imported", user: "Admin", role: "Administrator", time: "10:05 AM", date: "14.08.2024", type: "import", description: "Production schedule spreadsheet uploaded and parsed." },
      { action: "Material Verified", user: "Warehouse", role: "Inventory Specialist", time: "11:30 AM", date: "14.08.2024", type: "check", description: "All steel billets and components checked for quality." },
      { action: "CNC Programming Completed", user: "J. Doe", role: "CNC Programmer", time: "01:15 PM", date: "14.08.2024", type: "process", description: "G-code generated and uploaded to VMC-01 CNC machine." },
      { action: "Roughing Started", user: "CNC Op 1", role: "CNC Machinist", time: "01:46 PM", date: "14.08.2024", type: "activity", description: "First pass of rough milling initiated on PUNCH SHOE." },
      { action: "Quality Check - Pass", user: "QC Inspector", role: "Quality Lead", time: "03:20 PM", date: "14.08.2024", type: "check", description: "Dimension tolerance verified within 0.05mm limit." },
      { action: "Heat Treatment Dispatched", user: "Logistic", role: "Logistics Coordinator", time: "04:10 PM", date: "14.08.2024", type: "shipping", description: "Parts sent to heat treatment facility for tempering." },
      { action: "Current Status: In Production", user: "System", role: "Automated", time: "04:30 PM", date: "14.08.2024", type: "status", description: "job order status automatically updated in system." },
      { action: "Grinding Setup Initialized", user: "Grind Op", role: "Grinding Tech", time: "05:02 PM", date: "14.08.2024", type: "activity", description: "Precision grinding machine calibrated for final thickness." },
      { action: "Assembly Verification Check", user: "Lead Hand", role: "Assembly Lead", time: "05:45 PM", date: "14.08.2024", type: "check", description: "Checking alignment of UPPER DIE BLOCK-1 guide pins." },
      { action: "Production Log Synced", user: "System", role: "Automated", time: "06:00 PM", date: "14.08.2024", type: "system", description: "Cloud database backup successfully synchronized." }
    ],
    purchases: (dbOrder.purchases && dbOrder.purchases.length > 0) ? dbOrder.purchases : defaultPurchases
  } : {
    id: id,
    customer: "Google", 
    product: "68-972-01 Assembly",
    subId: "T25-0009/1",
    status: "IN PRODUCTION",
    price: "$1,267",
    specs: [
      { label: "Width", value: "590 cm" },
      { label: "Height", value: "50 cm" },
      { label: "Depth", value: "900 cm" },
      { label: "Material", value: "MS / DC53" },
      { label: "Tool NO.", value: "68-972-01" },
    ],
    included: [
      { label: "PUNCH SHOE", value: "1 pcs" },
      { label: "PUNCH PLATE", value: "1 pcs" },
      { label: "UPPER DIE BLOCK", value: "4 pcs" },
      { label: "LOWER PUNCH", value: "2 pcs" },
    ],
    tools: [
      { id: `${id}/1`, name: "PUNCH SHOE", specs: "590.0 x 50.0 x 900.0" },
      { id: `${id}/2`, name: "PUNCH PLATE", specs: "20.0 x 450.0 x 760.0" },
      { id: `${id}/3`, name: "UPPER DIE BLOCK-1", specs: "30.0 x 450.0 x 131.0" },
      { id: `${id}/4`, name: "LOWER PUNCH-1", specs: "30.0 x 314.0 x 186.0" },
    ].map((tool, idx) => ({
      ...tool,
      processPath: idx % 2 === 0 ? "M1-C2-G1" : "M2-W1-E1-G1",
      processes: {
        cnc: { actual: idx === 3 ? 12 : 8, estimated: 12, status: idx === 3 ? "Completed" : idx === 1 ? "Pending" : "In Progress", machine: "VMC-01" },
        milling: { actual: idx === 3 ? 8 : 4, estimated: 8, status: idx === 3 ? "Completed" : idx === 0 ? "In Progress" : "Pending", machine: "M-102" },
        heat: { actual: idx === 3 ? 2 : 0, estimated: 2, status: idx === 3 ? "Completed" : "Pending", machine: "HT-05" },
        grinding: { actual: idx === 3 ? 4 : 2, estimated: 4, status: idx === 3 ? "Completed" : idx === 2 ? "In Progress" : "Pending", machine: "G-44" },
        wiring: { actual: idx === 3 ? 24 : 0, estimated: 24, status: idx === 3 ? "Completed" : "Pending", machine: "W-EDM-A" },
        edm: { actual: idx === 3 ? 16 : 0, estimated: 16, status: idx === 3 ? "Completed" : "Pending", machine: "SINK-X1" },
        assembly: { actual: idx === 1 ? 0 : 0, estimated: idx === 1 ? 0 : 4, status: idx === 1 ? "N/A" : "Pending", machine: "BENCH-04" }
      }
    })),
    history: [
      { action: "Job Order Created", user: "System", role: "Automated", time: "10:00 AM", date: "14.08.2024", type: "system", description: "Job Order WO-2026-001 created." },
      { action: "Excel Log Imported", user: "Admin", role: "Administrator", time: "10:05 AM", date: "14.08.2024", type: "import", description: "Production schedule spreadsheet uploaded and parsed." },
      { action: "Material Verified", user: "Warehouse", role: "Inventory Specialist", time: "11:30 AM", date: "14.08.2024", type: "check", description: "All steel billets and components checked for quality." },
      { action: "CNC Programming Completed", user: "J. Doe", role: "CNC Programmer", time: "01:15 PM", date: "14.08.2024", type: "process", description: "G-code generated and uploaded to VMC-01 CNC machine." },
      { action: "Roughing Started", user: "CNC Op 1", role: "CNC Machinist", time: "01:46 PM", date: "14.08.2024", type: "activity", description: "First pass of rough milling initiated on PUNCH SHOE." },
      { action: "Quality Check - Pass", user: "QC Inspector", role: "Quality Lead", time: "03:20 PM", date: "14.08.2024", type: "check", description: "Dimension tolerance verified within 0.05mm limit." },
      { action: "Heat Treatment Dispatched", user: "Logistic", role: "Logistics Coordinator", time: "04:10 PM", date: "14.08.2024", type: "shipping", description: "Parts sent to heat treatment facility for tempering." },
      { action: "Current Status: In Production", user: "System", role: "Automated", time: "04:30 PM", date: "14.08.2024", type: "status", description: "job order status automatically updated in system." },
      { action: "Grinding Setup Initialized", user: "Grind Op", role: "Grinding Tech", time: "05:02 PM", date: "14.08.2024", type: "activity", description: "Precision grinding machine calibrated for final thickness." },
      { action: "Assembly Verification Check", user: "Lead Hand", role: "Assembly Lead", time: "05:45 PM", date: "14.08.2024", type: "check", description: "Checking alignment of UPPER DIE BLOCK-1 guide pins." },
      { action: "Production Log Synced", user: "System", role: "Automated", time: "06:00 PM", date: "14.08.2024", type: "system", description: "Cloud database backup successfully synchronized." }
    ],
    purchases: defaultPurchases
  };

  const depts = ['cnc', 'milling', 'heat', 'grinding', 'wiring', 'edm', 'assembly'];
  const deptColors = {
    CNC: '#ef4444',
    MILLING: '#3b82f6',
    HEAT: '#f59e0b',
    GRINDING: '#22c55e',
    WIRING: '#8b5cf6',
    EDM: '#f59e0b',
    ASSEMBLY: '#22c55e'
  } as any;
  
  // Aggregated hours for production bar graph
  const aggregatedHours = depts.map(dept => {
    const totals = orderDetail.tools.reduce((acc: any, tool: any) => {
      const proc = tool.processes?.[dept];
      if (proc && proc.status !== 'N/A') {
        acc.actual += proc.actual || 0;
        acc.estimated += proc.estimated || 0;
      }
      return acc;
    }, { actual: 0, estimated: 0 });
    return { 
      name: dept.toUpperCase(), 
      actual: totals.actual, 
      estimated: totals.estimated,
      progress: totals.estimated > 0 ? Math.round((totals.actual / totals.estimated) * 100) : 0
    };
  }).filter(d => d.estimated > 0);

  if (!isMounted) {
    return <div className="detail-page" style={{ padding: '40px', textAlign: 'center' }}>Loading Job Order Data...</div>;
  }

  return (
    <div className="detail-page">
      {/* Detail Header */}
      <div className="detail-header">
       <div className="header-top">
        <div className="header-left">
          <Link href={designer ? "/designer/jobs" : "/job-orders"} className="back-btn">
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
                {dbOrder?.headerMetadata?.['QUOTATION REF'] && (
                  <Link 
                    href={`/quotations/${dbOrder.headerMetadata['QUOTATION REF']}`}
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
                    <span>Quote: {dbOrder.headerMetadata['QUOTATION REF']}</span>
                    <ExternalLink size={11} />
                  </Link>
                )}
                {dbOrder?.headerMetadata?.['RFQ REF'] && (
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
                    <span>RFQ: {dbOrder.headerMetadata['RFQ REF']}</span>
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
            <button><Share2 size={18} /></button>
            <button><Printer size={18} /></button>
            <button><MoreVertical size={18} /></button>
          </div>
          <div className="status-pill-large">
            {orderDetail.status} <CheckCircle size={14} />
          </div>
          <button className="expand-btn">
            <ChevronLeft size={20} style={{ transform: 'rotate(-90deg)' }} />
          </button>
        </div>
       </div> {/* End header-top */}

        {/* Meta Header / Excel Header Metadata Grid */}
        {(() => {
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
                        ...getPriorityBadgeStyle(dbOrder?.priority || 'High')
                      }}>
                        {dbOrder?.priority || 'High'}
                      </span>
                    </div>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Start Date</span>
                    <span className="metadata-value" style={{ fontSize: '14px' }}>{dbOrder?.startDate || '14.08.2024'}</span>
                  </div>
                </div>

                {/* Column 3: Tech Specs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h4 style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-red)', textTransform: 'uppercase', margin: '0 0 6px 0', letterSpacing: '0.05em' }}>Excel Metadata Specifications</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Object.entries(dbOrder?.headerMetadata || {
                      'DRAWING NO': 'N/A',
                      'REV': '-',
                      'MATERIAL': 'NOT SPECIFIED',
                      'PO VALUE': orderDetail.price
                    }).map(([key, value]: [string, any]) => {
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
        
        {/* Financial Snapshot Persistent Header */}
        <div className="financial-snapshot">
          <div className="fin-card">
            <div className="fin-icon"><DollarSign size={20} /></div>
            <div className="fin-data">
              <span className="fin-label">PO Value</span>
              <span className="fin-value">{orderDetail.price}</span>
            </div>
          </div>
          <div className="fin-card">
            <div className="fin-icon blue"><ShieldCheck size={20} /></div>
            <div className="fin-data">
              <span className="fin-label">Required Budget</span>
              <span className="fin-value">RM 850.00</span>
            </div>
          </div>
          <div className="fin-card">
            <div className="fin-icon green"><TrendingUp size={20} /></div>
            <div className="fin-data">
              <span className="fin-label">Est. Margin</span>
              <span className="fin-value">32.8%</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="detail-tabs">
          <button className={`detail-tab ${activeTab === 'parts' ? 'active' : ''}`} onClick={() => setActiveTab('parts')}>Production</button>
          <button className={`detail-tab ${activeTab === 'department' ? 'active' : ''}`} onClick={() => setActiveTab('department')}>Department View</button>
          <button className={`detail-tab ${activeTab === 'machines' ? 'active' : ''}`} onClick={() => setActiveTab('machines')}>Machines Matrix</button>
          <button className={`detail-tab ${activeTab === 'purchase' ? 'active' : ''}`} onClick={() => setActiveTab('purchase')}>Purchase Planning</button>
          <button className={`detail-tab ${activeTab === 'expenditure' ? 'active' : ''}`} onClick={() => setActiveTab('expenditure')}>Expenditure</button>
          {hasPermission('timeline.view') && (
            <button className={`detail-tab ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>Timeline</button>
          )}
          {hasPermission('revision.view') && (
            <button className={`detail-tab ${activeTab === 'revisions' ? 'active' : ''}`} onClick={() => setActiveTab('revisions')}>Revisions</button>
          )}
          {hasPermission('job.edit') && (
            <button className={`detail-tab ${activeTab === 'hours' ? 'active' : ''}`} onClick={() => setActiveTab('hours')}>Hours Allocation</button>
          )}
        </div>
      </div>

      <div className="detail-content" style={{ padding: '24px 32px' }}>
        {activeTab === 'timeline' && (
          <div className="section-card" style={{ padding: '24px' }}>
            <h3 className="section-title-small mb-4">Operational Timeline</h3>
            <div className="space-y-4">
              <div className="p-4 border border-[#2a2a2a] rounded-lg bg-[#f8fafc]">
                <h4 className="font-bold text-gray-800">Design Phase</h4>
                <p className="text-sm text-gray-600">Expected completion: 18.08.2024</p>
                <div className="w-full bg-gray-200 h-2 mt-2 rounded-full"><div className="bg-blue-500 h-2 rounded-full w-full"></div></div>
              </div>
              <div className="p-4 border border-[#2a2a2a] rounded-lg bg-[#fff7ed]">
                <h4 className="font-bold text-orange-800">Purchase Phase</h4>
                <p className="text-sm text-orange-600">Expected completion: 22.08.2024</p>
                <div className="w-full bg-orange-200 h-2 mt-2 rounded-full"><div className="bg-orange-500 h-2 rounded-full w-1/2"></div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revisions' && (
          <div className="section-card" style={{ padding: '24px' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="section-title-small">Revisions</h3>
              {hasPermission('revision.create') && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded font-medium text-sm">Request Revision</button>
              )}
            </div>
            <div className="p-8 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
              <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active revisions for this job.</p>
            </div>
          </div>
        )}

        {activeTab === 'hours' && (
          <div className="section-card" style={{ padding: '24px' }}>
            <h3 className="section-title-small mb-4">Hours Allocation</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded bg-[#f8fafc]">
                  <span className="font-medium text-gray-700">Design</span>
                  <input type="number" defaultValue={24} className="w-20 p-1 border rounded text-right" disabled={!hasPermission('job.edit')} />
                </div>
                <div className="flex justify-between items-center p-3 border rounded bg-[#f8fafc]">
                  <span className="font-medium text-gray-700">Purchase</span>
                  <input type="number" defaultValue={4} className="w-20 p-1 border rounded text-right" disabled={!hasPermission('job.edit')} />
                </div>
                <div className="flex justify-between items-center p-3 border rounded bg-[#f8fafc]">
                  <span className="font-medium text-gray-700">Planning</span>
                  <input type="number" defaultValue={6} className="w-20 p-1 border rounded text-right" disabled={!hasPermission('job.edit')} />
                </div>
                <div className="flex justify-between items-center p-3 border rounded bg-[#f8fafc]">
                  <span className="font-medium text-gray-700">Production</span>
                  <input type="number" defaultValue={8} className="w-20 p-1 border rounded text-right" disabled={!hasPermission('job.edit')} />
                </div>
              </div>
              <div className="bg-[#1e293b] p-6 rounded-lg text-white">
                <h4 className="text-lg font-bold mb-4 border-b border-slate-600 pb-2">Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Estimated</span><span className="font-bold">42 h</span></div>
                  <div className="flex justify-between"><span>Allocated</span><span className="font-bold">42 h</span></div>
                  <div className="flex justify-between"><span>Used</span><span className="font-bold text-yellow-400">12 h</span></div>
                  <div className="flex justify-between mt-4 pt-4 border-t border-slate-600">
                    <span>Remaining</span><span className="font-bold text-green-400">30 h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'parts' && (
          <div className="main-grid">
            <div className="top-row stacked-col">
              {/* Job Order Progress (Bar Graph) */}
              <div className="section-card bar-graph-card">
                 <div className="section-header-compact">
                   <h3 className="section-title-small">Job Order Production Progress (Actual vs Estimated Hours)</h3>
                   <div className="legend">
                     <div className="legend-item"><span className="dot act"></span> Actual</div>
                     <div className="legend-item"><span className="dot est"></span> Estimated</div>
                   </div>
                 </div>
                 <div className="hour-bars-container">
                    {aggregatedHours.map(data => {
                      const color = deptColors[data.name] || 'var(--accent-red)';
                      return (
                        <div key={data.name} className="hour-bar-row">
                           <div className="bar-label">
                              <span className="dept-name">{data.name}</span>
                              <span className="hour-metrics">
                                <span className="act-val" style={{ color }}>{data.actual.toFixed(1)}h</span>
                                <span className="sep">/</span>
                                <span className="est-val">{data.estimated.toFixed(1)}h</span>
                              </span>
                           </div>
                           <div className="bar-track-wrapper">
                              <div className="bar-label-inner">
                                 {data.progress}% Complete
                              </div>
                              <div 
                                className="bar-track est" 
                                style={{ width: '100%', background: `${color}33`, borderColor: `${color}66` }} 
                              />
                              <div 
                                className="bar-track act" 
                                style={{ width: `${Math.min((data.actual / data.estimated) * 100, 100)}%`, background: color }} 
                              />
                           </div>
                        </div>
                      );
                    })}
                 </div>
              </div>
            </div>

            {/* Tool Department Progress Table */}
            <div className="tools-section-integrated">
              <div className="section-title">
                <h3>Tool Operations Progress ({orderDetail.tools.length} Items)</h3>
              </div>
              
              <div className="matrix-table-container" style={{ marginTop: '16px' }}>
                <table className="matrix-table" style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                  <thead>
                    <tr>
                      <th style={{ background: 'var(--accent-red-light)', position: 'sticky', left: 0, zIndex: 11, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>Tool ID & Component</th>
                      <th style={{ background: 'var(--accent-red-light)' }}>Machine Path</th>
                      <th style={{ background: 'var(--accent-red-light)' }}>CNC</th>
                      <th style={{ background: 'var(--accent-red-light)' }}>Milling</th>
                      <th style={{ background: 'var(--accent-red-light)' }}>Heat Treat</th>
                      <th style={{ background: 'var(--accent-red-light)' }}>Grinding</th>
                      <th style={{ background: 'var(--accent-red-light)' }}>Wiring</th>
                      <th style={{ background: 'var(--accent-red-light)' }}>EDM</th>
                      <th style={{ background: 'var(--accent-red-light)', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>Assembly</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetail.tools.map((tool: any, i: number) => {
                      const depts = ['cnc', 'milling', 'heat', 'grinding', 'wiring', 'edm', 'assembly'];
                      return (
                        <tr key={i} className="work-order-row">
                          <td style={{ fontWeight: 700, borderLeft: '1.5px solid #cbd5e1', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', minWidth: '220px' }}>
                            <Link href={designer ? designerToolHref(id, tool.id) : `/tools/${tool.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              <div className="tool-info-cell" style={{ cursor: 'pointer' }}>
                                <span style={{ color: 'var(--accent-red)', fontFamily: 'monospace', fontSize: '14px' }}>
                                  {tool.id}
                                </span>
                                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                                  {tool.name}
                                </span>
                              </div>
                            </Link>
                          </td>
                          <td>
                            <div className="path-badge">
                              {tool.processPath}
                            </div>
                          </td>
                          {depts.map((dept, dIdx) => {
                             const proc = tool.processes?.[dept] || { actual: 0, estimated: 0, status: 'N/A', machine: 'N/A' };
                             const progress = proc.estimated > 0 ? Math.round((proc.actual / proc.estimated) * 100) : 0;
                             
                             return (
                               <td key={dept} style={dIdx === depts.length - 1 ? { borderRight: '1.5px solid #cbd5e1', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' } : {}}>
                                 <div className="process-cell">
                                   {proc.estimated === 0 || proc.status === 'N/A' ? (
                                     <div className="na-status">N/A</div>
                                   ) : (
                                     <>
                                       <div className={`dept-status-indicator-small ${proc.status.toLowerCase().replace(' ', '-')}`}>
                                         {proc.status === 'Completed' && <CheckCircle size={10} className="icon-success" />}
                                         {proc.status === 'In Progress' && <Activity size={10} className="icon-running" />}
                                         {proc.status === 'Pending' && <Clock size={10} className="icon-pending" />}
                                         <span>{proc.status}</span>
                                       </div>
                                       <div className="micro-progress-container">
                                         <div className="micro-progress-bar" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                       </div>
                                       <div className="hours-stat">
                                         <span className="perc">{progress}%</span>
                                         <span className="vals">({proc.actual}h / {proc.estimated}h)</span>
                                       </div>
                                     </>
                                   )}
                                 </div>
                               </td>
                             );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Job Order Auditing Log (Placed below tool listing) */}
            <div className="section-card audit-card" style={{ marginTop: '24px', padding: '20px' }}>
              <h3 className="section-title-small" style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Job Order Auditing Log</h3>
              
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                {/* Log Table Header */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1.2fr 1.2fr 1.8fr 3.5fr', 
                  padding: '10px 16px', 
                  background: '#f8fafc', 
                  borderBottom: '1px solid var(--border-color)',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <div>Timestamp</div>
                  <div>Operator</div>
                  <div>Event Type</div>
                  <div>Details & Description</div>
                </div>

                {/* Scrollable Log Rows */}
                <div style={{ maxHeight: '320px', overflowY: 'auto' }} className="audit-list-scrollable">
                  {[...orderDetail.history].reverse().map((h: any, i: number) => (
                    <div key={i} style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1.2fr 1.2fr 1.8fr 3.5fr', 
                      padding: '12px 16px', 
                      borderBottom: i < orderDetail.history.length - 1 ? '1px solid #f1f5f9' : 'none',
                      alignItems: 'center',
                      fontSize: '12px',
                      transition: 'background 0.15s ease'
                    }} className="audit-list-item-hover">
                      {/* Column 1: Timestamp */}
                      <div style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {h.time}
                      </div>

                      {/* Column 2: Operator Badge & Position */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
                        <span style={{ 
                          background: '#f1f5f9', 
                          color: 'var(--text-primary)', 
                          padding: '3px 8px', 
                          borderRadius: '6px', 
                          fontWeight: 700, 
                          fontSize: '11px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <span style={{ 
                            width: '6px', 
                            height: '6px', 
                            borderRadius: '50%', 
                            background: h.type === 'system' ? '#3b82f6' : 
                                        h.type === 'check' ? '#10b981' : 
                                        h.type === 'activity' ? '#ef4444' : '#64748b' 
                          }} />
                          {h.user}
                        </span>
                        {h.role && h.role !== 'Automated' && (
                          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600, paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            {h.role}
                          </span>
                        )}
                      </div>

                      {/* Column 3: Event Type */}
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em', paddingRight: '12px' }}>
                        {h.action}
                      </div>

                      {/* Column 4: Description */}
                      <div style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {h.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity & Action Row */}
            <div className="bottom-row">
              <div className="action-cards">
                {[
                  { name: 'Deposits', icon: <FileText size={20} />, desc: 'Attach paper copy of assembly instructions.' },
                  { name: 'Publish', icon: <Share2 size={20} />, desc: 'Share this job order with external partners.' },
                  { name: 'Products', icon: <Package size={20} />, desc: 'Configure product packaging and shipping labels.' }
                ].map(action => (
                  <div key={action.name} className="action-card">
                    <div className="action-icon-box">
                      {action.icon}
                    </div>
                    <div>
                      <h4>{action.name}</h4>
                      <p>{action.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="status-history-group">
                <div className="current-status-card">
                  <div className="status-header-small">
                    <div className="status-dot-active" />
                    <h4>LIVE STATUS: IN PROCESS</h4>
                  </div>
                  <div className="timeline-simple">
                    <div className="timeline-item-active">
                      <div className="t-icon"><CheckCircle size={14} /></div>
                      <div className="t-content">
                        <p>Job Order Initialized</p>
                        <span>14.08.2024 10:00 am</span>
                      </div>
                    </div>
                    <div className="timeline-item-active">
                      <div className="t-icon"><Activity size={14} /></div>
                      <div className="t-content">
                        <p>Production Stage Started</p>
                        <span>14.08.2024 1:46 pm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'department' && (
          <div className="department-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Horizontal Department Summary Bar (Enhanced) */}
            <div className="dept-summary-row" style={{ gap: '20px', paddingBottom: '16px' }}>
              {[
                { id: 'cnc', name: 'CNC', icon: <Settings size={18} /> },
                { id: 'milling', name: 'Milling', icon: <Cpu size={18} /> },
                { id: 'heat', name: 'Heat Treat', icon: <TrendingUp size={18} /> },
                { id: 'grinding', name: 'Grinding', icon: <Activity size={18} /> },
                { id: 'wiring', name: 'Wiring', icon: <MapPin size={18} /> },
                { id: 'edm', name: 'EDM', icon: <Settings size={18} /> },
                { id: 'assembly', name: 'Assembly', icon: <Package size={18} /> }
              ].map(dept => {
                const deptJobs = orderDetail.tools.filter((j: any) => j.processes?.[dept.id] && j.processes[dept.id].status !== 'N/A');
                const totalActual = deptJobs.reduce((sum: number, j: any) => sum + (j.processes?.[dept.id]?.actual || 0), 0);
                const totalEstimated = deptJobs.reduce((sum: number, j: any) => sum + (j.processes?.[dept.id]?.estimated || 0), 0);
                const completedJobsCount = deptJobs.filter((j: any) => j.processes?.[dept.id]?.status === 'Completed').length;
                const progress = totalEstimated > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0;
                
                return (
                  <div key={dept.id} className="mini-dept-card bigger">
                    <div className="mini-icon-large">{dept.icon}</div>
                    <div className="mini-info-enhanced">
                       <span className="mini-label-large">{dept.name}</span>
                       <div className="mini-metrics-main">
                         <div className="hour-stat">
                           <span className="val">{totalActual}</span>
                           <span className="sep">/</span>
                           <span className="total">{totalEstimated}h</span>
                         </div>
                         <div className="mini-progress-micro">
                            <div className="mini-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                         </div>
                       </div>
                       <span className="mini-tools-count">{completedJobsCount} / {deptJobs.length} Done</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="department-view" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', alignItems: 'start' }}>
            {/* Department Summary Grouping */}
            {[
              { id: 'cnc', name: 'CNC Milling', icon: <Settings size={18} /> },
              { id: 'milling', name: 'Manual Milling', icon: <Cpu size={18} /> },
              { id: 'heat', name: 'Heat Treatment', icon: <TrendingUp size={18} /> },
              { id: 'grinding', name: 'Surface Grinding', icon: <Activity size={18} /> },
              { id: 'wiring', name: 'Wire EDM', icon: <MapPin size={18} /> },
              { id: 'edm', name: 'EDM Sinker', icon: <Settings size={18} /> },
              { id: 'assembly', name: 'Final Assembly', icon: <Package size={18} /> }
            ].map(dept => {
              const deptJobs = orderDetail.tools.filter((j: any) => j.processes?.[dept.id] && j.processes[dept.id].status !== 'N/A');
              if (deptJobs.length === 0) return null;

              return (
                <div key={dept.id} className="section-card dept-section">
                  <div className="dept-section-header">
                    <div className="dept-title-box">
                      <div className="dept-icon-circle">{dept.icon}</div>
                      <div className="dept-text">
                        <h4>{dept.name}</h4>
                        <span className="tool-count">{deptJobs.length} Tools in Queue</span>
                      </div>
                    </div>
                    <div className="dept-summary-stats">
                      <div className="summary-pill completed">
                        {deptJobs.filter((j: any) => j.processes[dept.id].status === 'Completed').length} DONE
                      </div>
                      <div className="summary-pill running">
                         {deptJobs.filter((j: any) => j.processes[dept.id].status === 'In Progress').length} RUNNING
                      </div>
                    </div>
                  </div>

                  <div className="matrix-table-container" style={{ marginTop: '20px' }}>
                    <table className="matrix-table" style={{ borderCollapse: 'separate', borderSpacing: '0 4px', width: '100%', tableLayout: 'fixed' }}>
                      <thead>
                        <tr>
                          <th style={{ background: '#f8fafc', color: 'var(--text-tertiary)', fontSize: '10px', padding: '10px 12px', width: '100px' }}>JOB ID</th>
                          <th style={{ background: '#f8fafc', color: 'var(--text-tertiary)', fontSize: '10px', padding: '10px 12px', width: '80px' }}>MACHINE</th>
                          <th style={{ background: '#f8fafc', color: 'var(--text-tertiary)', fontSize: '10px', padding: '10px 12px' }}>COMPONENT</th>
                          <th style={{ background: '#f8fafc', color: 'var(--text-tertiary)', fontSize: '10px', padding: '10px 12px', width: '100px' }}>STATUS</th>
                          <th style={{ background: '#f8fafc', color: 'var(--text-tertiary)', fontSize: '10px', padding: '10px 12px', width: '150px' }}>PROGRESS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deptJobs.map((tool: any, jIdx: number) => {
                          const proc = tool.processes?.[dept.id] || { actual: 0, estimated: 0, status: 'N/A', machine: 'N/A' };
                          const progress = proc.estimated > 0 ? Math.round((proc.actual / proc.estimated) * 100) : 0;
                          
                          return (
                            <tr key={jIdx} className="dept-row">
                              <td style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-red)', fontSize: '12px', padding: '8px 12px', whiteSpace: 'nowrap' }}>
                                <Link href={designer ? designerToolHref(id, tool.id) : `/tools/${tool.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                  {tool.id}
                                </Link>
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <div className="machine-badge" style={{ fontSize: '10px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                                  {proc.machine}
                                </div>
                              </td>
                              <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '11px', padding: '8px 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {tool.name}
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <div className={`dept-status-indicator-small ${proc.status.toLowerCase().replace(' ', '-')}`} style={{ fontSize: '9px', padding: '2px 6px', border: '1px solid currentColor', borderRadius: '4px' }}>
                                  <span>{proc.status}</span>
                                </div>
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                 <div className="micro-progress-container" style={{ marginBottom: '4px', height: '3px' }}>
                                   <div className="micro-progress-bar" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                 </div>
                                 <div className="hours-stat" style={{ fontSize: '9px' }}>
                                   <span className="perc">{progress}%</span>
                                   <span className="vals">({proc.actual} / {proc.estimated}h)</span>
                                 </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}

        {activeTab === 'machines' && (
          <div className="machines-view-container">
            <div className="matrix-header-info" style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 600 }}>
                <Cpu size={20} className="icon-running" />
                <span>Factory Floor Machine Distribution</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Horizontal overview of component tools currently assigned to specific machines.
              </p>
            </div>

            <div className="machines-matrix-grid-container" style={{ width: '100%', paddingBottom: '16px' }}>
              <div className="machines-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '20px',
                width: '100%'
              }}>
                {(() => {
                  // Collect unique machines
                  const machineMap: Record<string, any[]> = {};
                  orderDetail.tools.forEach((tool: any) => {
                    if (tool.processes) {
                      Object.entries(tool.processes).forEach(([deptKey, proc]: [string, any]) => {
                        if (proc.machine && proc.machine !== 'N/A' && proc.status !== 'N/A') {
                          if (!machineMap[proc.machine]) machineMap[proc.machine] = [];
                          machineMap[proc.machine].push({
                            ...tool,
                            currentProcess: deptKey,
                            processInfo: proc
                          });
                        }
                      });
                    }
                  });

                  // Sort machines naturally
                  const machines = Object.keys(machineMap).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

                  if (machines.length === 0) {
                    return (
                      <div className="empty-state" style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-tertiary)' }}>
                        <Info size={32} style={{ margin: '0 auto 12px' }} />
                        <p>No machines currently assigned to tools in this Job Order.</p>
                      </div>
                    );
                  }

                  return machines.map(machineId => (
                    <div key={machineId} className="machine-column" style={{ display: 'flex', flexDirection: 'column' }}>
                      <div className="machine-header-card" style={{ 
                        background: 'white', 
                        padding: '12px', 
                        borderRadius: '12px 12px 0 0', 
                        border: '1px solid var(--border-color)',
                        borderBottom: '2px solid var(--accent-red)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Machine ID</span>
                          <div className="status-dot-active" style={{ width: '6px', height: '6px' }} />
                        </div>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{machineId}</span>
                      </div>
                      
                      <div className="machine-tools-list" style={{ 
                        background: '#f8fafc', 
                        padding: '12px', 
                        borderRadius: '0 0 12px 12px', 
                        border: '1px solid var(--border-color)',
                        borderTop: 'none',
                        minHeight: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        {machineMap[machineId].map((jobInfo, idx) => {
                          const proc = jobInfo.processInfo;
                          const progress = proc.estimated > 0 ? Math.round((proc.actual / proc.estimated) * 100) : 0;
                          
                          return (
                            <div key={`${machineId}-${jobInfo.id}-${idx}`} className="machine-tool-card" style={{ 
                              background: 'white', 
                              padding: '12px', 
                              borderRadius: '8px', 
                              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                              border: '1px solid var(--border-color)'
                            }}>
                               <Link href={designer ? designerToolHref(id, jobInfo.id) : `/tools/${jobInfo.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px', cursor: 'pointer' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-red)', fontFamily: 'monospace' }}>{jobInfo.id}</span>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{jobInfo.name}</span>
                                  </div>
                                  <div className={`dept-status-indicator-small ${proc.status.toLowerCase().replace(' ', '-')}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                                    {proc.status}
                                  </div>
                                </div>
                              </Link>

                              <div style={{ marginBottom: '8px' }}>
                                <div className="micro-progress-container" style={{ height: '4px', marginBottom: '4px' }}>
                                  <div className="micro-progress-bar" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-tertiary)' }}>
                                  <span>{progress}% Efficiency</span>
                                  <span>{proc.actual}/{proc.estimated}h</span>
                                </div>
                              </div>

                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px', 
                                fontSize: '10px', 
                                color: 'var(--text-secondary)',
                                paddingTop: '8px',
                                borderTop: '1px dashed var(--border-color)'
                              }}>
                                <Settings size={10} />
                                <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{jobInfo.currentProcess}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'purchase' && (
          <div className="purchase-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
            
            {/* KPI Summary Cards */}
            {(() => {
              const purchases = orderDetail.purchases || [];
              const totalItems = purchases.length;
              const pendingPurchases = purchases.filter((p: any) => p.status === 'Purchase Pending' || p.status === 'Awaiting Approval').length;
              const inTransit = purchases.filter((p: any) => p.status === 'In Transit').length;
              const arrived = purchases.filter((p: any) => p.status === 'Arrived').length;
              const totalCost = purchases.reduce((sum: number, p: any) => sum + (p.totalCost || 0), 0);

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div className="kpi-card" style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Total Items</span>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0 0 0' }}>{totalItems}</h2>
                  </div>
                  <div className="kpi-card" style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Pending Requisitions</span>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-red)', margin: '8px 0 0 0' }}>{pendingPurchases}</h2>
                  </div>
                  <div className="kpi-card" style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>In Transit</span>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b', margin: '8px 0 0 0' }}>{inTransit}</h2>
                  </div>
                  <div className="kpi-card" style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Arrived</span>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', margin: '8px 0 0 0' }}>{arrived}</h2>
                  </div>
                  <div className="kpi-card" style={{ background: 'var(--text-primary)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Total Procurement Cost</span>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', margin: '8px 0 0 0' }}>RM {totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                  </div>
                </div>
              );
            })()}

            {/* Quick Actions Toolbar */}
            <div className="actions-toolbar" style={{ display: 'flex', gap: '12px', background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions:</span>
              <button className="toolbar-btn-primary"><Plus size={14} /> Add Material</button>
              <button className="toolbar-btn"><FileText size={14} /> Generate PO</button>
              <button className="toolbar-btn"><Upload size={14} /> Import BOM</button>
              <button className="toolbar-btn"><Download size={14} /> Export List</button>
              <button className="toolbar-btn"><FilePlus size={14} /> Upload Invoice</button>
              <button className="toolbar-btn" style={{ marginLeft: 'auto' }}><Users size={14} /> Manage Quotes</button>
            </div>

            {/* Procurement Risk Alerts */}
            {(() => {
              const riskItems = (orderDetail.purchases || []).filter((p: any) => p.risk === 'Critical Delay' || p.risk === 'At Risk');
              if (riskItems.length === 0) return null;

              return (
                <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 700, fontSize: '13px' }}>
                    <AlertCircle size={16} />
                    <span>Procurement Risk Advisory ({riskItems.length} Materials At Risk)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px', marginTop: '4px' }}>
                    {riskItems.map((item: any) => (
                      <div key={item.id} style={{ background: '#ffffff', border: '1px solid #f3f4f6', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>{item.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                            Required Date: <span style={{ fontWeight: 600 }}>14.08.2024</span> | ETA: <span style={{ fontWeight: 600 }}>{item.eta}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {item.blocking && <span style={{ background: '#fee2e2', color: '#ef4444', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Blocking Production</span>}
                          <span style={{ 
                            background: item.risk === 'Critical Delay' ? '#fee2e2' : '#fff9db', 
                            color: item.risk === 'Critical Delay' ? '#ef4444' : '#f59e0b', 
                            fontSize: '9px', 
                            fontWeight: 800, 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            textTransform: 'uppercase' 
                          }}>{item.risk}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Main Procurement Table Card */}
            <div className="section-card purchase-section" style={{ margin: 0, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Procurement Ledger</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Click on a material row to view comprehensive details, PO timeline tracking, and production impact analysis.</p>
                </div>
              </div>

              <div className="matrix-table-container" style={{ marginTop: '16px', overflowX: 'auto' }}>
                <table className="matrix-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '12px 16px', width: '220px' }}>Item Name</th>
                      <th style={{ padding: '12px 16px', width: '160px' }}>Specification</th>
                      <th style={{ padding: '12px 16px', width: '100px' }}>Required Qty</th>
                      <th style={{ padding: '12px 16px', width: '180px' }}>Supplier</th>
                      <th style={{ padding: '12px 16px', width: '110px' }}>ETA</th>
                      <th style={{ padding: '12px 16px', width: '100px' }}>Total Cost</th>
                      <th style={{ padding: '12px 16px', width: '140px' }}>Status</th>
                      <th style={{ padding: '12px 16px', width: '110px' }}>Risk Level</th>
                      <th style={{ padding: '12px 16px', width: '110px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(orderDetail.purchases || []).map((item: any, pIdx: number) => {
                      const isSelected = selectedPurchase && selectedPurchase.id === item.id;
                      return (
                        <tr 
                          key={pIdx} 
                          className="purchase-row" 
                          style={{ 
                            cursor: 'pointer', 
                            background: isSelected ? '#f1f5f9' : '#ffffff', 
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background 0.2s ease'
                          }}
                          onClick={() => setSelectedPurchase(item)}
                        >
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>{item.name}</span>
                              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'monospace', marginTop: '2px' }}>{item.id}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{item.specs}</td>
                          <td style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {item.qty} <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 500 }}>{item.unit}</span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {item.final ? (
                                <>
                                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.final}</span>
                                  {item.suggested && item.suggested !== item.final && <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>{item.suggested}</span>}
                                </>
                              ) : (
                                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Suggested: {item.suggested || 'None'}</span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.eta || item.date || 'N/A'}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                ${item.totalCost !== undefined ? item.totalCost : (item.unitCost ? item.unitCost * (item.qty || 1) : 0)}
                              </span>
                              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                                ${item.unitCost !== undefined ? item.unitCost : 0}/{(item.unit ? (item.unit.endsWith('s') ? item.unit.slice(0, -1) : item.unit) : 'pc')}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span className={`status-select-styled ${item.status.toLowerCase().replace(' ', '-')}`} style={{ 
                              padding: '4px 8px', 
                              borderRadius: '6px', 
                              fontSize: '10px', 
                              fontWeight: 800, 
                              display: 'inline-block',
                              textAlign: 'center',
                              textTransform: 'uppercase'
                            }}>
                              {item.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ 
                              background: item.risk === 'On Schedule' ? '#e6fcf5' : item.risk === 'At Risk' ? '#fff9db' : '#fee2e2', 
                              color: item.risk === 'On Schedule' ? '#0ca678' : item.risk === 'At Risk' ? '#f59e0b' : '#ef4444', 
                              padding: '4px 8px', 
                              borderRadius: '6px', 
                              fontSize: '10px', 
                              fontWeight: 800, 
                              display: 'inline-block',
                              textAlign: 'center',
                              textTransform: 'uppercase'
                            }}>
                              {item.risk}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button className="p-action-btn" title="View Details" onClick={() => setSelectedPurchase(item)}><Eye size={13} /></button>
                              <button className="p-action-btn" title="Generate PO"><FileText size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Side Panel */}
            {selectedPurchase && (
              <div className="procurement-side-drawer" style={{ 
                position: 'fixed', 
                top: 0, 
                right: 0, 
                bottom: 0, 
                width: '420px', 
                background: '#ffffff', 
                boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', 
                zIndex: 1000, 
                display: 'flex', 
                flexDirection: 'column',
                animation: 'slideIn 0.3s ease-out',
                borderLeft: '1px solid var(--border-color)'
              }}>
                {/* Drawer Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Material Details</span>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>{selectedPurchase.name}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedPurchase(null)} 
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', borderRadius: '50%' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Drawer Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Production Alert */}
                  {selectedPurchase.blocking && (
                    <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'start' }}>
                      <AlertTriangle size={16} style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>Production Blocked</div>
                        <p style={{ fontSize: '11px', color: '#ef4444', margin: '2px 0 0 0', lineHeight: '1.4' }}>This item is actively blocking the next manufacturing phase. Expedite shipping immediately.</p>
                      </div>
                    </div>
                  )}

                  {/* Material Specs */}
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px', marginBottom: '10px' }}>Specifications</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Material ID</span>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{selectedPurchase.id}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Dimensions</span>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedPurchase.specs}</div>
                      </div>
                    </div>
                  </div>

                  {/* Quantity ledger */}
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px', marginBottom: '10px' }}>Quantities</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                      <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>Req'd</span>
                        <div style={{ fontSize: '13px', fontWeight: 800 }}>{selectedPurchase.qty}</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>Ordered</span>
                        <div style={{ fontSize: '13px', fontWeight: 800 }}>{selectedPurchase.status === 'Draft' || selectedPurchase.status === 'Purchase Pending' ? 0 : selectedPurchase.qty}</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>Received</span>
                        <div style={{ fontSize: '13px', fontWeight: 800 }}>{selectedPurchase.status === 'Arrived' ? selectedPurchase.qty : 0}</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>Rem'g</span>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: selectedPurchase.status === 'Arrived' ? 'inherit' : 'var(--accent-red)' }}>{selectedPurchase.status === 'Arrived' ? 0 : selectedPurchase.qty}</div>
                      </div>
                    </div>
                  </div>

                  {/* Purchase details */}
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px', marginBottom: '10px' }}>Procurement & Cost</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>PR Number</span>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedPurchase.prNum}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>PO Number</span>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedPurchase.poNum}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Suggested Supplier</span>
                        <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{selectedPurchase.suggested || 'N/A'}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Approved Supplier</span>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedPurchase.final || 'N/A'}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Unit Cost</span>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>RM {selectedPurchase.unitCost}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Total Cost</span>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '13px' }}>RM {selectedPurchase.totalCost}</div>
                      </div>
                    </div>
                  </div>

                  {/* Tracking dates */}
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px', marginBottom: '10px' }}>Tracking Timeline Dates</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Request Date</span>
                        <div style={{ fontWeight: 700 }}>{selectedPurchase.requestDate}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Order Date</span>
                        <div style={{ fontWeight: 700 }}>{selectedPurchase.orderDate}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Expected Arrival (ETA)</span>
                        <div style={{ fontWeight: 700, color: '#f59e0b' }}>{selectedPurchase.eta}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Actual Arrival</span>
                        <div style={{ fontWeight: 700, color: '#10b981' }}>{selectedPurchase.actualArrivalDate}</div>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Supplier Lead Time</span>
                        <div style={{ fontWeight: 700 }}>{selectedPurchase.leadTime}</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Timeline Stepper */}
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px', marginBottom: '14px' }}>Procurement Timeline</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingLeft: '8px', position: 'relative' }}>
                      {(() => {
                        const status = selectedPurchase.status;
                        
                        // Define steps
                        const steps = [
                          { label: 'Material Requested', active: true, desc: `Requested on ${selectedPurchase.requestDate}` },
                          { label: 'Approved', active: status !== 'Draft' && status !== 'Purchase Pending', desc: status === 'Draft' || status === 'Purchase Pending' ? 'Pending Approval' : 'Approved' },
                          { label: 'Purchase Order Created', active: status !== 'Draft' && status !== 'Purchase Pending' && status !== 'Awaiting Approval', desc: selectedPurchase.poNum !== '-' ? `PO Number: ${selectedPurchase.poNum}` : 'PO Pending' },
                          { label: 'Supplier Confirmed', active: status !== 'Draft' && status !== 'Purchase Pending' && status !== 'Awaiting Approval', desc: status === 'Ordered' || status === 'In Transit' || status === 'Arrived' ? 'Confirmed by supplier' : 'Awaiting confirmation' },
                          { label: 'Shipped', active: status === 'In Transit' || status === 'Arrived', desc: status === 'In Transit' ? 'Package in transit' : status === 'Arrived' ? 'Delivered' : 'Awaiting dispatch' },
                          { label: 'Received', active: status === 'Arrived', desc: status === 'Arrived' ? `Arrived on ${selectedPurchase.actualArrivalDate}` : 'Pending delivery' }
                        ];

                        return steps.map((step, sIdx) => (
                          <div key={sIdx} style={{ display: 'flex', gap: '12px', alignItems: 'start', position: 'relative' }}>
                            {/* Line */}
                            {sIdx < steps.length - 1 && (
                              <div style={{ 
                                position: 'absolute', 
                                left: '8px', 
                                top: '18px', 
                                bottom: '-12px', 
                                width: '2px', 
                                background: step.active && steps[sIdx+1].active ? '#10b981' : '#e5e7eb' 
                              }} />
                            )}
                            {/* Dot */}
                            <div style={{ 
                              width: '18px', 
                              height: '18px', 
                              borderRadius: '50%', 
                              background: step.active ? '#10b981' : '#ffffff', 
                              border: step.active ? '2px solid #10b981' : '2px solid #cbd5e1', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              zIndex: 1, 
                              flexShrink: 0,
                              marginTop: '2px'
                            }}>
                              {step.active && <Check size={10} style={{ color: 'white' }} />}
                            </div>
                            {/* Content */}
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: step.active ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{step.label}</div>
                              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{step.desc}</div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                {/* Drawer Actions */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px', background: '#f8fafc' }}>
                  <button className="valuation-btn" style={{ flex: 1, height: '36px' }}><Plus size={14} style={{ marginRight: '6px' }} /> Update Status</button>
                  <button className="valuation-btn" style={{ flex: 1, height: '36px', background: 'white', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}><Printer size={14} style={{ marginRight: '6px' }} /> Print Details</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'expenditure' && (
          <div className="expenditure-view">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3>Cost Estimation & Expenditure</h3>
              <button className="valuation-btn" style={{ padding: '8px 16px', fontSize: '12px' }}>EXPORT REPORT <Printer size={14} style={{marginLeft: '8px'}}/></button>
            </div>
            
            <div className="exp-grid-top">
              <div className="exp-card highlight">
                <span>Total PO Value</span>
                <h2>{orderDetail.price}</h2>
              </div>
              <div className="exp-card">
                <span>Estimated Material Cost</span>
                <h2>RM 450.00</h2>
              </div>
              <div className="exp-card">
                <span>Estimated Labor Cost</span>
                <h2>RM 400.00</h2>
              </div>
              <div className="exp-card success">
                <span>Estimated Margin</span>
                <h2>RM 417.00 <span>(32.8%)</span></h2>
              </div>
            </div>

            <div className="exp-breakdown">
              <div className="exp-section-card">
                <h4>Material Breakdown</h4>
                <table className="exp-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Unit Cost</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>DC53 Tool Steel 400x500x20</td>
                      <td>1</td>
                      <td>RM 350.00</td>
                      <td>RM 350.00</td>
                    </tr>
                    <tr>
                      <td>M3 Bolts (Box)</td>
                      <td>2</td>
                      <td>RM 25.00</td>
                      <td>RM 50.00</td>
                    </tr>
                    <tr>
                      <td>Copper Wire Spool</td>
                      <td>1</td>
                      <td>RM 50.00</td>
                      <td>RM 50.00</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{textAlign: 'right', fontWeight: 'bold'}}>Subtotal:</td>
                      <td style={{fontWeight: 'bold'}}>RM 450.00</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="exp-section-card">
                <h4>Labor & Machine Time Breakdown</h4>
                <table className="exp-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Hours (Est)</th>
                      <th>Rate/Hr</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>CNC Milling</td>
                      <td>8 hrs</td>
                      <td>RM 20.00</td>
                      <td>RM 160.00</td>
                    </tr>
                    <tr>
                      <td>EDM Wirecut</td>
                      <td>10 hrs</td>
                      <td>RM 15.00</td>
                      <td>RM 150.00</td>
                    </tr>
                    <tr>
                      <td>Grinding</td>
                      <td>3 hrs</td>
                      <td>RM 15.00</td>
                      <td>RM 45.00</td>
                    </tr>
                    <tr>
                      <td>QC Inspection</td>
                      <td>3 hrs</td>
                      <td>RM 15.00</td>
                      <td>RM 45.00</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{textAlign: 'right', fontWeight: 'bold'}}>Subtotal:</td>
                      <td style={{fontWeight: 'bold'}}>RM 400.00</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <QrDisplayModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} jobId={orderDetail.id} />

      <style jsx>{`
        .detail-page {
          height: 100%;
          overflow-y: auto;
          background: #f8fafc;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .detail-page::-webkit-scrollbar {
          width: 6px;
        }
        .detail-page::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .detail-header {
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

        /* Excel Gantt CSS */
        .excel-gantt-wrapper { display: flex; border-top: 1px solid var(--border-color); background: white; width: 100%;}
        .excel-gantt-left { width: 140px; border-right: 1px solid var(--border-color); background: #f8fafc; flex-shrink: 0; z-index: 2; box-shadow: 2px 0 5px rgba(0,0,0,0.05); }
        .excel-cell { height: 48px; display: flex; align-items: center; padding: 0 16px; border-bottom: 1px solid var(--border-color); font-size: 13px; font-weight: 600; color: var(--text-secondary); }
        .excel-cell.header-cell { height: 40px; background: #f1f5f9; color: var(--text-tertiary); text-transform: uppercase; font-size: 10px; border-bottom: 1px solid var(--border-color); }
        .excel-cell.row-label { background: white; color: var(--text-primary); }
        .excel-cell:last-child { border-bottom: none; }
        
        .excel-gantt-scroll { flex: 1; overflow-x: auto; background: white; }
        .excel-gantt-scroll::-webkit-scrollbar { height: 6px; }
        .excel-gantt-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        
        .excel-gantt-grid { width: 2400px; display: flex; flex-direction: column; }
        .excel-header-row { display: flex; height: 40px; background: #f8fafc; border-bottom: 1px solid var(--border-color); }
        .excel-col-header { flex: 1; display: flex; align-items: center; justify-content: center; border-right: 1px solid #e2e8f0; font-size: 11px; font-weight: 600; color: var(--text-tertiary); }
        
        .excel-rows-container { position: relative; display: flex; flex-direction: column; }
        .excel-bg-grid { position: absolute; inset: 0; display: flex; pointer-events: none; z-index: 0; }
        .excel-bg-col { flex: 1; border-right: 1px dashed #e2e8f0; }
        
        .excel-row { height: 48px; position: relative; border-bottom: 1px solid var(--border-color); z-index: 1; }
        .excel-row:last-child { border-bottom: none; }
        
        .gantt-bar { position: absolute; border-radius: 6px; padding: 0 8px; display: flex; align-items: center; font-size: 11px; font-weight: 600; white-space: nowrap; overflow: hidden; }
        .gantt-bar.est { top: 6px; height: 16px; border: 1px dashed rgba(0,0,0,0.1); }
        .gantt-bar.act { top: 26px; height: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); color: white; }
        
        /* Audit Log */
        .audit-list-scrollable::-webkit-scrollbar {
          width: 6px;
        }
        .audit-list-scrollable::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .audit-list-scrollable::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .audit-list-scrollable::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .audit-list-item-hover:hover {
          background: #f8fafc;
        }
 
        .mini-dept-card.bigger {
          flex: 0 0 calc(14.28% - 18px);
          min-width: 140px;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .mini-dept-card.bigger:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.04);
          border-color: var(--accent-red-light);
        }
        .mini-icon-large {
          width: 28px;
          height: 28px;
          background: var(--accent-red-light);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-red);
          margin-bottom: 2px;
        }
        .mini-icon-large svg { width: 14px; height: 14px; }
        
        .mini-label-large {
          font-size: 10px;
          color: var(--text-tertiary);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          line-height: 1;
        }
        .mini-metrics-main {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .mini-metrics-main .hour-stat {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .mini-metrics-main .val { font-size: 17px; font-weight: 800; color: var(--text-primary); line-height: 1; }
        .mini-metrics-main .sep { font-size: 12px; color: var(--text-tertiary); font-weight: 400; }
        .mini-metrics-main .total { font-size: 12px; font-weight: 600; color: var(--text-secondary); }
        
        .mini-progress-micro {
          width: 100%;
          height: 3px;
          background: #f1f5f9;
          border-radius: 2px;
          overflow: hidden;
        }
        .mini-progress-fill {
          height: 100%;
          background: var(--accent-red);
          border-radius: 2px;
        }
        .mini-tools-count {
          font-size: 10px;
          color: var(--text-tertiary);
          font-weight: 600;
          line-height: 1;
        }

        .purchase-section {
          padding: 24px;
        }
        .purchase-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .purchase-item-cell { display: flex; flex-direction: column; gap: 4px; }
        .purchase-item-cell .p-name { font-weight: 700; color: var(--text-primary); font-size: 13px; }
        .purchase-item-cell .p-specs { font-size: 11px; color: var(--text-tertiary); font-family: monospace; }
        
        .suggested-val { 
          font-size: 12px; 
          color: var(--text-secondary); 
          font-weight: 600;
          background: #f8fafc;
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px dashed #e2e8f0;
        }

        .supplier-input {
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
          background: transparent;
          transition: all 0.2s ease;
        }
        .supplier-input:focus {
          outline: none;
          border-color: var(--accent-red);
          background: white;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.05);
        }

        .status-select-styled {
          width: 100%;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          border: 1px solid transparent;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 12px;
        }
        
        .status-select-styled.purchase-pending { background-color: #f1f5f9; color: #64748b; border-color: #e2e8f0; }
        .status-select-styled.ordered { background-color: #eff6ff; color: #1d4ed8; border-color: #dbeafe; }
        .status-select-styled.in-transit { background-color: #fff7ed; color: #c2410c; border-color: #ffedd5; }
        .status-select-styled.arrived { background-color: #f0fdf4; color: #15803d; border-color: #dcfce7; }

        .p-action-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background: white;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .p-action-btn:hover {
          background: #fff5f5;
          color: var(--accent-red);
          border-color: var(--accent-red);
        }

        .purchase-row td { padding: 16px 12px !important; }
        .purchase-row:hover { background: #fafafa; }

        .department-view-container h3, .purchase-view-container h3 { margin: 0; color: var(--text-primary); }
        .dept-section {
          padding: 16px 20px;
          background: white;
          border-radius: 20px;
          border: 1px solid var(--border-color);
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          width: 100%;
        }
        
        @media (max-width: 1400px) {
          .department-view { grid-template-columns: 1fr !important; }
        }
        .dept-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .dept-title-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .dept-icon-circle {
          width: 36px;
          height: 36px;
          background: var(--bg-secondary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-red);
          border: 1px solid var(--border-color);
        }
        .dept-text h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .tool-count {
          font-size: 11px;
          color: var(--text-tertiary);
          font-weight: 600;
          text-transform: uppercase;
        }
        .dept-summary-stats {
          display: flex;
          gap: 12px;
        }
        .summary-pill {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .summary-pill.completed { background: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }
        .summary-pill.running { background: #eff6ff; color: #1d4ed8; border: 1px solid #dbeafe; }

        .dept-row {
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dept-row:hover {
          background: #fbfbfb;
        }
        .dept-row td {
          border-top: 1px solid #f1f5f9;
        }
        
        .purchase-list { display: flex; flex-direction: column; gap: 12px; }
        .purchase-item { background: white; padding: 16px; border-radius: 12px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
        .p-icon { color: var(--text-tertiary); }
        .p-details h4 { margin: 0; font-weight: 600; font-size: 14px; }
        .p-details span { font-size: 12px; color: var(--text-tertiary); }
        .p-status-select { margin-left: auto; padding: 6px 12px; border: 1px solid var(--border-color); border-radius: 6px; background: #f8fafc; font-weight: 500; outline: none; cursor: pointer; }

        .expenditure-view h3 { margin: 0; color: var(--text-primary); }
        .exp-grid-top { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; margin-bottom: 32px; }
        .exp-card { background: white; padding: 24px; border-radius: 16px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px;}
        .exp-card span { font-size: 12px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; }
        .exp-card h2 { font-size: 28px; margin: 0; color: var(--text-primary); }
        .exp-card h2 span { font-size: 16px; color: var(--success-green); font-weight: 600; }
        .exp-card.highlight { background: #1e293b; border-color: #1e293b; }
        .exp-card.highlight span { color: #94a3b8; }
        .exp-card.highlight h2 { color: white; }
        .exp-card.success h2 { color: var(--success-green); }
        .exp-breakdown { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 32px; }
        .exp-section-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); padding: 24px; }
        .exp-section-card h4 { margin-top: 0; margin-bottom: 20px; font-size: 16px; color: var(--text-primary); }
        .exp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .exp-table th { text-align: left; padding: 12px 8px; color: var(--text-tertiary); border-bottom: 2px solid var(--border-color); font-weight: 600; }
        .exp-table td { padding: 12px 8px; border-bottom: 1px solid #f1f5f9; color: var(--text-secondary); }
        .exp-table tfoot td { border-bottom: none; border-top: 2px solid var(--border-color); color: var(--text-primary); }

        .back-btn {
          width: 40px; h-height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%;
          border: 1px solid var(--border-color); color: var(--text-secondary); transition: all 0.2s ease;
        }
        .header-left { display: flex; align-items: center; gap: 24px; }
        .header-info { display: flex; align-items: center; gap: 16px; }
        .customer-avatar {
          width: 48px; height: 48px; background: var(--accent-red); color: white; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px;
        }

        /* Integrated Tool Progress Table */
        .tools-section-integrated {
          margin-top: 32px;
          margin-bottom: 32px;
        }
        .matrix-table-container {
          width: 100%;
          overflow-x: auto;
        }
        /* Override/Enhance matrix table for detail view */
        .matrix-table th {
          padding: 12px 16px;
          font-size: 11px;
          font-weight: 700;
          color: var(--accent-red);
          text-transform: uppercase;
          border-right: 1px solid rgba(239, 68, 68, 0.15);
          text-align: left;
        }
        .matrix-table th:last-child {
          border-right: none;
        }
        .matrix-table td {
          vertical-align: middle;
          padding: 16px;
          border-top: 1.5px solid #cbd5e1;
          border-bottom: 1.5px solid #cbd5e1;
          border-right: 1.5px solid #e2e8f0;
        }
        .matrix-table tr:hover td {
          background: #fbfbfb;
          border-top-color: var(--accent-red);
          border-bottom-color: var(--accent-red);
        }
        .tool-info-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .dept-status-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          width: fit-content;
        }
        .dept-status-indicator.passed {
          background: #f0fdf4;
          color: #15803d;
        }
        .dept-status-indicator.running {
          background: #eff6ff;
          color: #1d4ed8;
        }
        .dept-status-indicator.pending {
          background: #f8fafc;
          color: #64748b;
        }

        /* Machine Path Badge */
        .path-badge {
          display: inline-block;
          padding: 4px 10px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-family: monospace;
          font-size: 11px;
          font-weight: 700;
          color: #111827;
          box-shadow: inset 0 1px 0 rgba(255,255,255,1);
          text-transform: uppercase;
        }

        /* Process Cell High Density */
        .process-cell {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 120px;
        }
        .dept-status-indicator-small {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .dept-status-indicator-small.completed { color: #15803d; }
        .dept-status-indicator-small.in-progress { color: #1d4ed8; }
        .dept-status-indicator-small.pending { color: #64748b; }

        .micro-progress-container {
          width: 100%;
          height: 3px;
          background: #f1f5f9;
          border-radius: 2px;
          overflow: hidden;
        }
        .micro-progress-bar {
          height: 100%;
          background: var(--accent-red);
          border-radius: 2px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hours-stat {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 10px;
          font-weight: 600;
        }
        .hours-stat .perc {
          color: var(--text-primary);
        }
        .hours-stat .vals {
          color: var(--text-tertiary);
          font-size: 9px;
        }

        .na-status {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          background: #f8fafc;
          padding: 8px 12px;
          border-radius: 6px;
          text-align: center;
          width: fit-content;
        }

        .icon-success { color: #22c55e; }
        .icon-running { color: #3b82f6; animation: spin 4s linear infinite; }
        .icon-pending { color: #94a3b8; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .audit-item.type-system .audit-dot { color: var(--accent-blue); background: var(--accent-blue-light); border-color: var(--accent-blue); }
        .audit-item.type-import .audit-dot { color: var(--accent-purple); background: #f3e8ff; border-color: #d8b4fe; }
        .audit-item.type-check .audit-dot { color: var(--accent-green); background: var(--accent-green-light); border-color: var(--accent-green); }
        .audit-item.type-process .audit-dot { color: #f59e0b; background: #fef3c7; border-color: #fcd34d; }
        .audit-item.type-activity .audit-dot { color: var(--accent-red); background: var(--accent-red-light); border-color: var(--accent-red); }
        .audit-item.type-shipping .audit-dot { color: #ec4899; background: #fce7f3; border-color: #fbcfe8; }
        .audit-item.type-status .audit-dot { color: var(--accent-blue); background: var(--accent-blue-light); border-color: var(--accent-blue); }

        .audit-content {
          padding-bottom: 24px;
          flex: 1;
        }
        .audit-main {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .audit-action {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .audit-meta {
          display: flex;
          gap: 12px;
          font-size: 11px;
          color: var(--text-tertiary);
        }
        .audit-user, .audit-time {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        @media (max-width: 1200px) {
          .bottom-row { grid-template-columns: 1fr; }
        }

        /* High-Density Bar Graph (Tool Details Style) */
        .bar-graph-card { padding: 20px !important; border-radius: 16px; }
        .section-header-compact { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .section-header-compact h3 { margin: 0; font-size: 14px; color: var(--text-primary); font-weight: 800; letter-spacing: -0.01em; text-transform: uppercase; }
        .legend { display: flex; gap: 12px; }
        .legend-item { display: flex; align-items: center; gap: 4px; font-size: 9px; font-weight: 800; color: var(--text-tertiary); text-transform: uppercase; }
        .legend-item .dot { width: 6px; height: 6px; border-radius: 50%; }
        .legend-item .dot.act { background: var(--accent-red); box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1); }
        .legend-item .dot.est { background: #e2e8f0; border: 1px dashed var(--accent-red); }

        .hour-bars-container { display: flex; flex-direction: column; gap: 16px; }
        .hour-bar-row { display: flex; flex-direction: column; gap: 8px; }
        .bar-label { display: flex; justify-content: space-between; align-items: flex-end; }
        .dept-name { font-size: 11px; font-weight: 800; color: var(--text-primary); letter-spacing: 0.05em; }
        .hour-metrics { font-size: 11px; font-weight: 700; display: flex; gap: 4px; align-items: center; }
        .hour-metrics .act-val { color: var(--accent-red); }
        .hour-metrics .sep { color: #cbd5e1; font-weight: 400; }
        .hour-metrics .est-val { color: var(--text-tertiary); }
        
        .bar-track-wrapper { position: relative; height: 14px; background: #f8fafc; border-radius: 4px; overflow: hidden; border: 1px solid var(--border-color); }
        .bar-track.est { 
          position: absolute; inset: 0; 
          border: 1px dashed rgba(0,0,0,0.1);
        }
        .bar-track.act { 
          position: absolute; top: 0; left: 0; bottom: 0; 
          border-right: 1.5px solid white; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); 
          box-shadow: 2px 0 8px rgba(0,0,0,0.05);
          z-index: 2;
        }
        .bar-label-inner { 
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: flex-end; 
          padding-right: 8px; font-size: 8px; font-weight: 800; color: white; z-index: 3; pointer-events: none;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        /* High-Density Bottom Row */
        .bottom-row { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-top: 24px; }
        .action-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .action-card { 
          background: white; border: 1px solid var(--border-color); border-radius: 12px; padding: 18px;
          display: flex; flex-direction: column; gap: 12px; transition: all 0.2s ease; cursor: pointer;
        }
        .action-card:hover { transform: translateY(-2px); border-color: var(--accent-red); box-shadow: var(--shadow-md); }
        .action-icon-box { 
          width: 36px; height: 36px; background: #fff1f2; border-radius: 10px; color: var(--accent-red);
          display: flex; align-items: center; justify-content: center; border: 1px solid #fee2e2;
        }
        .action-card h4 { margin: 0; font-size: 14px; font-weight: 700; color: var(--text-primary); }
        .action-card p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.4; }
        
        .current-status-card { 
          background: white; border: 1px solid var(--border-color); border-radius: 12px; padding: 18px; height: 100%;
          display: flex; flex-direction: column; gap: 16px;
        }
        .status-header-small { display: flex; align-items: center; gap: 10px; }
        .status-header-small h4 { margin: 0; font-size: 10px; font-weight: 800; color: var(--accent-red); letter-spacing: 0.1em; }
        .status-dot-active { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2); animation: pulse 2s infinite; }
        
        .timeline-simple { display: flex; flex-direction: column; gap: 16px; }
        .timeline-item-active { display: flex; gap: 12px; }
        .t-icon { width: 28px; height: 28px; background: #ecfdf5; border-radius: 8px; color: #059669; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid #d1fae5; }
        .t-content { display: flex; flex-direction: column; }
        .t-content p { margin: 0; font-size: 13px; font-weight: 700; color: var(--text-primary); }
        .t-content span { font-size: 10px; color: var(--text-tertiary); font-weight: 500; }

        /* Procurement Side Drawer Styles */
        .procurement-side-drawer {
          transform: translateX(100%);
          animation: slideIn 0.25s forwards cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideIn {
          to {
            transform: translateX(0);
          }
        }
        .status-select-styled.draft { background-color: #f1f5f9; color: #475569; border-color: #cbd5e1; }
        .status-select-styled.awaiting-approval { background-color: #fef3c7; color: #d97706; border-color: #fde68a; }
        .status-select-styled.partially-received { background-color: #f3e8ff; color: #7c3aed; border-color: #e9d5ff; }
        .status-select-styled.cancelled { background-color: #fee2e2; color: #dc2626; border-color: #fca5a5; }
        
        .kpi-card, .procurement-side-drawer {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .kpi-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03) !important;
        }
        .toolbar-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 12px;
          background: var(--accent-red);
          color: white;
          border: 1px solid var(--accent-red);
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .toolbar-btn-primary:hover {
          background: #b91c1c;
          border-color: #b91c1c;
          transform: translateY(-1px);
        }
        .toolbar-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 12px;
          background: #f8fafc;
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .toolbar-btn:hover {
          background: #fff5f5;
          border-color: var(--accent-red);
          color: var(--accent-red);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
