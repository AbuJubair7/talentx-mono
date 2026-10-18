import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createQueryWrapper, createTestQueryClient } from '@/tests/test-utils/query-client-wrapper';
import { employerJobsService } from '../../services/employer-jobs.service';
import { employerJobKeys } from '../query-keys';
import { useUpdateJob } from '../useUpdateJob';
import type { EmployerEditJobFormValues } from '../../types/employer-job.types';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../services/employer-jobs.service', () => ({
  employerJobsService: {
    updateJob: jest.fn(),
  },
}));

const mockedEmployerJobsService = employerJobsService as jest.Mocked<typeof employerJobsService>;

const sampleFormValues: EmployerEditJobFormValues = {
  title: 'Lead AI Engineer',
  companyName: 'Neural Works',
  description: 'Deep learning leadership role overseeing PyTorch model development.',
  requirements: 'PhD in ML, 5+ years of PyTorch experience, and prior team leadership.',
  location: 'San Francisco, CA',
  city: 'San Francisco',
  country: 'USA',
  minOverlapHours: 4,
  employmentType: 'FullTime',
  experienceLevel: 'Lead',
  workArrangement: 'Hybrid',
  requiredSkills: ['PyTorch', 'Python'],
  vacancies: 2,
  expireAt: '2026-12-31',
  salaryType: 'Range',
  salaryMin: 80000,
  salaryMax: 120000,
  salaryCurrency: 'BDT',
  salaryPeriod: 'PerMonth',
};

describe('useUpdateJob', () => {
  const jobId = 'job-ai-101';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates and publishes job: invalidates all jobs, toasts success, and navigates', async () => {
    const testQueryClient = createTestQueryClient();
    const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries');
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
    );

    mockedEmployerJobsService.updateJob.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useUpdateJob(jobId), { wrapper: customWrapper });

    result.current.mutate({
      values: sampleFormValues,
      publish: true,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedEmployerJobsService.updateJob).toHaveBeenCalledWith(
      jobId,
      expect.objectContaining({
        title: 'Lead AI Engineer',
        companyName: 'Neural Works',
        requirements: 'PhD in ML, 5+ years of PyTorch experience, and prior team leadership.',
        publish: true,
      })
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: employerJobKeys.all });
    expect(toast.success).toHaveBeenCalledWith('Job published successfully');
    expect(mockPush).toHaveBeenCalledWith('/job/job-listing');
  });

  it('saves job as draft: invalidates detail query, toasts draft notice, without redirect', async () => {
    const testQueryClient = createTestQueryClient();
    const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries');
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
    );

    mockedEmployerJobsService.updateJob.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useUpdateJob(jobId), { wrapper: customWrapper });

    result.current.mutate({
      values: sampleFormValues,
      publish: false,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedEmployerJobsService.updateJob).toHaveBeenCalledWith(
      jobId,
      expect.objectContaining({
        publish: false,
      })
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: employerJobKeys.detail(jobId) });
    expect(toast.success).toHaveBeenCalledWith('Job saved as draft');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('unpacks array of validation errors from backend error response', async () => {
    const apiErrorResponse = {
      response: {
        data: {
          message: 'Validation failed',
          errors: ['Title cannot be empty.', 'Description is too short.'],
        },
      },
    };

    mockedEmployerJobsService.updateJob.mockRejectedValueOnce(apiErrorResponse);

    const { result } = renderHook(() => useUpdateJob(jobId), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate({
      values: sampleFormValues,
      publish: true,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledWith('Title cannot be empty. Description is too short.');
  });

  it('falls back to generic error message when error response contains no details', async () => {
    mockedEmployerJobsService.updateJob.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useUpdateJob(jobId), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate({
      values: sampleFormValues,
      publish: false,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledWith('Network error');
  });

  it('sends salary fields through in the update payload for range salaries', async () => {
    mockedEmployerJobsService.updateJob.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useUpdateJob(jobId), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate({
      values: sampleFormValues,
      publish: true,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedEmployerJobsService.updateJob).toHaveBeenCalledWith(
      jobId,
      expect.objectContaining({
        salaryType: 'Range',
        salaryMin: 80000,
        salaryMax: 120000,
        salaryCurrency: 'BDT',
        salaryPeriod: 'PerMonth',
        publish: true,
      })
    );
  });

  it('sets salary max equal to min for fixed salaries', async () => {
    mockedEmployerJobsService.updateJob.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useUpdateJob(jobId), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate({
      values: {
        ...sampleFormValues,
        salaryType: 'Fixed',
        salaryMin: 90000,
        salaryMax: null,
      },
      publish: false,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedEmployerJobsService.updateJob).toHaveBeenCalledWith(
      jobId,
      expect.objectContaining({
        salaryType: 'Fixed',
        salaryMin: 90000,
        salaryMax: 90000,
        salaryCurrency: 'BDT',
        salaryPeriod: 'PerMonth',
      })
    );
  });

  it('sends null salary details when salary type is negotiable', async () => {
    mockedEmployerJobsService.updateJob.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useUpdateJob(jobId), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate({
      values: {
        ...sampleFormValues,
        salaryType: 'Negotiable',
        salaryMin: null,
        salaryMax: null,
        salaryCurrency: null,
        salaryPeriod: null,
      },
      publish: false,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedEmployerJobsService.updateJob).toHaveBeenCalledWith(
      jobId,
      expect.objectContaining({
        salaryType: 'Negotiable',
        salaryMin: null,
        salaryMax: null,
        salaryCurrency: null,
        salaryPeriod: null,
      })
    );
  });
});
