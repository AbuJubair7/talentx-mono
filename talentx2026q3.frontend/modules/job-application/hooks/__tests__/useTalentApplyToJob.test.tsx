import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { createTestQueryClient } from '@/tests/test-utils/query-client-wrapper';
import { jobApplicationService } from '../../services/job-application.service';
import type { ApplyPayload } from '../../types/job-application.types';
import { useTalentApplyToJob } from '../useApplyToJob';

jest.mock('../../services/job-application.service', () => ({
  jobApplicationService: {
    submitApplication: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedService = jobApplicationService as jest.Mocked<typeof jobApplicationService>;

function withQueryClient(testQueryClient: ReturnType<typeof createTestQueryClient>) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
}

describe('useTalentApplyToJob', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const payload: ApplyPayload = {
    applicantName: 'Alex Smith',
    applicantEmail: 'alex@example.com',
    resumeStorageKey: 'resumes/alex.pdf',
  };

  it('invalidates the dashboard queries on success so Track-your-applications shows the new row', async () => {
    const testQueryClient = createTestQueryClient();
    const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries');
    mockedService.submitApplication.mockResolvedValueOnce({
      id: 'app-1',
      jobId: 'job-1',
      status: 'Applied',
      appliedAt: '2026-09-01T12:00:00Z',
    });

    const { result } = renderHook(() => useTalentApplyToJob('job-1'), {
      wrapper: withQueryClient(testQueryClient),
    });

    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedService.submitApplication).toHaveBeenCalledWith('job-1', payload);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['jobs', 'job-1', 'application-status'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['talent-applications'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['talent-application-counts'],
    });
  });
});
