import type { DesignRevision } from './db';

export interface DesignerTool {
  id?: string;
  partNo?: string;
  partNumber?: string;
  name?: string;
  partName?: string;
  qty?: string | number;
  material?: string;
  status?: string;
  designer?: string;
}

export function toolKey(tool: DesignerTool, index: number): string {
  return tool.id || tool.partNo || tool.partNumber || `tool-${index + 1}`;
}

export function toolName(tool: DesignerTool): string {
  return tool.partName || tool.name || 'Unnamed tool';
}

export function designerJobHref(jobId: string): string {
  return `/designer/jobs/${jobId.split('/').map(encodeURIComponent).join('/')}`;
}

export function designerToolHref(jobId: string, toolId: string): string {
  return `/designer/tools/${encodeURIComponent(jobId)}/${toolId.split('/').map(encodeURIComponent).join('/')}`;
}

// Older links encoded the slash inside a tool ID as %2F. Next can retain
// that escape in catch-all params; normalize it before looking up the tool.
export function decodeDesignerRouteId(value: string): string {
  try { return decodeURIComponent(value); } catch { return value; }
}

export function toolRevisions(revisions: DesignRevision[] = [], toolId: string): DesignRevision[] {
  return revisions.filter(revision => revision.toolId === toolId);
}

export function jobDesignStatus(job: { tools?: DesignerTool[]; designRevisions?: DesignRevision[] }): 'Not started' | 'Draft' | 'Submitted' {
  const tools = job.tools || [];
  const latest = tools.map((tool, index) => toolRevisions(job.designRevisions, toolKey(tool, index))[0]);
  if (!latest.some(Boolean)) return 'Not started';
  return latest.every(revision => revision?.status === 'Submitted') ? 'Submitted' : 'Draft';
}
