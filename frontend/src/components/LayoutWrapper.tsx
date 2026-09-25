"use client";

import React, { useEffect } from 'react';
import { useUI } from '@/context/UIContext';
import Sidebar from '@/components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isSidebarCollapsed } = useUI();
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && pathname !== '/login') {
        router.push('/login');
      } else if (isAuthenticated && pathname === '/login') {
        router.push('/rfqs');
      }
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0a] text-white">Loading Synco...</div>;
  }

  // Prevent flash of protected content while redirecting to login
  if (!isAuthenticated && pathname !== '/login') {
    return null;
  }

  // Prevent flash of login page if already authenticated
  if (isAuthenticated && pathname === '/login') {
    return null;
  }

  if (pathname === '/login') {
    return <main>{children}</main>;
  }

  return (
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <main className="main-wrapper">
        {children}
      </main>
    </div>
  );
};
