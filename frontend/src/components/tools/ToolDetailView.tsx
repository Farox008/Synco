"use client";

import React, { useState } from 'react';
import { DesignWorkspace } from '@/components/designer/DesignWorkspace';
import { designerJobHref, toolKey, toolName } from '@/services/designerTools';
import { 
  ChevronLeft, MoreVertical, Share2, Printer, 
  Layers, Package, Info, CheckCircle, Clock, 
  AlertCircle, ChevronRight, FileText, Barcode as BarcodeIcon,
  Cpu, MapPin, User, Activity, Maximize,
  DollarSign, ShieldCheck, TrendingUp, Settings, Target
} from 'lucide-react';
import Barcode from 'react-barcode';
import Link from 'next/link';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useDatabase } from '@/context/DatabaseContext';

interface PageProps { toolId: string; designerJobId?: string; }

export default function ToolDetailView({ toolId, designerJobId }: PageProps) {
  const { getJobById, getJobOrderById, isMounted } = useDatabase();
  const idStr = toolId;
  const parent = designerJobId ? getJobOrderById(designerJobId) : undefined;
  const selectedTool = parent?.tools?.find((item: Parameters<typeof toolKey>[0], index: number) => toolKey(item, index) === toolId);
  const tool = designerJobId ? selectedTool && { ...selectedTool, id: toolId, name: toolName(selectedTool), parentJobOrder: designerJobId, customer: parent.customer || parent.customerName || 'Customer', priority: parent.priority, dueDate: parent.dueDate, headerMetadata: selectedTool.headerMetadata || parent.headerMetadata } : getJobById(idStr);
  const [activeTab, setActiveTab] = useState<'overview' | 'department' | 'machines' | 'specs' | 'purchase' | 'expenditure' | 'history' | 'design'>('overview');

  if (!isMounted) return <div className="detail-page !p-8">Loading tool details…</div>;
  if (!tool) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--accent-red)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Tool Not Found</h2>
        <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>The Tool ID "{idStr}" could not be located in the system.</p>
        <Link href={designerJobId ? designerJobHref(designerJobId) : "/tools"} className="pro-btn" style={{ background: 'var(--accent-red)', color: 'white', display: 'inline-block' }}>
          Back to Tools List
        </Link>
      </div>
    );
  }

  const depts = ['cnc', 'milling', 'heat', 'grinding', 'wiring', 'edm', 'assembly'];

  // Mock data for Tool-specific depth
  const jobValue = tool.headerMetadata?.['PO VALUE'] ? `RM ${(parseFloat(tool.headerMetadata['PO VALUE'].replace(/[^0-9.]/g, '')) * 0.15).toFixed(2)}` : "RM 245.00";
  const jobPurchases = tool.purchases || [
    { id: "MAT-J1", name: "Tool Specific Steel Plate", specs: "200x150x12mm", vendor: "Metals Direct", suggested: "Metals Direct", final: "Metals Direct", status: "Arrived", date: "12 Aug" },
    { id: "TOOL-J1", name: "Custom Carbide Endmill", specs: "3mm Ball", vendor: "ToolSync", suggested: "ToolSync", final: "ToolSync", status: "Ordered", date: "14 Aug" }
  ];
  const jobHistory = tool.history || [
    { action: 'Tool Released to Floor', time: '14.08.2024 10:00am', user: 'System', type: 'system' },
    { action: 'Material Assigned', time: '14.08.2024 11:30am', user: 'Warehouse', type: 'activity' },
    { action: 'Work Started in CNC', time: '14.08.2024 1:46pm', user: 'CNC Op 1', type: 'process' },
    { action: 'Operation Completed: CNC', time: '15.08.2024 09:12am', user: 'System', type: 'check' },
    { action: 'Quality Inspection Pass', time: '15.08.2024 10:30am', user: 'Inspector B', type: 'check' },
  ];

  return (
    <div className="detail-page">
      {/* Tool Header */}
      <div className="detail-header">
        <div className="header-top">
          <div className="header-left">
            <Link href={designerJobId ? designerJobHref(designerJobId) : "/tools"} className="back-btn">
              <ChevronLeft size={20} />
            </Link>
            <div className="header-info">
              <div className="customer-avatar">
                {tool.customer.charAt(0)}
              </div>
              <div className="title-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2>{tool.name}</h2>
                  <span className="id-badge">#{tool.id}</span>
                </div>
                <div className="sub-id-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                   <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Part of Job Order:</span>
                   <Link href={designerJobId ? designerJobHref(designerJobId) : `/job-orders/${tool.parentJobOrder}`} style={{ color: 'var(--accent-blue)', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}>
                     {tool.parentJobOrder}
                   </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <div className="action-icons">
              <button title="Scan Barcode"><BarcodeIcon size={18} /></button>
              <button title="Share Tool"><Share2 size={18} /></button>
              <button title="Print Traveler"><Printer size={18} /></button>
              <button><MoreVertical size={18} /></button>
            </div>
            <div className="status-pill-large">
              {tool.status?.toUpperCase() || 'RUNNING'} <CheckCircle size={14} />
            </div>
            <button className="expand-btn">
              <ChevronLeft size={20} style={{ transform: 'rotate(-90deg)' }} />
            </button>
          </div>
        </div>

        {/* Tool Meta Header with Barcode */}
        <div className="header-metadata-card">
          <div className="metadata-grid">
            {Object.entries(tool.headerMetadata || {
               'CUSTOMER': tool.customer,
               'DRAWING NO': 'DWG-9821',
               'MATERIAL': 'Titanium G5',
               'DUE DATE': tool.dueDate
            }).map(([key, value]: [string, any]) => {
              const label = key.startsWith('Info_') || key.startsWith('Field_') ? '' : key;
              return (
                <div key={key} className="metadata-item">
                  {label && <span className="metadata-label">{label}</span>}
                  <span className="metadata-value">{value}</span>
                </div>
              );
            })}
          </div>
          <div className="metadata-barcode-area">
            <div className="barcode-inner">
              <Barcode 
                value={tool.id} 
                width={1.6} 
                height={60} 
                fontSize={12} 
                background="transparent"
                margin={0}
              />
            </div>
            <span className="barcode-caption">JOB SPECIFIC SKU</span>
          </div>
        </div>

        {/* Financial Snapshot Persistent Header */}
        <div className="financial-snapshot">
          <div className="fin-card">
            <div className="fin-icon"><DollarSign size={20} /></div>
            <div className="fin-data">
              <span className="fin-label">Tool Value</span>
              <span className="fin-value">{jobValue}</span>
            </div>
          </div>
          <div className="fin-card">
            <div className="fin-icon blue"><ShieldCheck size={20} /></div>
            <div className="fin-data">
              <span className="fin-label">Allocated Budget</span>
              <span className="fin-value">RM 185.00</span>
            </div>
          </div>
          <div className="fin-card">
            <div className="fin-icon green"><TrendingUp size={20} /></div>
            <div className="fin-data">
              <span className="fin-label">Est. Margin</span>
              <span className="fin-value">24.4%</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="detail-tabs">
           {designerJobId && <button className={`detail-tab ${activeTab === 'design' ? 'active' : ''}`} onClick={() => setActiveTab('design')}>Design & BOM</button>}
           <button className={`detail-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
           <button className={`detail-tab ${activeTab === 'department' ? 'active' : ''}`} onClick={() => setActiveTab('department')}>Department</button>
           <button className={`detail-tab ${activeTab === 'machines' ? 'active' : ''}`} onClick={() => setActiveTab('machines')}>Machines</button>
           <button className={`detail-tab ${activeTab === 'specs' ? 'active' : ''}`} onClick={() => setActiveTab('specs')}>Technical Specs</button>
           <button className={`detail-tab ${activeTab === 'purchase' ? 'active' : ''}`} onClick={() => setActiveTab('purchase')}>Purchase Planning</button>
           <button className={`detail-tab ${activeTab === 'expenditure' ? 'active' : ''}`} onClick={() => setActiveTab('expenditure')}>Expenditure</button>
           <button className={`detail-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>History</button>
        </div>
      </div>

      <div className="detail-content">
        {activeTab === 'design' && designerJobId && <DesignWorkspace key={`${designerJobId}:${toolId}`} initialJobId={designerJobId} toolId={toolId} embedded /> }
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
               {/* Tool Specific Gantt Chart (Top, Full Width) */}
               <div className="section-card gantt-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 16px 24px' }}>
                    <h3 className="section-title-small" style={{ margin: 0, borderBottom: 'none', padding: 0 }}>Tool Timeline Progress (Actual vs Estimated)</h3>
                  </div>
                  <div className="excel-gantt-wrapper">
                    <div className="excel-gantt-left">
                       <div className="excel-cell header-cell">Process / Dept</div>
                       {depts.map(dept => {
                          const proc = tool.processes?.[dept];
                          if (!proc || proc.status === 'N/A') return null;
                          return (
                             <div key={dept} className="excel-cell row-label">{dept}</div>
                          );
                       })}
                    </div>
                    <div className="excel-gantt-scroll">
                       <div className="excel-gantt-grid">
                          <div className="excel-header-row">
                             {Array.from({length: 30}).map((_, i) => {
                                const d = new Date(2024, 7, 14); // base date matching mock data
                                d.setDate(d.getDate() + i);
                                return (
                                  <div key={i} className="excel-col-header">
                                    {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </div>
                                );
                             })}
                          </div>
                          <div className="excel-rows-container">
                             <div className="excel-bg-grid">
                                {Array.from({length: 30}).map((_, i) => (
                                   <div key={i} className="excel-bg-col"></div>
                                ))}
                             </div>
                             {depts.map((dept, idx) => {
                                const proc = tool.processes?.[dept];
                                if (!proc || proc.status === 'N/A') return null;
                                
                                // Map colors based on department (matches Job Order page scheme)
                                const deptColors = {
                                  cnc: '#ef4444',
                                  milling: '#3b82f6',
                                  heat: '#f59e0b',
                                  grinding: '#22c55e',
                                  wiring: '#8b5cf6',
                                  edm: '#f59e0b',
                                  assembly: '#22c55e',
                                  qc: '#3b82f6'
                                } as any;
                                const color = deptColors[dept] || 'var(--accent-red)';
                                
                                // Calculate bars (simplified for aesthetic parity)
                                const estWidth = Math.min(proc.estimated * 2, 80); // max 80% for visual
                                const actWidth = Math.min(proc.actual * 2, estWidth);
                                const startOffset = idx * 10; // staggered start for look

                                return (
                                  <div key={dept} className="excel-row">
                                     <div 
                                       className="gantt-bar est" 
                                       style={{ 
                                          left: `${startOffset}%`, 
                                          width: `${estWidth}%`,
                                          background: `${color}4D`
                                       }}
                                     >
                                        <span style={{ color: color }}>Est: {proc.estimated}h</span>
                                     </div>
                                     <div 
                                       className="gantt-bar act" 
                                       style={{ 
                                          left: `${startOffset}%`, 
                                          width: `${actWidth}%`,
                                          background: color
                                       }}
                                     >
                                        <span>Act: {proc.actual}h</span>
                                     </div>
                                  </div>
                                );
                             })}
                          </div>
                       </div>
                    </div>
                  </div>
                  <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '24px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 600 }}>
                        <div style={{ width: '12px', height: '12px', background: '#e2e8f0', borderRadius: '3px' }}></div>
                        <span>Estimated Duration</span>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 600 }}>
                        <div style={{ width: '12px', height: '12px', background: 'var(--text-tertiary)', borderRadius: '3px' }}></div>
                        <span>Actual Progress</span>
                     </div>
                  </div>
               </div>

             <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                <div className="stacked-col">
                   <div className="section-card">
                      <h4 className="section-title-small">Production Summary</h4>
                      <div className="card-content">
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px', lineHeight: '1.6' }}>
                          Component <strong>{tool.name}</strong> is currently assigned to <strong>{(Object.values(tool.processes || {}).find((p: any) => p.status === 'In Progress') as any)?.machine || 'Queue'}</strong> in the production line. 
                          Total progress tracked is {tool.progress || 0}% across all operational stages.
                        </p>
                        
                        <div style={{ background: 'var(--bg-secondary)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700 }}>Total Completion</span>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-red)' }}>{tool.progress || 0}%</span>
                          </div>
                          <div style={{ height: '12px', width: '100%', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                height: '100%', 
                                width: `${tool.progress || 0}%`, 
                                background: 'var(--accent-red)',
                                borderRadius: '6px',
                                transition: 'width 0.5s ease'
                              }} 
                            />
                          </div>
                        </div>
                      </div>
                   </div>

                   <div className="section-card">
                      <h4 className="section-title-small">Critical Path Metrics</h4>
                      <div className="metrics-simple-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', padding: '24px' }}>
                         <div className="metric-box">
                            <span className="m-label">Lead Time</span>
                            <span className="m-value">14 Days</span>
                         </div>
                         <div className="metric-box">
                            <span className="m-label">Ops Count</span>
                            <span className="m-value">{Object.keys(tool.processes || {}).length} Units</span>
                         </div>
                         <div className="metric-box">
                            <span className="m-label">Efficiency</span>
                            <span className="m-value">94.2%</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="section-card">
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                     <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Recent Activity</h4>
                     <button style={{ color: 'var(--accent-red)', background: 'none', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>View All</button>
                   </div>
                   <div className="audit-list">
                       {jobHistory.slice(0, 5).map((log: any, i: number) => (
                         <div key={i} className="audit-item">
                            <div className="audit-connector">
                               <div className={`audit-dot ${i === 0 ? 'active' : ''}`}>
                                  {log.type === 'check' ? <CheckCircle size={10} /> : <Activity size={10} />}
                               </div>
                               {i < jobHistory.slice(0, 5).length - 1 && <div className="audit-line" />}
                            </div>
                            <div className="audit-content">
                               <div className="audit-main">
                                  <div className="audit-action">{log.action}</div>
                                  <div className="audit-meta">
                                     <span className="audit-time"><Clock size={11} /> {log.time}</span>
                                     <span className="audit-user"><User size={11} /> {log.user}</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                       ))}
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'department' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Horizontal Department Summary Bar */}
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
                const proc = tool.processes?.[dept.id] || { actual: 0, estimated: 0, status: 'N/A' };
                const progress = proc.estimated > 0 ? Math.round((proc.actual / proc.estimated) * 100) : 0;
                
                return (
                  <div key={dept.id} className="mini-dept-card" style={{ opacity: proc.status === 'N/A' ? 0.4 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="mini-icon" style={{ width: '32px', height: '32px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>{dept.icon}</div>
                      <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>{dept.name}</span>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                         <span style={{ fontWeight: 600 }}>{proc.actual} / {proc.estimated}h</span>
                         <span style={{ fontWeight: 800, color: 'var(--accent-red)' }}>{progress}%</span>
                      </div>
                      <ProgressBar progress={progress} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="section-card">
              <h4 className="section-title-small">Operational Sequence Matrix</h4>
              <div className="matrix-table-container">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>OP #</th>
                      <th style={{ width: '180px' }}>DEPARTMENT</th>
                      <th style={{ width: '180px' }}>MACHINE</th>
                      <th>STATUS</th>
                      <th style={{ width: '250px' }}>PROGRESS</th>
                      <th style={{ width: '150px' }}>TIME (A/E)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depts.map((dept, idx) => {
                      const proc = tool.processes?.[dept] || { actual: 0, estimated: 0, status: 'N/A', machine: 'N/A' };
                      const progress = proc.estimated > 0 ? Math.round((proc.actual / proc.estimated) * 100) : 0;
                      
                      return (
                        <tr key={dept} style={{ opacity: proc.status === 'N/A' ? 0.3 : 1 }}>
                          <td style={{ fontWeight: 800 }}>{(idx + 1) * 10}</td>
                          <td style={{ fontWeight: 700, textTransform: 'uppercase' }}>{dept}</td>
                          <td style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{proc.machine}</td>
                          <td>
                            <div className={`dept-status-indicator-small ${proc.status.toLowerCase().replace(' ', '-')}`}>
                               {proc.status}
                            </div>
                          </td>
                          <td>
                            <div style={{ width: '180px' }}>
                              <ProgressBar progress={progress} showLabel={proc.status !== 'N/A'} />
                            </div>
                          </td>
                          <td style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>{proc.actual}h / {proc.estimated}h</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'machines' && (
          <div className="machines-view-container">
            <div className="matrix-header-info" style={{ marginBottom: '24px', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontWeight: 700 }}>
                <Cpu size={22} color="var(--accent-red)" />
                <span style={{ fontSize: '16px' }}>Machine Distribution Matrix</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                Distribution of operational stages across factory floor assets for this specific tool.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
              {depts.map(deptKey => {
                const proc = tool.processes?.[deptKey];
                if (!proc || proc.status === 'N/A' || !proc.machine || proc.machine === 'N/A') return null;
                
                const progress = proc.estimated > 0 ? Math.round((proc.actual / proc.estimated) * 100) : 0;
                
                return (
                  <div key={deptKey} style={{ width: '300px', flexShrink: 0 }}>
                    <div style={{ 
                      background: 'white', 
                      padding: '16px', 
                      borderRadius: '16px 16px 0 0', 
                      border: '1px solid var(--border-color)',
                      borderBottom: '3px solid var(--accent-red)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{deptKey} Machine</span>
                        {proc.status === 'In Progress' && <div className="status-dot-active" style={{ width: '8px', height: '8px' }} />}
                      </div>
                      <h4 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0', color: 'var(--text-primary)' }}>{proc.machine}</h4>
                    </div>
                    
                    <div style={{ 
                      background: '#f8fafc', 
                      padding: '20px', 
                      borderRadius: '0 0 16px 16px', 
                      border: '1px solid var(--border-color)',
                      borderTop: 'none',
                      minHeight: '140px'
                    }}>
                      <div className="machine-tool-card" style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                          <div>
                             <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-red)', fontFamily: 'monospace' }}>{tool.id}</span>
                             <p style={{ fontSize: '13px', fontWeight: 700, margin: '2px 0' }}>Current Stage</p>
                          </div>
                          <div className={`dept-status-indicator-small ${proc.status.toLowerCase().replace(' ', '-')}`}>
                            {proc.status}
                          </div>
                        </div>
                        
                        <div style={{ marginBottom: '12px' }}>
                          <ProgressBar progress={progress} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                            <span>Efficiency Rate</span>
                            <span>{proc.actual}/{proc.estimated}h</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="section-card">
             <h4 className="section-title-small">Technical Specifications</h4>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', marginTop: '16px' }}>
                <div style={{ borderLeft: '4px solid var(--accent-red)', paddingLeft: '20px' }}>
                   <span className="metadata-label">Physical Dimensions</span>
                   <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginTop: '4px' }}>590.0 x 50.0 x 900.0<span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: '4px' }}>mm</span></span>
                </div>
                <div style={{ borderLeft: '4px solid var(--accent-blue)', paddingLeft: '20px' }}>
                   <span className="metadata-label">Weight Breakdown</span>
                   <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginTop: '4px' }}>12.4<span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: '4px' }}>kg (Gross)</span></span>
                </div>
                <div style={{ borderLeft: '4px solid #10b981', paddingLeft: '20px' }}>
                   <span className="metadata-label">Tolerance Class</span>
                   <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginTop: '4px' }}>ISO 2768-m</span>
                </div>
                <div style={{ borderLeft: '4px solid #f59e0b', paddingLeft: '20px' }}>
                   <span className="metadata-label">Material Composition</span>
                   <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginTop: '4px' }}>SKD11 / Cold Work</span>
                </div>
                <div style={{ borderLeft: '4px solid #8b5cf6', paddingLeft: '20px' }}>
                   <span className="metadata-label">Hardness Req.</span>
                   <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginTop: '4px' }}>58-60 HRC</span>
                </div>
                <div style={{ borderLeft: '4px solid #64748b', paddingLeft: '20px' }}>
                   <span className="metadata-label">Surface Finish</span>
                   <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginTop: '4px' }}>Ra 0.8 Mirror</span>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'purchase' && (
          <div className="section-card">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
               <div>
                  <h4 className="section-title-small" style={{ border: 'none', marginBottom: 0, paddingBottom: 0 }}>Tool Procurement & Materials</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Track material arrival and vendor performance for this component.</p>
               </div>
               <button className="pro-btn" style={{ width: 'auto', background: 'var(--accent-red)', color: 'white' }}>+ NEW REQUISITION</button>
             </div>
             <div className="matrix-table-container">
               <table className="matrix-table">
                 <thead>
                   <tr>
                     <th style={{ width: '220px' }}>ITEM NAME / SPECIFICATIONS</th>
                     <th style={{ width: '180px' }}>SUGGESTED</th>
                     <th style={{ width: '180px' }}>FINAL SUPPLIER</th>
                     <th style={{ width: '160px' }}>PROCUREMENT STATUS</th>
                     <th style={{ width: '80px' }}>REQD.</th>
                     <th style={{ width: '60px', textAlign: 'center' }}>ACTION</th>
                   </tr>
                 </thead>
                 <tbody>
                   {jobPurchases.map((p: any, i: number) => (
                     <tr key={i} className="purchase-row">
                       <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 800, color: 'var(--accent-red)', fontSize: '11px' }}>#{p.id}</span>
                            <span style={{ fontWeight: 700, fontSize: '13px' }}>{p.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{p.specs}</span>
                          </div>
                       </td>
                       <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{p.suggested || p.vendor}</td>
                       <td>
                          <input 
                            type="text" 
                            className="supplier-input" 
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px' }}
                            placeholder="Enter final supplier..." 
                            defaultValue={p.final || p.vendor}
                          />
                       </td>
                       <td>
                          <select 
                            className={`status-select-styled ${p.status.toLowerCase().replace(' ', '-')}`}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px', fontWeight: 600, background: '#f8fafc' }}
                            defaultValue={p.status}
                          >
                            <option value="Purchase Pending">Purchase Pending</option>
                            <option value="Ordered">Ordered</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Arrived">Arrived</option>
                          </select>
                       </td>
                       <td style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)' }}>{p.date}</td>
                       <td style={{ textAlign: 'center' }}>
                          <button style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}><Activity size={16} /></button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === 'expenditure' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                <div className="section-card" style={{ padding: '24px', borderLeft: '4px solid var(--accent-red)' }}>
                   <span className="metadata-label">Tool Total PO Value</span>
                   <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0' }}>{jobValue}</h2>
                   <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>+4.2% Optimization</span>
                </div>
                <div className="section-card" style={{ padding: '24px' }}>
                   <span className="metadata-label">Estimated Labor</span>
                   <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0' }}>$125.50</h2>
                </div>
                <div className="section-card" style={{ padding: '24px' }}>
                   <span className="metadata-label">Material Cost</span>
                   <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0' }}>$45.00</h2>
                </div>
                <div className="section-card" style={{ padding: '24px', background: '#ecfdf5', borderColor: '#10b981' }}>
                   <span className="metadata-label" style={{ color: '#047857' }}>Projected Margin</span>
                   <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0', color: '#047857' }}>$74.50</h2>
                   <span style={{ fontSize: '12px', color: '#047857', fontWeight: 700 }}>30.4% Net</span>
                </div>
             </div>

             <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                <div className="section-card">
                   <h4 className="section-title-small">Material Allocation Details</h4>
                   <table className="matrix-table">
                      <thead>
                         <tr>
                            <th>Item Description</th>
                            <th>Qty</th>
                            <th>Unit Cost</th>
                            <th style={{ textAlign: 'right' }}>Total</th>
                         </tr>
                      </thead>
                      <tbody>
                         <tr>
                            <td style={{ fontWeight: 700 }}>Stock Steel Plate</td>
                            <td>1</td>
                            <td>$35.00</td>
                            <td style={{ textAlign: 'right', fontWeight: 800 }}>$35.00</td>
                         </tr>
                         <tr>
                            <td style={{ fontWeight: 700 }}>Consumable Tooling</td>
                            <td>2</td>
                            <td>$5.00</td>
                            <td style={{ textAlign: 'right', fontWeight: 800 }}>$10.00</td>
                         </tr>
                      </tbody>
                      <tfoot>
                         <tr>
                            <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, padding: '16px' }}>Subtotal:</td>
                            <td style={{ textAlign: 'right', fontWeight: 800, padding: '16px', color: 'var(--accent-red)' }}>$45.00</td>
                         </tr>
                      </tfoot>
                   </table>
                </div>

                <div className="section-card">
                   <h4 className="section-title-small">Operational Labor Breakdown</h4>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {depts.map(dept => {
                         const proc = tool.processes?.[dept];
                         if (!proc || proc.status === 'N/A') return null;
                         const cost = proc.actual * 20; // Mock rate RM 20/hr
                         return (
                            <div key={dept} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                               <div>
                                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>{dept}</span>
                                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>{proc.actual} Hours Logged</p>
                               </div>
                               <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>RM {cost.toFixed(2)}</span>
                            </div>
                         );
                      })}
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="section-card">
             <h4 className="section-title-small">Full Tool Audit Trail</h4>
             <div className="audit-list">
                {jobHistory.map((h: any, i: number) => (
                    <div key={i} className={`audit-item type-${h.type || 'default'}`} style={{ padding: '16px 0', borderBottom: '1px solid #f8fafc' }}>
                      <div className="audit-connector">
                        <div className="audit-dot">
                          {h.type === 'system' && <Info size={12} />}
                          {h.type === 'check' && <CheckCircle size={12} />}
                          {h.type === 'process' && <Settings size={12} />}
                          {h.type === 'activity' && <Activity size={12} />}
                          {h.type === 'shipping' && <MapPin size={12} />}
                        </div>
                        {i < jobHistory.length - 1 && <div className="audit-line" />}
                      </div>
                      <div className="audit-main" style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <div>
                            <div className="audit-action" style={{ fontSize: '15px' }}>{h.action}</div>
                            <div className="audit-meta" style={{ marginTop: '4px' }}>
                               <span style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--bg-secondary)', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>{h.type}</span>
                               <span className="audit-user"><User size={11} /> {h.user}</span>
                            </div>
                          </div>
                          <span className="audit-time" style={{ fontWeight: 600 }}><Clock size={11} /> {h.time}</span>
                        </div>
                      </div>
                    </div>
                ))}
             </div>
          </div>
        )}
      </div>

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
        .excel-col-header { flex: 1; display: flex; align-items: center; justify-content: center; border-right: 1px solid #e2e8f0; font-size: 11px; font-weight: 600; color: var(--text-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        
        .excel-rows-container { position: relative; display: flex; flex-direction: column; }
        .excel-bg-grid { position: absolute; inset: 0; display: flex; pointer-events: none; z-index: 0; }
        .excel-bg-col { flex: 1; border-right: 1px dashed #e2e8f0; }
        
        .excel-row { position: relative; height: 48px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; }
        .excel-row:last-child { border-bottom: 1px solid var(--border-color); }
        
        .gantt-bar { position: absolute; border-radius: 6px; padding: 0 8px; display: flex; align-items: center; font-size: 11px; font-weight: 600; white-space: nowrap; overflow: hidden; }
        .gantt-bar.est { top: 6px; height: 16px; border: none; }
        .gantt-bar.act { top: 26px; height: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); color: white; }
        
        /* Audit Log */
        .audit-list { display: flex; flex-direction: column; }
        .audit-item { display: flex; gap: 16px; position: relative; padding-bottom: 24px; }
        .audit-item:last-child { padding-bottom: 0; }
        .audit-item:not(:last-child)::before {
          content: ''; position: absolute; left: 5px; top: 12px; bottom: 0; width: 2px; background: #e2e8f0;
        }
        .audit-dot { width: 12px; height: 12px; border-radius: 50%; background: #cbd5e1; margin-top: 4px; position: relative; z-index: 2; }
        .audit-dot.active { background: var(--accent-red); box-shadow: 0 0 0 4px var(--accent-red-light); }
        .audit-content { display: flex; flex-direction: column; gap: 4px; }
        .audit-action { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .audit-meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-tertiary); }
        .audit-meta span { display: flex; align-items: center; gap: 4px; }
      `}</style>
    </div>
  );
}
