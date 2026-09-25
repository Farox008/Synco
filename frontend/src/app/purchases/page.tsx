"use client";

import React, { useState, useMemo } from 'react';
import { ShoppingCart, Upload } from 'lucide-react';
import { useDatabase } from '@/context/DatabaseContext';
import { Header } from '@/components/dashboard/Header';
import { DesignSubmissions } from '@/components/designer/DesignWorkspace';
import { Modal } from '@/components/ui/Modal';
import { ExcelImportManager } from '@/components/job-orders/ExcelImportManager';
import { buildJobOrderFromImport, BomImportPayload, mapPurchaseStatusToMaterial, buildPurchasesFromJobs } from '@/services/bomImport';
import { 
  PurchaseStats, 
  PurchaseFilterBar, 
  PurchaseJobOrderTable,
  PurchaseMetric,
  ProcurementWO,
  Material
} from '@/components/purchases/PurchaseModules';

export default function PurchasesPage() {
  const { data, addJobOrder } = useDatabase();
  const rawJobOrders = data.jobOrders || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const handleBomImport = (payload: BomImportPayload) => {
    if (!payload?.tools?.length) return;
    addJobOrder(buildJobOrderFromImport(payload));
    setIsImportOpen(false);
  };

  // Map work-order purchase records into the procurement dashboard view.
  const procurementData: ProcurementWO[] = useMemo(() => {
    return rawJobOrders.map((wo: any) => {
      const purchaseSource = wo.purchases?.length
        ? wo.purchases
        : (wo.tools?.length ? buildPurchasesFromJobs(wo.tools, wo.id) : []);

      const materials: Material[] = purchaseSource.map((p: any, idx: number) => {
        const status = mapPurchaseStatusToMaterial(p.status);
        const reqQty = Number(p.qty) || 10 + (idx * 5);
        let ordQty = reqQty;
        let recQty = 0;

        if (status === 'Arrived') recQty = reqQty;
        if (status === 'Not Ordered') ordQty = 0;
        if (status === 'Partial Arrival') recQty = Math.floor(reqQty / 2);

        return {
          id: p.id || `MAT-${wo.id}-${idx}`,
          name: p.name || p.item || 'Generic Material',
          specs: p.specs || '-',
          vendor: p.final || p.vendor || p.suggested || 'Unknown Supplier',
          reqQty,
          ordQty,
          recQty,
          eta: p.date || p.eta || 'TBD',
          status,
        };
      });

      return {
        id: wo.id,
        customer: wo.customer || 'Unknown Customer',
        dueDate: wo.dueDate || 'TBD',
        materials,
      };
    }).filter(wo => wo.materials.length > 0);
  }, [rawJobOrders]);

  // Compute KPIs
  const metrics = useMemo(() => {
    const totalMaterials = procurementData.reduce((sum, wo) => sum + wo.materials.length, 0);
    const counts = {
      pending: 0,
      delayed: 0,
      arrived: 0,
      notOrdered: 0,
      partial: 0
    };

    procurementData.forEach(wo => {
      wo.materials.forEach(m => {
        if (m.status === 'Pending') counts.pending++;
        if (m.status === 'Delayed') counts.delayed++;
        if (m.status === 'Arrived') counts.arrived++;
        if (m.status === 'Not Ordered') counts.notOrdered++;
        if (m.status === 'Partial Arrival') counts.partial++;
      });
    });

    const kpis: PurchaseMetric[] = [
      { id: 'All', title: 'Total Purchase Orders', value: totalMaterials, color: 'var(--text-primary)' },
      { id: 'Pending', title: 'Pending', value: counts.pending, total: totalMaterials, color: '#F59E0B' },
      { id: 'Delayed', title: 'Delayed', value: counts.delayed, total: totalMaterials, color: 'var(--accent-red)' },
      { id: 'Arrived', title: 'Arrived', value: counts.arrived, total: totalMaterials, color: 'var(--success-green)' },
      { id: 'Not Ordered', title: 'Not Ordered', value: counts.notOrdered, total: totalMaterials, color: 'var(--text-tertiary)' },
      { id: 'Partial Arrival', title: 'Partially Arrived', value: counts.partial, total: totalMaterials, color: '#3B82F6' }
    ];

    return kpis;
  }, [procurementData]);

  // Filtering Logic
  const filteredJobOrders = useMemo(() => {
    return procurementData.filter(wo => {
      // Text Search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        wo.id.toLowerCase().includes(searchLower) ||
        wo.customer.toLowerCase().includes(searchLower) ||
        wo.materials.some(m => m.name.toLowerCase().includes(searchLower) || m.id.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // KPI / Status Badge Filter
      if (activeFilter && activeFilter !== 'All') {
        const hasMatchingMaterial = wo.materials.some(m => m.status === activeFilter);
        if (!hasMatchingMaterial) return false;
      }

      return true;
    });
  }, [procurementData, searchTerm, activeFilter]);

  const handleFilterClick = (id: string | null) => {
    setActiveFilter(id);
  };

  const handleMaterialFilter = (status: string) => {
    // If clicking a badge for a status that's already active, clear it
    setActiveFilter(activeFilter === status ? null : status);
  };

  return (
    <>
      <Header 
        title="Procurement Dashboard" 
        tabs={[
          { label: 'Purchasing Overview', icon: <ShoppingCart size={16} />, active: true }
        ]}
      />

      <div className="content-scroll" style={{ flexDirection: 'column', gap: '0px', padding: '0 32px 32px 32px' }}>
        <div className="my-6"><DesignSubmissions purchaser /></div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button
            className="header-tab"
            style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', gap: '8px' }}
            onClick={() => setIsImportOpen(true)}
          >
            <Upload size={16} /> Import BOM (Excel / PDF)
          </button>
        </div>

        <div style={{ marginTop: '24px' }}>
          <PurchaseStats 
            metrics={metrics} 
            activeFilter={activeFilter} 
            onFilterClick={handleFilterClick} 
          />
        </div>

        <PurchaseFilterBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />
        
        <PurchaseJobOrderTable 
          jobOrders={filteredJobOrders} 
          activeFilter={activeFilter}
          onMaterialFilter={handleMaterialFilter}
        />
      </div>

      <Modal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Import BOM & Update Procurement"
        width="760px"
      >
        <ExcelImportManager
          onImport={handleBomImport}
          onCancel={() => setIsImportOpen(false)}
        />
      </Modal>
    </>
  );
}
