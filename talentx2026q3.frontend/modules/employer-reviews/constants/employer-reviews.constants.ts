import { COMPANY_REVIEW_STATUS_VALUES, REVIEW_SENTIMENT_VALUES } from '@/modules/company-review';
import type { CompanyReviewStatus } from '@/modules/company-review';
import type {
  EmployerCompanyReviewSummaryDto,
  EmployerReviewFilterOption,
  GetEmployerCompanyReviewsQueryParams,
} from '../types/employer-reviews.types';

export const EMPLOYER_REVIEW_PAGE_SIZE = 10;
export const EMPLOYER_REVIEW_PAGE_NUMBER = 1;

export const EMPLOYER_REVIEW_ENDPOINTS = {
  reviews: () => `/employers/me/company-reviews`,
  summary: () => `/employers/me/company-reviews/summary`,
};

export const EMPLOYER_REVIEW_QUERY_KEYS = {
  all: ['employer-company-reviews'] as const,
  lists: () => [...EMPLOYER_REVIEW_QUERY_KEYS.all, 'list'] as const,
  list: (params?: GetEmployerCompanyReviewsQueryParams) =>
    [...EMPLOYER_REVIEW_QUERY_KEYS.lists(), params] as const,
  summaries: () => [...EMPLOYER_REVIEW_QUERY_KEYS.all, 'summary'] as const,
};

export const EMPLOYER_REVIEW_SENTIMENT_OPTIONS: readonly EmployerReviewFilterOption<
  (typeof REVIEW_SENTIMENT_VALUES)[number]
>[] = REVIEW_SENTIMENT_VALUES.map((sentiment) => ({ value: sentiment, label: sentiment }));

/** Employer-facing explanation of what each status means for their company, shown in the status overview card. */
export const EMPLOYER_REVIEW_STATUS_DESCRIPTIONS: Record<CompanyReviewStatus, string> = {
  Pending: 'Awaiting TalentX moderation',
  Published: 'Visible on your public company profile',
  Rejected: 'Did not pass moderation',
  Hidden: 'Hidden from public view by a moderator',
  Withdrawn: 'Withdrawn by the reviewer',
};

export const EMPLOYER_REVIEW_FALLBACKS = {
  ERROR_LOAD_LIST: 'Could not load your company reviews.',
  ERROR_LOAD_SUMMARY: 'Could not load your review summary.',
};

export const EMPTY_EMPLOYER_REVIEW_SUMMARY: EmployerCompanyReviewSummaryDto = {
  summary: {
    totalCount: 0,
    positiveCount: 0,
    negativeCount: 0,
    positivePercent: 0,
    recruitmentProcess: { average: null, ratingCount: 0 },
    communication: { average: null, ratingCount: 0 },
    interviewExperience: { average: null, ratingCount: 0 },
    professionalism: { average: null, ratingCount: 0 },
  },
  countsByStatus: Object.fromEntries(COMPANY_REVIEW_STATUS_VALUES.map((status) => [status, 0])) as Record<
    CompanyReviewStatus,
    number
  >,
};
