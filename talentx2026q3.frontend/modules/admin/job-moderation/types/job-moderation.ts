import type { PaginatedList } from "@/modules/admin/audit-log/types/audit-log";

// The statuses admin moderation works with. Drafts and closed jobs are never returned by the
// admin jobs API.
export type ModerationStatus = "Published" | "Deactivated" | "PendingReview";

export type DeactivationReason =
  | "Spam"
  | "InappropriateContent"
  | "MisleadingInformation"
  | "Discriminatory"
  | "DuplicatePosting"
  | "Outdated"
  | "Other";

export type JobModerationAction = "Deactivated" | "ResubmittedForReview" | "Reactivated";

export interface AdminJobListItem {
  id: string;
  title: string;
  companyName: string;
  employerName: string;
  employerEmail: string;
  status: ModerationStatus;
  // Expired jobs are still stored as Published, so status alone can't tell a dead listing
  // from a live one.
  isExpired: boolean;
  location: string;
  employmentType: string;
  workArrangement: string;
  applicantCount: number;
  // When the job last went live (moves on reopen/reactivation/re-publish).
  publishedAt: string | null;
  // When the job was first posted (never changes).
  firstPublishedAt: string | null;
  expireAt: string;
  deactivatedAt: string | null;
}

export interface JobModerationHistoryEntry {
  id: string;
  action: JobModerationAction;
  fromStatus: ModerationStatus;
  toStatus: ModerationStatus;
  reason: DeactivationReason | null;
  reasonLabel: string | null;
  details: string | null;
  actorEmail: string;
  createdAt: string;
}

export interface AdminJobDetails {
  id: string;
  title: string;
  companyName: string;
  description: string;
  requirements: string | null;
  location: string;
  city: string | null;
  country: string | null;
  employmentType: string;
  experienceLevel: string;
  workArrangement: string;
  minOverlapHours: number | null;
  requiredSkills: string[];
  vacancies: number;
  salaryType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryPeriod: string | null;
  status: ModerationStatus;
  isExpired: boolean;
  createdAt: string;
  // When the job last went live (moves on reopen/reactivation/re-publish).
  publishedAt: string | null;
  // When the job was first posted (never changes).
  firstPublishedAt: string | null;
  expireAt: string;
  // Empty strings when the employer's user record no longer exists.
  employerName: string;
  employerEmail: string;
  // Why the job is down right now; all null once it has been reactivated.
  deactivationReason: DeactivationReason | null;
  deactivationReasonLabel: string | null;
  deactivationDetails: string | null;
  deactivatedAt: string | null;
  history: JobModerationHistoryEntry[];
}

export interface AdminJobsQueryParams {
  searchQuery?: string;
  status?: ModerationStatus;
  page?: number;
  pageSize?: number;
}

export interface DeactivateJobPayload {
  reason: DeactivationReason;
  details: string;
}

export interface StatusUpdateResponse {
  message?: string;
}

export type { PaginatedList };
