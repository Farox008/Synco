"use client";

import React from 'react';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { mockActivityLogs } from '@/modules/user-management/data/mockData';
import { ActivityLog } from '@/modules/user-management/types';

export default function ActivityLogPage() {
  const columns: ColumnDef<ActivityLog>[] = [
    { 
      header: 'Timestamp', 
      cell: (row) => new Date(row.timestamp).toLocaleString()
    },
    { header: 'User', accessorKey: 'user' },
    { 
      header: 'Action', 
      cell: (row) => <span className="font-medium text-[var(--text-primary)]">{row.action}</span>
    },
    { header: 'Details', accessorKey: 'details' }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Activity Log</h2>
      <DataTable 
        data={mockActivityLogs} 
        columns={columns} 
        searchPlaceholder="Search logs..."
      />
    </div>
  );
}
