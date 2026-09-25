"use client";

import { useParams } from 'next/navigation';
import JobOrderDetailView from '@/components/job-orders/JobOrderDetailView';

export default function DesignerJobPage() {
  const { id } = useParams<{ id: string[] }>();
  const jobId = id.join('/');
  return <JobOrderDetailView key={jobId} jobId={jobId} designer />;
}
