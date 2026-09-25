import React from 'react';
import { Card } from '../ui/Card';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Search } from 'lucide-react';
import { StatusPill } from '../ui/StatusPill';
import { ProgressBar } from '../ui/ProgressBar';

interface ChartData {
  name: string;
  Actual: number;
  Planned: number;
  RFQ: number;
}

interface ProductionChartCardProps {
  data: ChartData[];
}

export const ProductionChartCard: React.FC<ProductionChartCardProps> = ({ data }) => {
  return (
    <Card title="Production Statistic" subtitle="Comparative Throughput" extra={<span style={{ fontSize: '12px', background: '#F5F5F5', padding: '6px 12px', borderRadius: '4px', fontWeight: 500, cursor: 'pointer' }}>Last 8 Months ⌄</span>} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, height: '220px', width: '100%', minWidth: 0 }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} barGap={6}>
            <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} />
            <Tooltip 
              cursor={{fill: 'transparent'}}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="RFQ" fill="#1E40AF" name="RFQ Volume" radius={[4, 4, 0, 0]} barSize={18} />
            <Bar dataKey="Planned" fill="#CBD5E1" name="Planned Output" radius={[4, 4, 0, 0]} barSize={18} />
            <Bar dataKey="Actual" fill="#FF4D4D" name="Actual Produced" radius={[4, 4, 0, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', gap: '20px', marginTop: '16px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#1E40AF' }} />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>RFQ</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#CBD5E1' }} />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Planned</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#FF4D4D' }} />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Actual</span>
        </div>
      </div>
    </Card>
  );
};

import Link from 'next/link';

interface Tool {
  id: string;
  jobOrder: string;
  route: string;
  progress: number;
  endDate: string;
  status: string;
}

interface RecentJobsTableProps {
  tools: Tool[];
}

export const RecentJobsTable: React.FC<RecentJobsTableProps> = ({ tools }) => {
  return (
    <Card className="table-card">
      <div className="card-header">
        <h3>Recent Tools</h3>
        <div className="search-bar"><Search size={16} /><input type="text" placeholder="Search.." /></div>
      </div>
      <table>
        <thead><tr><th>Tool ID ↕</th><th>Job Order ↕</th><th>Route ↕</th><th>Progress ↕</th><th>End Date ↕</th><th>Status ↕</th></tr></thead>
        <tbody>
          {tools.map(tool => (
            <tr key={tool.id}>
              <td className="strong">
                <Link href={`/tools/${tool.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {tool.id}
                </Link>
              </td>
              <td style={{ fontSize: '12px', fontWeight: 600 }}>
                <Link href={`/job-orders/${tool.jobOrder}`} style={{ textDecoration: 'none', color: 'var(--accent-blue)' }}>
                  {tool.jobOrder}
                </Link>
              </td>
              <td>{tool.route}</td>
              <td style={{ width: '120px' }}>
                <ProgressBar progress={tool.progress} showLabel />
              </td>
              <td>{tool.endDate}</td>
              <td><StatusPill status={tool.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};
