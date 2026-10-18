import { NOTIFICATION_CONSTANTS } from '../constants';

export function formatUnreadCount(unreadCount: number): string {
  if (!Number.isFinite(unreadCount) || unreadCount <= 0) {
    return '';
  }

  const normalizedCount = Math.floor(unreadCount);
  if (normalizedCount <= 0) {
    return '';
  }

  if (normalizedCount > NOTIFICATION_CONSTANTS.MAX_UNREAD_COUNT_DISPLAY) {
    return `${NOTIFICATION_CONSTANTS.MAX_UNREAD_COUNT_DISPLAY}+`;
  }

  return String(normalizedCount);
}
