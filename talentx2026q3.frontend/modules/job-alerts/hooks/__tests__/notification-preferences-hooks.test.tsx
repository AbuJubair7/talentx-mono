import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';

import { createQueryWrapper, createTestQueryClient } from '@/tests/test-utils/query-client-wrapper';
import { notificationPreferencesService } from '../../services/notification-preferences.service';
import type {
  TalentNotificationPreference,
  UpdateTalentNotificationPreferenceInput,
} from '../../types';
import { useNotificationPreferences } from '../useNotificationPreferences';
import { useUpdateNotificationPreferences } from '../useUpdateNotificationPreferences';

jest.mock('../../services/notification-preferences.service', () => ({
  notificationPreferencesService: {
    getNotificationPreferences: jest.fn(),
    updateNotificationPreferences: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedNotificationPreferencesService = notificationPreferencesService as jest.Mocked<
  typeof notificationPreferencesService
>;

function withQueryClient(testQueryClient: ReturnType<typeof createTestQueryClient>) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
}

describe('Notification Preferences Hooks', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const samplePreferences: TalentNotificationPreference = {
    jobAlertsEmailEnabled: true,
  };

  describe('useNotificationPreferences', () => {
    it('fetches notification preferences successfully', async () => {
      mockedNotificationPreferencesService.getNotificationPreferences.mockResolvedValueOnce(
        samplePreferences
      );

      const { result } = renderHook(() => useNotificationPreferences(), {
        wrapper: createQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedNotificationPreferencesService.getNotificationPreferences).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(samplePreferences);
    });

    it('does not fetch when enabled is false', () => {
      const { result } = renderHook(
        () => useNotificationPreferences({ enabled: false }),
        { wrapper: createQueryWrapper() }
      );

      expect(mockedNotificationPreferencesService.getNotificationPreferences).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useUpdateNotificationPreferences', () => {
    const updatePayload: UpdateTalentNotificationPreferenceInput = {
      jobAlertsEmailEnabled: false,
    };

    it('updates preferences, invalidates query cache, and shows success toast', async () => {
      const testQueryClient = createTestQueryClient();
      const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries');
      mockedNotificationPreferencesService.updateNotificationPreferences.mockResolvedValueOnce(
        undefined
      );

      const { result } = renderHook(() => useUpdateNotificationPreferences(), {
        wrapper: withQueryClient(testQueryClient),
      });

      result.current.mutate(updatePayload);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(
        mockedNotificationPreferencesService.updateNotificationPreferences
      ).toHaveBeenCalledWith(updatePayload);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['notification-preferences'],
      });
      expect(toast.success).toHaveBeenCalledWith('Notification preferences updated.');
    });

    it('shows error toast when preference update fails', async () => {
      mockedNotificationPreferencesService.updateNotificationPreferences.mockRejectedValueOnce({
        status: 500,
        message: 'Internal server error',
      });

      const { result } = renderHook(() => useUpdateNotificationPreferences(), {
        wrapper: createQueryWrapper(),
      });

      result.current.mutate(updatePayload);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Internal server error');
    });
  });
});
