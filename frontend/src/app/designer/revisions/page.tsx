"use client";

import { Header } from '@/components/dashboard/Header';
import { DesignSubmissions } from '@/components/designer/DesignWorkspace';

export default function DesignerRevisionsPage() {
  return <><Header title="Revisions" /><div className="content-scroll"><div className="w-full space-y-4 p-4 sm:p-8"><p className="text-sm text-slate-500">Design and BOM revisions, newest first. Download files from any saved version.</p><DesignSubmissions /></div></div></>;
}
