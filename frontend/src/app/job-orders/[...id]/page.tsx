"use client";
import { use } from 'react';
import JobOrderDetailView from '@/components/job-orders/JobOrderDetailView';
export default function JobOrderDetailPage({ params }: { params: Promise<{ id: string[] }> }) {
  const { id } = use(params);
  return <JobOrderDetailView jobId={Array.isArray(id) ? id.join('/') : id} />;
}