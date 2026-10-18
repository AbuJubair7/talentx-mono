import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';

import { createQueryWrapper, createTestQueryClient } from '@/tests/test-utils/query-client-wrapper';

import { employerJobsService } from '../../services/employer-jobs.service';
import type {
  EmployerDashboardDto,
  EmployerJobListItemDto,
  PaginatedList,
} from '../../types/employer-job.types';
import { employerJobKeys } from '../query-keys';
import { useCloseJob } from '../useCloseJob';
import { useDeleteJob } from '../useDeleteJob';
import { useEmployerDashboard } from '../useEmployerDashboard';
import { useEmployerJobs } from '../useEmployerJobs';

jest.mock('../../services/employer-jobs.service', () => ({
  employerJobsService: {
    getDashboard: jest.fn(),
    getJobs: jest.fn(),
    closeJob: jest.fn(),
    deleteJob: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedEmployerJobsService = employerJobsService as jest.Mocked<typeof employerJobsService>;

const mockDashboardResponse: EmployerDashboardDto = {
  totalPostedJobs: 12,
  totalHires: 5,
  activeJobsCount: 7,
  draftJobsCount: 2,
  closedJobsCount: 2,
  expiredJobsCount: 1,
  deactivatedJobsCount: 0,
  pendingReviewJobsCount: 0,
  recentJobs: [
    {
      id: 'job-1',
      title: 'Senior Software Engineer',
      status: 'Published',
      createdAt: '2026-09-01T10:00:00Z',
      expireAt: '2026-10-01T10:00:00Z',
      vacancies: 2,
      applicantCount: 8,
    },
  ],
};

const mockJobsResponse: PaginatedList<EmployerJobListItemDto> = {
  items: [
    {
      id: 'job-1',
      title: 'Senior Software Engineer',
      companyName: 'Acme Corp',
      status: 'Published',
      employmentType: 'FullTime',
      workArrangement: 'Remote',
      experienceLevel: 'Senior',
      location: 'New York, NY',
      vacancies: 2,
      expireAt: '2026-10-01T10:00:00Z',
      createdAt: '2026-09-01T10:00:00Z',
      applicantCount: 8,
    },
  ],
  page: 1,
  pageSize: 10,
  totalCount: 1,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

describe('employerJobKeys', () => {
  it('produces hierarchical query keys matching expected contract', () => {
    expect(employerJobKeys.all).toEqual(['employer']);
    expect(employerJobKeys.dashboard()).toEqual(['employer', 'dashboard']);
    expect(employerJobKeys.jobs()).toEqual(['employer', 'jobs']);
    expect(employerJobKeys.jobsList()).toEqual(['employer', 'jobs', undefined]);
    expect(employerJobKeys.jobsList({ page: 2, pageSize: 20 })).toEqual([
      'employer',
      'jobs',
      { page: 2, pageSize: 20 },
    ]);
    expect(employerJobKeys.detail('job-123')).toEqual(['employer', 'jobs', 'job-123']);
    expect(employerJobKeys.pipelineSummary('job-123')).toEqual([
      'employer',
      'jobs',
      'job-123',
      'pipeline-summary',
    ]);
  });
});

describe('useEmployerDashboard', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('fetches and returns dashboard metrics on success', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValueOnce(mockDashboardResponse);

    const { result } = renderHook(() => useEmployerDashboard(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockDashboardResponse);
    expect(mockedEmployerJobsService.getDashboard).toHaveBeenCalledTimes(1);
  });

  it('surfaces error state when dashboard query fails', async () => {
    mockedEmployerJobsService.getDashboard.mockRejectedValueOnce(
      new Error('Failed to load dashboard metrics')
    );

    const { result } = renderHook(() => useEmployerDashboard(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockedEmployerJobsService.getDashboard).toHaveBeenCalledTimes(1);
  });
});

describe('useEmployerJobs', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('fetches and returns paginated job list with provided parameters', async () => {
    const queryParameters = { page: 1, pageSize: 10, status: 'Published' };
    mockedEmployerJobsService.getJobs.mockResolvedValueOnce(mockJobsResponse);

    const { result } = renderHook(() => useEmployerJobs(queryParameters), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockJobsResponse);
    expect(mockedEmployerJobsService.getJobs).toHaveBeenCalledWith(
      queryParameters,
      expect.any(AbortSignal)
    );
  });

  it('surfaces error state when jobs query fails', async () => {
    mockedEmployerJobsService.getJobs.mockRejectedValueOnce(
      new Error('Failed to load employer jobs')
    );

    const { result } = renderHook(() => useEmployerJobs(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockedEmployerJobsService.getJobs).toHaveBeenCalledTimes(1);
  });
});

describe('useCloseJob', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('calls service closeJob, invalidates query cache, and triggers success toast', async () => {
    const testQueryClient = createTestQueryClient();
    const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries');
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
    );

    mockedEmployerJobsService.closeJob.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useCloseJob(), { wrapper: customWrapper });

    result.current.mutate('job-123');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedEmployerJobsService.closeJob).toHaveBeenCalledWith('job-123');
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: employerJobKeys.all });
    expect(toast.success).toHaveBeenCalledWith('Job closed successfully.');
  });

  it('triggers error toast with error message on failure', async () => {
    mockedEmployerJobsService.closeJob.mockRejectedValueOnce(
      new Error('Unauthorized to close job')
    );

    const { result } = renderHook(() => useCloseJob(), { wrapper: createQueryWrapper() });

    result.current.mutate('job-123');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Unauthorized to close job');
  });

  it('triggers error toast with fallback message when error message is empty', async () => {
    mockedEmployerJobsService.closeJob.mockRejectedValueOnce({ message: '' });

    const { result } = renderHook(() => useCloseJob(), { wrapper: createQueryWrapper() });

    result.current.mutate('job-123');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Failed to close job.');
  });
});

describe('useDeleteJob', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('calls service deleteJob, invalidates query cache, and triggers success toast', async () => {
    const testQueryClient = createTestQueryClient();
    const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries');
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
    );

    mockedEmployerJobsService.deleteJob.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteJob(), { wrapper: customWrapper });

    result.current.mutate('job-456');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedEmployerJobsService.deleteJob).toHaveBeenCalledWith('job-456');
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: employerJobKeys.all });
    expect(toast.success).toHaveBeenCalledWith('Job deleted successfully.');
  });

  it('triggers error toast with error message on failure', async () => {
    mockedEmployerJobsService.deleteJob.mockRejectedValueOnce(
      new Error('Failed to delete job due to server error')
    );

    const { result } = renderHook(() => useDeleteJob(), { wrapper: createQueryWrapper() });

    result.current.mutate('job-456');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Failed to delete job due to server error');
  });

  it('triggers error toast with fallback message when error message is empty', async () => {
    mockedEmployerJobsService.deleteJob.mockRejectedValueOnce({ message: '' });

    const { result } = renderHook(() => useDeleteJob(), { wrapper: createQueryWrapper() });

    result.current.mutate('job-456');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Failed to delete job.');
  });
});
