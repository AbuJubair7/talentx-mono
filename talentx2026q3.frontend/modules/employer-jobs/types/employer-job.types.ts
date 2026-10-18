import type { LucideIcon } from 'lucide-react';
import type { EmploymentType, ExperienceLevel, WorkArrangement } from '@/modules/job-listing';
import type { TimeOfDay } from '../utils/greeting.utils';

export type { EmploymentType, ExperienceLevel, WorkArrangement, TimeOfDay };

export type EmployerJobDetailTab = 'job-details' | 'applicants' | 'interviews';

export interface EmployerJobDetailTabOption {
  label: string;
  value: EmployerJobDetailTab;
  icon: LucideIcon;
}

// Deactivated and PendingReview come from admin moderation: an admin took the job down, or the
// employer edited it and sent it back for review.
export type JobStatus = 'Draft' | 'Published' | 'Closed' | 'Expired' | 'Deactivated' | 'PendingReview';

export type InvitationStatus = 'Pending' | 'Accepted' | 'Declined' | 'Expired' | 'Withdrawn';

export type MatchStatus = 'Active' | 'Expired' | 'Archived' | 'Pending' | string;

export interface EmployerJob {
  id: string;
  title: string;
  companyName: string;
  description: string | null;
  requirements?: string | null;
  location: string | null;
  employmentType: string | null;
  experienceLevel: string | null;
  workArrangement: string | null;
  requiredSkills: string[];
  vacancies: number;
  status: JobStatus;
  createdAt: string;
  expireAt: string;
  city?: string | null;
  country?: string | null;
  minOverlapHours?: number | null;
  updatedAt?: string | null;
  applicantCount?: number;
  isExpired?: boolean;
  salaryType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;
  // Set while an admin has the job down; all cleared once it is reactivated.
  deactivationReason?: string | null;
  deactivationReasonLabel?: string | null;
  deactivationDetails?: string | null;
  deactivatedAt?: string | null;
}

export interface EmployerRecentJobDto {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  expireAt: string;
  vacancies: number;
  applicantCount: number;
}

export interface CandidatePipelineStatsDto {
  appliedCount: number;
  shortlistedCount: number;
  invitedCount: number;
  interviewCount: number;
  rejectedCount: number;
  hiredCount: number;
}

export interface JobPipelineSummaryDto {
  jobId: string;
  jobTitle: string;
  companyName: string;
  jobStatus: string;
  vacancies: number;
  postedDate: string;
  totalApplicants: number;
  pipelineStats: CandidatePipelineStatsDto;
}

export interface EmployerDashboardDto {
  totalPostedJobs: number;
  totalHires: number;
  activeJobsCount: number;
  draftJobsCount: number;
  closedJobsCount: number;
  expiredJobsCount: number;
  deactivatedJobsCount: number;
  pendingReviewJobsCount: number;
  candidatePipeline?: CandidatePipelineStatsDto;
  recentJobs: EmployerRecentJobDto[];
}

export interface PipelineSegmentData {
  segmentKey: string;
  segmentLabel: string;
  segmentCount: number;
  segmentPercentage: number;
  strokeColor: string;
}

export interface CandidatePipelineStageData {
  stageKey: string;
  stageLabel: string;
  stageCount: number;
  stagePercentage: number;
  fillColor: string;
}

export interface EmployerJobListItemDto {
  id: string;
  title: string;
  companyName: string;
  status: string;
  employmentType: string;
  workArrangement: string;
  experienceLevel: string;
  location: string;
  vacancies: number;
  expireAt: string;
  createdAt: string;
  applicantCount: number;
  salaryType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;
  // Shown under the badge so the employer sees why a job is down without opening it.
  deactivationReasonLabel?: string | null;
}

export interface PaginatedList<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface EmployerJobsQueryParams {
  page?: number;
  pageSize?: number;
  status?: string;
  isExpired?: boolean;
  searchTerm?: string;
}

