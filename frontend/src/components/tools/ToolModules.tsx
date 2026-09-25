import React from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { StatusPill } from '../ui/StatusPill';
import { Search, Filter, ArrowUpDown, MoreHorizontal, ChevronRight, Layers, Target, Upload } from 'lucide-react';
import Link from 'next/link';

interface Metric {
  title: string;
  value: string;
  sub: string;
  trend: 'up' | 'down';
}

interface ToolStatsProps {
  metrics: Metric[];
}

export const ToolStats: React.FC<ToolStatsProps> = ({ metrics }) => {
  return (
    <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
      {metrics.map((m, idx) => (
        <Card key={idx} className="kpi-card">
          <span className="kpi-title">{m.title}</span>
          <span className="kpi-value">{m.value}</span>
          <span className="kpi-sub">
            vs Last Week <span className={m.trend === 'up' ? 'pill-green' : 'pill-red'}>{m.sub}</span>
          </span>
        </Card>
      ))}
    </div>
  );
};

interface ToolFilterBarProps {
  onSearch: (term: string) => void;
  onCreateTool?: () => void;
  onUploadBOM?: (file: File) => void;
  filterDept?: string;
  setFilterDept?: (dept: string) => void;
  sortBy?: string;
  setSortBy?: (sort: string) => void;
  sortOrder?: 'asc' | 'desc';
  setSortOrder?: (order: 'asc' | 'desc') => void;
}

export const ToolFilterBar: React.FC<ToolFilterBarProps> = ({ onSearch, onCreateTool, onUploadBOM, filterDept, setFilterDept, sortBy, setSortBy, sortOrder, setSortOrder }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '16px',
      gap: '16px' 
    }}>
      <div className="search-bar" style={{ flex: 1, maxWidth: '400px' }}>
        <Search size={16} />
        <input 
          type="text" 
          placeholder="Search Tool ID, Part Name, Job Order, Designer..." 
          style={{ width: '100%' }} 
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <select value={filterDept} onChange={e => setFilterDept?.(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <option value="All">All Departments</option>
          <option value="cnc">CNC</option>
          <option value="milling">MILL</option>
          <option value="heat">HEAT</option>
          <option value="grinding">GRN</option>
          <option value="wiring">WIR</option>
          <option value="edm">EDM</option>
          <option value="assembly">ASM</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy?.(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <option value="id">Sort by Tool No</option>
          <option value="jobOrder">Sort by Job Order</option>
          <option value="name">Sort by Name</option>
        </select>
        <button onClick={() => setSortOrder?.(sortOrder === 'asc' ? 'desc' : 'asc')} style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
          <ArrowUpDown size={16} />
        </button>
        <label className="header-tab active" style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={16} /> Upload BOM
          <input 
            type="file" 
            accept=".pdf" 
            style={{ display: 'none' }} 
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onUploadBOM?.(e.target.files[0]);
                e.target.value = ''; // Reset input
              }
            }}
          />
        </label>
        <button className="pro-btn" style={{ width: 'auto', background: 'var(--accent-red)', color: 'white' }} onClick={onCreateTool}>
          Create Tool
        </button>
      </div>
    </div>
  );
};

interface Tool {
  id: string;
  name: string;
  parentJobOrder: string;
  customer: string;
  priority: string;
  progress?: number;
  status?: string;
  dueDate: string;
  processPath?: string;
  processes?: Record<string, any>;
}

interface ToolTableProps {
  tools: Tool[];
  sortBy?: string;
  setSortBy?: (sort: string) => void;
  sortOrder?: 'asc' | 'desc';
  setSortOrder?: (order: 'asc' | 'desc') => void;
}

export const ToolTable: React.FC<ToolTableProps> = ({ tools, sortBy, setSortBy, sortOrder, setSortOrder }) => {
  const depts = [
    { id: 'cnc', label: 'CNC' },
    { id: 'milling', label: 'MILL' },
    { id: 'heat', label: 'HEAT' },
    { id: 'grinding', label: 'GRN' },
    { id: 'wiring', label: 'WIR' },
    { id: 'edm', label: 'EDM' },
    { id: 'assembly', label: 'ASM' }
  ];

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table className="matrix-table" style={{ margin: 0, borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed', minWidth: '1200px' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-color)' }}>
          <tr>
            <th onClick={() => { setSortBy?.('id'); setSortOrder?.(sortOrder === 'asc' ? 'desc' : 'asc'); }} style={{ background: 'var(--accent-red-light)', position: 'sticky', left: 0, zIndex: 12, width: '140px', cursor: 'pointer' }}>Tool ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
            <th onClick={() => { setSortBy?.('jobOrder'); setSortOrder?.(sortOrder === 'asc' ? 'desc' : 'asc'); }} style={{ background: 'var(--accent-red-light)', width: '120px', cursor: 'pointer' }}>Job Order {sortBy === 'jobOrder' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
            <th onClick={() => { setSortBy?.('name'); setSortOrder?.(sortOrder === 'asc' ? 'desc' : 'asc'); }} style={{ background: 'var(--accent-red-light)', width: '180px', cursor: 'pointer' }}>Component Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
            {depts.map(dept => (
              <th key={dept.id} style={{ background: 'var(--accent-red-light)', textAlign: 'center', width: '100px' }}>{dept.label} %</th>
            ))}
            <th style={{ background: 'var(--accent-red-light)', width: '120px' }}>Designer</th>
            <th style={{ background: 'var(--accent-red-light)', width: '120px' }}>Due Date</th>
            <th style={{ background: 'var(--accent-red-light)', width: '120px' }}>Status</th>
            <th style={{ background: 'var(--accent-red-light)', width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {tools.map((tool) => (
            <tr key={tool.id} className="work-order-row">
              <td style={{ fontWeight: 700, color: 'var(--accent-red)', position: 'sticky', left: 0, background: 'white', zIndex: 11, borderRight: '1px solid var(--border-color)' }}>
                <Link 
                  href={`/tools/${tool.id}`} 
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {tool.id} <ChevronRight size={14} opacity={0.5} />
                  </div>
                </Link>
              </td>
              <td style={{ fontSize: '12px', fontWeight: 600 }}>{tool.parentJobOrder}</td>
              <td style={{ fontWeight: 600, fontSize: '12px' }}>{tool.name}</td>
              {depts.map(dept => {
                const proc = tool.processes?.[dept.id] || { actual: 0, estimated: 0, status: 'N/A' };
                const percentage = proc.estimated > 0 ? Math.min(Math.round((proc.actual / proc.estimated) * 100), 100) : 0;
                const isNA = proc.status === 'N/A';
                
                return (
                  <td key={dept.id} style={{ textAlign: 'center' }}>
                    {isNA ? (
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 700 }}>N/A</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: percentage === 100 ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                          {percentage}%
                        </span>
                        <div style={{ width: '40px', height: '3px', background: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${percentage}%`, 
                            height: '100%', 
                            background: percentage === 100 ? 'var(--accent-green)' : 'var(--accent-blue)',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    )}
                  </td>
                );
              })}
              <td style={{ fontSize: '12px' }}>{(tool as any).designBy || 'N/A'}</td>
              <td style={{ fontSize: '12px' }}>{tool.dueDate}</td>
              <td style={{ minWidth: '100px' }}>
                <StatusPill status={tool.status || 'Pending'} />
              </td>
              <td style={{ textAlign: 'center' }}>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                  <MoreHorizontal size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
    </div>
  );
};
