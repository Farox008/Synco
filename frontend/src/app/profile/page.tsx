"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { ProfileHeaderCard, ProfileDetailsGrid, ProfileSecurityLog } from '@/components/profile/ProfileModules';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      setIsLoggingOut(true);
      await logout();
      setIsLoggingOut(false);
    }
  };

  const userProfileData = {
    username: user?.username || 'John Doe',
    email: user?.email || 'admin@synco.app',
    lastLogin: user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Just now',
    role: 'Administrator',
    avatarUrl: "https://i.pravatar.cc/150?img=11"
  };

  return (
    <>
      <Header title="My Profile" />
      <div className="content-scroll" style={{ flexDirection: 'column', gap: '24px', padding: '32px' }}>
        
        {/* Detail Page Layout: Two Column Grid */}
        <div className="main-columns" style={{ flexDirection: 'row' }}>
          
          <div className="side-column" style={{ width: '380px' }}>
            <ProfileHeaderCard user={userProfileData} />
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="card"
              style={{ padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, color: 'var(--text-secondary)' }}
            >
              <LogOut size={18} />
              {isLoggingOut ? 'Logging out...' : 'Log Out Account'}
            </button>
          </div>
          
          <div className="main-columns" style={{ flex: 1 }}>
            <ProfileDetailsGrid user={userProfileData} />
            <ProfileSecurityLog />
          </div>

        </div>

      </div>
    </>
  );
}
