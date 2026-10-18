import { QueryClient } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper'

import { TALENT_INTERVIEW_QUERY_KEYS } from '../constants/interview.constants'
import { useAcceptInterview } from '../hooks/useAcceptInterview'
import { useDeclineInterview } from '../hooks/useDeclineInterview'
import { useMyInterviews } from '../hooks/useMyInterviews'
import { talentInterviewService } from '../services/interview.service'
import type { PaginatedInterviewList, TalentInterviewDto } from '../types/interview.types'

jest.mock('../services/interview.service')

const mockedService = talentInterviewService as jest.Mocked<typeof talentInterviewService>

afterEach(() => jest.restoreAllMocks())

describe('useMyInterviews', () => {
  it('fetches /talents/me/interviews for the given page', async () => {
    const page: PaginatedInterviewList<TalentInterviewDto> = {
      items: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    }
    mockedService.getMyInterviews.mockResolvedValueOnce(page)

    const { result } = renderHook(() => useMyInterviews({ page: 1, pageSize: 10 }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBe(page)
    expect(mockedService.getMyInterviews).toHaveBeenCalledWith({ page: 1, pageSize: 10 }, expect.anything())
  })
})

describe('useAcceptInterview', () => {
  it('accepts an invitation and invalidates relevant query keys', async () => {
    mockedService.accept.mockResolvedValueOnce({ message: 'ok' })
    const invalidateSpy = jest.spyOn(QueryClient.prototype, 'invalidateQueries')

    const { result } = renderHook(() => useAcceptInterview(), { wrapper: createQueryWrapper() })
    result.current.mutate({ invitationId: 'inv-1', payload: { selectedTimeslotId: 'slot-1' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedService.accept).toHaveBeenCalledWith('inv-1', { selectedTimeslotId: 'slot-1' })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: TALENT_INTERVIEW_QUERY_KEYS.lists() })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['talent-applications'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['talent-application-counts'] })
  })
})

describe('useDeclineInterview', () => {
  it('declines an invitation and invalidates the interview lists', async () => {
    mockedService.decline.mockResolvedValueOnce({ message: 'ok' })
    const invalidateSpy = jest.spyOn(QueryClient.prototype, 'invalidateQueries')

    const { result } = renderHook(() => useDeclineInterview(), { wrapper: createQueryWrapper() })
    result.current.mutate({ invitationId: 'inv-1', payload: { reason: 'busy' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedService.decline).toHaveBeenCalledWith('inv-1', { reason: 'busy' })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: TALENT_INTERVIEW_QUERY_KEYS.lists() })
  })
})
