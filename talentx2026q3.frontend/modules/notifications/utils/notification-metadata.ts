export interface NotificationMatchingJobsMetadata {
  keyword?: string;
  location?: string;
  employmentType?: string;
  experienceLevel?: string;
  workArrangement?: string;
  jobId?: string;
}

export interface NotificationEmployerVerificationMetadata {
  employerId?: string;
  employerName?: string;
  companyName?: string;
}

export interface NotificationJobReportMetadata {
  jobId?: string;
  reportId?: string;
}

// Metadata on job moderation notifications (deactivated, reactivated, resubmitted, report resolved).
export interface NotificationJobMetadata {
  jobId?: string;
  jobTitle?: string;
}

export interface NotificationInterviewMetadata {
  invitationId?: string;
  jobId?: string;
  jobTitle?: string;
  applicationId?: string;
  companyName?: string;
  candidateName?: string;
}

export interface NotificationJobInvitationMetadata {
  invitationId?: string;
  jobId?: string;
  jobTitle?: string;
  companyName?: string;
  token?: string;
}

// The status filter an employer's job list falls back to when a notification carries no job id.
export type EmployerJobFallbackStatus = 'Deactivated' | 'Active';

export function parseNotificationMetadata(
  metadata: string | null
): NotificationMatchingJobsMetadata | null {
  if (!metadata) {
    return null;
  }
  try {
    const parsedMetadata = JSON.parse(metadata) as unknown;
    if (typeof parsedMetadata !== 'object' || parsedMetadata === null) {
      return null;
    }
    return parsedMetadata as NotificationMatchingJobsMetadata;
  } catch {
    return null;
  }
}

export function parseEmployerVerificationMetadata(
  metadata: string | null
): NotificationEmployerVerificationMetadata | null {
  if (!metadata) {
    return null;
  }
  try {
    const parsedMetadata = JSON.parse(metadata) as unknown;
    if (typeof parsedMetadata !== 'object' || parsedMetadata === null) {
      return null;
    }
    return parsedMetadata as NotificationEmployerVerificationMetadata;
  } catch {
    return null;
  }
}

// Parses job-keyed metadata: a JSON object, or a bare job id (which JobReportResolved sends).
function parseJobKeyedMetadata<T extends { jobId?: string }>(metadata: string | null): T | null {
  if (!metadata) {
    return null;
  }
  try {
    const parsedMetadata = JSON.parse(metadata) as unknown;
    if (typeof parsedMetadata === 'string') {
      return { jobId: parsedMetadata } as T;
    }
    if (typeof parsedMetadata !== 'object' || parsedMetadata === null) {
      return null;
    }
    return parsedMetadata as T;
  } catch {
    const trimmedMetadata = metadata.trim();
    if (trimmedMetadata.length > 0) {
      return { jobId: trimmedMetadata } as T;
    }
    return null;
  }
}

// Parses a JobReported notification's metadata ({ jobId, reportId }).
export function parseJobReportMetadata(
  metadata: string | null
): NotificationJobReportMetadata | null {
  return parseJobKeyedMetadata<NotificationJobReportMetadata>(metadata);
}

// Parses a job moderation notification's metadata ({ jobId, jobTitle }, or a bare job id).
export function parseJobMetadata(metadata: string | null): NotificationJobMetadata | null {
  return parseJobKeyedMetadata<NotificationJobMetadata>(metadata);
}

export function parseInterviewMetadata(
  metadata: string | null
): NotificationInterviewMetadata | null {
  return parseJobKeyedMetadata<NotificationInterviewMetadata>(metadata);
}

export function parseJobInvitationMetadata(
  metadata: string | null
): NotificationJobInvitationMetadata | null {
  return parseJobKeyedMetadata<NotificationJobInvitationMetadata>(metadata);
}

// Mirrors the "View Matching Jobs" query-param convention already established in
// modules/job-alerts/components/JobAlertsView.tsx — same param names, same casing.
export function buildMatchingJobsUrl(
  metadata: NotificationMatchingJobsMetadata
): string | null {
  const searchParameters = new URLSearchParams();
  if (metadata.keyword) searchParameters.set('keyword', metadata.keyword);
  if (metadata.location) searchParameters.set('location', metadata.location);
  if (metadata.employmentType) searchParameters.set('employmentType', metadata.employmentType);
  if (metadata.experienceLevel) searchParameters.set('experienceLevel', metadata.experienceLevel);
  if (metadata.workArrangement) searchParameters.set('workArrangement', metadata.workArrangement);

  if (searchParameters.toString() === '') {
    return null;
  }
  return `/jobs?${searchParameters.toString()}`;
}

export function buildEmployerVerificationUrl(
  metadata: NotificationEmployerVerificationMetadata
): string | null {
  if (!metadata.employerId) {
    return null;
  }
  return `/admin/employers?highlight=${encodeURIComponent(metadata.employerId)}`;
}

export function buildEmployerDashboardUrl(): string | null {
  return '/dashboard';
}

export function buildReportedJobsUrl(
  _metadata?: NotificationJobReportMetadata | null
): string | null {
  return '/admin/reported-jobs';
}

// Admins land on the moderation list; with a jobId it opens that job's detail dialog so the
// resubmitted fix can be reviewed and approved in place.
export function buildJobModerationUrl(
  metadata?: NotificationJobMetadata | null
): string {
  if (metadata?.jobId) {
    return `/admin/jobs?job=${encodeURIComponent(metadata.jobId)}`;
  }
  return '/admin/jobs';
}

// Employers land on the job itself; without a job id, on their job list filtered to fallbackStatus.
export function buildEmployerJobUrl(
  metadata: NotificationJobMetadata | null | undefined,
  fallbackStatus: EmployerJobFallbackStatus
): string {
  if (metadata?.jobId) {
    return `/job/job-listing/${encodeURIComponent(metadata.jobId)}`;
  }
  return `/job/job-listing?status=${fallbackStatus}`;
}

export function buildTalentInterviewsUrl(): string {
  return '/interviews';
}

export function buildEmployerApplicantDetailUrl(
  metadata?: NotificationInterviewMetadata | null
): string {
  if (metadata?.jobId && metadata?.applicationId) {
    return `/job/job-listing/${encodeURIComponent(metadata.jobId)}/applicants/${encodeURIComponent(metadata.applicationId)}`;
  }
  if (metadata?.jobId) {
    return `/job/job-listing/${encodeURIComponent(metadata.jobId)}`;
  }
  return '/job/job-listing';
}

export function buildJobInvitationUrl(
  metadata?: NotificationJobInvitationMetadata | null
): string {
  if (metadata?.jobId && metadata?.token) {
    return `/jobs/${encodeURIComponent(metadata.jobId)}?invitation=${encodeURIComponent(metadata.token)}`;
  }
  if (metadata?.jobId) {
    return `/jobs/${encodeURIComponent(metadata.jobId)}`;
  }
  return '/jobs';
}


