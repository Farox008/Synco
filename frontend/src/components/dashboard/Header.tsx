import React from 'react';
import { Bell, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface Tab {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

interface HeaderProps {
  title: string;
  tabs?: Tab[];
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, tabs, actions }) => {
  const { user } = useAuth();
  const router = useRouter();

  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1 }}>
        <h1 className="header-title">{title}</h1>
        <div className="header-tabs">
          {tabs?.map((tab, idx) => (
            <button key={idx} className={`header-tab ${tab.active ? 'active' : ''}`} onClick={tab.onClick}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {actions && <div className="header-page-actions">{actions}</div>}
        <div className="header-user">
         <div className="header-actions">
            <button className="header-action-btn"><Bell size={18} /><span className="badge-dot" /></button>
            <button className="header-action-btn"><MessageCircle size={18} /></button>
         </div>
         <div 
           className="user-profile-header" 
           onClick={handleProfileClick}
           style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
           onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
           onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
           title="View Profile"
         >
            <img src="https://i.pravatar.cc/150?img=11" alt="User" />
            <div className="user-info">
               <span className="user-name">{user?.username || 'User'}</span>
               <span className="user-role">{user?.role || 'Guest'}</span>
            </div>
         </div>
      </div>
    </div>
  </header>
);
};
