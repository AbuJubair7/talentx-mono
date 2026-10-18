import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';

import { createQueryWrapper, createTestQueryClient } from '@/tests/test-utils/query-client-wrapper';
import { jobAlertsService } from '../../services/job-alerts.service';
import type { CreateJobAlertInput, JobAlert, UpdateJobAlertInput } from '../../types';
import { useCreateJobAlert } from '../useCreateJobAlert';
import { useDeleteJobAlert } from '../useDeleteJobAlert';
import { useJobAlerts } from '../useJobAlerts';
import { useToggleJobAlert } from '../useToggleJobAlert';
import { useUpdateJobAlert } from '../useUpdateJobAlert';

jest.mock('../../services/job-alerts.service', () => ({
  jobAlertsService: {
    getJobAlerts: jest.fn(),
    createJobAlert: jest.fn(),
    updateJobAlert: jest.fn(),
    toggleJobAlert: jest.fn(),
    deleteJobAlert: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedJobAlertsService = jobAlertsService as jest.Mocked<typeof jobAlertsService>;

function withQueryClient(testQueryClient: ReturnType<typeof createTestQueryClient>) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
}

describe('Job Alerts Hooks', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const sampleAlert: JobAlert = {
    id: 'alert-uuid-1',
    name: 'Backend Alerts',
    title: '.NET Engineer',
    location: 'Remote',
    employmentType: 'FullTime',
    experienceLevel: 'SeniorLevel',
    workArrangement: 'FullRemote',
    isEnabled: true,
    createdAt: '2026-09-14T10:00:00.000Z',
  };

  describe('useJobAlerts', () => {
    it('fetches job alerts list successfully', async () => {
      mockedJobAlertsService.getJobAlerts.mockResolvedValueOnce([sampleAlert]);

      const { result } = renderHook(() => useJobAlerts(), {
        wrapper: createQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedJobAlertsService.getJobAlerts).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual([sampleAlert]);
    });

    it('does not fetch when enabled is false', () => {
      const { result } = renderHook(() => useJobAlerts({ enabled: false }), {
        wrapper: createQueryWrapper(),
      });

      expect(mockedJobAlertsService.getJobAlerts).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useCreateJobAlert', () => {
    const createPayload: CreateJobAlertInput = {
      name: 'Backend Alerts',
      title: '.NET Engineer',
    };

    it('creates job alert and invalidates queries on success', async () => {
      const testQueryClient = createTestQueryClient();
      const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries');
      mockedJobAlertsService.createJobAlert.mockResolvedValueOnce('new-alert-uuid');

      const { result } = renderHook(() => useCreateJobAlert(), {
        wrapper: withQueryClient(testQueryClient),
      });

      result.current.mutate(createPayload);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedJobAlertsService.createJobAlert).toHaveBeenCalledWith(createPayload);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['job-alerts', 'list'] });
      expect(toast.success).toHaveBeenCalledWith('Job alert created successfully.');
    });

    it('shows error toast when creation fails', async () => {
      mockedJobAlertsService.createJobAlert.mockRejectedValueOnce({
        status: 400,
        message: 'Maximum limit of 10 alerts reached.',
      });

      const { result } = renderHook(() => useCreateJobAlert(), {
        wrapper: createQueryWrapper(),
      });

      result.current.mutate(createPayload);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Maximum limit of 10 alerts reached.');
    });
  });

  describe('useUpdateJobAlert', () => {
    const updatePayload: UpdateJobAlertInput = {
      name: 'Updated Backend Alerts',
      title: 'Principal .NET Engineer',
    };

    it('updates job alert and invalidates queries on success', async () => {
      const testQueryClient = createTestQueryClient();
      const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries');
      mockedJobAlertsService.updateJobAlert.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useUpdateJobAlert(), {
        wrapper: withQueryClient(testQueryClient),
      });

      result.current.mutate({ id: 'alert-uuid-1', input: updatePayload });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedJobAlertsService.updateJobAlert).toHaveBeenCalledWith('alert-uuid-1', updatePayload);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['job-alerts', 'list'] });
      expect(toast.success).toHaveBeenCalledWith('Job alert updated successfully.');
    });

    it('shows error toast when update fails', async () => {
      mockedJobAlertsService.updateJobAlert.mockRejectedValueOnce({
        status: 404,
        message: 'Job alert not found.',
      });

      const { result } = renderHook(() => useUpdateJobAlert(), {
        wrapper: createQueryWrapper(),
      });

      result.current.mutate({ id: 'alert-uuid-1', input: updatePayload });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Job alert not found.');
    });
  });

  describe('useToggleJobAlert', () => {
    it('toggles job alert to enabled and invalidates queries', async () => {
      const testQueryClient = createTestQueryClient();
      const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries');
      mockedJobAlertsService.toggleJobAlert.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useToggleJobAlert(), {
        wrapper: withQueryClient(testQueryClient),
      });

      result.current.mutate({ id: 'alert-uuid-1', isEnabled: true });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedJobAlertsService.toggleJobAlert).toHaveBeenCalledWith('alert-uuid-1', true);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['job-alerts', 'list'] });
      expect(toast.success).toHaveBeenCalledWith('Job alert enabled.');
    });

    it('toggles job alert to disabled with paused toast message', async () => {
      mockedJobAlertsService.toggleJobAlert.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useToggleJobAlert(), {
        wrapper: createQueryWrapper(),
      });

      result.current.mutate({ id: 'alert-uuid-1', isEnabled: false });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(toast.success).toHaveBeenCalledWith('Job alert paused.');
    });

    it('shows error toast on toggle failure', async () => {
      mockedJobAlertsService.toggleJobAlert.mockRejectedValueOnce({
        status: 500,
        message: '',
      });

      const { result } = renderHook(() => useToggleJobAlert(), {
        wrapper: createQueryWrapper(),
      });

      result.current.mutate({ id: 'alert-uuid-1', isEnabled: true });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Failed to toggle job alert.');
    });
  });

  describe('useDeleteJobAlert', () => {
    it('deletes job alert and invalidates queries on success', async () => {
      const testQueryClient = createTestQueryClient();
      const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries');
      mockedJobAlertsService.deleteJobAlert.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteJobAlert(), {
        wrapper: withQueryClient(testQueryClient),
      });

      result.current.mutate('alert-uuid-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedJobAlertsService.deleteJobAlert).toHaveBeenCalledWith('alert-uuid-1');
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['job-alerts', 'list'] });
      expect(toast.success).toHaveBeenCalledWith('Job alert deleted successfully.');
    });

    it('shows error toast on delete failure', async () => {
      mockedJobAlertsService.deleteJobAlert.mockRejectedValueOnce({
        status: 404,
        message: 'Job alert not found.',
      });

      const { result } = renderHook(() => useDeleteJobAlert(), {
        wrapper: createQueryWrapper(),
      });

      result.current.mutate('alert-uuid-1');

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Job alert not found.');
    });
  });
});
