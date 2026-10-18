import { apiClient } from '@/lib/api/axios';
import { JOB_ALERTS_API_ENDPOINTS } from '../constants';
import type {
  TalentNotificationPreference,
  UpdateTalentNotificationPreferenceInput,
} from '../types';

export const notificationPreferencesService = {
  getNotificationPreferences: async (
    abortSignal?: AbortSignal
  ): Promise<TalentNotificationPreference> => {
    const response = await apiClient.get<TalentNotificationPreference>(
      JOB_ALERTS_API_ENDPOINTS.NOTIFICATION_PREFERENCES,
      { signal: abortSignal }
    );
    return response.data;
  },

  updateNotificationPreferences: async (
    payload: UpdateTalentNotificationPreferenceInput
  ): Promise<void> => {
    await apiClient.patch(JOB_ALERTS_API_ENDPOINTS.NOTIFICATION_PREFERENCES, payload);
  },
};
