'use client';

import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotificationsInfinite,
  useNotificationsRealtime,
  useUnreadNotificationCount,
} from '../hooks';
import { NotificationListItem } from './NotificationListItem';

export interface NotificationDropdownPanelProps {
  className?: string;
}

function getTabButtonClassName(isActive: boolean): string {
  return cn(
    'pb-2.5 pt-2 text-xs sm:text-sm transition-colors cursor-pointer border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 dark:focus-visible:ring-white',
    isActive
      ? 'border-emerald-700 text-slate-900 font-bold dark:border-emerald-500 dark:text-white'
      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
  );
}

export function NotificationDropdownPanel({
  className,
}: NotificationDropdownPanelProps) {
  useNotificationsRealtime();

  const { data: unreadCount } = useUnreadNotificationCount();
  const unreadBadgeCount = typeof unreadCount === 'number' ? unreadCount : 0;
  const hasUnread = unreadBadgeCount > 0;

  const markAllNotificationsAsReadMutation = useMarkAllNotificationsAsRead();
  const markNotificationAsReadMutation = useMarkNotificationAsRead();

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [hasArmedAutoLoad, setHasArmedAutoLoad] = useState(false);

  const allTabRef = useRef<HTMLButtonElement>(null);
  const unreadTabRef = useRef<HTMLButtonElement>(null);
  const allSentinelRef = useRef<HTMLDivElement>(null);
  const unreadSentinelRef = useRef<HTMLDivElement>(null);

  const allNotificationsQuery = useNotificationsInfinite({
    unreadOnly: false,
    enabled: activeTab === 'all',
  });
  const unreadNotificationsQuery = useNotificationsInfinite({
    unreadOnly: true,
    enabled: activeTab === 'unread',
  });

  const allItems =
    allNotificationsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const unreadItems =
    unreadNotificationsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const activeQuery =
    activeTab === 'all' ? allNotificationsQuery : unreadNotificationsQuery;
  const activeItems = activeTab === 'all' ? allItems : unreadItems;

  const previousTabRef = useRef(activeTab);
  const knownNotificationIdsRef = useRef<Set<string>>(new Set());
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  useEffect(() => {
    if (previousTabRef.current !== activeTab) {
      previousTabRef.current = activeTab;
      knownNotificationIdsRef.current = new Set(
        activeItems.map((notificationItem) => notificationItem.id)
      );
      return;
    }

    if (activeItems.length === 0) {
      return;
    }

    if (knownNotificationIdsRef.current.size === 0) {
      knownNotificationIdsRef.current = new Set(
        activeItems.map((notificationItem) => notificationItem.id)
      );
      return;
    }

    const unannouncedItem = activeItems.find(
      (notificationItem) => !knownNotificationIdsRef.current.has(notificationItem.id)
    );

    if (unannouncedItem) {
      setLiveAnnouncement(`New notification: ${unannouncedItem.title}`);
      knownNotificationIdsRef.current.add(unannouncedItem.id);
    }
  }, [activeTab, activeItems]);

  // Keyboard navigation between tabs (WAI-ARIA Tablist Pattern)
  const handleTabKeyDown = (keyboardEvent: KeyboardEvent<HTMLButtonElement>) => {
    if (keyboardEvent.key === 'ArrowRight' || keyboardEvent.key === 'ArrowLeft') {
      keyboardEvent.preventDefault();
      if (activeTab === 'all') {
        setActiveTab('unread');
        unreadTabRef.current?.focus();
      } else {
        setActiveTab('all');
        allTabRef.current?.focus();
      }
    } else if (keyboardEvent.key === 'Home') {
      keyboardEvent.preventDefault();
      setActiveTab('all');
      allTabRef.current?.focus();
    } else if (keyboardEvent.key === 'End') {
      keyboardEvent.preventDefault();
      setActiveTab('unread');
      unreadTabRef.current?.focus();
    }
  };

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = activeQuery;

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const sentinelElement =
      activeTab === 'all'
        ? hasArmedAutoLoad
          ? allSentinelRef.current
          : null
        : unreadSentinelRef.current;

    if (!sentinelElement || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const sentinelEntry = entries[0];
      if (sentinelEntry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    });

    observer.observe(sentinelElement);
    return () => observer.disconnect();
  }, [activeTab, hasArmedAutoLoad, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div
      onWheel={(wheelEvent) => wheelEvent.stopPropagation()}
      className={cn('flex flex-col w-full text-slate-900 dark:text-slate-100 overscroll-contain', className)}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Notifications
        </h2>
        {hasUnread && (
          <button
            type="button"
            data-testid="mark-all-as-read-button"
            onClick={() => markAllNotificationsAsReadMutation.mutate()}
            disabled={markAllNotificationsAsReadMutation.isPending}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-sm cursor-pointer disabled:opacity-50 disabled:cursor-default dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Tabs row */}
      <div
        role="tablist"
        aria-label="Notification filters"
        className="flex items-center gap-4 px-4 border-b border-slate-100 dark:border-slate-800"
      >
        <button
          ref={allTabRef}
          id="notification-tab-all"
          role="tab"
          type="button"
          aria-selected={activeTab === 'all'}
          aria-controls="notification-panel-all"
          tabIndex={activeTab === 'all' ? 0 : -1}
          onClick={() => setActiveTab('all')}
          onKeyDown={handleTabKeyDown}
          className={getTabButtonClassName(activeTab === 'all')}
        >
          All
        </button>
        <button
          ref={unreadTabRef}
          id="notification-tab-unread"
          role="tab"
          type="button"
          aria-selected={activeTab === 'unread'}
          aria-controls="notification-panel-unread"
          tabIndex={activeTab === 'unread' ? 0 : -1}
          onClick={() => setActiveTab('unread')}
          onKeyDown={handleTabKeyDown}
          className={getTabButtonClassName(activeTab === 'unread')}
        >
          Unread ({unreadBadgeCount})
        </button>
      </div>

      {/* Screen reader live notification announcement */}
      <div aria-live="polite" role="status" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* Body scroll area */}
      <div
        role="tabpanel"
        id={activeTab === 'all' ? 'notification-panel-all' : 'notification-panel-unread'}
        aria-labelledby={activeTab === 'all' ? 'notification-tab-all' : 'notification-tab-unread'}
        tabIndex={0}
        onWheel={(wheelEvent) => wheelEvent.stopPropagation()}
        className="overflow-y-auto max-h-[380px] overscroll-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-inset dark:focus-visible:ring-white"
      >
        {activeQuery.isPending && !activeQuery.data ? (
          <div className="p-3 space-y-3">
            {[1, 2, 3].map((placeholderIndex) => (
              <div
                key={placeholderIndex}
                className="p-3 space-y-2 rounded-md bg-slate-50 dark:bg-slate-900/60 animate-pulse"
              >
                <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-2.5 w-2/3 rounded bg-slate-100 dark:bg-slate-800/60" />
              </div>
            ))}
          </div>
        ) : activeQuery.isError && !activeQuery.data ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 dark:text-slate-400">
            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
              Couldn&apos;t load notifications
            </p>
            <button
              type="button"
              onClick={() => void activeQuery.refetch()}
              className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-white transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : activeItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-slate-500 dark:text-slate-400">
            {activeTab === 'unread' ? (
              <CheckCheck className="size-8 text-emerald-600 mb-2 opacity-80" aria-hidden="true" />
            ) : (
              <Bell className="size-8 text-slate-300 dark:text-slate-600 mb-2" aria-hidden="true" />
            )}
            <p className="text-xs sm:text-sm font-medium">
              {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeItems.map((notification) => (
                <NotificationListItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={(notificationId) =>
                    markNotificationAsReadMutation.mutate(notificationId)
                  }
                  isMarkingAsRead={
                    markNotificationAsReadMutation.isPending &&
                    markNotificationAsReadMutation.variables === notification.id
                  }
                />
              ))}
            </ul>

            {/* Unread tab load-more behavior: IntersectionObserver sentinel only (NO button ever) */}
            {activeTab === 'unread' && unreadNotificationsQuery.hasNextPage && (
              <div>
                {unreadNotificationsQuery.isFetchingNextPage && (
                  <div className="py-2.5 flex items-center justify-center text-slate-400">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="sr-only">Loading more notifications...</span>
                  </div>
                )}
                <div
                  ref={unreadSentinelRef}
                  data-testid="unread-scroll-sentinel"
                  className="h-1"
                  aria-hidden="true"
                />
              </div>
            )}

            {/* All tab load-more behavior: Manual button until clicked, then IntersectionObserver sentinel */}
            {activeTab === 'all' && allNotificationsQuery.hasNextPage && (
              <div>
                {!hasArmedAutoLoad ? (
                  <button
                    type="button"
                    data-testid="see-previous-notifications-button"
                    onClick={() => {
                      void allNotificationsQuery.fetchNextPage();
                      setHasArmedAutoLoad(true);
                    }}
                    disabled={allNotificationsQuery.isFetchingNextPage}
                    className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-t border-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-white cursor-pointer disabled:cursor-default dark:border-slate-800 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900"
                  >
                    {allNotificationsQuery.isFetchingNextPage ? (
                      <span className="inline-flex items-center gap-1.5 justify-center">
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Loading...</span>
                      </span>
                    ) : (
                      'See previous notifications'
                    )}
                  </button>
                ) : (
                  <div>
                    {allNotificationsQuery.isFetchingNextPage && (
                      <div className="py-2.5 flex items-center justify-center text-slate-400">
                        <Loader2 className="size-4 animate-spin" />
                        <span className="sr-only">Loading more notifications...</span>
                      </div>
                    )}
                    <div
                      ref={allSentinelRef}
                      data-testid="all-scroll-sentinel"
                      className="h-1"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
