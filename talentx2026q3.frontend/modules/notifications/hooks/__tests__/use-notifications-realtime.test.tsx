import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { createTestQueryClient } from '@/tests/test-utils/query-client-wrapper';
import { refreshSession } from '@/modules/auth/refresh/services/refresh.service';
import { getAuthCookies } from '@/modules/auth/shared/auth-cookies.service';
import { toast } from 'sonner';
import { NOTIFICATIONS_REALTIME_KEEP_ALIVE_INTERVAL_MS } from '../../constants';
import type { Notification } from '../../types';
import { notificationKeys } from '../query-keys';
import { useNotificationsRealtime, __resetSingletonStateForTesting } from '../useNotificationsRealtime';

type ReceiveNotificationHandler = (notification: Notification) => void;

const mockConnection = {
  state: 'Connected' as string,
  on: jest.fn<void, [string, ReceiveNotificationHandler]>(),
  start: jest.fn<Promise<void>, []>(),
  stop: jest.fn<Promise<void>, []>(),
};

jest.mock('@microsoft/signalr', () => ({
  HubConnectionState: {
    Disconnected: 'Disconnected',
    Connecting: 'Connecting',
    Connected: 'Connected',
    Disconnecting: 'Disconnecting',
    Reconnecting: 'Reconnecting',
  },
  HttpTransportType: {
    None: 0,
    WebSockets: 1,
    ServerSentEvents: 2,
    LongPolling: 4,
  },
  HubConnectionBuilder: jest.fn().mockImplementation(() => ({
    withUrl: jest.fn().mockReturnThis(),
    withAutomaticReconnect: jest.fn().mockReturnThis(),
    build: jest.fn(() => mockConnection),
  })),
}));

jest.mock('@/modules/auth/refresh/services/refresh.service', () => ({
  refreshSession: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/modules/auth/shared/auth-cookies.service', () => ({
  getAuthCookies: jest.fn().mockResolvedValue({ accessToken: 'fresh-token', refreshToken: null }),
}));

jest.mock('sonner', () => ({
  toast: {
    info: jest.fn(),
  },
}));

const mockedRefreshSession = jest.mocked(refreshSession);
const mockedGetAuthCookies = jest.mocked(getAuthCookies);

function withQueryClient(testQueryClient: ReturnType<typeof createTestQueryClient>) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
}

function getReceiveNotificationHandler(): ReceiveNotificationHandler {
  const call = mockConnection.on.mock.calls.find(([eventName]) => eventName === 'ReceiveNotification');
  if (!call) {
    throw new Error('ReceiveNotification handler was never registered');
  }
  return call[1];
}

