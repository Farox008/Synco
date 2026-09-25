"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/context/AuthContext';
import { dbService } from '@/services/db';
import type { DesignRevision } from '@/services/db';

interface LocalDB {
  jobOrders: any[];
  tools: any[];
  metrics: any[];
  machines: any[];
}

interface DatabaseContextType {
  saveDesignRevision: (jobId: string, revision: DesignRevision) => void;
  data: LocalDB;
  isMounted: boolean;
  addJobOrder: (order: any) => void;
  updateJobOrder: (id: string, updates: any) => void;
  getJobOrderById: (id: string) => any | undefined;
  getAllJobs: () => any[];
  getJobById: (id: string) => any | undefined;
  deleteJobOrder: (id: string) => void;
  addMachine: (machine: any) => void;
  updateMachine: (id: string, updates: any) => void;
  getAllPurchases: () => any[];
  clearDatabase: () => void;
  refreshJobOrders: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<LocalDB>({ jobOrders: [], tools: [], metrics: [], machines: [] });
  const [isMounted, setIsMounted] = useState(false);

  const normalizeData = (rawData: any) => {
    const normalizedJobOrders = (rawData.workOrders || []).map((wo: any) => ({
      ...wo,
      tools: wo.jobs,
      headerMetadata: Array.isArray(wo.metadata)
        ? Object.fromEntries(wo.metadata.map((m: any) => [m.metaKey, m.metaValue]))
        : (wo.headerMetadata || {}),
    }));
    return { ...rawData, jobOrders: normalizedJobOrders };
  };

  const refreshJobOrders = () => {
    const freshData = dbService.init();
    setData(freshData);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const initial = dbService.init();
        setData(initial);
      } catch (error) {
        console.error('Failed to load local DB data:', error);
      } finally {
        setIsMounted(true);
      }
    };
    loadData();

    const handleUpdate = () => {
      refreshJobOrders();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('synco_db_update', handleUpdate);
      window.addEventListener('storage', handleUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('synco_db_update', handleUpdate);
        window.removeEventListener('storage', handleUpdate);
      }
    };
  }, []);

  const addJobOrder = async (order: any) => {
    try {
      // Add to persistent dbService
      dbService.addJobOrder(order);
      const savedOrder = dbService.getJobOrderById(order.id);
      // Optimistically update local state to preserve UI fields
      setData(prev => ({
        ...prev,
        jobOrders: [savedOrder, ...prev.jobOrders.filter(o => o.id !== order.id)]
      }));
      // Map tools back to jobs for backend
      const payload = { ...order, jobs: order.tools };
      await api.post('/work-orders', payload).catch(console.warn);
    } catch (e) {
      console.error(e);
    }
  };

  const updateJobOrder = async (id: string, updates: any) => {
    try {
      dbService.updateJobOrder(id, updates);
      // Optimistically update local state
      setData(prev => ({
        ...prev,
        jobOrders: prev.jobOrders.map(o => o.id === id ? { ...o, ...updates } : o)
      }));
      // Map tools back to jobs for backend
      const payload = { ...updates, jobs: updates.tools };
      await api.put(`/work-orders/${id}`, payload).catch(console.warn);
    } catch (e) {
      console.error(e);
    }
  };

  const getJobOrderById = (id: string) => {
    return data.jobOrders.find(o => o.id === id);
  };

  const getAllJobs = () => {
    const allJobs: any[] = [];
    (data.jobOrders || []).forEach(order => {
      if (order.tools) {
        order.tools.forEach((tool: any) => {
          allJobs.push({
            ...tool,
            id: tool.partNo || tool.id,
            name: tool.partName || tool.name,
            parentJobOrder: order.id,
            customer: order.customer,
            priority: order.priority,
            dueDate: order.dueDate
          });
        });
      }
    });
    return allJobs;
  };

  const getJobById = (id: string) => {
    for (const order of (data.jobOrders || [])) {
      if (order.tools) {
        const found = order.tools.find((j: any) => j.id === id);
        if (found) return { 
          ...found, 
          parentJobOrder: order.id, 
          customer: order.customer,
          priority: order.priority,
          dueDate: order.dueDate,
          headerMetadata: order.headerMetadata
        };
      }
    }
    return undefined;
  };

  const getAllPurchases = () => {
    const allPurchases: any[] = [];
    (data.jobOrders || []).forEach(order => {
      if (order.purchases) {
        order.purchases.forEach((p: any) => {
          allPurchases.push({
            ...p,
            jobOrderId: order.id,
            customer: order.customer
          });
        });
      }
    });
    return allPurchases;
  };

  const deleteJobOrder = async (id: string) => {
    try {
      await api.delete(`/work-orders/${id}`);
      const res = await api.get('/data/init');
      setData(normalizeData(res.data));
    } catch (e) {
      console.error(e);
    }
  };

  const addMachine = async (machine: any) => {
    try {
      await api.post('/machines', machine);
      const res = await api.get('/data/init');
      setData(normalizeData(res.data));
    } catch (e) {
      console.error(e);
    }
  };

  const updateMachine = async (id: string, updates: any) => {
    try {
      await api.put(`/machines/${id}`, updates);
      const res = await api.get('/data/init');
      setData(normalizeData(res.data));
    } catch (e) {
      console.error(e);
    }
  };

  const clearDatabase = () => {
    console.warn('Clear database is disabled in production DB mode.');
  };

  return (
    <DatabaseContext.Provider value={{ 
      saveDesignRevision: (jobId, revision) => { dbService.saveDesignRevision(jobId, revision); refreshJobOrders(); },
      data, 
      isMounted,
      addJobOrder, 
      updateJobOrder, 
      getJobOrderById, 
      getAllJobs,
      getJobById,
      deleteJobOrder,
      addMachine,
      updateMachine,
      getAllPurchases,
      clearDatabase,
      refreshJobOrders
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
