"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  OperationManagerService, 
  KpiData, 
  AttentionItem, 
  ActiveJob, 
  ScheduleItem, 
  WorkloadItem, 
  ActivityItem, 
  NotificationItem 
} from '@/services/operation-manager.service';
import { DashboardHeader } from '@/components/operation-manager/DashboardHeader';
import { KPIGrid } from '@/components/operation-manager/KPIGrid';
import { AttentionRequired } from '@/components/operation-manager/AttentionRequired';
import { ActiveJobsTable } from '@/components/operation-manager/ActiveJobsTable';
import { ScheduleOverview } from '@/components/operation-manager/ScheduleOverview';
import { WorkflowOverview } from '@/components/operation-manager/WorkflowOverview';
import { WorkloadOverview } from '@/components/operation-manager/WorkloadOverview';
import { RecentActivity } from '@/components/operation-manager/RecentActivity';
import { QuickActionsModal } from '@/components/operation-manager/QuickActionsModal';
import { GlobalSearchModal } from '@/components/operation-manager/GlobalSearchModal';
import { NotificationDrawer } from '@/components/operation-manager/NotificationDrawer';
import { ShieldAlert, RefreshCw, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import RfqBudgetAllocationPanel from '@/components/rfq/RfqBudgetAllocationPanel';

export default function OperationManagerDashboard() {
  const { hasPermission, role } = usePermissions();
  const router = useRouter();

  // State
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [workflowDist, setWorkflowDist] = useState<Record<string, number>>({});
  const [workload, setWorkload] = useState<WorkloadItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals & Drawers
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFeasibilityModalOpen, setIsFeasibilityModalOpen] = useState(false);
  const [quickActionType, setQuickActionType] = useState<'job' | 'rfq' | 'quotation' | 'revision' | 'design' | null>(null);
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('');

  // Status
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        kpiData,
        attentionData,
        jobsData,
        scheduleData,
        workflowData,
        workloadData,
        activityData,
        notificationData
      ] = await Promise.all([
        OperationManagerService.getKpis(),
        OperationManagerService.getAttentionRequired(),
        OperationManagerService.getActiveJobs(),
        OperationManagerService.getScheduleOverview(),
        OperationManagerService.getWorkflowDistribution(),
        OperationManagerService.getWorkload(),
        OperationManagerService.getRecentActivity(),
        OperationManagerService.getNotifications()
      ]);

      setKpis(kpiData);
      setAttentionItems(attentionData);
      setActiveJobs(jobsData);
      setScheduleItems(scheduleData);
      setWorkflowDist(workflowData);
      setWorkload(workloadData);
      setActivities(activityData);
      setNotifications(notificationData);
    } catch (err) {
      console.error('Failed to load operational dashboard data:', err);
      setError('Unable to load operational data. Please check connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Keyboard shortcut ⌘K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Permission Gate
  if (!hasPermission('dashboard.view') && role !== 'Operation Manager' && role !== 'Super Admin') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-color)', maxWidth: '400px' }}>
          <ShieldAlert size={54} color="var(--accent-red)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Access Restricted
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            You do not have permission to access the Operation Manager control tower.
          </p>
        </div>
      </div>
    );
  }

  // Loading Skeleton State
  if (isLoading && !kpis) {
    return (
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ height: '110px', background: '#e2e8f0', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
        <div style={{ height: '180px', background: '#e2e8f0', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: '350px', background: '#e2e8f0', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />
      </div>
    );
  }

  // Error State with Retry
  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '60vh' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {error}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          An error occurred while aggregating operational records.
        </p>
        <button
          onClick={loadDashboardData}
          style={{
            padding: '8px 24px',
            background: 'var(--text-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* 1. Header with Global Search, Notifications, Quick Actions */}
      <DashboardHeader
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenQuickAction={type => setQuickActionType(type)}
        onOpenFeasibilityCalculator={() => setIsFeasibilityModalOpen(true)}
        unreadNotificationsCount={unreadNotifications}
      />

      {/* 2. Main Dashboard Content */}
      <div className="content-scroll" style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>

          {/* KPI Grid (Active, RFQs, Quotations, Overdue, Revisions, Due Soon) */}
          {kpis && (
            <KPIGrid 
              data={kpis} 
              onFilterClick={(type, val) => {
                if (type === 'status' && val === 'OVERDUE') {
                  // scroll to attention required
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }
              }}
            />
          )}

          {/* Attention Required Section */}
          <AttentionRequired
            items={attentionItems}
            onActionClick={item => {
              if (item.link) {
                router.push(item.link);
              }
            }}
          />

          {/* Two-Column Operational Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '24px', alignItems: 'start' }}>
            {/* Left Column: Active Jobs Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <ActiveJobsTable
                jobs={activeJobs}
                selectedStageFilter={selectedStageFilter}
                onClearStageFilter={() => setSelectedStageFilter('')}
                onViewJob={jobNo => router.push(`/job-orders/${jobNo}`)}
              />

              {/* Recent Activity Stream */}
              <RecentActivity activities={activities} />
            </div>

            {/* Right Column: Schedule, Stage Distribution & Department Workload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Timeline / Upcoming Deadlines */}
              <ScheduleOverview
                items={scheduleItems}
                onViewJob={jobNo => router.push(`/job-orders/${jobNo}`)}
              />

              {/* Stage Workflow Distribution */}
              <WorkflowOverview
                distribution={workflowDist}
                selectedStage={selectedStageFilter}
                onSelectStage={stage => setSelectedStageFilter(stage)}
              />

              {/* Department Workload Overview */}
              <WorkloadOverview workload={workload} />
            </div>
          </div>

        </div>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        jobs={activeJobs}
        onSelectResult={(type, id) => {
          if (type === 'job') router.push(`/job-orders/${id}`);
          else if (type === 'rfq') router.push('/rfqs');
          else if (type === 'quotation') router.push('/quotations');
        }}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
      />

      {/* Quick Action Modal Dialogs */}
      <QuickActionsModal
        isOpen={quickActionType !== null}
        actionType={quickActionType}
        onClose={() => setQuickActionType(null)}
        onSuccess={loadDashboardData}
      />

      {/* RFQ Feasibility Budget Allocation & Hours Modal */}
      {isFeasibilityModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '24px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-color)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: '#F8FAFC'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  RFQ Feasibility & Budget Allocation Calculator
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Standalone Operation Manager manufacturing capacity and budget screening
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsFeasibilityModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <RfqBudgetAllocationPanel
                initialBudget={10000}
                onApplyToEstimates={() => {
                  setIsFeasibilityModalOpen(false);
                  router.push('/rfqs');
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
