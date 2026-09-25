"use client";

import React, { use, useState } from 'react';
import Link from 'next/link';
import { 
  Wrench, 
  Cpu, 
  Layers, 
  Activity, 
  Clock, 
  CheckCircle2, 
  Play, 
  Pause, 
  ExternalLink, 
  ChevronRight, 
  AlertTriangle,
  Flame,
  Check,
  ShieldCheck,
  Zap,
  RotateCcw
} from 'lucide-react';
import { useDatabase } from '@/context/DatabaseContext';

interface PageProps {
  params: Promise<{ department: string }>;
}

interface DepartmentInfo {
  name: string;
  code: string;
  icon: React.ElementType;
  description: string;
  defaultMachines: string[];
  hourlyRate: number;
}

const DEPT_MAP: Record<string, DepartmentInfo> = {
  'milling': {
    name: 'Milling Operator Workstation',
    code: 'MILL',
    icon: Wrench,
    description: 'Manual and CNC roughing & finish milling for die blocks, punch shoes, and tool plates.',
    defaultMachines: ['M-101 (Bridgeport)', 'M-102 (Universal Mill)', 'M-103 (High-Speed Mill)', 'M-104 (Turret Mill)'],
    hourlyRate: 35
  },
  'cnc': {
    name: 'CNC Machining Center',
    code: 'CNC',
    icon: Cpu,
    description: 'High-speed 3-axis and 5-axis vertical machining centers (VMC) for precision contouring and cavities.',
    defaultMachines: ['VMC-01 (Fanuc 5-Axis)', 'VMC-02 (Haas VF-3)', 'VMC-03 (Mazak Variaxis)', 'VMC-04 (Makino PS95)'],
    hourlyRate: 105
  },
  'grinding': {
    name: 'Surface Grinding Workstation',
    code: 'GR',
    icon: Zap,
    description: 'High-precision surface grinding & cylindrical grinding achieving ±0.002mm parallelism and flatness.',
    defaultMachines: ['G-01 (Chevalier Surface)', 'G-02 (Okamoto Precision)', 'G-03 (Kent Cylindrical)', 'G-04 (Supertec Wet Grind)'],
    hourlyRate: 40
  },
  'wire-cut': {
    name: 'Wire Cut EDM Workstation',
    code: 'WC',
    icon: Activity,
    description: 'Sub-micron Wire Electrical Discharge Machining (EDM) for tight-tolerance die openings and punch profiles.',
    defaultMachines: ['W-EDM-A (Sodick ALC600G)', 'W-EDM-B (Mitsubishi MV2400S)', 'W-EDM-C (AgieCharmilles Cut P)', 'SINK-X (Sinker EDM)'],
    hourlyRate: 66
  },
  'assembly': {
    name: 'Die Fitting & Assembly Bench',
    code: 'ASSY',
    icon: Layers,
    description: 'Final tool bench assembly, dowel pin alignment, guide post fitting, and stroke testing.',
    defaultMachines: ['BENCH-01 (Main Stamping Bench)', 'BENCH-02 (Mold Fit Station)', 'BENCH-03 (Hydraulic Tryout Press)'],
    hourlyRate: 35
  }
};

