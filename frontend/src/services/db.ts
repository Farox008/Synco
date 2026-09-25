import { jobOrderMetrics, jobOrdersExtended, machineFleet } from '@/data/mockData';
import { toolKey, type DesignerTool } from './designerTools';
import { createDesignerWorkflowMocks } from '@/data/designerWorkflowMockData';

const DB_KEY = 'synco_local_db_v5';

export interface DesignFile {
  name: string;
  kind: 'Drawing' | 'BOM';
  url: string;
}

export interface DesignRevision {
  toolId?: string;
  toolName?: string;
  id: string;
  revision: number;
  createdAt: string;
  notes: string;
  files: DesignFile[];
  status: 'Draft' | 'Submitted';
}

export interface LocalDB {
  designerMockVersion?: number;
  jobOrders: any[];
  tools: any[];
  metrics: any[];
  machines: any[];
}

export const dbService = {
  saveDesignRevision: (jobId: string, revision: DesignRevision) => {
    const data = dbService.init();
    const order = data.jobOrders.find(order => order.id === jobId);
    if (!order) throw new Error('The selected job no longer exists.');
    if (!revision.toolId || !(order.tools || []).some((tool: DesignerTool, index: number) => toolKey(tool, index) === revision.toolId)) {
      throw new Error('Select an existing tool before saving designs or a BOM.');
    }
    order.designRevisions = [revision, ...(order.designRevisions || [])];
    dbService.save(data);
  },
  // Initialize the database with mock data if empty
  init: (): LocalDB => {
    if (typeof window === 'undefined') return { jobOrders: [], tools: [], metrics: [], machines: [] };
    
    const stored = localStorage.getItem(DB_KEY);
    if (!stored) {
      const initialStore: LocalDB = {
        jobOrders: [...createDesignerWorkflowMocks(), ...jobOrdersExtended],
        designerMockVersion: 1,
        tools: [], // Initially populated from Excel or Manual creation
        metrics: jobOrderMetrics as any[],
        machines: machineFleet as any[],
      };
      localStorage.setItem(DB_KEY, JSON.stringify(initialStore));
      return initialStore;
    }
    const parsed = JSON.parse(stored);
    // Ensure legacy DBs get machines collection
    if (!parsed.machines) parsed.machines = machineFleet;
    if (!parsed.designerMockVersion) {
      const existingIds = new Set((parsed.jobOrders || []).map((order: { id: string }) => order.id));
      parsed.jobOrders = [...createDesignerWorkflowMocks().filter(order => !existingIds.has(order.id)), ...(parsed.jobOrders || [])];
      parsed.designerMockVersion = 1;
      localStorage.setItem(DB_KEY, JSON.stringify(parsed));
    }
    return parsed;
  },

  // Save the entire state to localStorage
  save: (data: LocalDB) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
      window.dispatchEvent(new Event('synco_db_update'));
    }
  },

  // CRUD for Job Orders
  getJobOrders: (): any[] => {
    const data = dbService.init();
    return data.jobOrders;
  },

  addJobOrder: (order: any) => {
    const data = dbService.init();
    const existing = data.jobOrders.find(o => o.id === order.id);
    order = { ...order, createdAt: existing?.createdAt || order.createdAt || order.created_at || new Date().toISOString() };
    // Prevent duplicate IDs by removing existing order with same id first
    data.jobOrders = [order, ...data.jobOrders.filter(o => o.id !== order.id)];
    dbService.save(data);
  },

  deleteJobOrder: (id: string) => {
    const data = dbService.init();
    data.jobOrders = data.jobOrders.filter(o => o.id !== id);
    dbService.save(data);
  },

  updateJobOrder: (id: string, updates: any) => {
    const data = dbService.init();
    data.jobOrders = data.jobOrders.map(o => o.id === id ? { ...o, ...updates } : o);
    dbService.save(data);
  },

  // CRUD for Machines
  getMachines: (): any[] => {
    const data = dbService.init();
    return data.machines;
  },

  addMachine: (machine: any) => {
    const data = dbService.init();
    data.machines = [machine, ...data.machines.filter(m => m.id !== machine.id)];
    dbService.save(data);
  },

  updateMachine: (id: string, updates: any) => {
    const data = dbService.init();
    data.machines = data.machines.map(m => m.id === id ? { ...m, ...updates } : m);
    dbService.save(data);
  },

  // Get single Job Order by ID
  getJobOrderById: (id: string) => {
    const data = dbService.init();
    return data.jobOrders.find(o => o.id === id);
  },

  // Clear all data and reset to initial state
  clearAll: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DB_KEY);
      return dbService.init();
    }
    return { jobOrders: [], tools: [], metrics: [], machines: [] };
  }
};
