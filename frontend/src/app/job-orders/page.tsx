"use client";

import React, { useState } from 'react';
import { Package, Filter, Download, PlusSquare, Trash2 } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { JobOrderStats, FilterBar, JobOrderTable } from '@/components/job-orders/JobOrderModules';
import { Modal } from '@/components/ui/Modal';
import { JobOrderForm } from '@/components/job-orders/JobOrderForm';
import { ExcelImportManager } from '@/components/job-orders/ExcelImportManager';
import { buildJobOrderFromImport, BomImportPayload } from '@/services/bomImport';

import { useDatabase } from '@/context/DatabaseContext';

export default function JobOrdersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { data, addJobOrder, clearDatabase, isMounted } = useDatabase();
  const orders = data.jobOrders;

  if (!isMounted) return null;

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete all job orders and reset to initial data?")) {
      clearDatabase();
    }
  };

  const handleNewOrder = (formData: any) => {
    const newOrder = {
      ...formData,
      customer: formData.customerName || 'New Customer',
      name: formData.projectName || 'Untitled Project',
      progress: 0,
      items: '0/10', // Defaulting for the demo
      status: 'Pending',
      activeJob: 'None'
    };
    addJobOrder(newOrder);
    setIsFormOpen(false);
  };

  const handleExcelImport = (payload: BomImportPayload) => {
    if (!payload || !payload.tools || payload.tools.length === 0) return;
    addJobOrder(buildJobOrderFromImport(payload));
    setIsImportOpen(false);
  };

  return (
    <>
      <Header 
        title="Job Orders" 
        tabs={[
          { label: 'All Orders', icon: <Package size={16} />, active: true },
          { label: 'Pending Material', icon: <Filter size={16} /> },
        ]}
      />

      <div className="content-scroll" style={{ flexDirection: 'column', gap: '0px', padding: '24px 32px 32px 32px' }}>


        {/* Stats Row */}
        <div style={{ padding: '0 0 24px 0' }}>
          <JobOrderStats metrics={data.metrics as any} />
        </div>

        {/* Table & Filtering */}
        <FilterBar 
          onNewJobOrder={() => setIsFormOpen(true)} 
          onUploadExcel={() => setIsImportOpen(true)} 
        />
        <JobOrderTable orders={orders as any} />
      </div>

      {/* Manual Creation Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title="Create New Job Order"
        width="800px"
      >
        <JobOrderForm 
          onSubmit={handleNewOrder} 
          onCancel={() => setIsFormOpen(false)} 
        />
      </Modal>

      {/* Excel Import Modal */}
      <Modal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        title="Import Job Orders & Procurement from a Data File"
        width="700px"
      >
        <ExcelImportManager 
          onImport={handleExcelImport} 
          onCancel={() => setIsImportOpen(false)} 
        />
      </Modal>
    </>
  );
}
