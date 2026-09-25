import { useAuth } from '@/context/AuthContext';
import { Role } from './useRBAC';

// Define all granular permissions requested by Synco specification
export type GranularPermission =
  // Dashboard
  | 'dashboard.view'
  // Job
  | 'job.view'
  | 'job.create'
  | 'job.edit'
  | 'job.delete'
  | 'job.assign'
  | 'job.approve'
  | 'job.change_priority'
  | 'job.change_deadline'
  // RFQ
  | 'rfq.view'
  | 'rfq.create'
  | 'rfq.edit'
  | 'rfq.delete'
  | 'rfq.assess'
  | 'rfq.accept'
  | 'rfq.accept_conditionally'
  | 'rfq.hold'
  | 'rfq.reject'
  | 'rfq.edit_budget'
  | 'rfq.edit_timeline'
  | 'rfq.edit_estimates'
  | 'rfq.upload_document'
  | 'rfq.view_history'
  | 'rfq.approve'
  // Quotation
  | 'quotation.view'
  | 'quotation.create'
  | 'quotation.edit'
  | 'quotation.approve'
  // Design Request
  | 'design_request.view'
  | 'design_request.create'
  | 'design_request.edit'
  // Revision
  | 'revision.view'
  | 'revision.create'
  | 'revision.assign'
  | 'revision.approve'
  | 'revision.reject'
  // Planning & Timeline
  | 'planning.view'
  | 'planning.create'
  | 'planning.edit'
  | 'timeline.view'
  | 'timeline.create'
  | 'timeline.edit'
  // Document
  | 'document.view'
  | 'document.upload'
  // Report
  | 'report.view'
  // User
  | 'user.view'
  | 'user.create'
  | 'user.edit';

const ROLE_PERMISSIONS: Partial<Record<Role, GranularPermission[]>> = {
  'Super Admin': [
    'dashboard.view',
    'job.view', 'job.create', 'job.edit', 'job.delete', 'job.assign', 'job.approve', 'job.change_priority', 'job.change_deadline',
    'rfq.view', 'rfq.create', 'rfq.edit', 'rfq.delete', 'rfq.assess', 'rfq.accept', 'rfq.accept_conditionally', 'rfq.hold', 'rfq.reject', 'rfq.edit_budget', 'rfq.edit_timeline', 'rfq.edit_estimates', 'rfq.upload_document', 'rfq.view_history', 'rfq.approve',
    'quotation.view', 'quotation.create', 'quotation.edit', 'quotation.approve',
    'design_request.view', 'design_request.create', 'design_request.edit',
    'revision.view', 'revision.create', 'revision.assign', 'revision.approve', 'revision.reject',
    'planning.view', 'planning.create', 'planning.edit',
    'timeline.view', 'timeline.create', 'timeline.edit',
    'document.view', 'document.upload',
    'report.view',
    'user.view', 'user.create', 'user.edit'
  ],
  'Operation Manager': [
    'dashboard.view',
    'job.view', 'job.create', 'job.edit', 'job.assign', 'job.change_priority', 'job.change_deadline',
    'rfq.view', 'rfq.create', 'rfq.edit', 'rfq.delete', 'rfq.assess', 'rfq.accept', 'rfq.accept_conditionally', 'rfq.hold', 'rfq.reject', 'rfq.edit_budget', 'rfq.edit_timeline', 'rfq.edit_estimates', 'rfq.upload_document', 'rfq.view_history', 'rfq.approve',
    'quotation.view', 'quotation.create', 'quotation.edit', 'quotation.approve',
    'design_request.view', 'design_request.create', 'design_request.edit',
    'revision.view', 'revision.create', 'revision.assign', 'revision.approve', 'revision.reject',
    'planning.view', 'planning.create', 'planning.edit',
    'timeline.view', 'timeline.create', 'timeline.edit',
    'document.view', 'document.upload',
    'report.view'
  ],
  'Design Manager': [
    'dashboard.view',
    'job.view',
    'design_request.view', 'design_request.edit',
    'revision.view', 'revision.approve', 'revision.reject',
    'document.view', 'document.upload'
  ]
};

export const usePermissions = () => {
  const { user } = useAuth();
  const role = (user?.role as Role) || null;

  const hasPermission = (permission: GranularPermission): boolean => {
    if (!role) return false;
    if (role === 'Super Admin') return true;
    if (role === 'System Administrator') return true;

    const allowedPermissions = ROLE_PERMISSIONS[role] || [];
    return allowedPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: GranularPermission[]): boolean => {
    return permissions.some(hasPermission);
  };

  const hasAllPermissions = (permissions: GranularPermission[]): boolean => {
    return permissions.every(hasPermission);
  };

  return { hasPermission, hasAnyPermission, hasAllPermissions, role };
};
