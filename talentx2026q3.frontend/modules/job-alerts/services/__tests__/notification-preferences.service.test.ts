import { apiClient } from '@/lib/api/axios';
import { notificationPreferencesService } from '../notification-preferences.service';
import type {
  TalentNotificationPreference,
  UpdateTalentNotificationPreferenceInput,
} from '../../types';

jest.mock('@/lib/api/axios', () => ({
  apiClient: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockedGet = jest.mocked(apiClient.get);
const mockedPatch = jest.mocked(apiClient.patch);

describe('notificationPreferencesService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getNotificationPreferences calls GET /notification-preferences with abort signal', async () => {
    const preferences: TalentNotificationPreference = {
      jobAlertsEmailEnabled: true,
    };
    mockedGet.mockResolvedValueOnce({ data: preferences });
    const controller = new AbortController();

    const result = await notificationPreferencesService.getNotificationPreferences(
      controller.signal
    );

    expect(mockedGet).toHaveBeenCalledWith('/notification-preferences', {
      signal: controller.signal,
    });
    expect(result).toEqual(preferences);
  });

  it('updateNotificationPreferences calls PATCH /notification-preferences with payload', async () => {
    const payload: UpdateTalentNotificationPreferenceInput = {
      jobAlertsEmailEnabled: false,
    };
    mockedPatch.mockResolvedValueOnce({ data: undefined });

    await notificationPreferencesService.updateNotificationPreferences(payload);

    expect(mockedPatch).toHaveBeenCalledWith('/notification-preferences', payload);
  });
});
