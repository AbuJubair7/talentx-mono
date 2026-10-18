import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper';
import { applicantService } from '../../services/applicant.service';
import { useJobApplicants } from '../useJobApplicants';
import type { PaginatedApplicantList, JobApplicant } from '../../types/applicant.types';

jest.mock('../../services/applicant.service', () => ({
  applicantService: {
    getJobApplicants: jest.fn(),
  },
}));

const mockedApplicantService = applicantService as jest.Mocked<typeof applicantService>;

describe('useJobApplicants', () => {
  const jobId = 'job-123';
  const mockPaginatedList: PaginatedApplicantList<JobApplicant> = {
    items: [
      {
        id: 'app-1',
        jobId,
        talentUserId: 'talent-1',
        applicantName: 'Alice Smith',
        applicantEmail: 'alice@example.com',
        resumeDownloadUrl: 'https://storage.test/cv.pdf',
        status: 'Applied',
        aiMatchScore: 90,
        expectedSalary: 100000,
        totalYearsExperience: 5,
        location: 'Dhaka',
        appliedAt: '2026-09-01T00:00:00Z',
      },
    ],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches applicant list for given jobId and params', async () => {
    mockedApplicantService.getJobApplicants.mockResolvedValueOnce(mockPaginatedList);

    const wrapper = createQueryWrapper();
    const queryParams = { page: 1, pageSize: 10, search: 'Alice' };

    const { result } = renderHook(() => useJobApplicants(jobId, queryParams), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApplicantService.getJobApplicants).toHaveBeenCalledWith(
      jobId,
      queryParams,
      expect.any(AbortSignal)
    );
    expect(result.current.data).toEqual(mockPaginatedList);
  });

  it('handles error state when service fails', async () => {
    mockedApplicantService.getJobApplicants.mockRejectedValueOnce(new Error('Network error'));

    const wrapper = createQueryWrapper();

    const { result } = renderHook(() => useJobApplicants(jobId), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
