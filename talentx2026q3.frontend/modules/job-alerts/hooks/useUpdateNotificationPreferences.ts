'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ApiError } from '@/lib/api/axios';
import { notificationPreferencesService } from '../services';
import type { UpdateTalentNotificationPreferenceInput } from '../types';
import { jobAlertKeys } from './query-keys';

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, UpdateTalentNotificationPreferenceInput>({
    mutationFn: (payload: UpdateTalentNotificationPreferenceInput) =>
      notificationPreferencesService.updateNotificationPreferences(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobAlertKeys.preferences() });
      toast.success('Notification preferences updated.');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to update notification preferences.');
    },
  });
}
