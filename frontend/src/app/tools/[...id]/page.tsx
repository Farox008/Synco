"use client";
import { use } from 'react';
import ToolDetailView from '@/components/tools/ToolDetailView';
export default function ToolDetailPage({ params }: { params: Promise<{ id: string[] }> }) {
  const { id } = use(params);
  return <ToolDetailView toolId={id.join('/')} />;
}