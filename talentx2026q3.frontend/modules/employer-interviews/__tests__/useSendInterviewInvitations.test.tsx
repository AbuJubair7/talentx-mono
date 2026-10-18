import { QueryClient } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper'
import { APPLICANT_QUERY_KEYS } from '@/modules/employer-applicants'

import { INTERVIEW_QUERY_KEYS } from '../constants/interview.constants'
import { useSendInterviewInvitations } from '../hooks/useSendInterviewInvitations'
import { interviewService } from '../services/interview.service'
import type { SendInterviewBatchPayload, SendInterviewBatchResponse } from '../types/interview.types'

jest.mock('../services/interview.service')

const mockedService = interviewService as jest.Mocked<typeof interviewService>

const payload: SendInterviewBatchPayload = {
  applicationIds: ['app-1'],
  type: 'OnlineAssessment',
  assessmentUrl: 'https://hackerrank.test/x',
  assessmentDeadline: '2030-01-01T00:00:00.000Z',
}

const mockBatchResponse: SendInterviewBatchResponse = {
  totalProcessed: 1,
  invitedCount: 1,
  skippedCount: 0,
  results: [
    {
      applicationId: 'app-1',
      candidateName: 'Alex Smith',
      candidateEmail: 'alex@example.com',
      success: true,
      canForceSend: false,
      hasDanglingPendingInvite: false,
    },
  ],
}

afterEach(() => jest.restoreAllMocks())

describe('useSendInterviewInvitations', () => {
  it('calls interviewService.sendBatch with the job id and payload', async () => {
    mockedService.sendBatch.mockResolvedValueOnce(mockBatchResponse)

    const { result } = renderHook(() => useSendInterviewInvitations('job-1'), { wrapper: createQueryWrapper() })
    result.current.mutate(payload)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedService.sendBatch).toHaveBeenCalledWith('job-1', payload)
  })

  it('invalidates the job interview lists on success', async () => {
    mockedService.sendBatch.mockResolvedValueOnce(mockBatchResponse)
    const invalidateSpy = jest.spyOn(QueryClient.prototype, 'invalidateQueries')

    const { result } = renderHook(() => useSendInterviewInvitations('job-1'), { wrapper: createQueryWrapper() })
    result.current.mutate(payload)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: INTERVIEW_QUERY_KEYS.jobLists('job-1') })
  })

  it('invalidates the job applicant lists on success, so their status refreshes', async () => {
    mockedService.sendBatch.mockResolvedValueOnce(mockBatchResponse)
    const invalidateSpy = jest.spyOn(QueryClient.prototype, 'invalidateQueries')

    const { result } = renderHook(() => useSendInterviewInvitations('job-1'), { wrapper: createQueryWrapper() })
    result.current.mutate(payload)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: APPLICANT_QUERY_KEYS.jobLists('job-1') })
  })

  it('surfaces a mutation error', async () => {
    mockedService.sendBatch.mockRejectedValueOnce({ status: 409, message: 'Already invited' })

    const { result } = renderHook(() => useSendInterviewInvitations('job-1'), { wrapper: createQueryWrapper() })
    result.current.mutate(payload)

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('forwards a payload that includes force: true unchanged', async () => {
    const forcePayload: SendInterviewBatchPayload = { ...payload, force: true }
    mockedService.sendBatch.mockResolvedValueOnce(mockBatchResponse)

    const { result } = renderHook(() => useSendInterviewInvitations('job-1'), { wrapper: createQueryWrapper() })
    result.current.mutate(forcePayload)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedService.sendBatch).toHaveBeenCalledWith('job-1', forcePayload)
  })
})
