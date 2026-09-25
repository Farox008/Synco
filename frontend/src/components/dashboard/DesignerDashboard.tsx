import React from 'react';
import Link from 'next/link';
import { PenTool, Upload, Search, List, Activity, Calendar as CalendarIcon, Clock, FileText, Bell } from 'lucide-react';
import { KPIGrid, ToolStatusBreakdown } from './QuickStats';
import { ProductionChartCard, RecentJobsTable } from './DataModules';
import { DelayTimelineCard } from './DelayTimelineCard';
import { Header } from './Header';
import {
  designerKpiMetrics, assignedTools, designProgressData, upcomingDeadlines,
  designerActivity, designerNotifications, designVersions, monthlyPerformance, recentFiles
} from '../../data/designerMockData';
import { useAuth } from '@/context/AuthContext';

export const DesignerDashboard = () => {
  const { user } = useAuth();
  const userName = user?.username ? user.username : 'Designer';

  return (
    <>
      <Header
        title="Designer Dashboard"
        tabs={[
          { label: `Welcome, ${userName}`, icon: <PenTool size={16} />, active: true },
        ]}
      />

      <div className="content-scroll">
        
        <div className="main-columns" style={{ paddingBottom: '48px' }}>
          {/* Top Row: KPIs + Performance Chart */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'stretch' }}>
            <div style={{ flex: '1.5', display: 'flex', flexDirection: 'column' }}>
              <KPIGrid metrics={designerKpiMetrics as any} isSmall={true} />
            </div>
            <div style={{ flex: '0.5', display: 'flex', flexDirection: 'column' }}>
              <div className="card" style={{ height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600 }}>My Performance</h3>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>32</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Active Designs</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success-green)' }}>12</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Completed This Week</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--warning-orange)' }}>2.4d</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Avg Completion</div>
                  </div>
                </div>
                <div style={{ display: 'flex', height: '120px', alignItems: 'stretch', gap: '8px' }}>
                  {monthlyPerformance.map((p, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: '4px' }}>
                      <div style={{ 
                        width: '60%', 
                        height: `${(p.completed / 25) * 100}%`, 
                        backgroundColor: 'var(--accent-red)', 
                        borderRadius: '4px 4px 0 0',
                        opacity: 0.8
                      }} title={`${p.completed} Completed`} />
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{p.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="my-4 flex flex-wrap justify-center gap-3">
            <Link href="/designer/jobs" className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium">
              <Upload size={16} /> Jobs — Upload Designs & BOM
            </Link>
            <Link href="/designer/revisions" className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium">
              <FileText size={16} /> Revisions
            </Link>
          </div>

          {/* Design Progress Breakdown */}
          <ToolStatusBreakdown data={designProgressData} total={26} />

          {/* Row 3: Assigned Tools Table + Upcoming Deadlines */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ flex: 1.5 }} className="card">
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>My Assigned Tools</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--accent-red-light)', color: 'var(--accent-red)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600, borderRadius: '8px 0 0 8px' }}>Tool / Job</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Customer</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Due Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, borderRadius: '0 8px 8px 0' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedTools.map((t, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.id} - {t.name}</div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>Rev {t.revision} | {t.jobOrder}</div>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{t.customer}</td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{t.dueDate}</td>
                      <td style={{ padding: '16px' }}>
                        <span className="status-pill" style={{ 
                          backgroundColor: t.status === 'In Progress' ? '#E3F2FD' : t.status === 'Pending' ? '#E2E3E5' : t.status === 'Revision' ? 'var(--accent-red-light)' : 'var(--warning-orange-light)', 
                          color: t.status === 'In Progress' ? '#1976D2' : t.status === 'Pending' ? '#383D41' : t.status === 'Revision' ? 'var(--accent-red)' : 'var(--warning-orange)',
                          padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600
                        }}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Link href="/designer/jobs" style={{ color: 'var(--info-blue)', fontWeight: 500, fontSize: '13px' }}>Open Jobs</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card">
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarIcon size={18} /> Upcoming Deadlines
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {upcomingDeadlines.map((d, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)' }}>{d.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{d.type}</div>
                      </div>
                      <div style={{ 
                        fontSize: '12px', fontWeight: 600, 
                        color: d.urgency === 'high' ? 'var(--accent-red)' : d.urgency === 'medium' ? 'var(--warning-orange)' : 'var(--success-green)'
                      }}>
                        {d.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={18} /> Notifications
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {designerNotifications.map((n, i) => (
                    <div key={i} style={{ paddingBottom: '12px', borderBottom: i === designerNotifications.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)' }}>{n.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{n.message}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Design Versions & Recent Files */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ flex: 1 }} className="card">
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Design Versions</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'var(--text-tertiary)', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '8px 0', fontWeight: 600 }}>Tool / Rev</th>
                    <th style={{ padding: '8px 0', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '8px 0', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {designVersions.map((v, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
                      <td style={{ padding: '12px 0', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {v.tool} <span style={{ color: 'var(--text-secondary)' }}>Rev {v.revision}</span>
                      </td>
                      <td style={{ padding: '12px 0', color: 'var(--text-secondary)' }}>{v.date}</td>
                      <td style={{ padding: '12px 0' }}>
                        <span style={{ 
                          color: v.status === 'Approved' ? 'var(--success-green)' : v.status === 'Rejected' ? 'var(--accent-red)' : 'var(--text-secondary)',
                          fontWeight: 500
                        }}>{v.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ flex: 1 }} className="card">
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} /> Recent Files
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentFiles.map((f, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ padding: '8px', backgroundColor: 'var(--bg-color)', borderRadius: '6px', color: 'var(--accent-red)' }}>
                        <FileText size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text-primary)' }}>{f.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{f.date}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', padding: '2px 6px', backgroundColor: 'var(--bg-color)', borderRadius: '4px' }}>
                      {f.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
