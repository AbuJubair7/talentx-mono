import React from "react";
import { render as rtlRender, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { UserRole } from "@/types/auth";
import {
  PORTAL_SIDEBAR_COLLAPSED_COOKIE,
  PORTAL_SIDEBAR_COLLAPSED_STORAGE_KEY,
} from "../constants/sidebar.constants";
import { AppShell } from "../app-shell";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: () => null,
  }),
}));

jest.mock("@/modules/talent-profile/hooks/useTalentProfile", () => ({
  useTalentProfile: jest.fn(() => ({ data: undefined })),
}));

jest.mock("@/modules/jobposting/hooks/useCurrentEmployer", () => ({
  useCurrentEmployer: jest.fn(() => ({ data: undefined })),
}));


jest.mock("@/modules/notifications/hooks", () => ({
  ...jest.requireActual("@/modules/notifications/hooks"),
  useUnreadNotificationCount: jest.fn(() => ({ data: 0 })),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;


import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const customRender = (ui: any, options = {}) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return rtlRender(ui, { wrapper: ({ children }: any) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>, ...options });
};

describe("AppShell Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    document.cookie = "";
    mockUsePathname.mockReturnValue("/dashboard");
  });

  it("renders main content children and desktop sidebar", () => {
    customRender(
      <AppShell role={UserRole.Talent}>
        <div data-testid="test-content">Dashboard Main Content</div>
      </AppShell>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
    const portalTitles = screen.getAllByText("Talent Portal");
    expect(portalTitles.length).toBeGreaterThanOrEqual(1);
  });

  it("opens and closes mobile drawer on hamburger click and close button", async () => {
    const user = userEvent.setup();

    customRender(
      <AppShell role={UserRole.Talent}>
        <div>Child Content</div>
      </AppShell>
    );

    const openMenuButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    expect(openMenuButton).toBeInTheDocument();

    await user.click(openMenuButton);

    const mobileDialog = screen.getByRole("dialog", {
      name: /mobile navigation menu/i,
    });
    expect(mobileDialog).toBeInTheDocument();

    const closeMenuButton = screen.getByRole("button", {
      name: /close navigation menu/i,
    });
    await user.click(closeMenuButton);

    expect(
      screen.queryByRole("dialog", { name: /mobile navigation menu/i })
    ).not.toBeInTheDocument();
  });

  it("closes mobile drawer on Escape key press", async () => {
    const user = userEvent.setup();

    customRender(
      <AppShell role={UserRole.Talent}>
        <div>Child Content</div>
      </AppShell>
    );

    const openMenuButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    await user.click(openMenuButton);

    expect(
      screen.getByRole("dialog", { name: /mobile navigation menu/i })
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("dialog", { name: /mobile navigation menu/i })
    ).not.toBeInTheDocument();
  });

  it("renders portal subtitle only once in mobile drawer without duplicate header and closes on navigation", async () => {
    const user = userEvent.setup();

    customRender(
      <AppShell role={UserRole.Employer}>
        <div>Child Content</div>
      </AppShell>
    );

    const openMenuButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    await user.click(openMenuButton);

    const mobileDialog = screen.getByRole("dialog", {
      name: /mobile navigation menu/i,
    });
    expect(mobileDialog).toBeInTheDocument();

    const portalSubtitlesInDialog = mobileDialog.querySelectorAll("span");
    const matchingSubtitles = Array.from(portalSubtitlesInDialog).filter(
      (element) => element.textContent === "Employer Portal"
    );
    expect(matchingSubtitles.length).toBe(1);

    const dashboardLinks = screen.getAllByRole("link", { name: /dashboard/i });
    const mobileDashboardLink = dashboardLinks[dashboardLinks.length - 1];
    await user.click(mobileDashboardLink);

    expect(
      screen.queryByRole("dialog", { name: /mobile navigation menu/i })
    ).not.toBeInTheDocument();
  });

  it("renders Admin Portal subtitle in mobile navigation drawer and top header when role=UserRole.Admin", async () => {
    const user = userEvent.setup();

    customRender(
      <AppShell role={UserRole.Admin}>
        <div>Admin Child Content</div>
      </AppShell>
    );

    const openMenuButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    await user.click(openMenuButton);

    const mobileDialog = screen.getByRole("dialog", {
      name: /mobile navigation menu/i,
    });
    expect(mobileDialog).toBeInTheDocument();

    const portalSubtitlesInDialog = mobileDialog.querySelectorAll("span");
    const matchingSubtitles = Array.from(portalSubtitlesInDialog).filter(
      (element) => element.textContent === "Admin Portal"
    );
    expect(matchingSubtitles.length).toBe(1);
  });

  it("renders desktop top navbar displaying the current page breadcrumb", () => {
    mockUsePathname.mockReturnValue("/job/job-listing");

    customRender(
      <AppShell role={UserRole.Employer}>
        <div>Child Content</div>
      </AppShell>
    );

    const topNavRegion = screen.getByRole("region", {
      name: "Portal Navigation",
    });
    expect(topNavRegion).toBeInTheDocument();

    const breadcrumbNav = screen.getByRole("navigation", {
      name: "Breadcrumb",
    });
    expect(breadcrumbNav).toBeInTheDocument();

    const breadcrumbItem = within(breadcrumbNav).getByText("My Jobs");
    expect(breadcrumbItem).toBeInTheDocument();
    expect(breadcrumbItem).toHaveAttribute("aria-current", "page");
  });

  it("renders notification bell dropdown in desktop top navbar and mobile header when role is Talent", () => {
    customRender(
      <AppShell role={UserRole.Talent}>
        <div>Child Content</div>
      </AppShell>
    );

    const bellTriggers = screen.getAllByTestId("notification-bell-trigger");
    expect(bellTriggers).toHaveLength(2);

    const topNavRegion = screen.getByRole("region", {
      name: "Portal Navigation",
    });
    const desktopBell = within(topNavRegion).getByTestId(
      "notification-bell-trigger"
    );
    expect(desktopBell).toBeInTheDocument();
    expect(desktopBell).toHaveAttribute("aria-label", "Notifications");

    const openMenuButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    const mobileHeader = openMenuButton.closest("header");
    expect(mobileHeader).not.toBeNull();
    const mobileBell = within(mobileHeader!).getByTestId(
      "notification-bell-trigger"
    );
    expect(mobileBell).toBeInTheDocument();
    expect(mobileBell).toHaveAttribute("aria-label", "Notifications");
  });

  it("renders notification bell dropdown in desktop top navbar and mobile header when role is Employer", () => {
    customRender(
      <AppShell role={UserRole.Employer}>
        <div>Child Content</div>
      </AppShell>
    );

    const bellTriggers = screen.getAllByTestId("notification-bell-trigger");
    expect(bellTriggers).toHaveLength(2);
  });

  it("renders notification bell dropdown in desktop top navbar and mobile header when role is Admin", () => {
    customRender(
      <AppShell role={UserRole.Admin}>
        <div>Child Content</div>
      </AppShell>
    );

    const bellTriggers = screen.getAllByTestId("notification-bell-trigger");
    expect(bellTriggers).toHaveLength(2);
  });

  it("renders sidebar in collapsed state on initial render when initialCollapsed is true", () => {
    customRender(
      <AppShell role={UserRole.Talent} initialCollapsed={true}>
        <div>Child Content</div>
      </AppShell>
    );

    const desktopSidebar = screen.getByRole("complementary", {
      name: "Sidebar",
    });
    expect(desktopSidebar).toHaveClass("w-20");
    expect(
      within(desktopSidebar).getByTestId("sidebar-monogram")
    ).toBeInTheDocument();
    expect(
      within(desktopSidebar).queryByRole("img", { name: "TalentX" })
    ).not.toBeInTheDocument();
  });

  it("updates localStorage and document.cookie when sidebar collapse is toggled", async () => {
    const user = userEvent.setup();

    customRender(
      <AppShell role={UserRole.Talent} initialCollapsed={false}>
        <div>Child Content</div>
      </AppShell>
    );

    const collapseButton = screen.getByRole("button", {
      name: /close sidebar/i,
    });
    await user.click(collapseButton);

    expect(
      localStorage.getItem(PORTAL_SIDEBAR_COLLAPSED_STORAGE_KEY)
    ).toBe("true");
    expect(document.cookie).toContain(
      `${PORTAL_SIDEBAR_COLLAPSED_COOKIE}=true`
    );

    const expandButton = screen.getByRole("button", {
      name: /open sidebar/i,
    });
    await user.click(expandButton);

    expect(
      localStorage.getItem(PORTAL_SIDEBAR_COLLAPSED_STORAGE_KEY)
    ).toBe("false");
    expect(document.cookie).toContain(
      `${PORTAL_SIDEBAR_COLLAPSED_COOKIE}=false`
    );
  });

  it("synchronizes collapsed state from localStorage when initialCollapsed differs from stored preference", async () => {
    localStorage.setItem(PORTAL_SIDEBAR_COLLAPSED_STORAGE_KEY, "true");

    customRender(
      <AppShell role={UserRole.Talent} initialCollapsed={false}>
        <div>Child Content</div>
      </AppShell>
    );

    const desktopSidebar = screen.getByRole("complementary", {
      name: "Sidebar",
    });

    await waitFor(() => {
      expect(desktopSidebar).toHaveClass("w-20");
    });
    expect(document.cookie).toContain(
      `${PORTAL_SIDEBAR_COLLAPSED_COOKIE}=true`
    );
  });
});
