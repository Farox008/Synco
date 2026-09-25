"use client";

import { useParams } from 'next/navigation';
import ToolDetailView from '@/components/tools/ToolDetailView';
import { decodeDesignerRouteId } from '@/services/designerTools';

export default function DesignerToolPage() {
  const { jobId, toolId } = useParams<{ jobId: string; toolId: string[] }>();
  const id = toolId.map(decodeDesignerRouteId).join('/');
  const parentId = decodeDesignerRouteId(jobId);
  return <ToolDetailView key={`${parentId}:${id}`} designerJobId={parentId} toolId={id} />;
}
