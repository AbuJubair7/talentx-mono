import React from 'react';
import { act, createEvent, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationDropdownPanel } from '../NotificationDropdownPanel';
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotificationsInfinite,
  useNotificationsRealtime,
  useUnreadNotificationCount,
} from '../../hooks';
import type { Notification, PaginatedNotificationList } from '../../types';

jest.mock('../../hooks', () => ({
  useNotificationsRealtime: jest.fn(),
  useUnreadNotificationCount: jest.fn(),
  useMarkAllNotificationsAsRead: jest.fn(),
  useMarkNotificationAsRead: jest.fn(),
  useNotificationsInfinite: jest.fn(),
}));

const mockUseNotificationsRealtime =
  useNotificationsRealtime as jest.MockedFunction<typeof useNotificationsRealtime>;
const mockUseUnreadNotificationCount =
  useUnreadNotificationCount as jest.MockedFunction<typeof useUnreadNotificationCount>;
const mockUseMarkAllNotificationsAsRead =
  useMarkAllNotificationsAsRead as jest.MockedFunction<typeof useMarkAllNotificationsAsRead>;
const mockUseMarkNotificationAsRead =
  useMarkNotificationAsRead as jest.MockedFunction<typeof useMarkNotificationAsRead>;
const mockUseNotificationsInfinite =
  useNotificationsInfinite as jest.MockedFunction<typeof useNotificationsInfinite>;

