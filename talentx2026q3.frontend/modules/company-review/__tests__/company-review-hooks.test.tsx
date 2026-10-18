import { QueryClient } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper'

import { COMPANY_REVIEW_QUERY_KEYS } from '../constants/company-review.constants'
import { useMyCompanyReviews } from '../hooks/useMyCompanyReviews'
import { usePublicCompanyReviews } from '../hooks/usePublicCompanyReviews'
import { useSubmitCompanyReview } from '../hooks/useSubmitCompanyReview'
import { useUpdateCompanyReview } from '../hooks/useUpdateCompanyReview'
import { useWithdrawCompanyReview } from '../hooks/useWithdrawCompanyReview'
import { companyReviewService } from '../services/company-review.service'
import type { PublicCompanyReviewDto } from '../types/company-review.types'

jest.mock('../services/company-review.service')

const mockedService = companyReviewService as jest.Mocked<typeof companyReviewService>

afterEach(() => jest.restoreAllMocks())

describe('useMyCompanyReviews', () => {
  it('fetches the talent reviews for the given page', async () => {
    const page = { items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 0 }
    mockedService.getMyReviews.mockResolvedValueOnce(page)

    const { result } = renderHook(() => useMyCompanyReviews({ page: 1, pageSize: 10 }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBe(page)
    expect(mockedService.getMyReviews).toHaveBeenCalledWith({ page: 1, pageSize: 10 }, expect.anything())
  })
})

describe('usePublicCompanyReviews', () => {
  it('fetches the first page of a company\'s public reviews', async () => {
    const page = { items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 0 }
    mockedService.getPublicReviews.mockResolvedValueOnce(page)

    const { result } = renderHook(() => usePublicCompanyReviews('company-1', 10), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.pages[0]).toBe(page)
    expect(mockedService.getPublicReviews).toHaveBeenCalledWith('company-1', { page: 1, pageSize: 10 }, expect.anything())
  })

  it('fetches the next page via fetchNextPage', async () => {
    const makeReview = (id: string): PublicCompanyReviewDto => ({
      id,
      sentiment: 'Positive',
      comment: null,
      recruitmentProcessRating: null,
      communicationRating: null,
      interviewExperienceRating: null,
      professionalismRating: null,
      publishedAt: '2026-08-01T00:00:00.000Z',
    })
    const firstPage = { items: [makeReview('r-1')], page: 1, pageSize: 2, totalCount: 4, totalPages: 2 }
    const secondPage = { items: [makeReview('r-2')], page: 2, pageSize: 2, totalCount: 4, totalPages: 2 }
    mockedService.getPublicReviews.mockResolvedValueOnce(firstPage).mockResolvedValueOnce(secondPage)

    const { result } = renderHook(() => usePublicCompanyReviews('company-1', 2), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    result.current.fetchNextPage()

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2))
    expect(mockedService.getPublicReviews).toHaveBeenLastCalledWith('company-1', { page: 2, pageSize: 2 }, expect.anything())
  })

  it('does not fetch when companyId is empty', () => {
    const { result } = renderHook(() => usePublicCompanyReviews(''), { wrapper: createQueryWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.isPending).toBe(true)
  })
})

describe('useSubmitCompanyReview', () => {
  it('submits and invalidates the review lists', async () => {
    mockedService.submit.mockResolvedValueOnce('id-1')
    const invalidateSpy = jest.spyOn(QueryClient.prototype, 'invalidateQueries')

    const { result } = renderHook(() => useSubmitCompanyReview(), { wrapper: createQueryWrapper() })
    result.current.mutate({ jobApplicationId: 'app-1', sentiment: 'Positive' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedService.submit).toHaveBeenCalledWith({ jobApplicationId: 'app-1', sentiment: 'Positive' })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: COMPANY_REVIEW_QUERY_KEYS.lists() })
  })
})

describe('useUpdateCompanyReview', () => {
  it('updates and invalidates the review lists', async () => {
    mockedService.update.mockResolvedValueOnce({ message: 'ok' })
    const invalidateSpy = jest.spyOn(QueryClient.prototype, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateCompanyReview(), { wrapper: createQueryWrapper() })
    result.current.mutate({ reviewId: 'r-1', payload: { sentiment: 'Negative' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedService.update).toHaveBeenCalledWith('r-1', { sentiment: 'Negative' })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: COMPANY_REVIEW_QUERY_KEYS.lists() })
  })
})

describe('useWithdrawCompanyReview', () => {
  it('withdraws and invalidates the review lists', async () => {
    mockedService.withdraw.mockResolvedValueOnce({ message: 'ok' })
    const invalidateSpy = jest.spyOn(QueryClient.prototype, 'invalidateQueries')

    const { result } = renderHook(() => useWithdrawCompanyReview(), { wrapper: createQueryWrapper() })
    result.current.mutate('r-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedService.withdraw).toHaveBeenCalledWith('r-1')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: COMPANY_REVIEW_QUERY_KEYS.lists() })
  })
})
