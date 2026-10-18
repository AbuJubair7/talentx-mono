export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (page: number, pageSize: number) => [...notificationKeys.lists(), page, pageSize] as const,
  listInfinite: (pageSize: number, unreadOnly?: boolean) =>
    [...notificationKeys.lists(), 'infinite', pageSize, { unreadOnly: Boolean(unreadOnly) }] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};
