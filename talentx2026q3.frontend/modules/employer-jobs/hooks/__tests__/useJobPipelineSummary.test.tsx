import { renderHook, waitFor } from '@testing-library/react';

import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper';

import { employerJobsService } from '../../services/employer-jobs.service';
import type { JobPipelineSummaryDto } from '../../types/employer-job.types';
import { useJobPipelineSummary } from '../useJobPipelineSummary';

jest.mock('../../services/employer-jobs.service', () => ({
  employerJobsService: {
    getJobPipelineSummary: jest.fn(),
  },
}));

const mockedEmployerJobsService = employerJobsService as jest.Mocked<typeof employerJobsService>;

const mockPipelineSummary: JobPipelineSummaryDto = {
  jobId: 'job-123',
  jobTitle: 'Senior Machine Learning Engineer',
  companyName: 'Tech Innovators Corp',
  jobStatus: 'Published',
  vacancies: 2,
  postedDate: '2026-09-01T10:00:00Z',
  totalApplicants: 15,
  pipelineStats: {
    appliedCount: 8,
    shortlistedCount: 4,
    invitedCount: 2,
    interviewCount: 1,
    rejectedCount: 1,
    hiredCount: 0,
  },
};

describe('useJobPipelineSummary', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('fetches and returns pipeline summary when jobId is provided', async () => {
    mockedEmployerJobsService.getJobPipelineSummary.mockResolvedValueOnce(mockPipelineSummary);

    const { result } = renderHook(() => useJobPipelineSummary('job-123'), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPipelineSummary);
    expect(mockedEmployerJobsService.getJobPipelineSummary).toHaveBeenCalledTimes(1);
    expect(mockedEmployerJobsService.getJobPipelineSummary).toHaveBeenCalledWith(
      'job-123',
      expect.any(Object)
    );
  });

  it('stays disabled and does not call service when jobId is null', () => {
    const { result } = renderHook(() => useJobPipelineSummary(null), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
    expect(mockedEmployerJobsService.getJobPipelineSummary).not.toHaveBeenCalled();
  });

  it('surfaces error state when getJobPipelineSummary fails', async () => {
    mockedEmployerJobsService.getJobPipelineSummary.mockRejectedValueOnce(
      new Error('Failed to load pipeline summary')
    );

    const { result } = renderHook(() => useJobPipelineSummary('job-123'), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Failed to load pipeline summary');
    expect(mockedEmployerJobsService.getJobPipelineSummary).toHaveBeenCalledTimes(1);
  });
});
