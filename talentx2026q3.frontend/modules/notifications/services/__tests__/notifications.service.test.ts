import { apiClient } from '@/lib/api/axios';
import { notificationsService } from '../notifications.service';
import type { Notification, PaginatedNotificationList } from '../../types';

jest.mock('@/lib/api/axios', () => ({
  apiClient: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockedGet = jest.mocked(apiClient.get);
const mockedPatch = jest.mocked(apiClient.patch);

describe('notificationsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const sampleNotification: Notification = {
    id: 'notification-uuid-1',
    type: 'JobAlertMatch',
    title: 'New job matches your alert',
    body: 'A new Senior .NET Engineer role was published.',
    metadata: '{"jobId":"job-uuid-1","keyword":".NET Engineer"}',
    readAt: null,
    createdAt: '2026-09-14T10:00:00.000Z',
  };

  it('getNotifications calls GET /notifications with page/pageSize params and abort signal', async () => {
    const page: PaginatedNotificationList<Notification> = {
      items: [sampleNotification],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    };
    mockedGet.mockResolvedValueOnce({ data: page });
    const controller = new AbortController();

    const result = await notificationsService.getNotifications(1, 10, false, controller.signal);

    expect(mockedGet).toHaveBeenCalledWith('/notifications', {
      params: { page: 1, pageSize: 10, unreadOnly: false },
      signal: controller.signal,
    });
    expect(result).toEqual(page);
  });

  it('getNotifications passes unreadOnly: true in query params when specified', async () => {
    const page: PaginatedNotificationList<Notification> = {
      items: [sampleNotification],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    };
    mockedGet.mockResolvedValueOnce({ data: page });
    const controller = new AbortController();

    const result = await notificationsService.getNotifications(1, 10, true, controller.signal);

    expect(mockedGet).toHaveBeenCalledWith('/notifications', {
      params: { page: 1, pageSize: 10, unreadOnly: true },
      signal: controller.signal,
    });
    expect(result).toEqual(page);
  });

  it('getUnreadCount calls GET /notifications/unread-count and returns the bare count', async () => {
    mockedGet.mockResolvedValueOnce({ data: 3 });
    const controller = new AbortController();

    const unreadCount = await notificationsService.getUnreadCount(controller.signal);

    expect(mockedGet).toHaveBeenCalledWith('/notifications/unread-count', {
      signal: controller.signal,
    });
    expect(unreadCount).toBe(3);
  });

  it('markAsRead calls PATCH /notifications/{id}/read', async () => {
    mockedPatch.mockResolvedValueOnce({ data: undefined });

    await notificationsService.markAsRead('notification-uuid-1');

    expect(mockedPatch).toHaveBeenCalledWith('/notifications/notification-uuid-1/read');
  });

  it('markAllAsRead calls PATCH /notifications/read-all', async () => {
    mockedPatch.mockResolvedValueOnce({ data: undefined });

    await notificationsService.markAllAsRead();

    expect(mockedPatch).toHaveBeenCalledWith('/notifications/read-all');
  });

  it('propagates an ApiError-shaped rejection from apiClient', async () => {
    const apiError = { status: 500, message: 'Internal server error' };
    mockedGet.mockRejectedValueOnce(apiError);

    await expect(notificationsService.getUnreadCount()).rejects.toEqual(apiError);
  });
});
