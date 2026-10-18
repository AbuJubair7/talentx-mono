import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@/tests/test-utils/query-client-wrapper';
import { APPLICANT_QUERY_KEYS } from '../../constants';
import { applicantService } from '../../services/applicant.service';
import { useUpdateApplicationStatus } from '../useUpdateApplicationStatus';

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../services/applicant.service', () => ({
  applicantService: {
    updateApplicationStatus: jest.fn(),
  },
}));

const mockedApplicantService = applicantService as jest.Mocked<typeof applicantService>;

describe('useUpdateApplicationStatus', () => {
  const jobId = 'job-123';
  const applicationId = 'app-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls service updateApplicationStatus, invalidates applicant caches, and shows success toast', async () => {
    const testQueryClient = createTestQueryClient();
    const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries');
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
    );

    mockedApplicantService.updateApplicationStatus.mockResolvedValueOnce({
      message: 'Status updated successfully',
    });

    const { result } = renderHook(() => useUpdateApplicationStatus(jobId), { wrapper: customWrapper });

    result.current.mutate({ applicationId, newStatus: 'Interview' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApplicantService.updateApplicationStatus).toHaveBeenCalledWith(applicationId, 'Interview');
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: APPLICANT_QUERY_KEYS.jobLists(jobId) });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: APPLICANT_QUERY_KEYS.profile(applicationId) });
  });

  it('handles error state when status update fails', async () => {
    const testQueryClient = createTestQueryClient();
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
    );

    mockedApplicantService.updateApplicationStatus.mockRejectedValueOnce(new Error('Update failed'));

    const { result } = renderHook(() => useUpdateApplicationStatus(jobId), { wrapper: customWrapper });

    result.current.mutate({ applicationId, newStatus: 'Rejected' });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
