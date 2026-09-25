"use client";

import React from 'react';
import { Truck } from 'lucide-react';
// UI Atoms & Layout Components
import { KPIGrid, ToolStatusBreakdown } from '@/components/dashboard/QuickStats';
import { ToolProcessMonitor } from '@/components/dashboard/ToolProcessMonitor';
import { JobOrderList } from '@/components/dashboard/JobOrderList';
import { DelayedJobsCard } from '@/components/dashboard/DelayedJobsCard';
import { DelayTimelineCard } from '@/components/dashboard/DelayTimelineCard';
import { RecentPurchasesCard } from '@/components/dashboard/RecentPurchasesCard';
import { FleetStatus, AuditLog } from '@/components/dashboard/SidebarModules';
import { ProductionChartCard, RecentJobsTable } from '@/components/dashboard/DataModules';
import { Header } from '@/components/dashboard/Header';
import { 
  productionStats, recentTools, 
  activeTools, machineFleet, auditLogs, toolStatusBreakdown,
  delayedTools, delaySummary, recentPurchases
} from '@/data/mockData';

import { useDatabase } from '@/context/DatabaseContext';



export default function Dashboard() {
  const { data } = useDatabase();

  
  // Dynamic metrics based on database
  const activeJobOrders = data.jobOrders.filter(o => o.status === 'Running' || o.status === 'Material Shortage');
  const completedJobOrders = data.jobOrders.filter(o => o.status === 'Completed');
  
  const dynamicKpiMetrics: React.ComponentProps<typeof KPIGrid>['metrics'] = [
    { title: 'Total Production', value: data.jobOrders.length.toString(), sub: '+2.34% ↗', trend: 'up' },
    { title: 'Completed Tools', value: completedJobOrders.length.toString(), sub: '-0.73% ↘', trend: 'down' },
    { title: 'Active Orders', value: activeJobOrders.length.toString(), sub: '-1.34% ↘', trend: 'down' },
    { title: 'Delay Alerts', value: '3', sub: '+3.89% ↗', trend: 'up' },
  ];


  return (
    <>
      <Header 
        title="Dashboard" 
        tabs={[
          { label: 'Production', icon: <Truck size={16} />, active: true },
        ]}
      />

      <div className="content-scroll">
        {/* Main Content (Left + Middle) */}
        <div className="main-columns">
          {/* Top Row: KPIs + Production Statistics */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'stretch' }}>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
              <KPIGrid metrics={dynamicKpiMetrics} />
            </div>
            <div style={{ flex: '1.5', display: 'flex' }}>
              <ProductionChartCard data={productionStats} />
            </div>
          </div>

          {/* Row 2: Status Breakdown */}
          <ToolStatusBreakdown 
            data={toolStatusBreakdown} 
            total={toolStatusBreakdown.reduce((acc, curr) => acc + curr.value, 0)} 
          />

          {/* Tool Matrix (Process Monitor) */}
          <ToolProcessMonitor tools={activeTools} />

          {/* Row 4: Job Order Progress + Delayed Tools (Combined Row) */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ flex: 1.5 }}>
              <JobOrderList orders={data.jobOrders.slice(0, 10)} />
            </div>
            <div style={{ flex: 1 }}>
              <DelayedJobsCard tools={delayedTools} />
            </div>
          </div>

          {/* Recent Tools Table */}
          <RecentJobsTable tools={recentTools} />

          {/* Timeline Awareness (Moved to bottom) */}
          <DelayTimelineCard summary={delaySummary} />
        </div>

        {/* Side Panel (Right) */}
        <div className="side-column">
          <FleetStatus machines={machineFleet} />
          <RecentPurchasesCard purchases={recentPurchases} />
          <AuditLog logs={auditLogs} />
        </div>
      </div>
    </>
  );
}
