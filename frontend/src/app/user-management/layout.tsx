"use client";

import React from 'react';
import { Header } from '@/components/dashboard/Header';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Building, GitFork, Briefcase, Clock, Activity } from 'lucide-react';

export default function UserManagementLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard', href: '/user-management/dashboard', icon: <LayoutDashboard size={16} /> },
    { name: 'Employees', href: '/user-management/employees', icon: <Users size={16} /> },
    { name: 'Departments', href: '/user-management/departments', icon: <Building size={16} /> },
    { name: 'Production Lines', href: '/user-management/production-lines', icon: <GitFork size={16} /> },
    { name: 'Employment Types', href: '/user-management/employment-types', icon: <Briefcase size={16} /> },
    { name: 'Shifts', href: '/user-management/shifts', icon: <Clock size={16} /> },
    { name: 'Activity Log', href: '/user-management/activity-log', icon: <Activity size={16} /> },
  ];

  const headerTabs = navItems.map((item) => ({
    label: item.name,
    icon: item.icon,
    active: pathname.startsWith(item.href),
    onClick: () => router.push(item.href)
  }));

  return (
    <>
      <Header title="User Management" tabs={headerTabs} />
      <div className="content-scroll" style={{ flexDirection: 'column', gap: '0px', padding: '32px' }}>
        {children}
      </div>
    </>
  );
}
