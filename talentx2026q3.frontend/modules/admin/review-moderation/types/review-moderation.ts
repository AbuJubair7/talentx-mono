import type { PaginatedList } from "@/modules/admin/audit-log/types/audit-log";
import type {
  CompanyReviewRatingsDto,
  CompanyReviewStatus,
  ReviewModerationReason,
  ReviewSentiment,
} from "@/modules/company-review";

export interface AdminCompanyReviewListItem {
  id: string;
  status: CompanyReviewStatus;
  sentiment: ReviewSentiment;
  comment: string | null;
  ratings: CompanyReviewRatingsDto;
  companyId: string;
  companyName: string;
  jobTitle: string;
  // "Deleted user" / null id when the talent's account no longer exists.
  reviewerName: string;
  reviewerEmail: string;
  reviewerUserId: string | null;
  submittedAt: string;
  updatedAt: string | null;
  publishedAt: string | null;
  moderationReason: ReviewModerationReason | null;
  moderationDetails: string | null;
  moderatedAt: string | null;
}

export interface AdminCompanyReviewDetails extends AdminCompanyReviewListItem {
  // The entity only stores the moderator's user id; the list doesn't resolve this.
  moderatedByEmail: string | null;
}

export interface AdminCompanyReviewStats {
  total: number;
  pendingCount: number;
  publishedCount: number;
  rejectedCount: number;
  hiddenCount: number;
  withdrawnCount: number;
}

export interface AdminCompanyReviewsQueryParams {
  searchQuery?: string;
  status?: CompanyReviewStatus;
  sentiment?: ReviewSentiment;
  page?: number;
  pageSize?: number;
}

export interface ModerationReasonPayload {
  reason: ReviewModerationReason;
  details: string;
}

export interface StatusUpdateResponse {
  message?: string;
}

export type { PaginatedList };
