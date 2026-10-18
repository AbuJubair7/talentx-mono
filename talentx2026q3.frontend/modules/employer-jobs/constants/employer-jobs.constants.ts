import { CalendarClock, FileText, Users } from 'lucide-react';
import type {
  EmployerJobDetailTab,
  EmployerJobDetailTabOption,
  JobStatus,
  JobStatusTabOption,
} from '../types/employer-job.types';

export const DEFAULT_JOB_DETAIL_TAB: EmployerJobDetailTab = 'job-details';

export const DETAIL_TABS: readonly EmployerJobDetailTabOption[] = [
  { label: 'Job Details', value: 'job-details', icon: FileText },
  { label: 'Applicants', value: 'applicants', icon: Users },
  { label: 'Interviews', value: 'interviews', icon: CalendarClock },
] as const;

export const VIEW_MODE_STORAGE_KEY = 'talentx_employer_jobs_view_mode';

export const STATUS_TABS: JobStatusTabOption[] = [
  { label: 'All', value: 'All' },
  { label: 'Active', value: 'Active' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Closed', value: 'Closed' },
  { label: 'Expired', value: 'Expired' },
  { label: 'Deactivated', value: 'Deactivated' },
  { label: 'Under review', value: 'PendingReview' },
];

export const STATUS_ACCENT_BORDER: Record<JobStatus, string> = {
  Published: 'border-t-emerald-500',
  Draft: 'border-t-amber-500',
  Closed: 'border-t-slate-400',
  Expired: 'border-t-rose-500',
  Deactivated: 'border-t-rose-600',
  PendingReview: 'border-t-amber-500',
};
