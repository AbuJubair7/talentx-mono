'use client';

import { useQuery } from '@tanstack/react-query';
import { notificationsService } from '../services';
import { notificationKeys } from './query-keys';

interface UseUnreadNotificationCountOptions {
  enabled?: boolean;
}

export function useUnreadNotificationCount(options?: UseUnreadNotificationCountOptions) {
  return useQuery<number>({
    queryKey: notificationKeys.unreadCount(),
    queryFn: ({ signal }) => notificationsService.getUnreadCount(signal),
    enabled: options?.enabled ?? true,
  });
}
