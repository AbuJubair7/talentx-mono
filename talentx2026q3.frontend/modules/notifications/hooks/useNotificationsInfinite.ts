'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { NOTIFICATION_CONSTANTS } from '../constants';
import { notificationsService } from '../services';
import type { Notification, PaginatedNotificationList } from '../types';
import { notificationKeys } from './query-keys';

export interface UseNotificationsInfiniteOptions {
  pageSize?: number;
  unreadOnly?: boolean;
  enabled?: boolean;
}

export function useNotificationsInfinite(options?: UseNotificationsInfiniteOptions) {
  const pageSize = options?.pageSize ?? NOTIFICATION_CONSTANTS.DEFAULT_PAGE_SIZE;
  const unreadOnly = options?.unreadOnly ?? false;
  const enabled = options?.enabled ?? true;

  return useInfiniteQuery<PaginatedNotificationList<Notification>>({
    queryKey: notificationKeys.listInfinite(pageSize, unreadOnly),
    queryFn: ({ pageParam, signal: abortSignal }) =>
      notificationsService.getNotifications(
        pageParam as number,
        pageSize,
        unreadOnly,
        abortSignal
      ),
    initialPageParam: NOTIFICATION_CONSTANTS.DEFAULT_PAGE_NUMBER,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled,
  });
}
