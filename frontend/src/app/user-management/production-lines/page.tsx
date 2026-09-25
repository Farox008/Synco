"use client";

import React from 'react';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { mockProductionLines } from '@/modules/user-management/data/mockData';
import { ProductionLine } from '@/modules/user-management/types';

export default function ProductionLinesPage() {
  const columns: ColumnDef<ProductionLine>[] = [
    { header: 'Line ID', accessorKey: 'id' },
    { header: 'Name', accessorKey: 'name' },
    {
      header: 'Parent Line',
      cell: (row) => {
        if (!row.parentId) return '-';
        const parent = mockProductionLines.find(pl => pl.id === row.parentId);
        return parent ? parent.name : row.parentId;
      }
    },
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
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Production Lines</h2>
      <DataTable 
        data={mockProductionLines} 
        columns={columns} 
        searchPlaceholder="Search production lines..."
        onAdd={() => {}}
        addLabel="Add Line"
      />
    </div>
  );
}
