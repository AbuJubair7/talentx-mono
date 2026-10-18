import { renderHook, waitFor } from '@testing-library/react'

import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper'

import { useEmployerCompanyReviews } from '../hooks/useEmployerCompanyReviews'
import { employerReviewsService } from '../services/employer-reviews.service'
import type { EmployerCompanyReviewDto, PaginatedEmployerCompanyReviewList } from '../types/employer-reviews.types'

jest.mock('../services/employer-reviews.service')

const mockedService = employerReviewsService as jest.Mocked<typeof employerReviewsService>

const page: PaginatedEmployerCompanyReviewList<EmployerCompanyReviewDto> = {
  items: [],
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 1,
}

afterEach(() => jest.clearAllMocks())

describe('useEmployerCompanyReviews', () => {
  it('fetches the given page/filters and exposes the paginated data', async () => {
    mockedService.getReviews.mockResolvedValueOnce(page)

    const { result } = renderHook(() => useEmployerCompanyReviews({ page: 1, pageSize: 10 }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBe(page)
    expect(mockedService.getReviews).toHaveBeenCalledWith({ page: 1, pageSize: 10 }, expect.anything())
  })

  it('re-fetches when the params change (distinct query keys)', async () => {
    mockedService.getReviews.mockResolvedValue(page)

    const { rerender } = renderHook(
      ({ status }: { status?: 'Published' | 'Withdrawn' }) => useEmployerCompanyReviews({ status }),
      {
        wrapper: createQueryWrapper(),
        initialProps: { status: undefined as 'Published' | 'Withdrawn' | undefined },
      }
    )

    await waitFor(() => expect(mockedService.getReviews).toHaveBeenCalledTimes(1))

    rerender({ status: 'Withdrawn' })

    await waitFor(() => expect(mockedService.getReviews).toHaveBeenCalledTimes(2))
    expect(mockedService.getReviews).toHaveBeenLastCalledWith({ status: 'Withdrawn' }, expect.anything())
  })
})
