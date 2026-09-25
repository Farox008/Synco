"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { mockEmployees, mockDepartments, mockEmploymentTypes } from '@/modules/user-management/data/mockData';
import { Employee } from '@/modules/user-management/types';
import Link from 'next/link';

export default function EmployeesPage() {
  const router = useRouter();

  const columns: ColumnDef<Employee>[] = [
    {
      header: 'Employee',
      cell: (row) => (
        <div className="flex items-center gap-3">
          {row.profilePicture ? (
            <img src={row.profilePicture} alt={row.firstName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--bg-color)] flex items-center justify-center text-xs font-medium">
              {row.firstName[0]}{row.lastName[0]}
            </div>
          )}
          <div>
            <Link href={`/user-management/employees/${row.id}`} className="font-medium text-[var(--text-primary)] hover:text-[var(--accent-red)] hover:underline">
              {row.firstName} {row.lastName}
            </Link>
            <div className="text-xs text-[var(--text-secondary)]">{row.id}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Department',
      cell: (row) => {
        const dept = mockDepartments.find(d => d.id === row.departmentId);
        return dept ? dept.name : '-';
      }
    },
    { header: 'Designation', accessorKey: 'designation' },
    {
      header: 'Type',
      cell: (row) => {
        const type = mockEmploymentTypes.find(t => t.id === row.employmentTypeId);
        return type ? type.name : '-';
      }
    },
    {
      header: 'Status',
      cell: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          row.employmentStatus === 'Active' 
            ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
            : 'bg-red-500/10 text-red-500 border border-red-500/20'
        }`}>
          {row.employmentStatus}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push(`/user-management/employees/${row.id}`)}
            className="text-xs text-[var(--accent-red)] hover:underline"
          >
            View
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Employees</h2>
      <DataTable 
        data={mockEmployees} 
        columns={columns} 
        searchPlaceholder="Search by ID, Name, or Department..."
        onAdd={() => {}}
        addLabel="Add Employee"
      />
    </div>
  );
}
