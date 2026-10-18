import React from "react";
import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationBellDropdown } from "../NotificationBellDropdown";
import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper";
import { useNotificationsRealtime, useUnreadNotificationCount } from "../../hooks";

jest.mock("../../hooks", () => ({
  ...jest.requireActual("../../hooks"),
  useNotificationsRealtime: jest.fn(),
  useUnreadNotificationCount: jest.fn(),
}));

jest.mock("../NotificationDropdownPanel", () => ({
  NotificationDropdownPanel: () => (
    <div data-testid="notification-dropdown-panel-content">
      <h2>Notifications</h2>
    </div>
  ),
}));

const mockUseUnreadNotificationCount =
  useUnreadNotificationCount as jest.MockedFunction<
    typeof useUnreadNotificationCount
  >;

describe("NotificationBellDropdown", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockUseUnreadNotificationCount.mockReturnValue({
      data: 0,
    } as ReturnType<typeof useUnreadNotificationCount>);
  });

  it("renders unread badge with exact count when unreadCount is greater than 0", () => {
    mockUseUnreadNotificationCount.mockReturnValue({
      data: 3,
    } as ReturnType<typeof useUnreadNotificationCount>);

    const QueryWrapper = createQueryWrapper();
    render(
      <QueryWrapper>
        <NotificationBellDropdown />
      </QueryWrapper>
    );

    const unreadBadgeElement = screen.getByTestId("notification-unread-badge");
    expect(unreadBadgeElement).toBeInTheDocument();
    expect(unreadBadgeElement).toHaveTextContent("3");
    expect(unreadBadgeElement).toHaveAttribute("aria-hidden", "true");
    expect(unreadBadgeElement).toHaveClass("bg-red-600", "text-white");
  });

  it("renders 99+ badge when unreadCount exceeds 99", () => {
    mockUseUnreadNotificationCount.mockReturnValue({
      data: 150,
    } as ReturnType<typeof useUnreadNotificationCount>);

    const QueryWrapper = createQueryWrapper();
    render(
      <QueryWrapper>
        <NotificationBellDropdown />
      </QueryWrapper>
    );

    const unreadBadgeElement = screen.getByTestId("notification-unread-badge");
    expect(unreadBadgeElement).toBeInTheDocument();
    expect(unreadBadgeElement).toHaveTextContent("99+");
    expect(unreadBadgeElement).toHaveAttribute("aria-hidden", "true");
    expect(unreadBadgeElement).toHaveClass("bg-red-600", "text-white");
  });

  it("does not render unread badge when unreadCount is 0", () => {
    mockUseUnreadNotificationCount.mockReturnValue({
      data: 0,
    } as ReturnType<typeof useUnreadNotificationCount>);

    const QueryWrapper = createQueryWrapper();
    render(
      <QueryWrapper>
        <NotificationBellDropdown />
      </QueryWrapper>
    );

    expect(
      screen.queryByTestId("notification-unread-badge")
    ).not.toBeInTheDocument();
  });

  it("does not render unread badge when unreadCount is undefined", () => {
    mockUseUnreadNotificationCount.mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useUnreadNotificationCount>);

    const QueryWrapper = createQueryWrapper();
    render(
      <QueryWrapper>
        <NotificationBellDropdown />
      </QueryWrapper>
    );

    expect(
      screen.queryByTestId("notification-unread-badge")
    ).not.toBeInTheDocument();
  });

  it("does not render unread badge when unreadCount is NaN or negative", () => {
    mockUseUnreadNotificationCount.mockReturnValue({
      data: NaN,
    } as ReturnType<typeof useUnreadNotificationCount>);

    const QueryWrapper = createQueryWrapper();
    const { rerender } = render(
      <QueryWrapper>
        <NotificationBellDropdown />
      </QueryWrapper>
    );

    expect(
      screen.queryByTestId("notification-unread-badge")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("notification-bell-trigger")).toHaveAttribute(
      "aria-label",
      "Notifications"
    );

    mockUseUnreadNotificationCount.mockReturnValue({
      data: -5,
    } as ReturnType<typeof useUnreadNotificationCount>);

    rerender(
      <QueryWrapper>
        <NotificationBellDropdown />
      </QueryWrapper>
    );

    expect(
      screen.queryByTestId("notification-unread-badge")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("notification-bell-trigger")).toHaveAttribute(
      "aria-label",
      "Notifications"
    );
  });

  it("handles float unreadCount by normalizing to floor integer", () => {
    mockUseUnreadNotificationCount.mockReturnValue({
      data: 4.8,
    } as ReturnType<typeof useUnreadNotificationCount>);

    const QueryWrapper = createQueryWrapper();
    render(
      <QueryWrapper>
        <NotificationBellDropdown />
      </QueryWrapper>
    );

    const unreadBadgeElement = screen.getByTestId("notification-unread-badge");
    expect(unreadBadgeElement).toHaveTextContent("4");
    expect(screen.getByTestId("notification-bell-trigger")).toHaveAttribute(
      "aria-label",
      "Notifications (4 unread)"
    );
  });

  it("sets dynamic aria-label on trigger button when unreadCount is 5", () => {
    mockUseUnreadNotificationCount.mockReturnValue({
      data: 5,
    } as ReturnType<typeof useUnreadNotificationCount>);

    const QueryWrapper = createQueryWrapper();
    render(
      <QueryWrapper>
        <NotificationBellDropdown />
      </QueryWrapper>
    );

    const triggerButton = screen.getByTestId("notification-bell-trigger");
    expect(triggerButton).toHaveAttribute("aria-label", "Notifications (5 unread)");
  });

  it("sets dynamic aria-label on trigger button when unreadCount is 120", () => {
    mockUseUnreadNotificationCount.mockReturnValue({
      data: 120,
    } as ReturnType<typeof useUnreadNotificationCount>);

    const QueryWrapper = createQueryWrapper();
    render(
      <QueryWrapper>
        <NotificationBellDropdown />
      </QueryWrapper>
    );

    const triggerButton = screen.getByTestId("notification-bell-trigger");
    expect(triggerButton).toHaveAttribute("aria-label", "Notifications (99+ unread)");
  });

  it("sets default aria-label on trigger button when unreadCount is 0 or undefined", () => {
    mockUseUnreadNotificationCount.mockReturnValue({
      data: 0,
    } as ReturnType<typeof useUnreadNotificationCount>);

    const QueryWrapper = createQueryWrapper();
    const { rerender } = render(
      <QueryWrapper>
        <NotificationBellDropdown />
      </QueryWrapper>
    );

    const triggerButton = screen.getByTestId("notification-bell-trigger");
    expect(triggerButton).toHaveAttribute("aria-label", "Notifications");

    mockUseUnreadNotificationCount.mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useUnreadNotificationCount>);

    rerender(
      <QueryWrapper>
        <NotificationBellDropdown />
      </QueryWrapper>
    );

    expect(triggerButton).toHaveAttribute("aria-label", "Notifications");
  });

  it("has accessible button trigger with correct attributes and focus ring", () => {
    const QueryWrapper = createQueryWrapper();
    render(
      <QueryWrapper>
        <NotificationBellDropdown />
      </QueryWrapper>
    );

    const triggerButton = screen.getByTestId("notification-bell-trigger");
    expect(triggerButton).toHaveAttribute("type", "button");
    expect(triggerButton).toHaveAttribute("aria-label", "Notifications");
    expect(triggerButton).toHaveAttribute("aria-haspopup", "dialog");
    expect(triggerButton).toHaveAttribute("aria-expanded", "false");
    expect(triggerButton).toHaveClass(
      "focus-visible:outline-none",
      "focus-visible:ring-2",
      "focus-visible:ring-slate-900",
      "focus-visible:ring-offset-2"
    );
  });

  it("toggles panel open and closed when clicking the trigger", async () => {
    const userInteraction = userEvent.setup();
    const QueryWrapper = createQueryWrapper();

    render(
      <QueryWrapper>
        <NotificationBellDropdown />
      </QueryWrapper>
    );

    const triggerButton = screen.getByTestId("notification-bell-trigger");
    expect(
      screen.queryByTestId("notification-dropdown-panel")
    ).not.toBeInTheDocument();
    expect(triggerButton).toHaveAttribute("aria-expanded", "false");

    await userInteraction.click(triggerButton);

    const dropdownPanel = screen.getByTestId("notification-dropdown-panel");
    expect(dropdownPanel).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(triggerButton).toHaveAttribute("aria-expanded", "true");

    await userInteraction.click(triggerButton);

    expect(
      screen.queryByTestId("notification-dropdown-panel")
    ).not.toBeInTheDocument();
    expect(triggerButton).toHaveAttribute("aria-expanded", "false");
  });

  it("unmounts panel from DOM completely when closed", async () => {
    const userInteraction = userEvent.setup();
    const QueryWrapper = createQueryWrapper();

    render(
      <QueryWrapper>
        <NotificationBellDropdown defaultOpen={false} />
      </QueryWrapper>
    );

    expect(
      screen.queryByTestId("notification-dropdown-panel")
    ).toBeNull();

    const triggerButton = screen.getByTestId("notification-bell-trigger");
    await userInteraction.click(triggerButton);

    expect(
      screen.getByTestId("notification-dropdown-panel")
    ).toBeInTheDocument();

    await userInteraction.click(triggerButton);

    expect(
      screen.queryByTestId("notification-dropdown-panel")
    ).toBeNull();
  });

  it("closes panel when clicking outside the dropdown component", async () => {
    const userInteraction = userEvent.setup();
    const QueryWrapper = createQueryWrapper();

    render(
      <QueryWrapper>
        <div>
          <button type="button" data-testid="outside-button">
            Outside Target
          </button>
          <NotificationBellDropdown defaultOpen={true} />
        </div>
      </QueryWrapper>
    );

    expect(
      screen.getByTestId("notification-dropdown-panel")
    ).toBeInTheDocument();

    const outsideButton = screen.getByTestId("outside-button");
    await userInteraction.click(outsideButton);

    expect(
      screen.queryByTestId("notification-dropdown-panel")
    ).not.toBeInTheDocument();
  });

  it("closes panel and focuses trigger button when Escape key is pressed", async () => {
    const userInteraction = userEvent.setup();
    const QueryWrapper = createQueryWrapper();

    render(
      <QueryWrapper>
        <NotificationBellDropdown defaultOpen={true} />
      </QueryWrapper>
    );

    const triggerButton = screen.getByTestId("notification-bell-trigger");
    expect(
      screen.getByTestId("notification-dropdown-panel")
    ).toBeInTheDocument();

    await userInteraction.keyboard("{Escape}");

    expect(
      screen.queryByTestId("notification-dropdown-panel")
    ).not.toBeInTheDocument();
    expect(triggerButton).toHaveFocus();
  });

  it("positions panel aligned to right by default and left when specified", () => {
    const QueryWrapper = createQueryWrapper();

    const { rerender } = render(
      <QueryWrapper>
        <NotificationBellDropdown defaultOpen={true} />
      </QueryWrapper>
    );

    const defaultPanel = screen.getByTestId("notification-dropdown-panel");
    expect(defaultPanel).toHaveClass("right-0");
    expect(defaultPanel).not.toHaveClass("left-0");

    rerender(
      <QueryWrapper>
        <NotificationBellDropdown defaultOpen={true} align="left" />
      </QueryWrapper>
    );

    const leftPanel = screen.getByTestId("notification-dropdown-panel");
    expect(leftPanel).toHaveClass("left-0");
    expect(leftPanel).not.toHaveClass("right-0");
  });

  it("applies overscroll-contain and isolates scroll wheel events on dropdown panel container", () => {
    const QueryWrapper = createQueryWrapper();

    render(
      <QueryWrapper>
        <NotificationBellDropdown defaultOpen={true} />
      </QueryWrapper>
    );

    const dropdownPanel = screen.getByTestId("notification-dropdown-panel");
    expect(dropdownPanel).toHaveClass("overscroll-contain");

    const wheelEvent = createEvent.wheel(dropdownPanel, { deltaY: 100 });
    const stopPropagationSpy = jest.spyOn(wheelEvent, "stopPropagation");
    fireEvent(dropdownPanel, wheelEvent);
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it("calls useNotificationsRealtime with enabled true when queryClient is available", () => {
    const QueryWrapper = createQueryWrapper();

    render(
      <QueryWrapper>
        <NotificationBellDropdown />
      </QueryWrapper>
    );

    expect(useNotificationsRealtime).toHaveBeenCalledWith({ enabled: true });
  });

  it("hides badge when opening dropdown and keeps it hidden when closing if unread count is unchanged", async () => {
    const userInteraction = userEvent.setup();
    mockUseUnreadNotificationCount.mockReturnValue({
      data: 3,
    } as ReturnType<typeof useUnreadNotificationCount>);

    const QueryWrapper = createQueryWrapper();
    render(
      <QueryWrapper>
        <NotificationBellDropdown />
      </QueryWrapper>
    );

    const triggerButton = screen.getByTestId("notification-bell-trigger");
    expect(screen.getByTestId("notification-unread-badge")).toBeInTheDocument();

    await userInteraction.click(triggerButton);

    expect(screen.getByTestId("notification-dropdown-panel")).toBeInTheDocument();
    expect(
      screen.queryByTestId("notification-unread-badge")
    ).not.toBeInTheDocument();

    await userInteraction.click(triggerButton);

    expect(
      screen.queryByTestId("notification-dropdown-panel")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("notification-unread-badge")
    ).not.toBeInTheDocument();
  });

  it("reappears when a new notification arrives after having opened the dropdown", async () => {
    const userInteraction = userEvent.setup();
    mockUseUnreadNotificationCount.mockReturnValue({
      data: 3,
    } as ReturnType<typeof useUnreadNotificationCount>);

    const QueryWrapper = createQueryWrapper();
    const { rerender } = render(
      <QueryWrapper>
        <NotificationBellDropdown />
      </QueryWrapper>
    );

    const triggerButton = screen.getByTestId("notification-bell-trigger");
    expect(screen.getByTestId("notification-unread-badge")).toHaveTextContent("3");

    await userInteraction.click(triggerButton);
    expect(
      screen.queryByTestId("notification-unread-badge")
    ).not.toBeInTheDocument();

    await userInteraction.click(triggerButton);
    expect(
      screen.queryByTestId("notification-unread-badge")
    ).not.toBeInTheDocument();

    mockUseUnreadNotificationCount.mockReturnValue({
      data: 4,
    } as ReturnType<typeof useUnreadNotificationCount>);

    rerender(
      <QueryWrapper>
        <NotificationBellDropdown />
      </QueryWrapper>
    );

    const updatedBadgeElement = screen.getByTestId("notification-unread-badge");
    expect(updatedBadgeElement).toBeInTheDocument();
    expect(updatedBadgeElement).toHaveTextContent("4");
    expect(updatedBadgeElement).toHaveClass("bg-red-600", "text-white");
  });

  it("does not display unread badge when defaultOpen is true and remains hidden after closing", async () => {
    const userInteraction = userEvent.setup();
    mockUseUnreadNotificationCount.mockReturnValue({
      data: 5,
    } as ReturnType<typeof useUnreadNotificationCount>);

    const QueryWrapper = createQueryWrapper();
    render(
      <QueryWrapper>
        <NotificationBellDropdown defaultOpen={true} />
      </QueryWrapper>
    );

    expect(screen.getByTestId("notification-dropdown-panel")).toBeInTheDocument();
    expect(
      screen.queryByTestId("notification-unread-badge")
    ).not.toBeInTheDocument();

    const triggerButton = screen.getByTestId("notification-bell-trigger");
    await userInteraction.click(triggerButton);

    expect(
      screen.queryByTestId("notification-dropdown-panel")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("notification-unread-badge")
    ).not.toBeInTheDocument();
  });

  it("synchronizes seen count when unread count decreases below seen count", () => {
    mockUseUnreadNotificationCount.mockReturnValue({
      data: 5,
    } as ReturnType<typeof useUnreadNotificationCount>);

    const QueryWrapper = createQueryWrapper();
    const { rerender } = render(
      <QueryWrapper>
        <NotificationBellDropdown defaultOpen={true} />
      </QueryWrapper>
    );

    expect(
      screen.queryByTestId("notification-unread-badge")
    ).not.toBeInTheDocument();

    mockUseUnreadNotificationCount.mockReturnValue({
      data: 2,
    } as ReturnType<typeof useUnreadNotificationCount>);

    rerender(
      <QueryWrapper>
        <NotificationBellDropdown defaultOpen={false} />
      </QueryWrapper>
    );

    expect(
      screen.queryByTestId("notification-unread-badge")
    ).not.toBeInTheDocument();
  });

  it("restores dismissed state from localStorage and badge stays hidden even when unreadCount loads as undefined before resolving", async () => {
    const userInteraction = userEvent.setup();
    mockUseUnreadNotificationCount.mockReturnValue({
      data: 5,
    } as ReturnType<typeof useUnreadNotificationCount>);

    const QueryWrapper = createQueryWrapper();
    const { unmount } = render(
      <QueryWrapper>
        <NotificationBellDropdown />
      </QueryWrapper>
    );

    expect(screen.getByTestId("notification-unread-badge")).toBeInTheDocument();

    await userInteraction.click(screen.getByTestId("notification-bell-trigger"));
    expect(screen.queryByTestId("notification-unread-badge")).not.toBeInTheDocument();

    await userInteraction.click(screen.getByTestId("notification-bell-trigger"));
    expect(screen.queryByTestId("notification-unread-badge")).not.toBeInTheDocument();

    unmount();

    mockUseUnreadNotificationCount.mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useUnreadNotificationCount>);

    const RefreshQueryWrapper = createQueryWrapper();
    const { rerender } = render(
      <RefreshQueryWrapper>
        <NotificationBellDropdown />
      </RefreshQueryWrapper>
    );

    expect(screen.queryByTestId("notification-unread-badge")).not.toBeInTheDocument();

    mockUseUnreadNotificationCount.mockReturnValue({
      data: 5,
    } as ReturnType<typeof useUnreadNotificationCount>);

    rerender(
      <RefreshQueryWrapper>
        <NotificationBellDropdown />
      </RefreshQueryWrapper>
    );

    expect(screen.queryByTestId("notification-unread-badge")).not.toBeInTheDocument();
  });
});
