"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { useDatabase } from '@/context/DatabaseContext';
import { Header } from '@/components/dashboard/Header';
import { DesignerDetailHeader } from './DesignerDetailHeader';
import type { DesignJob } from './JobMetadata';
import { designerToolHref, toolKey, toolName, toolRevisions } from '@/services/designerTools';

export function DesignerJobTools({ jobId }: { jobId: string }) {
  const { data, isMounted } = useDatabase();
  const [search, setSearch] = useState('');
  const job = (data.jobOrders as DesignJob[]).find(job => job.id === jobId);
  if (!isMounted) return <><Header title="Job Details" /><p className="!p-8">Loading job…</p></>;
  if (!job) return <><Header title="Job Details" /><div className="!p-8">Job not found. <Link href="/designer/jobs">Back to Jobs</Link></div></>;
  const tools = (job.tools || []).map((tool, index) => ({ tool, id: toolKey(tool, index) })).filter(({ tool, id }) => `${id} ${toolName(tool)}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <div className="content-scroll !block !p-0">
    <DesignerDetailHeader job={job} />
    <nav className="detail-tabs" aria-label="Job sections"><span className="detail-tab active" aria-current="page">Tools</span><Link href="/designer/revisions" className="detail-tab">Revisions</Link></nav>
    <div className="detail-content !px-4 !py-8 sm:!px-8">
      <section className="section-card !p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 !p-6"><div><h3 className="text-lg font-semibold">Tools <span className="text-sm text-[var(--text-tertiary)]">({job.tools?.length || 0})</span></h3><p className="!mt-2 text-sm text-[var(--text-secondary)]">Select a tool to upload its BOM and design files.</p></div><label className="search-bar"><Search size={16} /><input aria-label="Search tools" placeholder="Search tools…" value={search} onChange={event => setSearch(event.target.value)} /></label></div>
        <div className="overflow-x-auto"><table className="matrix-table !m-0 !border-collapse text-sm [&_th]:!bg-[var(--accent-red-light)] [&_th]:!text-[var(--accent-red)] [&_th]:!px-6 [&_th]:!py-4 [&_td]:!px-6 [&_td]:!py-4">
          <thead><tr>{['Tool / Part No.', 'Tool Name', 'Quantity', 'Material', 'Design / BOM', 'Action'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
          <tbody>{!tools.length ? <tr><td colSpan={6} className="!py-12 text-center text-[var(--text-secondary)]">{search ? 'No tools match your search.' : 'No tools are linked to this job yet.'}</td></tr> : tools.map(({ tool, id }) => {
            const latest = toolRevisions(job.designRevisions, id)[0];
            const href = designerToolHref(job.id, id);
            return <tr key={id}><td><Link href={href} className="font-semibold text-[var(--accent-red)]">{id}</Link></td><td>{toolName(tool)}</td><td>{tool.qty ?? '—'}</td><td>{tool.material || '—'}</td><td>{latest ? `Rev ${latest.revision} · ${latest.status}` : 'Not started'}</td><td><Link href={href} className="inline-flex items-center gap-2 whitespace-nowrap font-semibold text-[var(--accent-red)]">Open Tool<ChevronRight size={16} /></Link></td></tr>;
          })}</tbody>
        </table></div>
      </section>
    </div>
  </div>;
}
