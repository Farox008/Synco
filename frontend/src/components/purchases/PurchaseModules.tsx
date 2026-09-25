import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Search, Filter, ChevronDown, ChevronRight, Package, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export interface PurchaseMetric {
  title: string;
  value: number;
  total?: number;
  color: string;
  id: string;
}

export const PurchaseStats: React.FC<{ metrics: PurchaseMetric[], activeFilter: string | null, onFilterClick: (id: string | null) => void }> = ({ metrics, activeFilter, onFilterClick }) => {
  return (
    <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', marginBottom: '24px', gap: '16px' }}>
      {metrics.map((m) => (
        <Card 
          key={m.id} 
          className="kpi-card" 
          style={{ 
            cursor: 'pointer', 
            border: activeFilter === m.id ? `2px solid ${m.color}` : '1px solid var(--border-color)',
            transform: activeFilter === m.id ? 'translateY(-2px)' : 'none',
            transition: 'all 0.2s ease',
            backgroundColor: activeFilter === m.id ? `${m.color}08` : 'var(--bg-panel)'
          }}
          onClick={() => onFilterClick(activeFilter === m.id ? null : m.id)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{m.title}</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: m.color }}>{m.value}</span>
              {m.total && (
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                  ({Math.round((m.value / m.total) * 100)}%)
                </span>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export const PurchaseFilterBar: React.FC<{ searchTerm: string, setSearchTerm: (s: string) => void }> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '16px',
      gap: '16px' 
    }}>
      <div className="search-bar" style={{ flex: 1, maxWidth: '400px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <Search size={16} color="var(--text-tertiary)" style={{ marginRight: '8px' }} />
        <input 
          type="text" 
          placeholder="Search Job Orders, Materials..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', width: '100%' }} 
        />
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="header-tab active" style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontWeight: 600, cursor: 'pointer' }}>
          <Filter size={16} /> Filter
        </button>
      </div>
    </div>
  );
};

export interface Material {
  id: string;
  name: string;
  specs: string;
  vendor: string;
  reqQty: number;
  ordQty: number;
  recQty: number;
  eta: string;
  status: 'Arrived' | 'Pending' | 'Delayed' | 'Not Ordered' | 'Partial Arrival';
}

export interface ProcurementWO {
  id: string;
  customer: string;
  dueDate: string;
  materials: Material[];
}

const getMaterialStatusColor = (status: string) => {
  switch (status) {
    case 'Arrived': return 'var(--success-green)';
    case 'Pending': return '#F59E0B'; // Amber/Yellow
    case 'Delayed': return 'var(--accent-red)';
    case 'Partial Arrival': return '#3B82F6'; // Blue
    case 'Not Ordered': return 'var(--text-tertiary)'; // Gray
    default: return 'var(--text-secondary)';
  }
};

const getReadiness = (materials: Material[]) => {
  if (!materials || materials.length === 0) return { label: 'Ready', color: 'var(--success-green)', icon: <CheckCircle size={14} /> };
  
  const hasDelayed = materials.some(m => m.status === 'Delayed');
  const hasNotOrdered = materials.some(m => m.status === 'Not Ordered');
  const hasPending = materials.some(m => m.status === 'Pending');
  const hasPartial = materials.some(m => m.status === 'Partial Arrival');
  const allArrived = materials.every(m => m.status === 'Arrived');
  
  if (hasDelayed || hasNotOrdered) return { label: 'Blocked', color: 'var(--accent-red)', icon: <AlertCircle size={14} /> };
  if (allArrived) return { label: 'Ready', color: 'var(--success-green)', icon: <CheckCircle size={14} /> };
  if (hasPartial || materials.some(m => m.status === 'Arrived')) return { label: 'Partial Ready', color: '#F59E0B', icon: <Package size={14} /> };
  return { label: 'Awaiting Materials', color: '#3B82F6', icon: <Clock size={14} /> };
};

export const PurchaseJobOrderTable: React.FC<{ 
  jobOrders: ProcurementWO[], 
  onMaterialFilter: (status: string) => void,
  activeFilter: string | null 
}> = ({ jobOrders, onMaterialFilter, activeFilter }) => {
  const [expandedWO, setExpandedWO] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedWO(expandedWO === id ? null : id);
  };

  return (
    <div style={{ width: '100%', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--bg-panel)' }}>
      <table className="matrix-table" style={{ margin: 0, borderCollapse: 'separate', borderSpacing: 0, width: '100%' }}>
        <thead style={{ background: 'var(--bg-secondary)' }}>
          {/* Row 1: Top-level grouped headers */}
          <tr>
            <th rowSpan={2} style={{ width: '40px', verticalAlign: 'middle', borderBottom: '1px solid var(--border-color)' }}></th>
            <th rowSpan={2} style={{ verticalAlign: 'middle', borderBottom: '1px solid var(--border-color)' }}>Job Order</th>
            <th rowSpan={2} style={{ verticalAlign: 'middle', borderBottom: '1px solid var(--border-color)' }}>Customer</th>
            <th rowSpan={2} style={{ verticalAlign: 'middle', borderBottom: '1px solid var(--border-color)' }}>Date</th>
            <th colSpan={4} style={{ textAlign: 'center', borderBottom: '1px solid var(--accent-blue)', color: 'var(--accent-blue)', letterSpacing: '0.05em', fontSize: '11px' }}>
              MATERIAL STATUS
            </th>
            <th rowSpan={2} style={{ verticalAlign: 'middle', borderBottom: '1px solid var(--border-color)' }}>Actions</th>
          </tr>
          {/* Row 2: Sub-columns for the grouped header */}
          <tr>
            <th style={{ textAlign: 'center', borderBottom: '2px solid var(--success-green)', color: 'var(--success-green)', fontSize: '11px', paddingTop: '4px', paddingBottom: '8px' }}>Arrived</th>
            <th style={{ textAlign: 'center', borderBottom: '2px solid #F59E0B', color: '#F59E0B', fontSize: '11px', paddingTop: '4px', paddingBottom: '8px' }}>Pending</th>
            <th style={{ textAlign: 'center', borderBottom: '2px solid var(--accent-red)', color: 'var(--accent-red)', fontSize: '11px', paddingTop: '4px', paddingBottom: '8px' }}>Delayed</th>
            <th style={{ textAlign: 'center', borderBottom: '2px solid var(--text-tertiary)', color: 'var(--text-tertiary)', fontSize: '11px', paddingTop: '4px', paddingBottom: '8px' }}>Not Ordered</th>
          </tr>
        </thead>
        <tbody>
          {jobOrders.length > 0 ? jobOrders.map((wo) => {
            const counts = {
              arrived: wo.materials.filter(m => m.status === 'Arrived' || m.status === 'Partial Arrival').length,
              pending: wo.materials.filter(m => m.status === 'Pending').length,
              delayed: wo.materials.filter(m => m.status === 'Delayed').length,
              notOrdered: wo.materials.filter(m => m.status === 'Not Ordered').length,
            };
            const readiness = getReadiness(wo.materials);
            const isExpanded = expandedWO === wo.id;

            return (
              <React.Fragment key={wo.id}>
                {/* Main Job Order Row */}
                <tr 
                  style={{ 
                    cursor: 'pointer', 
                    backgroundColor: isExpanded ? 'var(--bg-secondary)' : 'transparent',
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'background-color 0.2s ease'
                  }}
                  onClick={() => toggleExpand(wo.id)}
                  onMouseOver={(e) => { if (!isExpanded) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }}
                  onMouseOut={(e) => { if (!isExpanded) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    <Link
                      href={`/purchases/${wo.id}`}
                      onClick={e => e.stopPropagation()}
                      style={{ textDecoration: 'none', color: 'var(--accent-red)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      {wo.id} <ChevronRight size={13} opacity={0.5} />
                    </Link>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{wo.customer}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{wo.dueDate}</td>
                  <td align="center">
                    <Badge count={counts.arrived} color="var(--success-green)" label="Arrived" onClick={(e) => { e.stopPropagation(); onMaterialFilter('Arrived'); }} />
                  </td>
                  <td align="center">
                    <Badge count={counts.pending} color="#F59E0B" label="Pending" onClick={(e) => { e.stopPropagation(); onMaterialFilter('Pending'); }} />
                  </td>
                  <td align="center">
                    <Badge count={counts.delayed} color="var(--accent-red)" label="Delayed" onClick={(e) => { e.stopPropagation(); onMaterialFilter('Delayed'); }} />
                  </td>
                  <td align="center">
                    <Badge count={counts.notOrdered} color="var(--text-tertiary)" label="Not Ordered" onClick={(e) => { e.stopPropagation(); onMaterialFilter('Not Ordered'); }} />
                  </td>
                  <td>
                    <select 
                      onClick={(e) => e.stopPropagation()} 
                      style={{ 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        border: '1px solid var(--border-color)', 
                        backgroundColor: 'var(--bg-secondary)', 
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                      defaultValue="pending"
                    >
                      <option value="not_ordered">Not Ordered</option>
                      <option value="pending">Pending</option>
                      <option value="stopped">Stopped</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                </tr>

                {/* Expanded job orders link to the dedicated purchase-details screen. */}
                {isExpanded && (
                  <tr>
                    <td colSpan={9} style={{ padding: 0, borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ padding: '24px', backgroundColor: 'var(--bg-color)', borderLeft: '4px solid var(--accent-blue)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Purchase Details</h4>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Material status breakdown for job order {wo.id}.</p>
                          </div>
                          <Link href={`/purchases/${wo.id}`} className="header-tab" style={{ textDecoration: 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            Open Full Purchase Details <ChevronRight size={16} />
                          </Link>
                        </div>
                        <PurchaseStats 
                          metrics={[
                            { id: 'total', title: 'Total Materials', value: wo.materials.length, color: 'var(--text-primary)' },
                            { id: 'arrived', title: 'Arrived', value: counts.arrived, total: wo.materials.length, color: 'var(--success-green)' },
                            { id: 'pending', title: 'Pending', value: counts.pending, total: wo.materials.length, color: '#F59E0B' },
                            { id: 'delayed', title: 'Delayed', value: counts.delayed, total: wo.materials.length, color: 'var(--accent-red)' },
                            { id: 'not_ordered', title: 'Not Ordered', value: counts.notOrdered, total: wo.materials.length, color: 'var(--text-tertiary)' },
                          ]} 
                          activeFilter={null} 
                          onFilterClick={() => {}} 
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          }) : (
            <tr>
              <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)' }}>
                No job orders found matching the selected filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const Badge: React.FC<{ count: number, color: string, label: string, onClick: (e: React.MouseEvent) => void }> = ({ count, color, label, onClick }) => {
  if (count === 0) return null;
  return (
    <div 
      onClick={onClick}
      title={`Filter by ${label}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: `${color}20`,
        color: color,
        fontSize: '11px',
        fontWeight: 700,
        cursor: 'pointer',
        border: `1px solid ${color}40`,
        transition: 'transform 0.1s ease'
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {count}
    </div>
  );
};
