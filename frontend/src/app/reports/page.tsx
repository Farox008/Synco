"use client";

import React from 'react';
import { BarChart2, TrendingUp, PieChart, Info, Download, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { 
  productionStats, toolStatusBreakdown, kpiMetrics,
  delaySummary, delayedTools, activeTools
} from '@/data/mockData';
import { useDatabase } from '@/context/DatabaseContext';
import { Card } from '@/components/ui/Card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart as RePieChart, Pie, Cell, ComposedChart, Line
} from 'recharts';

export default function ReportsPage() {
  const { data, isMounted } = useDatabase();
  const machines = data.machines as any[];
  const jobOrders = data.jobOrders as any[];

  const jobOrderMetrics = [
    { title: 'Total Job Orders', value: jobOrders.length.toString(), sub: '', trend: 'up' },
    { title: 'In Progress', value: jobOrders.filter(w => w.status === 'In Progress').length.toString(), sub: '', trend: 'up' },
    { title: 'Completed', value: jobOrders.filter(w => w.status === 'Completed').length.toString(), sub: '', trend: 'up' },
    { title: 'Delayed', value: jobOrders.filter(w => w.status === 'Delayed').length.toString(), sub: '', trend: 'down' },
  ];

  return (
    <>
      <Header title="Comprehensive Production Reports" />

      <div className="content-scroll" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {/* Overview Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <BarChart2 size={24} color="var(--text-secondary)" />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Production Overview</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
            {kpiMetrics.map((kpi, i) => (
              <Card key={i}>
                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{kpi.title}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>{kpi.value}</h2>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: kpi.trend === 'up' ? 'var(--success-green)' : 'var(--accent-red)' }}>
                    {kpi.sub}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
            <Card style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Yearly Production Output</h3>
                <button style={{ color: 'var(--text-tertiary)', border: 'none', background: 'none', cursor: 'pointer' }}>
                  <Download size={16} />
                </button>
              </div>
              <div style={{ flex: 1, height: '300px', width: '100%', minWidth: 0 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={productionStats}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-red)" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="var(--accent-red)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="Actual" stroke="var(--accent-red)" fillOpacity={1} fill="url(#colorActual)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Planned" stroke="var(--text-tertiary)" fill="transparent" strokeDasharray="5 5" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Tool Status Distribution</h3>
              <div style={{ flex: 1, height: '300px', width: '100%', minWidth: 0 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie data={toolStatusBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {toolStatusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </section>

        {/* Machine Utilization Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <TrendingUp size={24} color="var(--text-secondary)" />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Machine Utilization</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
            <Card>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Overall OEE</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>82.4%</h2>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success-green)' }}>+2.1% ↗</span>
              </div>
            </Card>
            <Card>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Machines</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>{machines.filter(m => m.status === 'running').length} / {machines.length}</h2>
              </div>
            </Card>
            <Card>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>In Maintenance</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>{machines.filter(m => m.status === 'maintenance').length}</h2>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)' }}>Normal</span>
              </div>
            </Card>
            <Card>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Scrap Rate</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>1.8%</h2>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success-green)' }}>-0.4% ↘</span>
              </div>
            </Card>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <Card style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Efficiency by Machine Category</h3>
              <div style={{ flex: 1, height: '250px', width: '100%', minWidth: 0 }}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={productionStats.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
                    <Tooltip />
                    <Bar dataKey="Actual" fill="var(--accent-red)" radius={[4, 4, 0, 0]} barSize={40} name="OEE (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Active Workload by Process</h3>
              <div style={{ flex: 1, height: '250px', width: '100%', minWidth: 0 }}>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={activeTools.slice(0, 5)} layout="vertical" margin={{ left: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-primary)" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cnc" stackId="a" fill="#E53935" name="CNC" />
                    <Bar dataKey="milling" stackId="a" fill="#1976D2" name="Milling" />
                    <Bar dataKey="heat" stackId="a" fill="#F57C00" name="Heat Treat" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </section>

        {/* Tool Delays Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <AlertTriangle size={24} color="var(--accent-red)" />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Tool Delays & Bottlenecks</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Delay Hours</p>
                <AlertTriangle size={16} color="var(--accent-red)" />
              </div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>{delaySummary.totalDelay}</h2>
            </Card>
            <Card>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Delays</p>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>{delaySummary.activeDelays}</h2>
            </Card>
            <Card>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Delay Trend</p>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>{delaySummary.trend}</h2>
            </Card>
            <Card>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Status</p>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--accent-red)' }}>{delaySummary.status}</h2>
            </Card>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
            <Card style={{ height: '400px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Top Delay Reasons</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { reason: 'Material', hours: 45 },
                      { reason: 'Tooling', hours: 22 },
                      { reason: 'Operator', hours: 15 },
                      { reason: 'Maintenance', hours: 10 },
                    ]}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-primary)" />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="reason" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                    <Tooltip />
                    <Bar dataKey="hours" fill="var(--accent-red)" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card style={{ height: '400px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Critical Delayed Tools</h3>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 500 }}>Tool ID</th>
                      <th style={{ padding: '12px 16px', fontWeight: 500 }}>Part Name</th>
                      <th style={{ padding: '12px 16px', fontWeight: 500 }}>Reason</th>
                      <th style={{ padding: '12px 16px', fontWeight: 500 }}>Time Lost</th>
                      <th style={{ padding: '12px 16px', fontWeight: 500 }}>Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {delayedTools.map((tool, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                        <td style={{ padding: '16px', fontWeight: 500 }}>{tool.id}</td>
                        <td style={{ padding: '16px' }}>{tool.name}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ padding: '4px 8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {tool.reason}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontWeight: 600, color: 'var(--accent-red)' }}>{tool.timeLost}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ 
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px', 
                            backgroundColor: tool.impact === 'High' ? 'rgba(229, 57, 53, 0.1)' : 'rgba(25, 118, 210, 0.1)', 
                            color: tool.impact === 'High' ? 'var(--accent-red)' : '#1976D2', borderRadius: '4px', fontSize: '12px', fontWeight: 600 
                          }}>
                            {tool.impact}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </section>

        {/* Job Order Breakdown Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <PieChart size={24} color="var(--text-secondary)" />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Job Order Breakdown</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
            {jobOrderMetrics.map((kpi, i) => (
              <Card key={i}>
                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{kpi.title}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>{kpi.value}</h2>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: kpi.trend === 'up' ? 'var(--success-green)' : 'var(--accent-red)' }}>
                    {kpi.sub}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            <Card style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Job Order Status Breakdown</h3>
              <div style={{ flex: 1, height: '300px', width: '100%', minWidth: 0 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: 184, fill: '#1976D2' },
                        { name: 'In Progress', value: 62, fill: 'var(--success-green)' },
                        { name: 'Delayed', value: 12, fill: 'var(--accent-red)' },
                        { name: 'Pending', value: 154, fill: 'var(--text-tertiary)' },
                      ]}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                    >
                      {[
                        { fill: '#1976D2' }, { fill: 'var(--success-green)' }, { fill: 'var(--accent-red)' }, { fill: 'var(--text-tertiary)' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </section>

      </div>
    </>
  );
}
