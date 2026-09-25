import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/Card';
import { Building2, CalendarDays, FileText } from 'lucide-react';

import type { DesignRevision } from '@/services/db';
import type { DesignerTool } from '@/services/designerTools';

export interface DesignJob {
  tools?: DesignerTool[];
  id: string;
  name?: string;
  projectName?: string;
  customer?: string;
  customerName?: string;
  priority?: string;
  status?: string;
  createdAt?: string;
  created_at?: string;
  startDate?: string;
  dueDate?: string;
  endDate?: string;
  description?: string;
  headerMetadata?: Record<string, unknown>;
  designRevisions?: DesignRevision[];
}

export function JobMetadata({ job }: { job: DesignJob }) {
  const created = job.createdAt || job.created_at;
  const createdDate = created && Number.isFinite(Date.parse(created)) ? new Date(created).toLocaleDateString('en-GB') : 'Not recorded';
  const groups = [
    { title: 'Project Profile', icon: Building2, fields: [['Customer', job.customer || job.customerName], ['Project Name', job.name || job.projectName], ['Job Number', job.id]] },
    { title: 'Status & Timeline', icon: CalendarDays, fields: [['Priority Level', job.priority], ['Created Date', createdDate], ['Start Date', job.startDate], ['Due Date', job.dueDate || job.endDate]] },
  ];
  const metadata = Object.entries(job.headerMetadata || {}).filter(([, value]) => value !== null && value !== undefined && value !== '');
  return <Card className="!rounded-2xl !shadow-none hover:!translate-y-0">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-[1.2fr_1.2fr_1.6fr_auto]">
      {groups.map(group => <section key={group.title} className="min-w-0 xl:border-r xl:border-[var(--border-color)] xl:pr-6">
        <h3 className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--accent-red)]"><group.icon size={16} />{group.title}</h3>
        <dl className="space-y-4">{group.fields.map(([label, value]) => <div key={label}><dt className="mb-1 text-xs font-medium text-[var(--text-tertiary)]">{label}</dt><dd className="break-words text-sm font-semibold text-[var(--text-primary)]">{value || '—'}</dd></div>)}</dl>
      </section>)}
      <section className="min-w-0">
        <h3 className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--accent-red)]"><FileText size={16} />Job Specifications</h3>
        {metadata.length ? <dl className="space-y-4">{metadata.map(([key, value]) => <div key={key} className="flex flex-wrap justify-between gap-2 border-b border-dashed border-[var(--border-color)] pb-2"><dt className="break-words text-xs font-medium text-[var(--text-tertiary)]">{key}</dt><dd className="break-words text-sm font-semibold text-[var(--text-primary)]">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd></div>)}</dl> : <p className="text-sm text-[var(--text-secondary)]">No additional specifications recorded.</p>}
        {job.description && <p className="mt-4 whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{job.description}</p>}
      </section>
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-[var(--bg-color)] p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">Job QR Code</span>
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-2"><QRCodeSVG value={job.id} size={128} marginSize={4} bgColor="var(--card-bg)" fgColor="var(--text-primary)" title={`Job ${job.id}`} /></div>
        <span className="max-w-48 break-all text-center font-mono text-xs font-semibold">{job.id}</span>
        <span className="text-xs text-[var(--text-tertiary)]">Scan to identify job</span>
      </div>
    </div>
  </Card>;
}