describe('NotificationDropdownPanel', () => {
  let observerCallback: IntersectionObserverCallback = () => {};
  let mockObserve: jest.Mock;
  let mockDisconnect: jest.Mock;

  const mockMarkAllAsReadMutate = jest.fn();
  const mockMarkAsReadMutate = jest.fn();
  const mockAllFetchNextPage = jest.fn();
  const mockUnreadFetchNextPage = jest.fn();

  const sampleNotifications: Notification[] = [
    {
      id: 'notif-1',
      type: 'JobAlertMatch',
      title: 'Senior AI Engineer Match',
      body: 'A new role matching your criteria was posted by TechCorp.',
      metadata: JSON.stringify({ keyword: 'AI Engineer', location: 'Remote' }),
      readAt: null,
      createdAt: '2026-09-17T09:30:00Z',
    },
    {
      id: 'notif-2',
      type: 'JobAlertMatch',
      title: 'Full Stack Engineer Match',
      body: 'A new full-time role was posted by Acme.',
      metadata: JSON.stringify({ keyword: 'Full Stack' }),
      readAt: '2026-09-17T08:00:00Z',
      createdAt: '2026-09-17T08:00:00Z',
    },
  ];

  const createMockInfiniteQueryResult = (
    items: Notification[],
    hasNextPage = false,
    fetchNextPage = jest.fn()
  ) => ({
    data: {
      pages: [
        {
          items,
          page: 1,
          pageSize: 10,
          totalCount: items.length,
          totalPages: hasNextPage ? 2 : 1,
        } as PaginatedNotificationList<Notification>,
      ],
      pageParams: [1],
    },
    isPending: false,
    isError: false,
    hasNextPage,
    isFetchingNextPage: false,
    fetchNextPage,
    refetch: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockObserve = jest.fn();
    mockDisconnect = jest.fn();
    window.IntersectionObserver = jest.fn().mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: mockObserve,
        unobserve: jest.fn(),
        disconnect: mockDisconnect,
      };
    });

    mockUseNotificationsRealtime.mockReturnValue(undefined);

    mockUseUnreadNotificationCount.mockReturnValue({
      data: 1,
    } as ReturnType<typeof useUnreadNotificationCount>);

    mockUseMarkAllNotificationsAsRead.mockReturnValue({
      mutate: mockMarkAllAsReadMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useMarkAllNotificationsAsRead>);

    mockUseMarkNotificationAsRead.mockReturnValue({
      mutate: mockMarkAsReadMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useMarkNotificationAsRead>);

    mockUseNotificationsInfinite.mockImplementation((options) => {
      if (options?.unreadOnly) {
        return createMockInfiniteQueryResult(
          [sampleNotifications[0]],
          false,
          mockUnreadFetchNextPage
        ) as unknown as ReturnType<typeof useNotificationsInfinite>;
      }
      return createMockInfiniteQueryResult(
        sampleNotifications,
        false,
        mockAllFetchNextPage
      ) as unknown as ReturnType<typeof useNotificationsInfinite>;
    });
  });

  it('calls useNotificationsRealtime at top level', () => {
    render(<NotificationDropdownPanel />);
    expect(mockUseNotificationsRealtime).toHaveBeenCalled();
  });

  it('renders All tab and Unread tab with count', () => {
    mockUseUnreadNotificationCount.mockReturnValue({
      data: 4,
    } as ReturnType<typeof useUnreadNotificationCount>);

    render(<NotificationDropdownPanel />);

    expect(screen.getByRole('tab', { name: /^All$/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^Unread \(4\)$/i })).toBeInTheDocument();
  });

  it('supports tab switching between All and Unread on click', async () => {
    const userInteraction = userEvent.setup();
    render(<NotificationDropdownPanel />);

    const allTab = screen.getByRole('tab', { name: /^All$/i });
    const unreadTab = screen.getByRole('tab', { name: /^Unread/i });

    expect(allTab).toHaveAttribute('aria-selected', 'true');
    expect(unreadTab).toHaveAttribute('aria-selected', 'false');

    await userInteraction.click(unreadTab);

    expect(unreadTab).toHaveAttribute('aria-selected', 'true');
    expect(allTab).toHaveAttribute('aria-selected', 'false');

    await userInteraction.click(allTab);

    expect(allTab).toHaveAttribute('aria-selected', 'true');
    expect(unreadTab).toHaveAttribute('aria-selected', 'false');
  });

  it('supports keyboard navigation across tabs (ArrowLeft, ArrowRight, Home, End)', async () => {
    const userInteraction = userEvent.setup();
    render(<NotificationDropdownPanel />);

    const allTab = screen.getByRole('tab', { name: /^All$/i });
    const unreadTab = screen.getByRole('tab', { name: /^Unread/i });

    allTab.focus();
    expect(allTab).toHaveFocus();

    // ArrowRight switches to and focuses Unread tab
    await userInteraction.keyboard('{ArrowRight}');
    expect(unreadTab).toHaveAttribute('aria-selected', 'true');
    expect(unreadTab).toHaveFocus();

    // ArrowLeft switches to and focuses All tab
    await userInteraction.keyboard('{ArrowLeft}');
    expect(allTab).toHaveAttribute('aria-selected', 'true');
    expect(allTab).toHaveFocus();

    // End switches to last tab (Unread)
    await userInteraction.keyboard('{End}');
    expect(unreadTab).toHaveAttribute('aria-selected', 'true');
    expect(unreadTab).toHaveFocus();

    // Home switches to first tab (All)
    await userInteraction.keyboard('{Home}');
    expect(allTab).toHaveAttribute('aria-selected', 'true');
    expect(allTab).toHaveFocus();
  });

  it('renders "Mark all as read" button when unreadCount > 0 and calls mutation on click', async () => {
    const userInteraction = userEvent.setup();
    mockUseUnreadNotificationCount.mockReturnValue({
      data: 2,
    } as ReturnType<typeof useUnreadNotificationCount>);

    render(<NotificationDropdownPanel />);

    const markAllButton = screen.getByTestId('mark-all-as-read-button');
    expect(markAllButton).toBeInTheDocument();
    expect(markAllButton).toHaveTextContent('Mark all as read');
    expect(markAllButton).toHaveClass(
      'text-emerald-700',
      'focus-visible:ring-emerald-700'
    );

    await userInteraction.click(markAllButton);

    expect(mockMarkAllAsReadMutate).toHaveBeenCalledTimes(1);
  });

  it('hides "Mark all as read" button when unreadCount is 0', () => {
    mockUseUnreadNotificationCount.mockReturnValue({
      data: 0,
    } as ReturnType<typeof useUnreadNotificationCount>);

    render(<NotificationDropdownPanel />);

    expect(screen.queryByTestId('mark-all-as-read-button')).not.toBeInTheDocument();
  });

  it('auto-loads Unread tab via IntersectionObserver sentinel without any button', async () => {
    const userInteraction = userEvent.setup();

    mockUseNotificationsInfinite.mockImplementation((options) => {
      if (options?.unreadOnly) {
        return createMockInfiniteQueryResult(
          [sampleNotifications[0]],
          true,
          mockUnreadFetchNextPage
        ) as unknown as ReturnType<typeof useNotificationsInfinite>;
      }
      return createMockInfiniteQueryResult(
        sampleNotifications,
        false,
        mockAllFetchNextPage
      ) as unknown as ReturnType<typeof useNotificationsInfinite>;
    });

    render(<NotificationDropdownPanel />);

    const unreadTab = screen.getByRole('tab', { name: /^Unread/i });
    await userInteraction.click(unreadTab);

    // Sentinel must be rendered
    const sentinel = screen.getByTestId('unread-scroll-sentinel');
    expect(sentinel).toBeInTheDocument();

    // STRICT: NO "See previous notifications" or "Load more" button ever on Unread tab!
    expect(
      screen.queryByTestId('see-previous-notifications-button')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /load more/i })
    ).not.toBeInTheDocument();

    // Trigger intersection
    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(mockUnreadFetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('renders "See previous notifications" button on All tab when hasNextPage and !hasArmedAutoLoad', () => {
    mockUseNotificationsInfinite.mockImplementation((options) => {
      if (options?.unreadOnly) {
        return createMockInfiniteQueryResult(
          [sampleNotifications[0]],
          false,
          mockUnreadFetchNextPage
        ) as unknown as ReturnType<typeof useNotificationsInfinite>;
      }
      return createMockInfiniteQueryResult(
        sampleNotifications,
        true,
        mockAllFetchNextPage
      ) as unknown as ReturnType<typeof useNotificationsInfinite>;
    });

    render(<NotificationDropdownPanel />);

    const loadMoreButton = screen.getByTestId('see-previous-notifications-button');
    expect(loadMoreButton).toBeInTheDocument();
    expect(loadMoreButton).toHaveTextContent('See previous notifications');

    // Sentinel is not active while in manual button mode
    expect(screen.queryByTestId('all-scroll-sentinel')).not.toBeInTheDocument();
  });

  it('arms auto-load on All tab when clicking "See previous notifications", hiding button and activating sentinel', async () => {
    const userInteraction = userEvent.setup();

    mockUseNotificationsInfinite.mockImplementation((options) => {
      if (options?.unreadOnly) {
        return createMockInfiniteQueryResult(
          [sampleNotifications[0]],
          false,
          mockUnreadFetchNextPage
        ) as unknown as ReturnType<typeof useNotificationsInfinite>;
      }
      return createMockInfiniteQueryResult(
        sampleNotifications,
        true,
        mockAllFetchNextPage
      ) as unknown as ReturnType<typeof useNotificationsInfinite>;
    });

    render(<NotificationDropdownPanel />);

    const loadMoreButton = screen.getByTestId('see-previous-notifications-button');
    expect(loadMoreButton).toBeInTheDocument();

    // Click button to arm auto-load
    await userInteraction.click(loadMoreButton);

    // Initial click calls fetchNextPage
    expect(mockAllFetchNextPage).toHaveBeenCalledTimes(1);

    // Button is now replaced by sentinel
    expect(
      screen.queryByTestId('see-previous-notifications-button')
    ).not.toBeInTheDocument();

    const sentinel = screen.getByTestId('all-scroll-sentinel');
    expect(sentinel).toBeInTheDocument();

    // Further scroll-to-end triggers sentinel auto-fetch
    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(mockAllFetchNextPage).toHaveBeenCalledTimes(2);
  });

  it('resets All tab back to manual button mode when panel is unmounted and remounted', async () => {
    const userInteraction = userEvent.setup();

    mockUseNotificationsInfinite.mockImplementation((options) => {
      if (options?.unreadOnly) {
        return createMockInfiniteQueryResult(
          [sampleNotifications[0]],
          false,
          mockUnreadFetchNextPage
        ) as unknown as ReturnType<typeof useNotificationsInfinite>;
      }
      return createMockInfiniteQueryResult(
        sampleNotifications,
        true,
        mockAllFetchNextPage
      ) as unknown as ReturnType<typeof useNotificationsInfinite>;
    });

    const { unmount } = render(<NotificationDropdownPanel />);

    const loadMoreButton = screen.getByTestId('see-previous-notifications-button');
    await userInteraction.click(loadMoreButton);

    expect(
      screen.queryByTestId('see-previous-notifications-button')
    ).not.toBeInTheDocument();

    // Unmount the panel (simulating dropdown close)
    unmount();

    // Reopen dropdown (remounting the panel)
    render(<NotificationDropdownPanel />);

    // Button must reappear because new mount starts with hasArmedAutoLoad = false
    expect(
      screen.getByTestId('see-previous-notifications-button')
    ).toBeInTheDocument();
  });

  it('renders gracefully when notification metadata contains malformed JSON', () => {
    const malformedNotifications: Notification[] = [
      {
        id: 'notif-bad',
        type: 'JobAlertMatch',
        title: 'Malformed Metadata Alert',
        body: 'Alert with corrupted metadata string.',
        metadata: '{"bad json: true, missing brackets',
        readAt: null,
        createdAt: '2026-09-17T09:30:00Z',
      },
    ];

    mockUseNotificationsInfinite.mockImplementation(() =>
      createMockInfiniteQueryResult(
        malformedNotifications,
        false
      ) as unknown as ReturnType<typeof useNotificationsInfinite>
    );

    expect(() => {
      render(<NotificationDropdownPanel />);
    }).not.toThrow();

    expect(screen.getByText('Malformed Metadata Alert')).toBeInTheDocument();
    expect(screen.getByText('Alert with corrupted metadata string.')).toBeInTheDocument();
  });

  it('invokes useMarkNotificationAsRead mutation when clicking an unread item', async () => {
    const userInteraction = userEvent.setup();
    render(<NotificationDropdownPanel />);

    const unreadButton = screen.getByRole('button', {
      name: `Mark "${sampleNotifications[0].title}" as read`,
    });
    await userInteraction.click(unreadButton);

    expect(mockMarkAsReadMutate).toHaveBeenCalledWith('notif-1');
  });

  it('renders empty states when notifications list is empty', async () => {
    const userInteraction = userEvent.setup();

    mockUseNotificationsInfinite.mockImplementation(() =>
      createMockInfiniteQueryResult(
        [],
        false
      ) as unknown as ReturnType<typeof useNotificationsInfinite>
    );

    render(<NotificationDropdownPanel />);

    expect(screen.getByText('No notifications yet')).toBeInTheDocument();

    const unreadTab = screen.getByRole('tab', { name: /^Unread/i });
    await userInteraction.click(unreadTab);

    expect(screen.getByText('No unread notifications')).toBeInTheDocument();
  });

  it('applies overscroll-contain and isolates scroll wheel events on the scrollable container', () => {
    render(<NotificationDropdownPanel />);

    const scrollContainer = screen.getByRole('tabpanel');
    expect(scrollContainer).toHaveClass('overscroll-contain');

    const wheelEvent = createEvent.wheel(scrollContainer, { deltaY: 100 });
    const stopPropagationSpy = jest.spyOn(wheelEvent, 'stopPropagation');
    fireEvent(scrollContainer, wheelEvent);
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('does not announce notifications on initial render', () => {
    render(<NotificationDropdownPanel />);
    const liveStatusElement = screen.getByRole('status');
    expect(liveStatusElement).toHaveTextContent('');
  });

  it('announces when a new notification arrives in activeItems', () => {
    const { rerender } = render(<NotificationDropdownPanel />);
    const liveStatusElement = screen.getByRole('status');
    expect(liveStatusElement).toHaveTextContent('');

    const newNotification: Notification = {
      id: 'notif-new',
      type: 'JobAlertMatch',
      title: 'Lead ML Engineer Match',
      body: 'New match role posted.',
      metadata: null,
      readAt: null,
      createdAt: '2026-09-18T00:00:00Z',
    };

    mockUseNotificationsInfinite.mockImplementation(() =>
      createMockInfiniteQueryResult(
        [newNotification, ...sampleNotifications],
        false
      ) as unknown as ReturnType<typeof useNotificationsInfinite>
    );

    rerender(<NotificationDropdownPanel />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'New notification: Lead ML Engineer Match'
    );
  });

  it('does not falsely announce existing notifications when switching tabs', async () => {
    const userInteraction = userEvent.setup();
    render(<NotificationDropdownPanel />);

    const liveStatusElement = screen.getByRole('status');
    expect(liveStatusElement).toHaveTextContent('');

    const unreadTab = screen.getByRole('tab', { name: /^Unread/i });
    await userInteraction.click(unreadTab);

    expect(screen.getByRole('status')).toHaveTextContent('');
  });
});

