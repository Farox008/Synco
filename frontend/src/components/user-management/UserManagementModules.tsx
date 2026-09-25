import React from 'react';
import { Search, Filter, Plus, UserPlus, FileDown } from 'lucide-react';
import { StatusPill } from '../ui/StatusPill';
import { Card } from '../ui/Card';

interface Metric {
  title: string;
  value: string;
  sub: string;
  trend: 'up' | 'down';
}

interface UserManagementStatsProps {
  metrics: Metric[];
}

export const UserManagementStats: React.FC<UserManagementStatsProps> = ({ metrics }) => {
  return (
    <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
      {metrics.map((m, idx) => (
        <Card key={idx} className="kpi-card">
          <span className="kpi-title">{m.title}</span>
          <span className="kpi-value">{m.value}</span>
          <span className="kpi-sub">
            vs Last Month <span className={m.trend === 'up' ? 'pill-green' : 'pill-red'}>{m.sub}</span>
          </span>
        </Card>
      ))}
    </div>
  );
};

interface UserManagementFilterBarProps {
  onNewEmployee: () => void;
  onExportData: () => void;
}

export const UserManagementFilterBar: React.FC<UserManagementFilterBarProps> = ({ onNewEmployee, onExportData }) => {
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
        <input type="text" placeholder="Search Employees, Roles, or Departments..." style={{ width: '100%' }} />
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="header-tab active" style={{ padding: '8px 16px', borderRadius: '8px' }}>
          <Filter size={16} /> Filter
        </button>
        <button className="header-tab" style={{ padding: '8px 16px', borderRadius: '8px' }} onClick={onExportData}>
          <FileDown size={16} /> Export Data
        </button>
        <button className="pro-btn" style={{ width: 'auto', background: 'var(--accent-red)', color: 'white' }} onClick={onNewEmployee}>
          <UserPlus size={16} style={{ display: 'inline', marginRight: '8px' }} /> New Employee
        </button>
      </div>
    </div>
  );
};

export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  employmentStatus: 'Active' | 'On Leave' | 'Inactive';
  lastActive: string;
}

interface EmployeeTableProps {
  employees: Employee[];
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees }) => {
  return (
    <div style={{ width: '100%' }}>
      <table className="matrix-table" style={{ margin: 0, borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-color)' }}>
          <tr>
            <th style={{ background: 'var(--accent-red-light)', position: 'sticky', top: 0 }}>Emp ID</th>
            <th style={{ background: 'var(--accent-red-light)', position: 'sticky', top: 0 }}>Name</th>
            <th style={{ background: 'var(--accent-red-light)', position: 'sticky', top: 0 }}>Department</th>
            <th style={{ background: 'var(--accent-red-light)', position: 'sticky', top: 0 }}>Role</th>
            <th style={{ background: 'var(--accent-red-light)', position: 'sticky', top: 0 }}>Status</th>
            <th style={{ background: 'var(--accent-red-light)', position: 'sticky', top: 0 }}>Last Active</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="work-order-row">
              <td style={{ fontWeight: 700, color: 'var(--accent-red)', minWidth: '100px' }}>
                {employee.id}
              </td>
              <td style={{ fontWeight: 600, minWidth: '180px', color: 'var(--text-primary)' }}>{employee.name}</td>
              <td style={{ minWidth: '150px' }}>{employee.department}</td>
              <td style={{ minWidth: '150px' }}>{employee.role}</td>
              <td style={{ minWidth: '120px' }}>
                <StatusPill status={employee.employmentStatus === 'Active' ? 'Delivered' : employee.employmentStatus === 'On Leave' ? 'Transit' : 'Pending'} />
              </td>
              <td style={{ fontSize: '13px', width: '150px' }}>{employee.lastActive}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
