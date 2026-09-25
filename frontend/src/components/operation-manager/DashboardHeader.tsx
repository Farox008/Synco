"use client";

import React, { useState } from 'react';
import { 
  Search, Bell, Plus, Calendar, Filter, DollarSign 
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface DashboardHeaderProps {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenQuickAction: (actionType: 'job' | 'rfq' | 'quotation' | 'revision' | 'design') => void;
  onOpenFeasibilityCalculator?: () => void;
  unreadNotificationsCount: number;
  activeFilterCount?: number;
  onToggleFilterDrawer?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onOpenSearch,
  onOpenNotifications,
  onOpenQuickAction,
  onOpenFeasibilityCalculator,
  unreadNotificationsCount,
  activeFilterCount = 0,
  onToggleFilterDrawer
}) => {
  const { hasPermission } = usePermissions();
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div style={{
      background: 'white',
      borderBottom: '1px solid var(--border-color)',
      padding: '16px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap'
    }}>
      {/* Title & Date */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Operation Manager
          </h1>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            background: '#EFF6FF',
            color: '#1D4ED8',
            padding: '3px 8px',
            borderRadius: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Control Tower
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <Calendar size={13} color="var(--text-tertiary)" />
          <span>{currentDate}</span>
          <span>•</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Operational Overview</span>
        </div>
      </div>

      {/* Global Actions: Search, Notifications, Quick Actions, Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Search Trigger */}
        <button
          onClick={onOpenSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            minWidth: '220px',
            transition: 'border-color 0.2s'
          }}
          title="Search jobs, RFQs, quotations, parts..."
        >
          <Search size={15} color="var(--text-tertiary)" />
          <span style={{ flex: 1, textAlign: 'left' }}>Search jobs, RFQs, parts...</span>
          <kbd style={{
            fontSize: '10px',
            background: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
            color: 'var(--text-tertiary)'
          }}>⌘K</kbd>
        </button>

        {/* Notifications Icon Button */}
        <button
          onClick={onOpenNotifications}
          style={{
            position: 'relative',
            padding: '8px',
            background: 'white',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Notifications"
        >
          <Bell size={18} color="var(--text-secondary)" />
          {unreadNotificationsCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'var(--accent-red)',
              color: 'white',
              fontSize: '10px',
              fontWeight: 800,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white'
            }}>
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Filter Toggle */}
        {onToggleFilterDrawer && (
          <button
            onClick={onToggleFilterDrawer}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: activeFilterCount > 0 ? '#EFF6FF' : 'white',
              border: `1px solid ${activeFilterCount > 0 ? '#BFDBFE' : 'var(--border-color)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              color: activeFilterCount > 0 ? '#1D4ED8' : 'var(--text-primary)'
            }}
          >
            <Filter size={15} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span style={{
                background: '#1D4ED8',
                color: 'white',
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '10px'
              }}>{activeFilterCount}</span>
            )}
          </button>
        )}

        {/* Permission-Gated Quick Actions Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsActionsOpen(!isActionsOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'var(--text-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
            }}
          >
            <Plus size={16} />
            <span>Quick Action</span>
          </button>

          {isActionsOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                background: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                minWidth: '220px',
                zIndex: 100,
                padding: '6px 0',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseLeave={() => setIsActionsOpen(false)}
            >
              {hasPermission('job.create') && (
                <button
                  onClick={() => { onOpenQuickAction('job'); setIsActionsOpen(false); }}
                  style={{
                    padding: '8px 16px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-color)'}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}
                >
                  <Plus size={14} color="var(--success-green)" />
                  <span>+ Create Job</span>
                </button>
              )}

              {hasPermission('rfq.create') && (
                <button
                  onClick={() => { onOpenQuickAction('rfq'); setIsActionsOpen(false); }}
                  style={{
                    padding: '8px 16px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-color)'}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}
                >
                  <Plus size={14} color="#1976D2" />
                  <span>+ Create RFQ</span>
                </button>
              )}

              <button
                onClick={() => { onOpenFeasibilityCalculator?.(); setIsActionsOpen(false); }}
                style={{
                  padding: '8px 16px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--bg-color)'}
                onMouseOut={e => e.currentTarget.style.background = 'none'}
              >
                <DollarSign size={14} color="var(--accent-red)" />
                <span>RFQ Budget & Hours Calculator</span>
              </button>

              {hasPermission('quotation.create') && (
                <button
                  onClick={() => { onOpenQuickAction('quotation'); setIsActionsOpen(false); }}
                  style={{
                    padding: '8px 16px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-color)'}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}
                >
                  <Plus size={14} color="#7C3AED" />
                  <span>+ Create Quotation</span>
                </button>
              )}

              {hasPermission('revision.create') && (
                <button
                  onClick={() => { onOpenQuickAction('revision'); setIsActionsOpen(false); }}
                  style={{
                    padding: '8px 16px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-color)'}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}
                >
                  <Plus size={14} color="var(--warning-orange)" />
                  <span>+ Create Revision Request</span>
                </button>
              )}

              {hasPermission('design_request.create') && (
                <button
                  onClick={() => { onOpenQuickAction('design'); setIsActionsOpen(false); }}
                  style={{
                    padding: '8px 16px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-color)'}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}
                >
                  <Plus size={14} color="#059669" />
                  <span>+ Create Design Request</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
