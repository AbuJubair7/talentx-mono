import type {
  CompanyReviewSummaryDto,
  MyCompanyReviewDto,
  MyCompanyReviewItemDto,
  PublicCompanyReviewDto,
} from '@/modules/company-review'

export function makeReview(overrides: Partial<MyCompanyReviewDto> = {}): MyCompanyReviewDto {
  return {
    id: 'review-1',
    status: 'Pending',
    sentiment: 'Positive',
    comment: 'Friendly, well organised process.',
    ratings: { recruitmentProcess: 5, communication: 4, interviewExperience: null, professionalism: 3 },
    moderationReason: null,
    moderationDetails: null,
    submittedAt: '2026-09-20T10:00:00Z',
    updatedAt: null,
    publishedAt: null,
    ...overrides,
  }
}

export function makeReviewItem(overrides: Partial<MyCompanyReviewItemDto> = {}): MyCompanyReviewItemDto {
  return {
    jobApplicationId: 'app-1',
    jobTitle: 'Backend Engineer',
    companyId: 'company-1',
    companyName: 'Acme Corp',
    interviewType: 'OnCall',
    reviewUnlocksAt: '2026-09-18T10:00:00Z',
    canSubmit: true,
    review: null,
    canEdit: false,
    canWithdraw: false,
    ...overrides,
  }
}

export function makePublicReview(overrides: Partial<PublicCompanyReviewDto> = {}): PublicCompanyReviewDto {
  return {
    id: 'review-1',
    sentiment: 'Positive',
    comment: 'Friendly, well organised process.',
    recruitmentProcessRating: 5,
    communicationRating: 4,
    interviewExperienceRating: null,
    professionalismRating: 3,
    publishedAt: '2026-09-20T10:00:00Z',
    ...overrides,
  }
}

export function makeSummary(overrides: Partial<CompanyReviewSummaryDto> = {}): CompanyReviewSummaryDto {
  return {
    totalCount: 3,
    positiveCount: 2,
    negativeCount: 1,
    positivePercent: 66.7,
    recruitmentProcess: { average: 4.3, ratingCount: 3 },
    communication: { average: 3.5, ratingCount: 2 },
    interviewExperience: { average: null, ratingCount: 0 },
    professionalism: { average: 5, ratingCount: 1 },
    ...overrides,
  }
}
