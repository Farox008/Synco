"use client";

import React from 'react';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { mockShifts } from '@/modules/user-management/data/mockData';
import { Shift } from '@/modules/user-management/types';

export default function ShiftsPage() {
  const columns: ColumnDef<Shift>[] = [
    { header: 'Shift ID', accessorKey: 'id' },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Start Time', accessorKey: 'startTime' },
    { header: 'End Time', accessorKey: 'endTime' },
    { 
      header: 'Break (min)', 
      cell: (row) => `${row.breakDuration} mins`
    },
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
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Shifts</h2>
      <DataTable 
        data={mockShifts} 
        columns={columns} 
        searchPlaceholder="Search shifts..."
        onAdd={() => {}}
        addLabel="Add Shift"
      />
    </div>
  );
}
