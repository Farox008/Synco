"use client";

import React from 'react';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { mockEmploymentTypes } from '@/modules/user-management/data/mockData';
import { EmploymentType } from '@/modules/user-management/types';

export default function EmploymentTypesPage() {
  const columns: ColumnDef<EmploymentType>[] = [
    { header: 'Type ID', accessorKey: 'id' },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Description', accessorKey: 'description' },
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
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Employment Types</h2>
      <DataTable 
        data={mockEmploymentTypes} 
        columns={columns} 
        searchPlaceholder="Search employment types..."
        onAdd={() => {}}
        addLabel="Add Type"
      />
    </div>
  );
}
