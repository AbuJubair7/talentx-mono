import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createQueryWrapper, createTestQueryClient } from '@/tests/test-utils/query-client-wrapper';
import { employerJobsService } from '../../services/employer-jobs.service';
import { employerJobKeys } from '../query-keys';
import { usePublishJob } from '../usePublishJob';

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../services/employer-jobs.service', () => ({
  employerJobsService: {
    publishJob: jest.fn(),
  },
}));

const mockedEmployerJobsService = employerJobsService as jest.Mocked<typeof employerJobsService>;

describe('usePublishJob', () => {
  const jobId = 'job-publish-88';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls service publishJob, invalidates caches, and shows success toast when called with variable', async () => {
    const testQueryClient = createTestQueryClient();
    const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries');
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
    );

    mockedEmployerJobsService.publishJob.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => usePublishJob(), { wrapper: customWrapper });

    result.current.mutate(jobId);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedEmployerJobsService.publishJob).toHaveBeenCalledWith(jobId);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: employerJobKeys.all });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: employerJobKeys.detail(jobId) });
    expect(toast.success).toHaveBeenCalledWith('Job published successfully');
  });

  it('supports explicit jobId passed into hook instantiation', async () => {
    const testQueryClient = createTestQueryClient();
    const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries');
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
    );

    mockedEmployerJobsService.publishJob.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => usePublishJob(jobId), { wrapper: customWrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedEmployerJobsService.publishJob).toHaveBeenCalledWith(jobId);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: employerJobKeys.all });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: employerJobKeys.detail(jobId) });
    expect(toast.success).toHaveBeenCalledWith('Job published successfully');
  });

  it('surfaces error toast when publishing fails', async () => {
    mockedEmployerJobsService.publishJob.mockRejectedValueOnce(
      new Error('Failed to publish draft job')
    );

    const { result } = renderHook(() => usePublishJob(), { wrapper: createQueryWrapper() });

    result.current.mutate(jobId);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledWith('Failed to publish draft job', expect.objectContaining({ description: undefined }));
  });

  it('falls back to default error message when error message is empty', async () => {
    mockedEmployerJobsService.publishJob.mockRejectedValueOnce({ message: '' });

    const { result } = renderHook(() => usePublishJob(), { wrapper: createQueryWrapper() });

    result.current.mutate(jobId);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledWith('Failed to publish job.', expect.objectContaining({ description: undefined }));
  });
});