export interface InitialEmployerJobsQueryParamsOptions {
  urlStatusParam?: string | null;
  urlIsExpiredParam?: string | null;
  initialUrlSearchParam?: string | null;
}

export interface BuildEmployerJobsUrlOptions {
  pathname?: string;
  status?: string | null;
  isExpired?: boolean | null;
  search?: string | null;
}

export interface PaginationRange {
  fromItem: number;
  toItem: number;
}

export interface UpdateJobPayload {
  title?: string;
  companyName?: string;
  description?: string;
  requirements?: string;
  location?: string;
  city?: string | null;
  country?: string | null;
  minOverlapHours?: number | null;
  employmentType?: string;
  experienceLevel?: string;
  workArrangement?: string;
  requiredSkills?: string[];
  vacancies?: number;
  expireAt?: string;
  salaryType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;
  publish: boolean;
}

export type JobActionIntent = 'close' | 'delete' | 'reopen' | 'publish';

export type JobActionConfirmDialogIntent = JobActionIntent;

export interface JobActionDropdownProps {
  jobId: string;
  jobTitle: string;
  jobStatus: JobStatus;
  isExpired?: boolean;
  expireAt?: string | null;
  onClose: (jobId: string) => void;
  onDelete: (jobId: string) => void;
  onReopen?: (jobId: string) => void;
  onPublish?: (jobId: string) => void;
}

export interface JobActionConfirmDialogProps {
  open: boolean;
  onOpenChange: (nextOpen: boolean) => void;
  jobTitle: string;
  intent: JobActionIntent;
  isPending: boolean;
  onConfirm: () => void;
}

export interface JobActionDialogState {
  isOpen: boolean;
  jobId: string;
  jobTitle: string;
  intent: JobActionIntent;
}

export interface EmployerDashboardClientProps {
  className?: string;
  userName?: string | null;
  userEmail?: string | null;
}

export interface EmployerDashboardSkeletonProps {
  className?: string;
}

export interface EmployerDashboardMetricCard {
  identifier: string;
  label: string;
  value: number;
  icon: import('lucide-react').LucideIcon;
  iconColorClassName: string;
  valueColorClassName: string;
  caption?: string;
  iconBgClassName?: string;
  accentBorderClassName?: string;
  href?: string;
}

export type JobStatusTab =
  | 'All'
  | 'Active'
  | 'Draft'
  | 'Closed'
  | 'Expired'
  | 'Published'
  | 'Deactivated'
  | 'PendingReview';

export interface JobStatusTabOption {
  label: string;
  value: JobStatusTab;
}

export interface EmployerJobsTableProps {
  jobs: EmployerJobListItemDto[];
  onCloseJob: (jobId: string, jobTitle: string) => void;
  onDeleteJob: (jobId: string, jobTitle: string) => void;
  onReopenJob?: (jobId: string) => void;
  onPublishJob?: (jobId: string) => void;
}

export interface EmployerJobsTableSkeletonProps {
  rowCount?: number;
}

export type JobViewMode = 'list' | 'cards';

export interface EmployerJobsCardViewProps {
  jobs: EmployerJobListItemDto[];
  onCloseJob: (jobId: string, jobTitle: string) => void;
  onDeleteJob: (jobId: string, jobTitle: string) => void;
  onReopenJob?: (jobId: string) => void;
  onPublishJob?: (jobId: string) => void;
  onSelectJob?: (job: EmployerJobListItemDto) => void;
}

export interface EmployerJobsCardViewSkeletonProps {
  cardCount?: number;
}

export interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export interface EmployerJobSalaryBadgeProps {
  salaryType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;
  className?: string;
}

export interface EmployerJobDetailViewProps {
  jobId: string;
  initialTab?: EmployerJobDetailTab;
}

export interface EmployerJobDetailSkeletonProps {
  className?: string;
}

export interface EmployerJobsClientProps {
  className?: string;
}

