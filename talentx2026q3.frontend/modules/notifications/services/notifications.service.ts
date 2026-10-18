import { apiClient } from '@/lib/api/axios';
import { NOTIFICATIONS_API_ENDPOINTS, NOTIFICATION_CONSTANTS } from '../constants';
import type { GetNotificationsQueryParams, Notification, PaginatedNotificationList } from '../types';

export const notificationsService = {
  getNotifications: async (
    page: number = NOTIFICATION_CONSTANTS.DEFAULT_PAGE_NUMBER,
    pageSize: number = NOTIFICATION_CONSTANTS.DEFAULT_PAGE_SIZE,
    unreadOnly: boolean = false,
    signal?: AbortSignal
  ): Promise<PaginatedNotificationList<Notification>> => {
    const params: GetNotificationsQueryParams = {
      page,
      pageSize,
      unreadOnly,
    };
    const response = await apiClient.get<PaginatedNotificationList<Notification>>(
      NOTIFICATIONS_API_ENDPOINTS.NOTIFICATIONS,
      { params, signal }
    );
    return response.data;
  },

  // Backend returns a bare JSON number from GET /notifications/unread-count (NotificationsController.GetUnreadCount).
  getUnreadCount: async (signal?: AbortSignal): Promise<number> => {
    const response = await apiClient.get<number>(NOTIFICATIONS_API_ENDPOINTS.UNREAD_COUNT, {
      signal,
    });
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(NOTIFICATIONS_API_ENDPOINTS.MARK_AS_READ(id));
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch(NOTIFICATIONS_API_ENDPOINTS.MARK_ALL_AS_READ);
  },
};
