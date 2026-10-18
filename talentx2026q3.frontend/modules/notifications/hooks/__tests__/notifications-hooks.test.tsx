import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { createQueryWrapper, createTestQueryClient } from '@/tests/test-utils/query-client-wrapper';
import { notificationsService } from '../../services/notifications.service';
import type { Notification, PaginatedNotificationList } from '../../types';
import { notificationKeys } from '../query-keys';
import { useMarkAllNotificationsAsRead } from '../useMarkAllNotificationsAsRead';
import { useMarkNotificationAsRead } from '../useMarkNotificationAsRead';
import { useUnreadNotificationCount } from '../useUnreadNotificationCount';

jest.mock('../../services/notifications.service', () => ({
  notificationsService: {
    getNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  },
}));

const mockedNotificationsService = notificationsService as jest.Mocked<typeof notificationsService>;

function withQueryClient(testQueryClient: ReturnType<typeof createTestQueryClient>) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
}

describe('Notification Hooks', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const sampleNotification: Notification = {
    id: 'notification-uuid-1',
    type: 'JobAlertMatch',
    title: 'New job matches your alert',
    body: 'A new Senior .NET Engineer role was published.',
    metadata: null,
    readAt: null,
    createdAt: '2026-09-14T10:00:00.000Z',
  };

  const samplePage: PaginatedNotificationList<Notification> = {
    items: [sampleNotification],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
  };


  describe('useUnreadNotificationCount', () => {
    it('fetches the unread notification count', async () => {
      mockedNotificationsService.getUnreadCount.mockResolvedValueOnce(4);

      const { result } = renderHook(() => useUnreadNotificationCount(), {
        wrapper: createQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBe(4);
    });
  });

  describe('useMarkNotificationAsRead', () => {
    it('marks a notification as read and invalidates the notification queries cache', async () => {
      const testQueryClient = createTestQueryClient();
      const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries');
      mockedNotificationsService.markAsRead.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useMarkNotificationAsRead(), {
        wrapper: withQueryClient(testQueryClient),
      });

      result.current.mutate('notification-uuid-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedNotificationsService.markAsRead).toHaveBeenCalledWith('notification-uuid-1');
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: notificationKeys.all });
    });
  });

  describe('useMarkAllNotificationsAsRead', () => {
    it('marks all notifications as read and invalidates the notification queries cache', async () => {
      const testQueryClient = createTestQueryClient();
      const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries');
      mockedNotificationsService.markAllAsRead.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useMarkAllNotificationsAsRead(), {
        wrapper: withQueryClient(testQueryClient),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedNotificationsService.markAllAsRead).toHaveBeenCalledTimes(1);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: notificationKeys.all });
    });
  });
});
