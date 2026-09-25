"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Building, GitFork, Briefcase, Clock, Activity } from 'lucide-react';

export function SubNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/user-management/dashboard', icon: LayoutDashboard },
    { name: 'Employees', href: '/user-management/employees', icon: Users },
    { name: 'Departments', href: '/user-management/departments', icon: Building },
    { name: 'Production Lines', href: '/user-management/production-lines', icon: GitFork },
    { name: 'Employment Types', href: '/user-management/employment-types', icon: Briefcase },
    { name: 'Shifts', href: '/user-management/shifts', icon: Clock },
    { name: 'Activity Log', href: '/user-management/activity-log', icon: Activity },
  ];

  return (
    <div className="w-full bg-[var(--card-bg)] border-b border-[var(--border-color)] px-6 py-2 shadow-sm mb-6 flex overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-[var(--accent-red-light)] text-[var(--accent-red)]' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-color)] hover:text-[var(--text-primary)]'}
              `}
            >
              <Icon size={16} />
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
