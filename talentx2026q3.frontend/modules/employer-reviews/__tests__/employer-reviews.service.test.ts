import { apiClient } from '@/lib/api/axios'

import { employerReviewsService } from '../services/employer-reviews.service'
import type {
  EmployerCompanyReviewDto,
  EmployerCompanyReviewSummaryDto,
  PaginatedEmployerCompanyReviewList,
} from '../types/employer-reviews.types'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn() },
}))

const mockedGet = jest.mocked(apiClient.get)

afterEach(() => jest.clearAllMocks())

describe('employerReviewsService.getReviews', () => {
  const page: PaginatedEmployerCompanyReviewList<EmployerCompanyReviewDto> = {
    items: [],
    page: 2,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  }

  it('GETs /employers/me/company-reviews forwarding params and the abort signal', async () => {
    mockedGet.mockResolvedValueOnce({ data: page })
    const controller = new AbortController()

    const result = await employerReviewsService.getReviews(
      { status: 'Published', sentiment: 'Positive', page: 2, pageSize: 10 },
      controller.signal
    )

    expect(mockedGet).toHaveBeenCalledWith('/employers/me/company-reviews', {
      params: { status: 'Published', sentiment: 'Positive', page: 2, pageSize: 10 },
      signal: controller.signal,
    })
    expect(result).toBe(page)
  })

  it('GETs with no params when called with none', async () => {
    mockedGet.mockResolvedValueOnce({ data: page })

    await employerReviewsService.getReviews()

    expect(mockedGet).toHaveBeenCalledWith('/employers/me/company-reviews', {
      params: undefined,
      signal: undefined,
    })
  })
})

describe('employerReviewsService.getSummary', () => {
  const summary: EmployerCompanyReviewSummaryDto = {
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
    countsByStatus: {
      Pending: 0,
      Published: 0,
      Rejected: 0,
      Hidden: 0,
      Withdrawn: 0,
    },
  }

  it('GETs /employers/me/company-reviews/summary forwarding the abort signal', async () => {
    mockedGet.mockResolvedValueOnce({ data: summary })
    const controller = new AbortController()

    const result = await employerReviewsService.getSummary(controller.signal)

    expect(mockedGet).toHaveBeenCalledWith('/employers/me/company-reviews/summary', {
      signal: controller.signal,
    })
    expect(result).toBe(summary)
  })
})
