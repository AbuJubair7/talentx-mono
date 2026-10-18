import { act, renderHook, waitFor } from '@testing-library/react';

import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper';
import { NOTIFICATION_CONSTANTS } from '../../constants';
import { notificationsService } from '../../services/notifications.service';
import type { Notification, PaginatedNotificationList } from '../../types';
import { notificationKeys } from '../query-keys';
import { useNotificationsInfinite } from '../useNotificationsInfinite';

jest.mock('../../services/notifications.service', () => ({
  notificationsService: {
    getNotifications: jest.fn(),
  },
}));

const mockedNotificationsService = notificationsService as jest.Mocked<typeof notificationsService>;

describe('useNotificationsInfinite', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const sampleNotificationOne: Notification = {
    id: 'notification-uuid-1',
    type: 'JobAlertMatch',
    title: 'New job matches your alert',
    body: 'A new Senior .NET Engineer role was published.',
    metadata: null,
    readAt: null,
    createdAt: '2026-09-14T10:00:00.000Z',
  };

  const sampleNotificationTwo: Notification = {
    id: 'notification-uuid-2',
    type: 'JobAlertMatch',
    title: 'Second job match',
    body: 'A new Lead Engineer role was published.',
    metadata: null,
    readAt: null,
    createdAt: '2026-09-15T10:00:00.000Z',
  };

  const samplePageOne: PaginatedNotificationList<Notification> = {
    items: [sampleNotificationOne],
    page: 1,
    pageSize: NOTIFICATION_CONSTANTS.DEFAULT_PAGE_SIZE,
    totalCount: 2,
    totalPages: 2,
  };

  const samplePageTwo: PaginatedNotificationList<Notification> = {
    items: [sampleNotificationTwo],
    page: 2,
    pageSize: NOTIFICATION_CONSTANTS.DEFAULT_PAGE_SIZE,
    totalCount: 2,
    totalPages: 2,
  };

  it('fetches page 1 and can fetch page 2 via fetchNextPage()', async () => {
    mockedNotificationsService.getNotifications
      .mockResolvedValueOnce(samplePageOne)
      .mockResolvedValueOnce(samplePageTwo);

    const { result } = renderHook(() => useNotificationsInfinite({ unreadOnly: false }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedNotificationsService.getNotifications).toHaveBeenCalledWith(
      NOTIFICATION_CONSTANTS.DEFAULT_PAGE_NUMBER,
      NOTIFICATION_CONSTANTS.DEFAULT_PAGE_SIZE,
      false,
      expect.anything()
    );
    expect(result.current.data?.pages[0]).toEqual(samplePageOne);
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

    expect(mockedNotificationsService.getNotifications).toHaveBeenCalledWith(
      2,
      NOTIFICATION_CONSTANTS.DEFAULT_PAGE_SIZE,
      false,
      expect.anything()
    );
    expect(result.current.data?.pages[1]).toEqual(samplePageTwo);
  });

  it('fetches with unreadOnly: true query parameter', async () => {
    mockedNotificationsService.getNotifications.mockResolvedValueOnce(samplePageOne);

    const { result } = renderHook(() => useNotificationsInfinite({ unreadOnly: true }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedNotificationsService.getNotifications).toHaveBeenCalledWith(
      NOTIFICATION_CONSTANTS.DEFAULT_PAGE_NUMBER,
      NOTIFICATION_CONSTANTS.DEFAULT_PAGE_SIZE,
      true,
      expect.anything()
    );
  });

  it('maintains independent cache keys for unreadOnly: false vs unreadOnly: true', () => {
    const defaultKey = notificationKeys.listInfinite(NOTIFICATION_CONSTANTS.DEFAULT_PAGE_SIZE, false);
    const unreadKey = notificationKeys.listInfinite(NOTIFICATION_CONSTANTS.DEFAULT_PAGE_SIZE, true);

    expect(defaultKey).not.toEqual(unreadKey);
    expect(defaultKey).toEqual([
      'notifications',
      'list',
      'infinite',
      NOTIFICATION_CONSTANTS.DEFAULT_PAGE_SIZE,
      { unreadOnly: false },
    ]);
    expect(unreadKey).toEqual([
      'notifications',
      'list',
      'infinite',
      NOTIFICATION_CONSTANTS.DEFAULT_PAGE_SIZE,
      { unreadOnly: true },
    ]);
  });

  it('returns undefined for getNextPageParam when page >= totalPages', async () => {
    const singlePage: PaginatedNotificationList<Notification> = {
      items: [sampleNotificationOne],
      page: 1,
      pageSize: NOTIFICATION_CONSTANTS.DEFAULT_PAGE_SIZE,
      totalCount: 1,
      totalPages: 1,
    };
    mockedNotificationsService.getNotifications.mockResolvedValueOnce(singlePage);

    const { result } = renderHook(() => useNotificationsInfinite(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.hasNextPage).toBe(false);
  });

  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(() => useNotificationsInfinite({ enabled: false }), {
      wrapper: createQueryWrapper(),
    });

    expect(mockedNotificationsService.getNotifications).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });
});
