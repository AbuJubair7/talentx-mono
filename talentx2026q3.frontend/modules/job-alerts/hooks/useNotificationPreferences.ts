'use client';

import { useQuery } from '@tanstack/react-query';
import { notificationPreferencesService } from '../services';
import type { TalentNotificationPreference } from '../types';
import { jobAlertKeys } from './query-keys';

interface UseNotificationPreferencesOptions {
  enabled?: boolean;
}

export function useNotificationPreferences(options?: UseNotificationPreferencesOptions) {
  return useQuery<TalentNotificationPreference>({
    queryKey: jobAlertKeys.preferences(),
    queryFn: ({ signal }) => notificationPreferencesService.getNotificationPreferences(signal),
    enabled: options?.enabled ?? true,
  });
}
