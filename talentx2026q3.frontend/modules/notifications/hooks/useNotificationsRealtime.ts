'use client';

import { toast } from 'sonner';import { useContext, useEffect } from 'react';
import {
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  type HubConnection,
} from '@microsoft/signalr';
import { QueryClientContext, type QueryClient } from '@tanstack/react-query';
import { refreshSession } from '@/modules/auth/refresh/services/refresh.service';
import { getAuthCookies } from '@/modules/auth/shared/auth-cookies.service';
import {
  NOTIFICATIONS_HUB_PATH,
  NOTIFICATIONS_REALTIME_KEEP_ALIVE_INTERVAL_MS,
} from '../constants';
import { API_URL } from '@/lib/config';
import type { Notification } from '../types';
import { notificationKeys } from './query-keys';

export interface UseNotificationsRealtimeOptions {
  enabled?: boolean;
}

// Design choice: a single hub connection is shared across every mounted consumer of this hook
// (module-level singleton + reference counting), rather than one connection per component. This
// avoids opening N duplicate SignalR connections/handshakes if the Talent portal ever renders
// more than one component that wants live notifications (e.g. the sidebar bell and the
// Notifications page at once). The "ReceiveNotification" listener and the keep-alive interval are
// likewise established exactly once, on the first mount, and torn down only when the last
// consumer unmounts.
//
// queryClient is stored in a module-level ref so the ReceiveNotification handler always closes
// over the latest instance. Without this, remounts (navigation, React Strict Mode) would leave
// the singleton listener pointing at a stale, possibly garbage-collected client.
let sharedConnection: HubConnection | null = null;
let sharedConnectionStart: Promise<void> | null = null;
let keepAliveIntervalId: ReturnType<typeof setInterval> | null = null;
let activeConsumerCount = 0;
let currentQueryClient: QueryClient | null = null;

// Single-flight guard: at most one refresh call in-flight at any time across all consumers.
// Prevents concurrent POSTs to /auth/refresh when multiple tabs or rapid reconnects race.
let inflightRefreshPromise: Promise<boolean> | null = null;

function applyIncomingNotification(notification: Notification): void {
  toast.info(notification.title, { description: notification.body ?? undefined });

  if (!currentQueryClient) {
    return;
  }
  currentQueryClient.invalidateQueries({ queryKey: notificationKeys.all });
  currentQueryClient.setQueryData<number>(notificationKeys.unreadCount(), (previousUnreadCount) =>
    notification.readAt === null ? (previousUnreadCount ?? 0) + 1 : previousUnreadCount ?? 0
  );
}

function createNotificationHubConnection(): HubConnection {
  const backendBase = API_URL.replace(/\/$/, '');
  const hubUrl = `${backendBase}${NOTIFICATIONS_HUB_PATH}`;

  return new HubConnectionBuilder()
    .withUrl(hubUrl, {
      transport: HttpTransportType.WebSockets,
      skipNegotiation: true,
      withCredentials: true,
      accessTokenFactory: async () => {
        if (!inflightRefreshPromise) {
          inflightRefreshPromise = refreshSession().finally(() => {
            inflightRefreshPromise = null;
          });
        }
        await inflightRefreshPromise;
        const authCookies = await getAuthCookies();
        return authCookies.accessToken ?? '';
      },
    })
    .withAutomaticReconnect()
    .build();
}

function acquireSharedConnection(): HubConnection {
  if (!sharedConnection) {
    sharedConnection = createNotificationHubConnection();
    sharedConnection.on('ReceiveNotification', (notification: Notification) => {
      applyIncomingNotification(notification);
    });
  }
  return sharedConnection;
}

export function useNotificationsRealtime(options?: UseNotificationsRealtimeOptions): void {
  const queryClient = useContext(QueryClientContext);
  const isEnabled = (options?.enabled ?? true) && Boolean(queryClient);

  useEffect(() => {
    if (!isEnabled || !queryClient) {
      return;
    }

    currentQueryClient = queryClient;
    const connection = acquireSharedConnection();
    activeConsumerCount += 1;

    if (!sharedConnectionStart && connection.state === HubConnectionState.Disconnected) {
      sharedConnectionStart = refreshSession()
        .then(() => connection.start())
        .catch((error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (
            errorMessage.includes('stopped during negotiation') ||
            errorMessage.includes('canceled') ||
            errorMessage.includes('abort') ||
            errorMessage.includes('not in the \'Disconnected\' state')
          ) {
            return;
          }
          console.warn('Notification hub connection warning:', error);
        })
        .finally(() => {
          sharedConnectionStart = null;
        });
    }

    if (!keepAliveIntervalId) {
      keepAliveIntervalId = setInterval(() => {
        if (connection.state === HubConnectionState.Connected) {
          void refreshSession();
        }
      }, NOTIFICATIONS_REALTIME_KEEP_ALIVE_INTERVAL_MS);
    }

    return () => {
      activeConsumerCount = Math.max(0, activeConsumerCount - 1);
      if (activeConsumerCount > 0) {
        return;
      }

      currentQueryClient = null;

      if (keepAliveIntervalId) {
        clearInterval(keepAliveIntervalId);
        keepAliveIntervalId = null;
      }

      const connectionToStop = sharedConnection;
      sharedConnection = null;
      sharedConnectionStart = null;
      if (connectionToStop) {
        connectionToStop.off?.('ReceiveNotification');
        void connectionToStop.stop().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled]);
}

// Exported for test isolation only. Resets all module-level singleton state between test runs.
export function __resetSingletonStateForTesting(): void {
  sharedConnection = null;
  sharedConnectionStart = null;
  keepAliveIntervalId = null;
  activeConsumerCount = 0;
  currentQueryClient = null;
  inflightRefreshPromise = null;
}
