import type { InterviewType } from '@/modules/talent-interviews';

export const REVIEW_SENTIMENT_VALUES = ['Positive', 'Negative'] as const;
export type ReviewSentiment = (typeof REVIEW_SENTIMENT_VALUES)[number];

export const COMPANY_REVIEW_STATUS_VALUES = [
  'Pending',
  'Published',
  'Rejected',
  'Hidden',
  'Withdrawn',
] as const;
export type CompanyReviewStatus = (typeof COMPANY_REVIEW_STATUS_VALUES)[number];

export const REVIEW_MODERATION_REASON_VALUES = [
  'Spam',
  'InappropriateContent',
  'PersonalInformation',
  'FalseOrMisleading',
  'OffTopic',
  'Other',
] as const;
export type ReviewModerationReason = (typeof REVIEW_MODERATION_REASON_VALUES)[number];

export type RatingAreaKey =
  | 'recruitmentProcess'
  | 'communication'
  | 'interviewExperience'
  | 'professionalism';

/** A rating is 1–5, or null when the talent chose not to rate that area. */
export type CompanyReviewRatingsDto = Record<RatingAreaKey, number | null>;

export interface RatingAreaSummaryDto {
  average: number | null;
  ratingCount: number;
}

/** Shared by the employer view and the public company page (later parts of this feature). */
export interface CompanyReviewSummaryDto {
  totalCount: number;
  positiveCount: number;
  negativeCount: number;
  positivePercent: number;
  recruitmentProcess: RatingAreaSummaryDto;
  communication: RatingAreaSummaryDto;
  interviewExperience: RatingAreaSummaryDto;
  professionalism: RatingAreaSummaryDto;
}

/** The talent's own review, including its moderation state. */
export interface MyCompanyReviewDto {
  id: string;
  status: CompanyReviewStatus;
  sentiment: ReviewSentiment;
  comment: string | null;
  ratings: CompanyReviewRatingsDto;
  moderationReason: ReviewModerationReason | null;
  moderationDetails: string | null;
  submittedAt: string;
  updatedAt: string | null;
  publishedAt: string | null;
}

/** One row of the Reviews tab: an application with an accepted interview. */
export interface MyCompanyReviewItemDto {
  jobApplicationId: string;
  jobTitle: string;
  /** Null only while the company's profile row hasn't been created yet. */
  companyId: string | null;
  companyName: string;
  interviewType: InterviewType;
  /** When submitting unlocks; null if it can't be derived from the interview. */
  reviewUnlocksAt: string | null;
  canSubmit: boolean;
  review: MyCompanyReviewDto | null;
  canEdit: boolean;
  canWithdraw: boolean;
}

export interface PaginatedCompanyReviewList<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface GetMyCompanyReviewsQueryParams {
  page?: number;
  pageSize?: number;
}

/** The public, anonymous view of one published review on a company's public profile. No reviewer, job, or moderation info. */
export interface PublicCompanyReviewDto {
  id: string;
  sentiment: ReviewSentiment;
  comment: string | null;
  recruitmentProcessRating: number | null;
  communicationRating: number | null;
  interviewExperienceRating: number | null;
  professionalismRating: number | null;
  publishedAt: string;
}

export interface GetPublicCompanyReviewsQueryParams {
  page?: number;
  pageSize?: number;
}

export interface CompanyReviewContentPayload {
  sentiment: ReviewSentiment;
  comment?: string;
  ratings?: Partial<CompanyReviewRatingsDto>;
}

export interface SubmitCompanyReviewPayload extends CompanyReviewContentPayload {
  jobApplicationId: string;
}

export type UpdateCompanyReviewPayload = CompanyReviewContentPayload;

export interface CompanyReviewActionResponse {
  message?: string;
}

export interface ReviewStatusStyleConfig {
  label: string;
  bg: string;
  dot: string;
}

export interface RatingArea {
  key: RatingAreaKey;
  label: string;
}