export default function OperatorDepartmentPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const deptKey = resolvedParams.department.toLowerCase();
  const dept = DEPT_MAP[deptKey] || {
    name: `${resolvedParams.department.toUpperCase()} Operator Workstation`,
    code: 'OPS',
    icon: Wrench,
    description: 'Dedicated operator workstation queue and production status.',
    defaultMachines: ['Station-01', 'Station-02'],
    hourlyRate: 50
  };

  const Icon = dept.icon;
  const { data } = useDatabase();
  const jobOrders = data.jobOrders || [];

  // Extract tools belonging to this department process
  const [operatorJobs, setOperatorJobs] = useState<any[]>(() => {
    const list: any[] = [];
    jobOrders.forEach(order => {
      (order.tools || []).forEach((tool: any, tidx: number) => {
        list.push({
          id: tool.id || `${order.id}/${tidx + 1}`,
          jobOrderId: order.id,
          customer: order.customer,
          partName: tool.name || tool.partName || 'Tool Part',
          specs: tool.specs || tool.toolingSizeLxbxh || 'Standard Dimensions',
          status: tidx === 0 ? 'In Progress' : 'Pending',
          machine: dept.defaultMachines[tidx % dept.defaultMachines.length],
          estimatedHours: 12 + (tidx * 4),
          actualHours: tidx === 0 ? 6.5 : 0,
          priority: order.priority || 'Medium',
          dueDate: order.dueDate || '2026-10-15'
        });
      });
    });
    return list.slice(0, 10);
  });

  const handleToggleStatus = (jobId: string) => {
    setOperatorJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      const nextStatus = job.status === 'Pending' ? 'In Progress' : job.status === 'In Progress' ? 'Completed' : 'Pending';
      return {
        ...job,
        status: nextStatus,
        actualHours: nextStatus === 'Completed' ? job.estimatedHours : nextStatus === 'In Progress' ? Math.max(1, job.actualHours) : 0
      };
    }));
  };

  const inProgressCount = operatorJobs.filter(j => j.status === 'In Progress').length;
  const completedCount = operatorJobs.filter(j => j.status === 'Completed').length;
  const pendingCount = operatorJobs.filter(j => j.status === 'Pending').length;

  return (
    <div 
      className="operator-page-scroll" 
      style={{ 
        flex: 1, 
        height: '100%', 
        overflowY: 'auto', 
        padding: '24px 32px 64px 32px', 
        backgroundColor: 'var(--bg-color)' 
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Workstation Header */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--accent-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {dept.name}
                </h1>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: 'var(--accent-red)',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  CODE: {dept.code}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                {dept.description}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-color)',
              border: '1px solid var(--border-color)',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}>
              Active Shift: <strong>Morning (08:00 - 17:00)</strong>
            </div>
            <div style={{
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              fontSize: '12px',
              fontWeight: 700
            }}>
              Machine Fleet: 100% Operational
            </div>
          </div>
        </div>

        {/* Quick Station KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>In Progress Tasks</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>{inProgressCount}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Actively running on spindles</div>
          </div>

          <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Pending in Queue</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>{pendingCount}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Awaiting material / previous stage</div>
          </div>

          <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Completed This Shift</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>{completedCount}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Passed to next department / QC</div>
          </div>

          <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Station Standard Rate</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>RM {dept.hourlyRate}/hr</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Department charging index</div>
          </div>
        </div>

        {/* Work Queue Table */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Assigned Work Queue & Tool Routing
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Click on action button to update processing status
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Job / Tool ID</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Customer & Part Name</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Specifications</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Assigned Machine</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Est vs Act Hours</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Due Date</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {operatorJobs.map((job) => {
                  const isRunning = job.status === 'In Progress';
                  const isDone = job.status === 'Completed';

                  return (
                    <tr key={job.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover-row">
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                        <Link 
                          href={`/job-orders/${job.jobOrderId}`} 
                          style={{ color: 'var(--accent-red)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span>{job.id}</span>
                          <ExternalLink size={12} opacity={0.6} />
                        </Link>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>{job.partName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{job.customer}</div>
                      </td>

                      <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {job.specs}
                      </td>

                      <td style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {job.machine}
                      </td>

                      <td style={{ padding: '14px 16px', fontSize: '13px' }}>
                        <strong>{job.actualHours}h</strong> / <span style={{ color: 'var(--text-tertiary)' }}>{job.estimatedHours}h</span>
                      </td>

                      <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {job.dueDate}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: isDone ? '#DCFCE7' : isRunning ? '#EFF6FF' : '#FEF3C7',
                          color: isDone ? '#16A34A' : isRunning ? '#2563EB' : '#D97706'
                        }}>
                          {job.status}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(job.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: isDone ? 'var(--card-bg)' : isRunning ? '#16A34A' : '#2563EB',
                            color: isDone ? 'var(--text-secondary)' : '#FFFFFF',
                            borderStyle: isDone ? 'solid' : 'none',
                            borderWidth: isDone ? '1px' : '0',
                            borderColor: 'var(--border-color)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {isDone ? (
                            <>
                              <RotateCcw size={12} />
                              <span>Reopen</span>
                            </>
                          ) : isRunning ? (
                            <>
                              <CheckCircle2 size={12} />
                              <span>Complete</span>
                            </>
                          ) : (
                            <>
                              <Play size={12} />
                              <span>Start</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
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