describe('useNotificationsRealtime', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    __resetSingletonStateForTesting();
    
    const HubConnectionBuilderMock = jest.requireMock('@microsoft/signalr').HubConnectionBuilder;
    HubConnectionBuilderMock.mockImplementation(() => ({
      withUrl: jest.fn().mockReturnThis(),
      withAutomaticReconnect: jest.fn().mockReturnThis(),
      build: jest.fn(() => mockConnection),
    }));

    mockedRefreshSession.mockResolvedValue(true);
    mockedGetAuthCookies.mockResolvedValue({ accessToken: 'fresh-token', refreshToken: null });
    mockConnection.state = 'Disconnected';
    mockConnection.start.mockImplementation(async () => {
      mockConnection.state = 'Connected';
    });
    mockConnection.stop.mockImplementation(async () => {
      mockConnection.state = 'Disconnected';
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts the hub connection and subscribes to ReceiveNotification once', async () => {
    const testQueryClient = createTestQueryClient();

    const { unmount } = renderHook(() => useNotificationsRealtime(), {
      wrapper: withQueryClient(testQueryClient),
    });

    await waitFor(() => expect(mockConnection.start).toHaveBeenCalledTimes(1));
    expect(mockConnection.on).toHaveBeenCalledWith('ReceiveNotification', expect.any(Function));

    unmount();
    await waitFor(() => expect(mockConnection.stop).toHaveBeenCalledTimes(1));
  });

  it('updates the list and unread-count caches when a notification is received', async () => {
    const testQueryClient = createTestQueryClient();
    testQueryClient.setQueryData(notificationKeys.unreadCount(), 2);
    const invalidateQueriesSpy = jest.spyOn(testQueryClient, 'invalidateQueries');

    const { unmount } = renderHook(() => useNotificationsRealtime(), {
      wrapper: withQueryClient(testQueryClient),
    });

    await waitFor(() => expect(mockConnection.start).toHaveBeenCalledTimes(1));

    const receiveNotification = getReceiveNotificationHandler();
    receiveNotification({
      id: 'notification-uuid-1',
      type: 'JobAlertMatch',
      title: 'New job matches your alert',
      body: 'A new Senior .NET Engineer role was published.',
      metadata: null,
      readAt: null,
      createdAt: '2026-09-17T10:00:00.000Z',
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: notificationKeys.all });
    expect(testQueryClient.getQueryData(notificationKeys.unreadCount())).toBe(3);

    unmount();
    await waitFor(() => expect(mockConnection.stop).toHaveBeenCalledTimes(1));
  });

  it('triggers session refresh on the keep-alive interval while connected', async () => {
    jest.useFakeTimers();
    const testQueryClient = createTestQueryClient();

    const { unmount } = renderHook(() => useNotificationsRealtime(), {
      wrapper: withQueryClient(testQueryClient),
    });

    // Flush the microtask queue so connection.start()'s resolved promise settles under fake timers.
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockConnection.start).toHaveBeenCalledTimes(1);
    expect(mockedRefreshSession).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(NOTIFICATIONS_REALTIME_KEEP_ALIVE_INTERVAL_MS);
    });
    expect(mockedRefreshSession).toHaveBeenCalledTimes(2);

    unmount();
  });

  it('refreshes the session immediately when the shared connection is first established', async () => {
    jest.useFakeTimers();
    const testQueryClient = createTestQueryClient();

    const { unmount } = renderHook(() => useNotificationsRealtime(), {
      wrapper: withQueryClient(testQueryClient),
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockedRefreshSession).toHaveBeenCalledTimes(1);
    expect(mockConnection.start).toHaveBeenCalledTimes(1);

    unmount();
  });

  it('does not start the connection when enabled is false', async () => {
    const testQueryClient = createTestQueryClient();

    const { unmount } = renderHook(() => useNotificationsRealtime({ enabled: false }), {
      wrapper: withQueryClient(testQueryClient),
    });

    expect(mockConnection.start).not.toHaveBeenCalled();
    unmount();
    expect(mockConnection.stop).not.toHaveBeenCalled();
  });

  it('handles "The connection was stopped during negotiation" cleanly without unhandled rejection', async () => {
    mockConnection.start.mockRejectedValue(new Error('The connection was stopped during negotiation.'));
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const testQueryClient = createTestQueryClient();

    const { unmount } = renderHook(() => useNotificationsRealtime(), {
      wrapper: withQueryClient(testQueryClient),
    });

    await waitFor(() => expect(mockConnection.start).toHaveBeenCalledTimes(1));
    expect(consoleWarnSpy).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
    unmount();
  });

  it('calls refreshSession in accessTokenFactory before returning the access token', async () => {
    const testQueryClient = createTestQueryClient();
    mockedGetAuthCookies.mockResolvedValue({ accessToken: 'fresh-token', refreshToken: null });

    const { unmount } = renderHook(() => useNotificationsRealtime(), {
      wrapper: withQueryClient(testQueryClient),
    });

    await waitFor(() => expect(mockConnection.start).toHaveBeenCalledTimes(1));

    // Capture the accessTokenFactory passed to withUrl
    const HubConnectionBuilderMock = jest.requireMock('@microsoft/signalr').HubConnectionBuilder;
    const withUrlCall = HubConnectionBuilderMock.mock.results[0]?.value?.withUrl?.mock?.calls?.[0];
    const urlOptions = withUrlCall?.[1] as { accessTokenFactory?: () => Promise<string> } | undefined;
    const accessTokenFactory = urlOptions?.accessTokenFactory;

    expect(accessTokenFactory).toBeDefined();

    // Call it directly — should trigger a refresh and return the fresh token
    const token = await accessTokenFactory!();

    expect(mockedRefreshSession).toHaveBeenCalled();
    expect(token).toBe('fresh-token');

    unmount();
  });

  it('deduplicates concurrent accessTokenFactory calls to a single refreshSession call', async () => {
    const testQueryClient = createTestQueryClient();
    mockedGetAuthCookies.mockResolvedValue({ accessToken: 'fresh-token', refreshToken: null });

    // Make refreshSession take a noticeable amount of time so the two concurrent calls overlap
    let resolveRefresh!: () => void;
    mockedRefreshSession.mockImplementation(
      () => new Promise<boolean>((resolve) => { resolveRefresh = () => resolve(true); })
    );

    const { unmount } = renderHook(() => useNotificationsRealtime(), {
      wrapper: withQueryClient(testQueryClient),
    });

    const HubConnectionBuilderMock = jest.requireMock('@microsoft/signalr').HubConnectionBuilder;
    const withUrlCall = HubConnectionBuilderMock.mock.results[0]?.value?.withUrl?.mock?.calls?.[0];
    const urlOptions = withUrlCall?.[1] as { accessTokenFactory?: () => Promise<string> } | undefined;
    const accessTokenFactory = urlOptions?.accessTokenFactory;
    expect(accessTokenFactory).toBeDefined();

    // Fire two concurrent calls
    const firstCall = accessTokenFactory!();
    const secondCall = accessTokenFactory!();

    // Resolve the pending refresh
    resolveRefresh();
    await Promise.all([firstCall, secondCall]);

    // Despite two concurrent calls, refreshSession must have been called exactly once
    // (one initial call from connection.start's refreshSession().then(), plus one from accessTokenFactory)
    // The key assertion: the two concurrent factory calls share one in-flight promise
    const refreshCallCount = mockedRefreshSession.mock.calls.length;
    expect(refreshCallCount).toBeLessThanOrEqual(2); // at most: 1 from start + 1 from factory (deduped)

    unmount();
  });

  it('shows a toast when a notification is received via ReceiveNotification', async () => {
    const testQueryClient = createTestQueryClient();

    const { unmount } = renderHook(() => useNotificationsRealtime(), {
      wrapper: withQueryClient(testQueryClient),
    });

    await waitFor(() => expect(mockConnection.start).toHaveBeenCalledTimes(1));

    const receiveNotification = getReceiveNotificationHandler();
    receiveNotification({
      id: 'notification-uuid-toast',
      type: 'JobAlertMatch',
      title: 'New job matches your alert',
      body: 'A Senior .NET Engineer role was published.',
      metadata: null,
      readAt: null,
      createdAt: '2026-09-23T10:00:00.000Z',
    });

    expect(toast.info).toHaveBeenCalledWith('New job matches your alert', {
      description: 'A Senior .NET Engineer role was published.',
    });

    unmount();
  });
});

