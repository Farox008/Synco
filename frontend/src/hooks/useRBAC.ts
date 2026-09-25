import { useAuth } from '@/context/AuthContext';

export type Role =
  | 'Super Admin'
  | 'System Administrator'
  | 'HR'
  | 'Accounts'
  | 'Design Manager'
  | 'Designer'
  | 'Purchase Manager'
  | 'Purchase Executive'
  | 'Planning Manager'
  | 'Production Planner'
  | 'Store Manager'
  | 'Store Keeper'
  | 'Production Manager'
  | 'Production Supervisor'
  | 'Milling Supervisor'
  | 'Manual Milling Operator'
  | 'CNC Milling Operator'
  | 'CNC Machining Operator'
  | 'Wire EDM Operator'
  | 'Grinding Supervisor'
  | 'Manual Grinding Operator'
  | 'Polishing Operator'
  | 'Finishing Operator'
  | 'Assembly Supervisor'
  | 'Assembly Operator'
  | 'QI Manager'
  | 'QI Inspector'
  | 'Dispatch Executive'
  | 'Operation Manager';

// Define which roles can read/edit which modules based on the specification
const MODULE_PERMISSIONS = {
  jobOrders: {
    edit: ['Super Admin', 'System Administrator', 'Design Manager', 'Designer', 'Planning Manager', 'Production Planner', 'Operation Manager'],
    read: ['Super Admin', 'System Administrator', 'Design Manager', 'Designer', 'Planning Manager', 'Production Planner', 'Production Manager', 'Production Supervisor', 'Operation Manager']
  },
  tools: {
    edit: ['Super Admin', 'System Administrator', 'Design Manager', 'Designer'],
    read: ['Super Admin', 'System Administrator', 'Design Manager', 'Designer', 'Planning Manager', 'Production Planner', 'Production Manager', 'Production Supervisor', 'QI Manager', 'QI Inspector', 'Operation Manager']
  },
  bom: {
    edit: ['Super Admin', 'System Administrator', 'Design Manager', 'Designer'],
    read: ['Super Admin', 'System Administrator', 'Design Manager', 'Designer', 'Planning Manager', 'Production Planner', 'Purchase Manager', 'Purchase Executive', 'Operation Manager']
  },
  inventory: {
    edit: ['Super Admin', 'System Administrator', 'Store Manager', 'Store Keeper', 'Purchase Manager', 'Purchase Executive'],
    read: ['Super Admin', 'System Administrator', 'Store Manager', 'Store Keeper', 'Purchase Manager', 'Purchase Executive', 'Planning Manager', 'Production Planner', 'Production Manager', 'Operation Manager']
  },
  purchases: {
    edit: ['Super Admin', 'System Administrator', 'Purchase Manager', 'Purchase Executive', 'Operation Manager'],
    read: ['Super Admin', 'System Administrator', 'Purchase Manager', 'Purchase Executive', 'Operation Manager']
  },
  planning: {
    edit: ['Super Admin', 'System Administrator', 'Planning Manager', 'Production Planner', 'Operation Manager'],
    read: ['Super Admin', 'System Administrator', 'Planning Manager', 'Production Planner', 'Production Manager', 'Operation Manager']
  },
  productionQueue: {
    edit: ['Super Admin', 'System Administrator', 'Production Manager', 'Production Supervisor', 'Milling Supervisor', 'Grinding Supervisor', 'Assembly Supervisor', 'CNC Milling Operator', 'Manual Milling Operator', 'CNC Machining Operator', 'Wire EDM Operator', 'Manual Grinding Operator', 'Polishing Operator', 'Finishing Operator', 'Assembly Operator'],
    read: ['Super Admin', 'System Administrator', 'Production Manager', 'Production Supervisor', 'Milling Supervisor', 'Grinding Supervisor', 'Assembly Supervisor', 'CNC Milling Operator', 'Manual Milling Operator', 'CNC Machining Operator', 'Wire EDM Operator', 'Manual Grinding Operator', 'Polishing Operator', 'Finishing Operator', 'Assembly Operator', 'Planning Manager', 'Production Planner', 'Operation Manager']
  },
  quality: {
    edit: ['Super Admin', 'System Administrator', 'QI Manager', 'QI Inspector'],
    read: ['Super Admin', 'System Administrator', 'QI Manager', 'QI Inspector', 'Production Manager', 'Production Supervisor', 'Planning Manager', 'Operation Manager']
  },
  dispatch: {
    edit: ['Super Admin', 'System Administrator', 'Dispatch Executive'],
    read: ['Super Admin', 'System Administrator', 'Dispatch Executive', 'Production Manager', 'Operation Manager']
  },
  reports: {
    edit: ['Super Admin', 'System Administrator', 'Planning Manager', 'Production Manager', 'Operation Manager'],
    read: ['Super Admin', 'System Administrator', 'Planning Manager', 'Production Manager', 'Design Manager', 'Purchase Manager', 'QI Manager', 'Designer', 'Operation Manager']
  },
  userManagement: {
    edit: ['Super Admin', 'System Administrator', 'HR'],
    read: ['Super Admin', 'System Administrator', 'HR']
  },
  drawings: {
    edit: ['Super Admin', 'System Administrator', 'Design Manager', 'Designer'],
    read: ['Super Admin', 'System Administrator', 'Design Manager', 'Designer', 'Planning Manager', 'Production Manager']
  },
  customers: {
    edit: ['Super Admin', 'System Administrator'],
    read: ['Super Admin', 'System Administrator', 'Design Manager', 'Designer', 'Planning Manager', 'Production Manager']
  },
  notifications: {
    edit: ['Super Admin', 'System Administrator', 'Design Manager', 'Designer', 'Planning Manager', 'Production Manager', 'Store Manager', 'Store Keeper', 'Purchase Manager', 'Purchase Executive'],
    read: ['Super Admin', 'System Administrator', 'Design Manager', 'Designer', 'Planning Manager', 'Production Manager', 'Store Manager', 'Store Keeper', 'Purchase Manager', 'Purchase Executive']
  }
};

export const useRBAC = () => {
  const { user } = useAuth();
  const role = (user?.role as Role) || null;

  const isSuperAdmin = role === 'Super Admin' || role === 'System Administrator';

  const canRead = (module: keyof typeof MODULE_PERMISSIONS) => {
    if (isSuperAdmin) return true;
    if (!role) return false;
    return MODULE_PERMISSIONS[module]?.read.includes(role) || MODULE_PERMISSIONS[module]?.edit.includes(role) || false;
  };

  const canEdit = (module: keyof typeof MODULE_PERMISSIONS) => {
    if (isSuperAdmin) return true;
    if (!role) return false;
    return MODULE_PERMISSIONS[module]?.edit.includes(role) || false;
  };

  return { role, isSuperAdmin, canRead, canEdit };
};
