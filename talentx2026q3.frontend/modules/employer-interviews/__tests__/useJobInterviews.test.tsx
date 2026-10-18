import { renderHook, waitFor } from '@testing-library/react'

import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper'

import { useJobInterviews } from '../hooks/useJobInterviews'
import { interviewService } from '../services/interview.service'
import type { EmployerInterviewDto, PaginatedInterviewList } from '../types/interview.types'

jest.mock('../services/interview.service')

const mockedService = interviewService as jest.Mocked<typeof interviewService>

const page: PaginatedInterviewList<EmployerInterviewDto> = {
  items: [],
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 1,
}

afterEach(() => jest.clearAllMocks())

describe('useJobInterviews', () => {
  it('fetches the given job/page and exposes the paginated data', async () => {
    mockedService.getJobInterviews.mockResolvedValueOnce(page)

    const { result } = renderHook(() => useJobInterviews('job-1', { page: 1, pageSize: 10 }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBe(page)
    expect(mockedService.getJobInterviews).toHaveBeenCalledWith(
      'job-1',
      { page: 1, pageSize: 10 },
      expect.anything()
    )
  })

  it('stays idle while there is no job id', () => {
    const { result } = renderHook(() => useJobInterviews(''), { wrapper: createQueryWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockedService.getJobInterviews).not.toHaveBeenCalled()
  })
})
