import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { toast } from 'sonner'

import { createQueryWrapper, createTestQueryClient } from '@/tests/test-utils/query-client-wrapper'
import type { PagedResult } from '@/modules/job-listing'

import { savedJobsService } from '../../services/saved-jobs.service'
import type { SavedJobResponse } from '../../types/saved-job.types'
import { useSaveJob } from '../useSaveJob'
import { useRemoveSavedJob } from '../useRemoveSavedJob'
import { useSavedJobIds } from '../useSavedJobIds'
import { useSavedJobs } from '../useSavedJobs'

jest.mock('../../services/saved-jobs.service', () => ({
  savedJobsService: {
    saveJob: jest.fn(),
    removeSavedJob: jest.fn(),
    getSavedJobIds: jest.fn(),
    getSavedJobs: jest.fn(),
  },
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const mockedSavedJobsService = savedJobsService as jest.Mocked<typeof savedJobsService>

function withQueryClient(testQueryClient: ReturnType<typeof createTestQueryClient>) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  )
  return Wrapper
}

describe('useSaveJob', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('calls saveJob and invalidates the saved-jobs caches on success', async () => {
    const testQueryClient = createTestQueryClient()
    const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries')
    mockedSavedJobsService.saveJob.mockResolvedValueOnce('saved-job-1')

    const { result } = renderHook(() => useSaveJob(), { wrapper: withQueryClient(testQueryClient) })

    result.current.mutate('job-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedSavedJobsService.saveJob).toHaveBeenCalledWith('job-1')
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['saved-jobs'] })
  })

  it('treats a 409 conflict as already-saved: re-syncs the cache, no error toast', async () => {
    const testQueryClient = createTestQueryClient()
    const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries')
    mockedSavedJobsService.saveJob.mockRejectedValueOnce({ status: 409, message: 'Already saved' })

    const { result } = renderHook(() => useSaveJob(), { wrapper: withQueryClient(testQueryClient) })

    result.current.mutate('job-1')

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['saved-jobs'] })
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('shows an error toast with the server message on non-409 failure', async () => {
    mockedSavedJobsService.saveJob.mockRejectedValueOnce({
      status: 400,
      message: 'This job is no longer available for saving.',
    })

    const { result } = renderHook(() => useSaveJob(), { wrapper: createQueryWrapper() })

    result.current.mutate('job-1')

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(toast.error).toHaveBeenCalledWith('This job is no longer available for saving.')
  })

  it('falls back to a default error message when the server sends none', async () => {
    mockedSavedJobsService.saveJob.mockRejectedValueOnce({ status: 500, message: '' })

    const { result } = renderHook(() => useSaveJob(), { wrapper: createQueryWrapper() })

    result.current.mutate('job-1')

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(toast.error).toHaveBeenCalledWith('Failed to save job.')
  })
})

describe('useRemoveSavedJob', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('calls removeSavedJob and invalidates the saved-jobs caches on success', async () => {
    const testQueryClient = createTestQueryClient()
    const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries')
    mockedSavedJobsService.removeSavedJob.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useRemoveSavedJob(), { wrapper: withQueryClient(testQueryClient) })

    result.current.mutate('job-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedSavedJobsService.removeSavedJob).toHaveBeenCalledWith('job-1')
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['saved-jobs'] })
  })

  it('shows an error toast with the server message on failure', async () => {
    mockedSavedJobsService.removeSavedJob.mockRejectedValueOnce({ status: 404, message: 'Saved job not found.' })

    const { result } = renderHook(() => useRemoveSavedJob(), { wrapper: createQueryWrapper() })

    result.current.mutate('job-1')

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(toast.error).toHaveBeenCalledWith('Saved job not found.')
  })

  it('falls back to a default error message when the server sends none', async () => {
    mockedSavedJobsService.removeSavedJob.mockRejectedValueOnce({ status: 500, message: '' })

    const { result } = renderHook(() => useRemoveSavedJob(), { wrapper: createQueryWrapper() })

    result.current.mutate('job-1')

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(toast.error).toHaveBeenCalledWith('Failed to remove saved job.')
  })
})

describe('useSavedJobIds', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('fetches saved job ids and exposes them as a Set for O(1) lookups', async () => {
    mockedSavedJobsService.getSavedJobIds.mockResolvedValueOnce(['job-1', 'job-2'])

    const { result } = renderHook(() => useSavedJobIds(), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(new Set(['job-1', 'job-2']))
    expect(mockedSavedJobsService.getSavedJobIds).toHaveBeenCalledTimes(1)
  })

  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(() => useSavedJobIds({ enabled: false }), { wrapper: createQueryWrapper() })

    expect(mockedSavedJobsService.getSavedJobIds).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
  })
})

describe('useSavedJobs', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  const mockPagedResult: PagedResult<SavedJobResponse> = {
    items: [
      {
        savedJobId: 'sj-1',
        jobId: 'job-1',
        jobTitle: 'Backend Engineer',
        companyName: 'Acme Corp',
        location: 'Dhaka',
        employmentType: 'FullTime',
        postedDate: '2026-08-01T00:00:00Z',
        isAvailable: true,
      },
    ],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
  }

  it('fetches the saved jobs list with the given page and pageSize', async () => {
    mockedSavedJobsService.getSavedJobs.mockResolvedValueOnce(mockPagedResult)

    const { result } = renderHook(() => useSavedJobs({ page: 2, pageSize: 5 }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedSavedJobsService.getSavedJobs).toHaveBeenCalledWith(2, 5)
    expect(result.current.data).toEqual(mockPagedResult)
  })

  it('defaults to page 1 and pageSize 20 when not provided', async () => {
    mockedSavedJobsService.getSavedJobs.mockResolvedValueOnce(mockPagedResult)

    const { result } = renderHook(() => useSavedJobs({}), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedSavedJobsService.getSavedJobs).toHaveBeenCalledWith(1, 20)
  })
})
