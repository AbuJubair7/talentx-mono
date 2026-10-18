import type {
  ApplicationStatus,
  ApplicationStatusFilter,
  GetJobApplicantsQueryParams,
  StatusOption,
  StatusStyleConfig,
} from '../types/applicant.types';

export type { ApplicationStatusFilter, StatusOption, StatusStyleConfig };

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_NUMBER = 1;

export const ALL_STATUS_FILTER = 'All' as const;

// PendingVerification is intentionally absent: unverified guest applications are hidden from
// employers (the backend excludes them), so there is nothing to filter on.
export const APPLICATION_STATUS_OPTIONS: readonly StatusOption[] = [
  { value: 'Applied', label: 'Applied' },
  { value: 'Reviewed', label: 'Reviewed' },
  { value: 'Shortlisted', label: 'Shortlisted' },
  { value: 'Interview', label: 'Interview' },
  { value: 'Hired', label: 'Hired' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Invited', label: 'Invited' },
] as const;

// Exhaustiveness guard — TypeScript errors here if ApplicationStatus grows but this list doesn't.
const _statusOptionsExhaustive: Record<ApplicationStatus, true> = {
  PendingVerification: true,
  Applied: true,
  Reviewed: true,
  Interview: true,
  Hired: true,
  Rejected: true,
  Invited: true,
  Shortlisted: true,
};
void _statusOptionsExhaustive; // suppress unused-variable lint

// Statuses an employer can manually select from the candidate list — system-managed statuses
// (PendingVerification, Interview, Invited) are set automatically by application/interview
// flows, and Reviewed is intentionally not offered. Applied is offered only as a revert target
// from a manually assignable status (see REVERTIBLE_FROM_STATUSES).
const MANUALLY_ASSIGNABLE_STATUSES: readonly ApplicationStatus[] = [
  'Shortlisted',
  'Hired',
  'Rejected',
];

export const REVERTIBLE_FROM_STATUSES: readonly ApplicationStatus[] = [
  'Shortlisted',
  'Hired',
  'Rejected',
];

export const MANUALLY_ASSIGNABLE_STATUS_OPTIONS: readonly StatusOption[] =
  APPLICATION_STATUS_OPTIONS.filter((option) => MANUALLY_ASSIGNABLE_STATUSES.includes(option.value));

export const canRevertToApplied = (status: ApplicationStatus | null | undefined): boolean =>
  status != null && REVERTIBLE_FROM_STATUSES.includes(status);

// Bulk "Set status" offers every manual target, including Applied as a revert, in canonical status order.
export const BULK_STATUS_OPTIONS: readonly StatusOption[] = APPLICATION_STATUS_OPTIONS.filter((option) =>
  option.value === 'Applied' || MANUALLY_ASSIGNABLE_STATUSES.includes(option.value),
);

// Single-applicant dropdowns offer Applied when the current status can be reverted, or as a muted
// current-state entry when the applicant is already Applied.
export const statusOptionsFor = (
  currentStatus: ApplicationStatus | null | undefined,
): readonly StatusOption[] =>
  currentStatus === 'Applied' || canRevertToApplied(currentStatus)
    ? BULK_STATUS_OPTIONS
    : MANUALLY_ASSIGNABLE_STATUS_OPTIONS;

export const APPLICATION_STATUS_STYLES: Record<string, StatusStyleConfig> = {
  applied: { label: 'Applied', bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  pendingverification: { label: 'Pending', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  reviewed: { label: 'Reviewed', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  shortlisted: { label: 'Shortlisted', bg: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500' },
  interview: { label: 'Interview', bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  hired: { label: 'Hired', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  invited: { label: 'Invited', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
};

export const DEFAULT_STATUS_STYLE: StatusStyleConfig = {
  label: '',
  bg: 'bg-slate-100 text-slate-700 border-slate-200',
  dot: 'bg-slate-400',
};

export const AI_SCORE_THRESHOLDS = {
  LOW: 60,
  HIGH: 80,
} as const;

export const AI_SCORE_STYLES = {
  HIGH: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  LOW: 'bg-rose-50 text-rose-700 border-rose-200',
} as const;

export const APPLICANT_QUERY_KEYS = {
  all:      ['job-applicants'] as const,
  lists:    () => [...APPLICANT_QUERY_KEYS.all, 'list'] as const,
  jobLists: (jobId: string) => [...APPLICANT_QUERY_KEYS.lists(), jobId] as const,
  list:     (jobId: string, params?: GetJobApplicantsQueryParams) =>
    [...APPLICANT_QUERY_KEYS.jobLists(jobId), params] as const,
  profile:  (applicationId: string | null) =>
    ['candidate-profile', applicationId] as const,
};

export const APPLICANT_ENDPOINTS = {
  jobApplications: (jobId: string) => `/jobs/${jobId}/applications`,
  scoreApplicants: (jobId: string) => `/jobs/${jobId}/score-applicants`,
  updateStatus: (applicationId: string) => `/job-applications/${applicationId}/status`,
  candidateProfile: (applicationId: string) => `/job-applications/${applicationId}/candidate-profile`,
};

export const APPLICANT_FALLBACKS = {
  DEFAULT_AVATAR_INITIAL: 'C',
  NOT_AVAILABLE: 'N/A',
  NOT_SPECIFIED: 'Not specified',
  NAME_FALLBACK: 'Candidate',
  PRESENT_DATE: 'Present',
  NO_CV: 'No CV',
  DEFAULT_RESUME_FILENAME: 'Resume.pdf',
  NONE: 'None',
  ERROR_LOAD_LIST_TITLE: 'Failed to load applicant list',
  ERROR_LOAD_LIST: 'Could not load applicant list.',
  ERROR_LOAD_PROFILE_TITLE: 'Failed to load candidate profile.',
  ERROR_LOAD_PROFILE: 'An error occurred while fetching candidate information.',
  LOADING_PROFILE: 'Loading candidate profile...',
  PENDING_AI_SCORE: 'Pending AI',
  SCORE_NOT_AVAILABLE: 'Not available',
  NO_ABOUT: 'No short bio has been provided by this candidate.',
  NO_COMPETENCIES: 'No competencies or highlights have been provided.',
  NO_SKILLS: 'No skills have been added to this profile.',
  NO_WORK_EXPERIENCE: 'No work experience has been provided by this candidate.',
  NO_EDUCATION: 'No education information has been provided.',
  NO_PROJECTS: 'No projects have been provided by this candidate.',
  NO_RESUME: 'No resume has been uploaded.',
};
