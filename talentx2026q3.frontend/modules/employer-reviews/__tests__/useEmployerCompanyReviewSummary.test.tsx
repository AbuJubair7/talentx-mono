import { renderHook, waitFor } from '@testing-library/react'

import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper'

import { useEmployerCompanyReviewSummary } from '../hooks/useEmployerCompanyReviewSummary'
import { employerReviewsService } from '../services/employer-reviews.service'
import type { EmployerCompanyReviewSummaryDto } from '../types/employer-reviews.types'

jest.mock('../services/employer-reviews.service')

const mockedService = employerReviewsService as jest.Mocked<typeof employerReviewsService>

const summary: EmployerCompanyReviewSummaryDto = {
  summary: {
    totalCount: 2,
    positiveCount: 1,
    negativeCount: 1,
    positivePercent: 50,
    recruitmentProcess: { average: 4, ratingCount: 2 },
    communication: { average: null, ratingCount: 0 },
    interviewExperience: { average: null, ratingCount: 0 },
    professionalism: { average: null, ratingCount: 0 },
  },
  countsByStatus: {
    Pending: 1,
    Published: 2,
    Rejected: 0,
    Hidden: 0,
    Withdrawn: 0,
  },
}

afterEach(() => jest.clearAllMocks())

describe('useEmployerCompanyReviewSummary', () => {
  it('fetches the summary and exposes the data', async () => {
    mockedService.getSummary.mockResolvedValueOnce(summary)

    const { result } = renderHook(() => useEmployerCompanyReviewSummary(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBe(summary)
    expect(mockedService.getSummary).toHaveBeenCalledTimes(1)
  })
})
