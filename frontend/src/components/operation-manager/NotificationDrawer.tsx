"use client";

import React, { useState } from 'react';
import { X, AlertCircle, Clock, Info, Bell } from 'lucide-react';
import { NotificationItem } from '@/services/operation-manager.service';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'All' | 'Critical' | 'Action Required' | 'Informational'>('All');

  const critical = notifications.filter(n => n.category === 'Critical');
  const actionReq = notifications.filter(n => n.category === 'Action Required');
  const informational = notifications.filter(n => n.category === 'Informational');

  const displayed = activeTab === 'All' 
    ? notifications 
    : notifications.filter(n => n.category === activeTab);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      zIndex: 1050,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        background: 'white',
        width: '100%',
        maxWidth: '420px',
        height: '100%',
        boxShadow: '-8px 0 24px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="var(--text-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Notifications
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Severity Category Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          padding: '0 16px',
          gap: '8px',
          background: '#FAFBFB'
        }}>
          {(['All', 'Critical', 'Action Required', 'Informational'] as const).map(tab => {
            const count = tab === 'All' ? notifications.length : (tab === 'Critical' ? critical.length : (tab === 'Action Required' ? actionReq.length : informational.length));
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 8px',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${isActive ? '#1976D2' : 'transparent'}`,
                  fontSize: '12px',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? '#1976D2' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{tab}</span>
                <span style={{
                  fontSize: '10px',
                  background: isActive ? '#EFF6FF' : '#E2E8F0',
                  color: isActive ? '#1D4ED8' : '#475569',
                  padding: '1px 5px',
                  borderRadius: '10px'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notification List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {displayed.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {displayed.map(n => {
                const isCritical = n.category === 'Critical';
                const isAction = n.category === 'Action Required';

                return (
                  <div
                    key={n.id}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${isCritical ? '#FCA5A5' : (isAction ? '#FDBA74' : 'var(--border-color)')}`,
                      background: isCritical ? '#FFF5F5' : (isAction ? '#FFF7ED' : 'white'),
                      display: 'flex',
                      gap: '10px'
                    }}
                  >
                    <div style={{ marginTop: '2px' }}>
                      {isCritical ? (
                        <AlertCircle size={16} color="var(--accent-red)" />
                      ) : isAction ? (
                        <Clock size={16} color="var(--warning-orange)" />
                      ) : (
                        <Info size={16} color="#1976D2" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {n.title}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          {n.time}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                        {n.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No notifications in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
