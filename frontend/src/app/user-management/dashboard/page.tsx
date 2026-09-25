"use client";

import React, { useState, useEffect } from 'react';
import { UserManagementStats, UserManagementFilterBar, EmployeeTable } from '@/components/user-management/UserManagementModules';
import { api } from '@/context/AuthContext';

export default function UserManagementDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await api.get('/employees');
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.employmentStatus === 'Active').length;
  const inactiveEmployees = totalEmployees - activeEmployees;

  const metrics = [
    { title: 'Total Employees', value: totalEmployees.toString(), sub: '+3%', trend: 'up' as const },
    { title: 'Active Employees', value: activeEmployees.toString(), sub: '+5%', trend: 'up' as const },
    { title: 'Inactive/On Leave', value: inactiveEmployees.toString(), sub: '-2%', trend: 'down' as const },
    { title: 'New This Month', value: '12', sub: '+1', trend: 'up' as const },
  ];

  const mappedEmployees = employees.map(e => ({
    id: e.id,
    name: `${e.firstName} ${e.lastName}`,
    department: e.department?.name || e.departmentId || 'Unknown',
    role: e.designation,
    employmentStatus: e.employmentStatus as 'Active' | 'On Leave' | 'Inactive',
    lastActive: e.joiningDate || 'Unknown' // simplified
  }));

  const filteredEmployees = mappedEmployees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div style={{ padding: '0 0 24px 0' }}>
        <UserManagementStats metrics={metrics} />
      </div>

      <UserManagementFilterBar 
        onNewEmployee={() => console.log('New Employee')} 
        onExportData={() => console.log('Export Data')} 
      />

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading employees...</div>
        ) : (
          <EmployeeTable employees={filteredEmployees as any} />
        )}
      </div>
    </>
  );
}
