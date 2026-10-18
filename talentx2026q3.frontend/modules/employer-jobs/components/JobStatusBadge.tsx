import type { JobStatusBadgeProps } from '../types/employer-job.types';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  Published: { label: 'Active',  className: 'bg-blue-50 border-blue-200 text-blue-700' },
  Draft:     { label: 'Draft',   className: 'bg-amber-50 border-amber-200 text-amber-700' },
  Closed:    { label: 'Closed',  className: 'bg-slate-100 border-slate-200 text-slate-500' },
  Expired:   { label: 'Expired', className: 'bg-rose-50 border-rose-200 text-rose-700' },
  // Set by admin moderation, not by the employer.
  Deactivated:   { label: 'Deactivated',  className: 'bg-rose-50 border-rose-300 text-rose-800' },
  PendingReview: { label: 'Under review', className: 'bg-amber-50 border-amber-300 text-amber-800' },
};

// Colored badge for a job's status on the employer side.
export function JobStatusBadge({ status, className: customClassName }: JobStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-slate-100 border-slate-200 text-slate-600',
  };
  const { label, className } = config;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", className, customClassName)}>
      {status === 'Published' && (
        <span className="mr-1.5 size-1.5 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
      )}
      {label}
    </span>
  );
}
