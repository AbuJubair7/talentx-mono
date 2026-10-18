import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createQueryWrapper, createTestQueryClient } from '@/tests/test-utils/query-client-wrapper';
import { employerJobsService } from '../../services/employer-jobs.service';
import { employerJobKeys } from '../query-keys';
import { useResubmitJob } from '../useResubmitJob';

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../services/employer-jobs.service', () => ({
  employerJobsService: {
    resubmitJob: jest.fn(),
  },
}));

const mockedEmployerJobsService = employerJobsService as jest.Mocked<typeof employerJobsService>;

const SUCCESS_MESSAGE = "Sent for review. You'll get an email when an admin approves it.";

describe('useResubmitJob', () => {
  const jobId = 'job-resubmit-42';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls the service, refreshes the caches, and tells the employer to expect an email', async () => {
    const testQueryClient = createTestQueryClient();
    const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries');
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
    );

    mockedEmployerJobsService.resubmitJob.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useResubmitJob(), { wrapper: customWrapper });

    result.current.mutate(jobId);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedEmployerJobsService.resubmitJob).toHaveBeenCalledWith(jobId);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: employerJobKeys.all });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: employerJobKeys.detail(jobId) });
    expect(toast.success).toHaveBeenCalledWith(SUCCESS_MESSAGE);
  });

  it('supports an explicit jobId passed at hook instantiation', async () => {
    mockedEmployerJobsService.resubmitJob.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useResubmitJob(jobId), { wrapper: createQueryWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedEmployerJobsService.resubmitJob).toHaveBeenCalledWith(jobId);
  });

  it('shows the backend message, which names any fields still missing', async () => {
    mockedEmployerJobsService.resubmitJob.mockRejectedValueOnce(
      new Error('Job cannot be published. Invalid or missing fields: Requirements')
    );

    const { result } = renderHook(() => useResubmitJob(), { wrapper: createQueryWrapper() });

    result.current.mutate(jobId);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledWith(
      'Job cannot be published. Invalid or missing fields: Requirements'
    );
  });

  it('falls back to a default error message when the error carries none', async () => {
    mockedEmployerJobsService.resubmitJob.mockRejectedValueOnce({ message: '' });

    const { result } = renderHook(() => useResubmitJob(), { wrapper: createQueryWrapper() });

    result.current.mutate(jobId);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledWith('Failed to send job for review.');
  });
});
