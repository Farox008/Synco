import React from 'react';
import { Camera, Shield, User, Mail, Clock } from 'lucide-react';
import { Card } from '../ui/Card';

interface UserProfile {
  username: string;
  email: string;
  lastLogin: string;
  role: string;
  avatarUrl?: string;
}

interface ProfileHeaderCardProps {
  user: UserProfile;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({ user }) => {
  return (
    <Card style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="relative group" style={{ marginBottom: '24px' }}>
        <img
          src={user.avatarUrl || "https://i.pravatar.cc/150?img=11"}
          alt="User avatar"
          style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--border-color)' }}
        />
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <Camera className="text-white" size={24} />
        </div>
      </div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>{user.username}</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', backgroundColor: 'var(--accent-red-light)', padding: '4px 12px', borderRadius: '20px' }}>
        <Shield size={14} /> 
        <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user.role}</span>
      </div>
    </Card>
  );
};

export const ProfileDetailsGrid: React.FC<ProfileHeaderCardProps> = ({ user }) => {
  return (
    <Card style={{ marginBottom: '24px' }}>
      <h3 className="section-title-small" style={{ marginBottom: '24px' }}>Account Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '24px' }}>
        <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <User size={16} color="var(--text-secondary)" />
            <span style={{ color: 'var(--text-tertiary)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Username</span>
          </div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 600, paddingLeft: '24px' }}>{user.username}</div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Mail size={16} color="var(--text-secondary)" />
            <span style={{ color: 'var(--text-tertiary)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Email Address</span>
          </div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 600, paddingLeft: '24px' }}>{user.email}</div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Clock size={16} color="var(--text-secondary)" />
            <span style={{ color: 'var(--text-tertiary)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Last Login</span>
          </div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 600, paddingLeft: '24px' }}>{user.lastLogin}</div>
        </div>
      </div>
    </Card>
  );
};

export const ProfileSecurityLog: React.FC = () => {
  const logs = [
    { id: 1, action: 'Successful Login', ip: '192.168.1.1', location: 'New York, USA', time: '2 hours ago' },
    { id: 2, action: 'Password Changed', ip: '192.168.1.1', location: 'New York, USA', time: '2 days ago' },
    { id: 3, action: 'Failed Login Attempt', ip: '14.123.45.6', location: 'Unknown', time: '1 week ago' },
  ];

  return (
    <Card>
      <h3 className="section-title-small" style={{ marginBottom: '24px' }}>Security Log</h3>
      <table className="matrix-table" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th style={{ background: 'var(--bg-color)' }}>Action</th>
            <th style={{ background: 'var(--bg-color)' }}>IP Address</th>
            <th style={{ background: 'var(--bg-color)' }}>Location</th>
            <th style={{ background: 'var(--bg-color)' }}>Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.action}</td>
              <td>{log.ip}</td>
              <td>{log.location}</td>
              <td>{log.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};