export interface EmployerEditJobFormValues {
  title: string;
  companyName: string;
  description: string;
  requirements: string;
  location: string;
  city: string;
  country: string;
  minOverlapHours: number;
  employmentType: string;
  experienceLevel: string;
  workArrangement: string;
  requiredSkills: string[];
  vacancies: number;
  expireAt: string;
  salaryType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;
}

export interface EmployerEditJobFormErrors {
  title?: string;
  companyName?: string;
  description?: string;
  requirements?: string;
  location?: string;
  city?: string;
  country?: string;
  minOverlapHours?: string;
  vacancies?: string;
  expireAt?: string;
  requiredSkills?: string;
  salaryType?: string;
  salaryCurrency?: string;
  salaryPeriod?: string;
  salaryMin?: string;
  salaryMax?: string;
}

// 'resubmit' sends a deactivated job back for review. The backend's EnsureContentComplete
// demands the same fields as publishing, so it validates like 'publish'.
export type EditJobActionType = 'draft' | 'publish' | 'save' | 'reopen' | 'resubmit';

export interface EmployerEditJobViewProps {
  jobId?: string;
}

export interface EmployerEditJobSkeletonProps {
  className?: string;
}

export interface EmployerEditJobErrorViewProps {
  errorMessage?: string;
  onRetry: () => void;
  onBack: () => void;
}

export interface UpdateJobMutationVariables {
  values: EmployerEditJobFormValues;
  publish: boolean;
  successMessage?: string;
}

export interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

export interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string | string[] }>;
}

export interface CandidateMatch {
  candidateId: string;
  talentUserId: string;
  name: string;
  tagline?: string | null;
  location?: string | null;
  totalYearsExperience?: number | null;
  expectedSalary?: number | null;
  technicalSkills: string[];
  score: number;
  explanation?: string | null;
  skillBreakdown?: string | null;
  status: MatchStatus;
  hasActiveInvitation: boolean;
  invitationStatus?: string | null;
  invitationId?: string | null;
  matchedAt: string;
  lastUpdatedAt?: string | null;
  employerNotes?: string | null;
  candidateResponse?: 'pending' | 'interested' | 'not_interested' | null;
}

export interface WorkExperienceSummary {
  companyName: string;
  jobTitle: string;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean;
}

export interface EducationSummary {
  institution: string;
  degree: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface CandidateProfileSummary {
  id: string;
  userId: string;
  name: string;
  email?: string | null;
  tagline?: string | null;
  shortBio?: string | null;
  location?: string | null;
  phone?: string | null;
  linkedInUrl?: string | null;
  additionalUrls?: string[];
  totalYearsExperience?: number | null;
  expectedSalary?: number | null;
  skillPropositions?: string[];
  technicalSkills?: string[];
  softSkills?: string[];
  toolsAndPlatforms?: string[];
  profilePictureUrl?: string | null;
  workExperiences?: WorkExperienceSummary[];
  educations?: EducationSummary[];
}

export interface JobInvitation {
  id: string;
  jobId: string;
  talentUserId: string;
  talentName?: string;
  talentEmail?: string;
  status: InvitationStatus;
  message?: string | null;
  token?: string;
  invitedAt: string;
  respondedAt?: string | null;
  expiresAt: string;
  invitationCount: number;
}

export interface RunMatchingResponse {
  jobId: string;
  matchedCount: number;
  candidates: CandidateMatch[];
  reusedCount?: number;
}

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  Pending: 'Pending',
  Accepted: 'Accepted',
  Declined: 'Declined',
  Expired: 'Expired',
  Withdrawn: 'Withdrawn',
};

export const INVITATION_STATUS_COLORS: Record<InvitationStatus, string> = {
  Pending: 'bg-amber-50 border-amber-200 text-amber-700',
  Accepted: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  Declined: 'bg-rose-50 border-rose-200 text-rose-700',
  Expired: 'bg-slate-100 border-slate-200 text-slate-500',
  Withdrawn: 'bg-slate-100 border-slate-200 text-slate-500',
};

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  Active: 'Active',
  Expired: 'Expired',
  Archived: 'Archived',
};
