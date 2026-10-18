import type {
  CompanyReviewSummaryDto,
  GetMyCompanyReviewsQueryParams,
  GetPublicCompanyReviewsQueryParams,
  RatingArea,
  ReviewModerationReason,
  ReviewStatusStyleConfig,
} from '../types/company-review.types';

export const COMPANY_REVIEW_PAGE_SIZE = 10;
export const COMPANY_REVIEW_PAGE_NUMBER = 1;
export const COMPANY_REVIEW_COMMENT_MAX_LENGTH = 2000;
export const COMPANY_REVIEW_MIN_RATING = 1;
export const COMPANY_REVIEW_MAX_RATING = 5;

export const COMPANY_REVIEW_ENDPOINTS = {
  myReviews: () => `/talents/me/company-reviews`,
  review: (reviewId: string) => `/talents/me/company-reviews/${reviewId}`,
  withdraw: (reviewId: string) => `/talents/me/company-reviews/${reviewId}/withdraw`,
  publicReviews: (companyId: string) => `/companies/${companyId}/reviews`,
};

export const COMPANY_REVIEW_QUERY_KEYS = {
  all: ['company-reviews'] as const,
  lists: () => [...COMPANY_REVIEW_QUERY_KEYS.all, 'mine'] as const,
  list: (params?: GetMyCompanyReviewsQueryParams) => [...COMPANY_REVIEW_QUERY_KEYS.lists(), params] as const,
  publicLists: () => [...COMPANY_REVIEW_QUERY_KEYS.all, 'public'] as const,
  publicList: (companyId: string, params?: GetPublicCompanyReviewsQueryParams) =>
    [...COMPANY_REVIEW_QUERY_KEYS.publicLists(), companyId, params] as const,
};

export const RATING_AREAS: readonly RatingArea[] = [
  { key: 'recruitmentProcess', label: 'Recruitment Process' },
  { key: 'communication', label: 'Communication' },
  { key: 'interviewExperience', label: 'Interview Experience' },
  { key: 'professionalism', label: 'Professionalism' },
];

export const REVIEW_SENTIMENT_LABELS = {
  Positive: 'Positive',
  Negative: 'Negative',
} as const;

export const REVIEW_STATUS_STYLES: Record<string, ReviewStatusStyleConfig> = {
  pending: { label: 'Pending review', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  published: { label: 'Published', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  hidden: { label: 'Hidden', bg: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-500' },
  withdrawn: { label: 'Withdrawn', bg: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
};

export const DEFAULT_REVIEW_STATUS_STYLE: ReviewStatusStyleConfig = {
  label: '',
  bg: 'bg-slate-100 text-slate-700 border-slate-200',
  dot: 'bg-slate-400',
};

export const REVIEW_MODERATION_REASON_LABELS: Record<ReviewModerationReason, string> = {
  Spam: 'Spam',
  InappropriateContent: 'Inappropriate content',
  PersonalInformation: 'Personal information',
  FalseOrMisleading: 'False or misleading',
  OffTopic: 'Off topic',
  Other: 'Other',
};

export const COMPANY_REVIEW_FALLBACKS = {
  ERROR_LOAD_LIST: 'Could not load your reviews.',
  ERROR_LOAD_PUBLIC_LIST: 'Could not load reviews.',
  ERROR_SUBMIT: 'Failed to submit your review.',
  ERROR_UPDATE: 'Failed to update your review.',
  ERROR_WITHDRAW: 'Failed to withdraw your review.',
};

/** Used where a company has no summary yet (e.g. an older cached public-profile response). */
export const EMPTY_COMPANY_REVIEW_SUMMARY: CompanyReviewSummaryDto = {
  totalCount: 0,
  positiveCount: 0,
  negativeCount: 0,
  positivePercent: 0,
  recruitmentProcess: { average: null, ratingCount: 0 },
  communication: { average: null, ratingCount: 0 },
  interviewExperience: { average: null, ratingCount: 0 },
  professionalism: { average: null, ratingCount: 0 },
};
