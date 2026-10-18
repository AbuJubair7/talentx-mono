import type {
  CompanyReviewRatingsDto,
  CompanyReviewStatus,
  CompanyReviewSummaryDto,
  ReviewSentiment,
} from '@/modules/company-review';

/** The employer's anonymized, read-only view of one review about their company. */
export interface EmployerCompanyReviewDto {
  id: string;
  status: CompanyReviewStatus;
  sentiment: ReviewSentiment;
  comment: string | null;
  ratings: CompanyReviewRatingsDto;
  jobTitle: string;
  submittedAt: string;
  updatedAt: string | null;
}

/** Published-only summary (matches the public page) plus a count of reviews per status. */
export interface EmployerCompanyReviewSummaryDto {
  summary: CompanyReviewSummaryDto;
  countsByStatus: Record<CompanyReviewStatus, number>;
}

export interface PaginatedEmployerCompanyReviewList<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface GetEmployerCompanyReviewsQueryParams {
  status?: CompanyReviewStatus;
  sentiment?: ReviewSentiment;
  page?: number;
  pageSize?: number;
}

export const ALL_EMPLOYER_REVIEW_STATUS_FILTER = 'All' as const;
export type EmployerReviewStatusFilter = CompanyReviewStatus | typeof ALL_EMPLOYER_REVIEW_STATUS_FILTER;

export const ALL_EMPLOYER_REVIEW_SENTIMENT_FILTER = 'All' as const;
export type EmployerReviewSentimentFilter = ReviewSentiment | typeof ALL_EMPLOYER_REVIEW_SENTIMENT_FILTER;

export interface EmployerReviewFilterOption<T> {
  value: T;
  label: string;
}
