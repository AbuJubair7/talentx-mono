import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createQueryWrapper, createTestQueryClient } from '@/tests/test-utils/query-client-wrapper';
import { employerJobsService } from '../../services/employer-jobs.service';
import { employerJobKeys } from '../query-keys';
import { useReopenJob } from '../useReopenJob';

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../services/employer-jobs.service', () => ({
  employerJobsService: {
    reopenJob: jest.fn(),
  },
}));

const mockedEmployerJobsService = employerJobsService as jest.Mocked<typeof employerJobsService>;

describe('useReopenJob', () => {
  const jobId = 'job-reopen-99';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls service reopenJob, invalidates caches, and shows success toast when called with variable', async () => {
    const testQueryClient = createTestQueryClient();
    const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries');
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
    );

    mockedEmployerJobsService.reopenJob.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useReopenJob(), { wrapper: customWrapper });

    result.current.mutate(jobId);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedEmployerJobsService.reopenJob).toHaveBeenCalledWith(jobId);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: employerJobKeys.all });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: employerJobKeys.detail(jobId) });
    expect(toast.success).toHaveBeenCalledWith('Job reopened successfully');
  });

  it('supports explicit jobId passed into hook instantiation', async () => {
    const testQueryClient = createTestQueryClient();
    const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries');
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
    );

    mockedEmployerJobsService.reopenJob.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useReopenJob(jobId), { wrapper: customWrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedEmployerJobsService.reopenJob).toHaveBeenCalledWith(jobId);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: employerJobKeys.all });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: employerJobKeys.detail(jobId) });
    expect(toast.success).toHaveBeenCalledWith('Job reopened successfully');
  });

  it('surfaces error toast when reopening fails', async () => {
    mockedEmployerJobsService.reopenJob.mockRejectedValueOnce(
      new Error('Failed to reopen closed job')
    );

    const { result } = renderHook(() => useReopenJob(), { wrapper: createQueryWrapper() });

    result.current.mutate(jobId);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledWith('Failed to reopen closed job');
  });

  it('falls back to default error message when error message is empty', async () => {
    mockedEmployerJobsService.reopenJob.mockRejectedValueOnce({ message: '' });

    const { result } = renderHook(() => useReopenJob(), { wrapper: createQueryWrapper() });

    result.current.mutate(jobId);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledWith('Failed to reopen job.');
  });
});
