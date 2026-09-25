"use client";

import React from 'react';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { mockDepartments } from '@/modules/user-management/data/mockData';
import { Department } from '@/modules/user-management/types';

export default function DepartmentsPage() {
  const columns: ColumnDef<Department>[] = [
    { header: 'Department ID', accessorKey: 'id' },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Description', accessorKey: 'description' },
    { header: 'Employees', accessorKey: 'employeeCount' },
    {
      header: 'Status',
      cell: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          row.status === 'Active' 
            ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
            : 'bg-red-500/10 text-red-500 border border-red-500/20'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: () => (
        <button className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-red)]">Edit</button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Departments</h2>
      <DataTable 
        data={mockDepartments} 
        columns={columns} 
        searchPlaceholder="Search departments..."
        onAdd={() => {}}
        addLabel="Add Department"
      />
    </div>
  );
}
