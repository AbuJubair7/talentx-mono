import type { GetMyInterviewsQueryParams, InterviewStatusStyleConfig } from '../types/interview.types';

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_NUMBER = 1;

export const TALENT_INTERVIEW_ENDPOINTS = {
  myInterviews: () => `/talents/me/interviews`,
  accept: (invitationId: string) => `/talents/me/interviews/${invitationId}/accept`,
  decline: (invitationId: string) => `/talents/me/interviews/${invitationId}/decline`,
};

export const TALENT_INTERVIEW_QUERY_KEYS = {
  all: ['talent-interviews'] as const,
  lists: () => [...TALENT_INTERVIEW_QUERY_KEYS.all, 'list'] as const,
  list: (params?: GetMyInterviewsQueryParams) => [...TALENT_INTERVIEW_QUERY_KEYS.lists(), params] as const,
};

export const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  OnlineAssessment: 'Online Assessment',
  OnCall: 'On Call',
  OnSite: 'On Site',
};

export const INTERVIEW_STATUS_STYLES: Record<string, InterviewStatusStyleConfig> = {
  pending: { label: 'Awaiting response', bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50', dot: 'bg-amber-500' },
  accepted: { label: 'Accepted', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50', dot: 'bg-emerald-500' },
  declined: { label: 'Declined', bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50', dot: 'bg-rose-500' },
  expired: { label: 'Expired', bg: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700', dot: 'bg-slate-500' },
  completed: { label: 'Completed', bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-800', dot: 'bg-slate-500' },
  cancelled: { label: 'Cancelled', bg: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700', dot: 'bg-slate-500' },
};

export const DEFAULT_INTERVIEW_STATUS_STYLE: InterviewStatusStyleConfig = {
  label: '',
  bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-800',
  dot: 'bg-slate-400',
};

export const TALENT_INTERVIEW_FALLBACKS = {
  ERROR_LOAD_LIST: 'Could not load your interview invitations.',
  ERROR_ACCEPT: 'Failed to accept interview invitation.',
  ERROR_DECLINE: 'Failed to decline interview invitation.',
};
