"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ChevronRight, Search, ClipboardList, Clock, FilePenLine, Send } from 'lucide-react';
import { useDatabase } from '@/context/DatabaseContext';
import { Header } from '@/components/dashboard/Header';
import { StatusPill } from '@/components/ui/StatusPill';
import { Card } from '@/components/ui/Card';
import type { DesignRevision } from '@/services/db';
import { jobDesignStatus, type DesignerTool } from '@/services/designerTools';

interface DesignerJob {
  tools?: DesignerTool[];
  id: string;
  name?: string;
  customer?: string;
  priority?: string;
  dueDate?: string;
  createdAt?: string;
  created_at?: string;
  status?: string;
  designRevisions?: DesignRevision[];
}

function createdTime(job: DesignerJob): number {
  const time = Date.parse(job.createdAt || job.created_at || '');
  return Number.isFinite(time) ? time : 0;
}

export function DesignerJobsTable() {
  const { data, isMounted } = useDatabase();
  const [search, setSearch] = useState('');
  const jobs: DesignerJob[] = data.jobOrders;
  const query = search.trim().toLowerCase();
  const filteredJobs = jobs.filter(job => [job.id, job.name, job.customer].some(value => value?.toLowerCase().includes(query)))
    .sort((a, b) => createdTime(b) - createdTime(a));
  const metrics = [
    { label: 'Total Jobs', value: jobs.length, description: 'All jobs in the workspace', icon: ClipboardList, color: 'bg-[var(--accent-red-light)] text-[var(--accent-red)]' },
    { label: 'Not Started', value: jobs.filter(job => jobDesignStatus(job) === 'Not started').length, description: 'No tool design or BOM revision saved', icon: Clock, color: 'bg-[var(--bg-color)] text-[var(--text-secondary)]' },
    { label: 'In Progress', value: jobs.filter(job => jobDesignStatus(job) === 'Draft').length, description: 'One or more tools await submission', icon: FilePenLine, color: 'bg-[var(--warning-orange-light)] text-[var(--warning-orange)]' },
    { label: 'Submitted to Purchasing', value: jobs.filter(job => jobDesignStatus(job) === 'Submitted').length, description: 'Latest revisions of all tools submitted', icon: Send, color: 'bg-[var(--success-green-light)] text-[var(--success-green)]' },
  ];

  return <><Header title="Jobs" /><div className="content-scroll !p-4 sm:!p-8"><div className="min-w-0 w-full space-y-6">
    <section aria-label="Job overview" aria-busy={!isMounted} className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ label, value, description, icon: Icon, color }) => <Card key={label} className="kpi-card">
        <div className="mb-2 flex items-center justify-between gap-2"><h2 className="kpi-title !mb-0">{label}</h2><span className={`rounded-lg p-2 ${color}`}><Icon size={18} aria-hidden="true" /></span></div>
        <p className="kpi-value tabular-nums text-[var(--text-primary)]">{isMounted ? value : '—'}</p>
        <p className="kpi-sub">{description}</p>
      </Card>)}
    </section>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <label className="search-bar w-full sm:max-w-md"><Search size={16} aria-hidden="true" /><input className="w-full" aria-label="Search jobs" placeholder="Search jobs, customers, or IDs…" value={search} onChange={event => setSearch(event.target.value)} /></label>
      <span className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><ArrowDown size={16} />Newest created first</span>
    </div>
    <div className="card overflow-x-auto !p-0">
      <table className="matrix-table !m-0 w-full !border-collapse">
        <thead><tr>{['Job ID', 'Customer / Job', 'Created Date', 'Priority', 'Due Date', 'Job Status', 'Design / BOM', ''].map((heading, index) => <th key={index} scope="col" aria-sort={heading === 'Created Date' ? 'descending' : undefined} className="!bg-[var(--accent-red-light)] whitespace-nowrap">{heading}</th>)}</tr></thead>
        <tbody>{!isMounted ? <tr><td colSpan={8} className="!py-12 text-center">Loading jobs…</td></tr> : !filteredJobs.length ? <tr><td colSpan={8} className="!py-12 text-center text-[var(--text-secondary)]">{query ? 'No jobs match your search.' : 'No jobs available yet.'}</td></tr> : filteredJobs.map(job => {
          const href = `/designer/jobs/${job.id.split('/').map(encodeURIComponent).join('/')}`;
          return <tr key={job.id} className="work-order-row">
            <td className="min-w-32 font-bold !text-[var(--accent-red)]"><Link className="flex items-center gap-1" href={href}>{job.id}<ChevronRight size={14} /></Link></td>
            <td className="min-w-48"><div className="font-semibold">{job.customer || '—'}</div><div className="mt-1 text-xs text-[var(--text-secondary)]">{job.name || '—'}</div></td>
            <td className="whitespace-nowrap">{createdTime(job) ? new Date(createdTime(job)).toLocaleDateString('en-GB') : 'Not recorded'}</td>
            <td><span className="rounded bg-[var(--bg-color)] px-2 py-1 text-xs font-semibold uppercase">{job.priority || '—'}</span></td>
            <td className="whitespace-nowrap">{job.dueDate || '—'}</td>
            <td><StatusPill status={job.status || 'Pending'} /></td>
            <td className="whitespace-nowrap">{jobDesignStatus(job) === 'Draft' ? 'In progress' : jobDesignStatus(job)}</td>
            <td><Link href={href} aria-label={`Open designs and BOM for ${job.id}`} className="whitespace-nowrap font-medium text-[var(--accent-red)]">Open Job →</Link></td>
          </tr>;
        })}</tbody>
      </table>
    </div>
    {isMounted && <p className="text-xs text-[var(--text-secondary)]">{filteredJobs.length} of {jobs.length} jobs · Jobs without a recorded creation date appear last.</p>}
  </div></div></>;
}
