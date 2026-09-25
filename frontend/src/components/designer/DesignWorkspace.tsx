"use client";

import { useRef, useState } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, FileUp, Download, FileText, Save, Send, X } from 'lucide-react';
import { useDatabase } from '@/context/DatabaseContext';
import { Header } from '@/components/dashboard/Header';
import type { DesignFile, DesignRevision } from '@/services/db';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/StatusPill';
import type { DesignJob } from './JobMetadata';
import { DesignerDetailHeader } from './DesignerDetailHeader';
import { designerJobHref, designerToolHref, toolKey, toolName, toolRevisions } from '@/services/designerTools';

function readFile(file: File, kind: DesignFile['kind']): Promise<DesignFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, kind, url: String(reader.result) });
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

export function DesignSubmissions({ purchaser = false }: { purchaser?: boolean }) {
  const { data, isMounted } = useDatabase();
  const jobs: DesignJob[] = data.jobOrders;
  const revisions = jobs.flatMap(job => (job.designRevisions || [])
    .filter(revision => !purchaser || revision.status === 'Submitted')
    .map(revision => ({ job, revision })))
    .sort((a, b) => b.revision.createdAt.localeCompare(a.revision.createdAt));

  if (!isMounted) return <p className="p-6">Loading revisions…</p>;
  return <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
    {purchaser && <h2 className="mb-4 text-lg font-semibold">Designs & BOMs from Designer</h2>}
    {!revisions.length ? <p className="text-sm text-slate-500">{purchaser ? 'No designs or BOMs have been submitted yet.' : 'No revisions yet. Save or submit a design package from Jobs to create one.'}</p> :
      <div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead><tr className="border-b text-slate-500">{['Job', 'Tool', 'Revision', 'Date', 'Changes', 'Status', 'Files'].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead>
        <tbody>{revisions.map(({ job, revision }) => <tr key={revision.id} className="border-b align-top">
          <td className="p-3"><Link className="font-medium text-blue-700" href={designerJobHref(job.id)}>{job.id}</Link><div>{job.name}</div></td>
          <td className="p-3">{revision.toolId ? <Link className="font-medium text-blue-700" href={designerToolHref(job.id, revision.toolId)}>{revision.toolName || revision.toolId}<div>{revision.toolId}</div></Link> : 'Legacy job-level files'}</td>
          <td className="p-3">Rev {revision.revision}</td><td className="whitespace-nowrap p-3">{new Date(revision.createdAt).toLocaleDateString()}</td>
          <td className="max-w-xs whitespace-pre-wrap p-3">{revision.notes || 'Initial design package'}</td><td className="p-3">{revision.status}</td>
          <td className="p-3">{revision.files.map((file, index) => <a key={index} className="mb-2 block text-blue-700 underline" href={file.url} download={file.name}>{file.kind}: {file.name}</a>)}</td>
        </tr>)}</tbody>
      </table></div>}
  </section>;
}

export function DesignWorkspace({ initialJobId = '', toolId, embedded = false }: { initialJobId?: string; toolId: string; embedded?: boolean }) {
  const { data, isMounted, saveDesignRevision } = useDatabase();
  const jobs: DesignJob[] = data.jobOrders;
  const jobId = initialJobId;
  const bomInput = useRef<HTMLInputElement>(null);
  const designInput = useRef<HTMLInputElement>(null);
  const [drawings, setDrawings] = useState<File[]>([]);
  const [bom, setBom] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const job = jobs.find(job => job.id === jobId);
  const tool = job?.tools?.find((tool, index) => toolKey(tool, index) === toolId);
  const revisions = toolRevisions(job?.designRevisions, toolId);
  const latest = revisions[0];
  const toolDetails: DesignJob | undefined = job && tool ? {
    ...job, id: toolId, name: toolName(tool), status: tool.status || job.status,
    headerMetadata: { 'JOB ORDER': job.id, 'MATERIAL': tool.material || '—', 'QUANTITY': tool.qty ?? '—', 'PART NO.': tool.partNumber || tool.partNo || toolId },
  } : undefined;

  async function save(status: DesignRevision['status']) {
    if (!job || !tool) { setMessage('Select a valid tool first.'); return; }
    if (!drawings.length && !bom && !latest?.files.length) { setMessage('Upload a drawing or BOM first.'); return; }
    setBusy(true);
    setMessage('');
    try {
      if ([...drawings, ...(bom ? [bom] : [])].reduce((sum, file) => sum + file.size, 0) > 2 * 1024 * 1024) {
        throw new Error('This local demo supports up to 2 MB of new files per revision.');
      }
      const files = [
        ...(drawings.length ? await Promise.all(drawings.map(file => readFile(file, 'Drawing'))) : latest?.files.filter(file => file.kind === 'Drawing') || []),
        ...(bom ? [await readFile(bom, 'BOM')] : latest?.files.filter(file => file.kind === 'BOM') || []),
      ];
      if (status === 'Submitted' && (!files.some(file => file.kind === 'Drawing') || !files.some(file => file.kind === 'BOM'))) {
        throw new Error('Add both a drawing and a BOM before submitting to purchasing.');
      }
      saveDesignRevision(job.id, { id: crypto.randomUUID(), toolId, toolName: toolName(tool), revision: Math.max(0, ...revisions.map(item => item.revision)) + 1, createdAt: new Date().toISOString(), notes: notes.trim(), files, status });
      setDrawings([]); setBom(null); setNotes(''); setInputKey(key => key + 1);
      setMessage(status === 'Submitted' ? 'Submitted. Purchasing can now download this revision.' : 'Draft revision saved.');
    } catch (error) {
      setMessage(error instanceof DOMException && error.name === 'QuotaExceededError' ? 'Local storage is full. The revision was not saved. Try smaller files.' : error instanceof Error ? error.message : 'Unable to save revision.');
    } finally { setBusy(false); }
  }

  const secondaryButton = 'inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] !px-4 !py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-color)] disabled:opacity-50';
  const pendingFiles = [
    ...(bom ? [{ name: bom.name, kind: 'BOM' as const, size: bom.size, index: -1 }] : []),
    ...drawings.map((file, index) => ({ name: file.name, kind: 'Drawing' as const, size: file.size, index })),
  ];
  const retainedFiles = (latest?.files || []).filter(file => file.kind === 'BOM' ? !bom : !drawings.length);
  const fileCount = pendingFiles.length + retainedFiles.length;
  return <div className={embedded ? 'text-[var(--text-primary)]' : 'content-scroll !block !p-0 text-[var(--text-primary)]'}>
    {!embedded && (isMounted && job && toolDetails ? <><DesignerDetailHeader job={toolDetails} backHref={designerJobHref(job.id)} /><nav aria-label="Tool sections" className="detail-tabs overflow-x-auto border-b border-[var(--border-color)]"><Link href={designerJobHref(job.id)} className="detail-tab whitespace-nowrap">Job {job.id} · Tools</Link><span className="detail-tab active whitespace-nowrap" aria-current="page">Design & BOM</span><Link href="/designer/revisions" className="detail-tab whitespace-nowrap">Revisions</Link></nav></> : <Header title="Tool Details" />)}
    <div className={embedded ? '' : 'detail-content !px-4 !py-6 sm:!px-8 sm:!py-8'}>
      {!isMounted ? <Card><p className="text-sm text-[var(--text-secondary)]">Loading tool details…</p></Card> : !job || !tool ? <Card><h3 className="!mb-4 text-lg font-semibold">Tool not found</h3><Link href={job ? designerJobHref(job.id) : '/designer/jobs'} className={secondaryButton}>Back to {job ? 'Tools' : 'Jobs'}</Link></Card> : <fieldset disabled={busy} className="flex min-w-0 flex-col gap-6">
        <section className="section-card !p-0 overflow-hidden" aria-label="Design package overview">
          <dl className="grid grid-cols-1 divide-y divide-[var(--border-color)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="flex items-center gap-4 !p-6"><span className="rounded-xl bg-[var(--accent-red-light)] !p-3 text-[var(--accent-red)]"><FileText size={20} /></span><div><dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">Current Revision</dt><dd className="!mt-2 text-lg font-bold">{latest ? `Rev ${latest.revision}` : 'Not started'}</dd></div></div>
            <div className="flex items-center gap-4 !p-6"><span className="rounded-xl bg-[var(--bg-color)] !p-3 text-[var(--text-secondary)]"><FileUp size={20} /></span><div><dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">Package Files</dt><dd className="!mt-2 text-lg font-bold">{fileCount}<span className="!ml-2 text-xs font-medium text-[var(--text-tertiary)]">{pendingFiles.length} unsaved</span></dd></div></div>
            <div className="flex items-center gap-4 !p-6"><span className="rounded-xl bg-[var(--success-green-light)] !p-3 text-[var(--success-green)]"><Send size={20} /></span><div><dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">Submission Status</dt><dd className="!mt-2"><StatusPill status={latest?.status === 'Submitted' ? 'Completed' : 'Pending'} label={latest?.status || 'Not submitted'} /></dd></div></div>
          </dl>
        </section>
        <section className="section-card !p-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-color)] !p-6">
            <div><h3 className="text-lg font-semibold">Design Files & Bill of Materials</h3><p className="!mt-2 text-xs text-[var(--text-secondary)]">Prepare drawings and material requirements for {toolName(tool)} ({toolId}).</p></div>
            <div key={inputKey} className="flex flex-wrap gap-3">
              <input ref={bomInput} type="file" accept=".xlsx,.xls,.csv" aria-label="Add BOM file" className="hidden" onChange={event => setBom(event.target.files?.[0] || null)} />
              <input ref={designInput} type="file" multiple aria-label="Add design files" className="hidden" onChange={event => setDrawings(Array.from(event.target.files || []))} />
              <button type="button" onClick={() => bomInput.current?.click()} className={secondaryButton}><FileSpreadsheet size={16} />Add BOM File</button>
              <button type="button" onClick={() => designInput.current?.click()} className={`${secondaryButton} !border-[var(--accent-red)] !bg-[var(--accent-red)] !text-[var(--card-bg)]`}><FileUp size={16} />Add Design File</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="matrix-table !m-0 !border-collapse text-sm [&_th]:!bg-[var(--accent-red-light)] [&_th]:!px-6 [&_th]:!py-4 [&_th]:!text-xs [&_th]:!text-[var(--accent-red)] [&_td]:!rounded-none [&_td]:!px-6 [&_td]:!py-4">
              <thead><tr><th scope="col">File Name</th><th scope="col">Type</th><th scope="col">Revision</th><th scope="col">Status</th><th scope="col" className="!text-right">Action</th></tr></thead>
              <tbody>
                {!fileCount && <tr><td colSpan={5}><div className="flex flex-col items-center gap-3 !py-8 text-center"><FileUp size={32} className="text-[var(--text-tertiary)]" /><p className="font-semibold">No files attached yet</p><p className="text-xs text-[var(--text-secondary)]">Use Add BOM File and Add Design File to prepare the job package.</p></div></td></tr>}
                {pendingFiles.map(file => <tr key={`${file.kind}-${file.index}`}><td><div className="flex items-center gap-3"><FileUp size={18} className="shrink-0 text-[var(--accent-red)]" /><div><p className="break-all font-semibold">{file.name}</p><p className="!mt-1 text-xs text-[var(--text-tertiary)]">{Math.max(1, Math.round(file.size / 1024))} KB</p></div></div></td><td>{file.kind === 'Drawing' ? 'Design' : 'BOM'}</td><td className="whitespace-nowrap">Next revision</td><td><StatusPill status="Pending" label="Unsaved" /></td><td className="text-right"><button type="button" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent-red)]" aria-label={`Remove ${file.name}`} onClick={() => { if (file.kind === 'BOM') setBom(null); else setDrawings(files => files.filter((_, index) => index !== file.index)); setInputKey(key => key + 1); }}><X size={16} />Remove</button></td></tr>)}
                {retainedFiles.map((file, index) => <tr key={`saved-${index}`}><td><div className="flex items-center gap-3"><FileText size={18} className="shrink-0 text-[var(--text-secondary)]" /><span className="break-all font-semibold">{file.name}</span></div></td><td>{file.kind === 'Drawing' ? 'Design' : 'BOM'}</td><td className="whitespace-nowrap">Rev {latest?.revision}</td><td><StatusPill status={latest?.status === 'Submitted' ? 'Completed' : 'Pending'} label={latest?.status} /></td><td className="text-right"><a href={file.url} download={file.name} className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent-red)]"><Download size={16} />Download</a></td></tr>)}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2 border-t border-[var(--border-color)] bg-[var(--bg-color)] !px-6 !py-4 text-xs text-[var(--text-secondary)]"><p>BOM: Excel or CSV · Maximum 2 MB of new files per revision · Saved in this browser.</p><p>Saved files carry forward unless replaced by new uploads of the same type.</p></div>
        </section>
        <section className="section-card">
          <h3 className="section-title-small !mb-6 !pb-4">Revision Notes</h3>
          <label htmlFor="designer-revision-notes" className="!mb-3 block text-sm text-[var(--text-secondary)]">Describe changes to the drawings or material requirements.</label>
          <textarea id="designer-revision-notes" value={notes} onChange={event => setNotes(event.target.value)} rows={3} className="block w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-color)] !p-4 text-sm placeholder:text-[var(--text-tertiary)] focus:outline-2 focus:outline-[var(--accent-red)]" placeholder="e.g. Updated plate dimensions and revised material quantities…" />
          <div className="!mt-6 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center border-t border-[var(--border-color)] !pt-6"><p className="text-xs text-[var(--text-tertiary)]">Saving creates a new revision. Submit when the BOM and drawings are ready.</p><div className="flex flex-wrap gap-3"><button type="button" onClick={() => save('Draft')} className={secondaryButton}><Save size={16} />Save Draft</button><button type="button" onClick={() => save('Submitted')} className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-red)] !px-4 !py-2 text-sm font-semibold text-[var(--card-bg)] hover:bg-[var(--accent-red-hover)] disabled:opacity-50"><Send size={16} />{busy ? 'Saving…' : 'Submit to Purchasing'}</button></div></div>
        </section>
      </fieldset>}
      {message && <p role="status" className="!mt-6 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] !p-4 text-sm">{message}</p>}
    </div>
  </div>;
}
