export const NOTIFICATION_CONSTANTS = {
  DEFAULT_PAGE_NUMBER: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_UNREAD_COUNT_DISPLAY: 99,
} as const;

export const NOTIFICATION_SEEN_UNREAD_STORAGE_KEY = "notification-seen-unread-count";

export const NOTIFICATIONS_API_ENDPOINTS = {
  NOTIFICATIONS: '/notifications',
  UNREAD_COUNT: '/notifications/unread-count',
  MARK_AS_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_AS_READ: '/notifications/read-all',
} as const;

// Path after /api/backend/. The rewrite prepends API_URL (which already contains /api/v1)
// in front of this, so it resolves to the backend's /api/v1/hubs/notifications route
// (RealtimeEndpointExtensions.NotificationsHubRoute) — do not add /api/v1 here too.
export const NOTIFICATIONS_HUB_PATH = '/hubs/notifications';

// Access token cookie lives 15 minutes (IdentityStartup.cs AccessTokenMinutes); refresh well
// before that so an idle Talent session with an open hub connection never lets the cookie expire.
export const NOTIFICATIONS_REALTIME_KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000;
