import { apiClient } from '@/lib/api/axios'

import { companyReviewService } from '../services/company-review.service'
import type {
  PaginatedCompanyReviewList,
  MyCompanyReviewItemDto,
  PublicCompanyReviewDto,
} from '../types/company-review.types'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}))

const mockedGet = jest.mocked(apiClient.get)
const mockedPost = jest.mocked(apiClient.post)
const mockedPut = jest.mocked(apiClient.put)

afterEach(() => jest.clearAllMocks())

describe('companyReviewService.getMyReviews', () => {
  it('GETs /talents/me/company-reviews forwarding params + signal', async () => {
    const page: PaginatedCompanyReviewList<MyCompanyReviewItemDto> = {
      items: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    }
    mockedGet.mockResolvedValueOnce({ data: page })
    const controller = new AbortController()

    const result = await companyReviewService.getMyReviews({ page: 2, pageSize: 10 }, controller.signal)

    expect(mockedGet).toHaveBeenCalledWith('/talents/me/company-reviews', {
      params: { page: 2, pageSize: 10 },
      signal: controller.signal,
    })
    expect(result).toBe(page)
  })
})

describe('companyReviewService.submit', () => {
  it('POSTs the payload and resolves to the new review id', async () => {
    mockedPost.mockResolvedValueOnce({ data: 'new-review-id' })
    const payload = {
      jobApplicationId: 'app-1',
      sentiment: 'Positive' as const,
      comment: 'Great',
      ratings: { recruitmentProcess: 5, communication: null, interviewExperience: null, professionalism: null },
    }

    const result = await companyReviewService.submit(payload)

    expect(mockedPost).toHaveBeenCalledWith('/talents/me/company-reviews', payload)
    expect(result).toBe('new-review-id')
  })
})

describe('companyReviewService.update', () => {
  it('PUTs the content to the review endpoint', async () => {
    mockedPut.mockResolvedValueOnce({ data: { message: 'Updated' } })

    const result = await companyReviewService.update('review-9', { sentiment: 'Negative', comment: 'Slow' })

    expect(mockedPut).toHaveBeenCalledWith('/talents/me/company-reviews/review-9', {
      sentiment: 'Negative',
      comment: 'Slow',
    })
    expect(result).toEqual({ message: 'Updated' })
  })

  it('normalises an empty body to {}', async () => {
    mockedPut.mockResolvedValueOnce({ data: undefined })
    await expect(companyReviewService.update('review-9', { sentiment: 'Positive' })).resolves.toEqual({})
  })
})

describe('companyReviewService.withdraw', () => {
  it('POSTs to the withdraw endpoint without a body', async () => {
    mockedPost.mockResolvedValueOnce({ data: { message: 'Withdrawn' } })

    const result = await companyReviewService.withdraw('review-9')

    expect(mockedPost).toHaveBeenCalledWith('/talents/me/company-reviews/review-9/withdraw')
    expect(result).toEqual({ message: 'Withdrawn' })
  })

  it('normalises an empty body to {}', async () => {
    mockedPost.mockResolvedValueOnce({ data: null })
    await expect(companyReviewService.withdraw('review-9')).resolves.toEqual({})
  })
})

describe('companyReviewService.getPublicReviews', () => {
  it('GETs /companies/{id}/reviews forwarding page, pageSize, and signal', async () => {
    const page: PaginatedCompanyReviewList<PublicCompanyReviewDto> = {
      items: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    }
    mockedGet.mockResolvedValueOnce({ data: page })
    const controller = new AbortController()

    const result = await companyReviewService.getPublicReviews('company-1', { page: 2, pageSize: 10 }, controller.signal)

    expect(mockedGet).toHaveBeenCalledWith('/companies/company-1/reviews', {
      params: { page: 2, pageSize: 10 },
      signal: controller.signal,
    })
    expect(result).toBe(page)
  })
})
