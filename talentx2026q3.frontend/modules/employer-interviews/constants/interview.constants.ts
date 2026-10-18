import type {
  GetJobInterviewsQueryParams,
  InterviewStatus,
  InterviewStatusOption,
  InterviewStatusStyleConfig,
  InterviewTypeOption,
} from '../types/interview.types';

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_NUMBER = 1;

export const ALL_INTERVIEW_STATUS_FILTER = 'All' as const;
export const ALL_INTERVIEW_TYPE_FILTER = 'All' as const;

export const INTERVIEW_ENDPOINTS = {
  sendBatch: (jobId: string) => `/jobs/${jobId}/interviews/send-batch`,
  jobInterviews: (jobId: string) => `/jobs/${jobId}/interviews`,
};

export const INTERVIEW_QUERY_KEYS = {
  all: ['employer-interviews'] as const,
  lists: () => [...INTERVIEW_QUERY_KEYS.all, 'list'] as const,
  jobLists: (jobId: string) => [...INTERVIEW_QUERY_KEYS.lists(), jobId] as const,
  list: (jobId: string, params?: GetJobInterviewsQueryParams) =>
    [...INTERVIEW_QUERY_KEYS.jobLists(jobId), params] as const,
};

export const INTERVIEW_TYPE_OPTIONS: readonly InterviewTypeOption[] = [
  { value: 'OnlineAssessment', label: 'Online Assessment' },
  { value: 'OnCall', label: 'On Call' },
  { value: 'OnSite', label: 'On Site' },
] as const;

// Exhaustiveness guard — TypeScript errors here if InterviewType grows but the options above don't.
const _typeOptionsExhaustive: Record<InterviewTypeOption['value'], true> = {
  OnlineAssessment: true,
  OnCall: true,
  OnSite: true,
};
void _typeOptionsExhaustive;

export const INTERVIEW_STATUS_OPTIONS: readonly InterviewStatusOption[] = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Declined', label: 'Declined' },
  { value: 'Cancelled', label: 'Cancelled' },
] as const;

// Exhaustiveness guard — TypeScript errors here if InterviewStatus grows but the options above don't.
const _statusOptionsExhaustive: Record<InterviewStatus, true> = {
  Pending: true,
  Accepted: true,
  Declined: true,
  Cancelled: true,
};
void _statusOptionsExhaustive;

export const INTERVIEW_STATUS_STYLES: Record<string, InterviewStatusStyleConfig> = {
  pending: { label: 'Pending', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', rail: 'border-amber-400' },
  accepted: { label: 'Accepted', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', rail: 'border-emerald-500' },
  declined: { label: 'Declined', bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', rail: 'border-rose-400' },
  cancelled: { label: 'Cancelled', bg: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400', rail: 'border-slate-300' },
};

export const DEFAULT_INTERVIEW_STATUS_STYLE: InterviewStatusStyleConfig = {
  label: '',
  bg: 'bg-slate-100 text-slate-700 border-slate-200',
  dot: 'bg-slate-400',
  rail: 'border-slate-300',
};

export const INTERVIEW_FALLBACKS = {
  ERROR_LOAD_LIST: 'Could not load interview invitations.',
  ERROR_SEND: 'Failed to send interview invitations.',
};
