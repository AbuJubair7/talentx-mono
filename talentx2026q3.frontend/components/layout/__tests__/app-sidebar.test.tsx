import React from "react";
import {   render as rtlRender , screen, within  } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { CircleDot } from "lucide-react";
import { UserRole } from "@/types/auth";
import {
  AppSidebar,
  extractInitials,
  TALENT_NAVIGATION_ITEMS,
  EMPLOYER_NAVIGATION_ITEMS,
  ADMIN_NAVIGATION_ITEMS,
} from "../app-sidebar";
import type { SidebarNavItem, SidebarUser } from "../types";

import { useTalentProfile } from "@/modules/talent-profile/hooks/useTalentProfile";

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


const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseTalentProfile = useTalentProfile as jest.MockedFunction<typeof useTalentProfile>;


import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const customRender = (ui: any, options = {}) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return rtlRender(ui, { wrapper: ({ children }: any) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>, ...options });
};

describe("extractInitials", () => {
  it("extracts initials from multi-word names", () => {
    expect(extractInitials("Jane Doe")).toBe("JD");
    expect(extractInitials("John Michael Smith")).toBe("JS");
  });

  it("extracts two characters from single-word names", () => {
    expect(extractInitials("Talent")).toBe("TA");
    expect(extractInitials("Administrator")).toBe("AD");
  });

  it("handles single-character names", () => {
    expect(extractInitials("A")).toBe("A");
  });

  it("handles null, undefined, or empty names with default fallback", () => {
    expect(extractInitials(null)).toBe("TX");
    expect(extractInitials(undefined)).toBe("TX");
    expect(extractInitials("")).toBe("TX");
    expect(extractInitials("   ")).toBe("TX");
  });
});

describe("AppSidebar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/dashboard");
  });

  describe("Role-based Navigation Items", () => {
    it("renders Talent navigation items by default when role is omitted", () => {
      customRender(<AppSidebar />);

      expect(screen.getByText("Talent Portal")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Jobs")).toBeInTheDocument();
      expect(screen.getByText("Job Alerts")).toBeInTheDocument();
      expect(screen.getByText("Interviews")).toBeInTheDocument();
      expect(screen.getByText("My Profile")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();

      const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
      expect(dashboardLink).toHaveAttribute("href", "/dashboard");

      const jobsLink = screen.getByRole("link", { name: /^jobs$/i });
      expect(jobsLink).toHaveAttribute("href", "/jobs");

      const jobAlertsLink = screen.getByRole("link", { name: /job alerts/i });
      expect(jobAlertsLink).toHaveAttribute("href", "/job-alerts");

      const interviewsLink = screen.getByRole("link", { name: /interviews/i });
      expect(interviewsLink).toHaveAttribute("href", "/interviews");
    });

    it("renders Talent navigation items explicitly when role=UserRole.Talent", () => {
      customRender(<AppSidebar role={UserRole.Talent} />);

      expect(screen.getByText("Talent Portal")).toBeInTheDocument();
      for (const item of TALENT_NAVIGATION_ITEMS) {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      }
    });

    it("renders Employer navigation items when role=UserRole.Employer", () => {
      mockUsePathname.mockReturnValue("/dashboard");
      customRender(<AppSidebar role={UserRole.Employer} />);

      expect(screen.getByText("Employer Portal")).toBeInTheDocument();
      for (const item of EMPLOYER_NAVIGATION_ITEMS) {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      }

      const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
      expect(dashboardLink).toHaveAttribute("href", "/dashboard");

      const postJobLink = screen.getByRole("link", { name: /post a job/i });
      expect(postJobLink).toHaveAttribute("href", "/job/jobpost");

      const myJobsLink = screen.getByRole("link", { name: /my jobs/i });
      expect(myJobsLink).toHaveAttribute("href", "/job/job-listing");

      expect(
        screen.queryByRole("link", {
          name: /^profile$/i,
        })
      ).not.toBeInTheDocument();

      const settingsLink = screen.getByRole("link", { name: /settings/i });
      expect(settingsLink).toHaveAttribute("href", "/settings");
    });

    it("renders Admin navigation items when role=UserRole.Admin", () => {
      mockUsePathname.mockReturnValue("/admin/dashboard");
      customRender(<AppSidebar role={UserRole.Admin} />);

      expect(screen.getByText("Admin Portal")).toBeInTheDocument();
      for (const item of ADMIN_NAVIGATION_ITEMS) {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      }

      const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
      expect(dashboardLink).toHaveAttribute("href", "/admin/dashboard");

      const userManagementLink = screen.getByRole("link", { name: /user management/i });
      expect(userManagementLink).toHaveAttribute("href", "/admin/users");

      const employerVerificationLink = screen.getByRole("link", { name: /employer verification/i });
      expect(employerVerificationLink).toHaveAttribute("href", "/admin/employers");

      const jobModerationLink = screen.getByRole("link", { name: /job moderation/i });
      expect(jobModerationLink).toHaveAttribute("href", "/admin/jobs");

      const reviewModerationLink = screen.getByRole("link", { name: /company review/i });
      expect(reviewModerationLink).toHaveAttribute("href", "/admin/reviews");

      const auditLogLink = screen.getByRole("link", { name: /audit log/i });
      expect(auditLogLink).toHaveAttribute("href", "/admin/audit-log");

      const settingsLink = screen.getByRole("link", { name: /^settings$/i });
      expect(settingsLink).toHaveAttribute("href", "/admin/settings");
    });

    it("renders Admin navigation items when role='admin'", () => {
      mockUsePathname.mockReturnValue("/admin/dashboard");
      customRender(<AppSidebar role="admin" />);

      expect(screen.getByText("Admin Portal")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("User Management")).toBeInTheDocument();
      expect(screen.getByText("Employer Verification")).toBeInTheDocument();
      expect(screen.getByText("Audit Log")).toBeInTheDocument();
    });
  });

  describe("Custom Navigation Items", () => {
    it("renders custom navigation items overriding defaults when provided", () => {
      const customItems: SidebarNavItem[] = [
        {
          label: "Custom Analytics",
          href: "/custom/analytics",
          icon: CircleDot,
          badge: 5,
        },
        {
          label: "Custom Reports",
          href: "/custom/reports",
          icon: CircleDot,
        },
      ];

      customRender(<AppSidebar customNavItems={customItems} />);

      expect(screen.getByText("Custom Analytics")).toBeInTheDocument();
      expect(screen.getByText("Custom Reports")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    });
  });

  describe("Expanding and Collapsing Width Toggle", () => {
    it("renders in expanded state with w-60, logo, and collapse button", async () => {
      const user = userEvent.setup();
      const mockToggleCollapse = jest.fn();

      customRender(
        <AppSidebar
          isCollapsed={false}
          onToggleCollapse={mockToggleCollapse}
        />
      );

      const sidebarElement = screen.getByRole("complementary");
      expect(sidebarElement).toHaveClass("w-60");
      expect(sidebarElement).not.toHaveClass("w-20");

      const logoImage = screen.getByRole("img", { name: "TalentX" });
      expect(logoImage).toBeInTheDocument();
      expect(logoImage.closest(".border-b")).toHaveClass("px-4", "h-16");

      const collapseButton = screen.getByRole("button", {
        name: /close sidebar/i,
      });
      expect(collapseButton).toBeInTheDocument();
      expect(collapseButton).toHaveAttribute("title", "Collapse sidebar");
      expect(collapseButton.querySelector("svg")).toBeInTheDocument();
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

      await user.click(collapseButton);
      expect(mockToggleCollapse).toHaveBeenCalledTimes(1);
    });

    it("renders in collapsed state with w-20, TalentX Icon button and expand toggle icon", async () => {
      const user = userEvent.setup();
      const mockToggleCollapse = jest.fn();

      customRender(
        <AppSidebar
          isCollapsed={true}
          onToggleCollapse={mockToggleCollapse}
        />
      );

      const sidebarElement = screen.getByRole("complementary");
      expect(sidebarElement).toHaveClass("w-20");

      const brandIcon = screen.getByRole("img", { name: "TalentX Icon" });
      expect(brandIcon).toBeInTheDocument();

      expect(screen.queryByRole("img", { name: "TalentX" })).not.toBeInTheDocument();

      const openButton = screen.getByRole("button", {
        name: /open sidebar/i,
      });
      expect(openButton).toBeInTheDocument();
      expect(openButton.querySelector("svg")).toBeInTheDocument();
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

      await user.click(openButton);
      expect(mockToggleCollapse).toHaveBeenCalledTimes(1);
    });

    it("configures hover cursor-pointer and navbar-wide toggle indicator for collapsed state", async () => {
      const user = userEvent.setup();
      const mockToggleCollapse = jest.fn();

      customRender(
        <AppSidebar
          isCollapsed={true}
          onToggleCollapse={mockToggleCollapse}
        />
      );

      const sidebarElement = screen.getByRole("complementary");
      expect(sidebarElement).toHaveClass("cursor-pointer", "group/sidebar");

      const brandIcon = screen.getByRole("img", { name: "TalentX Icon" });
      expect(brandIcon).toHaveClass("group-hover/sidebar:hidden");

      const openButton = screen.getByRole("button", {
        name: /open sidebar/i,
      });
      expect(openButton).toHaveClass("group/monogram");
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

      await user.click(sidebarElement);
      expect(mockToggleCollapse).toHaveBeenCalledTimes(1);
    });
  });

  describe("Route Matching and Active Styles", () => {
    it("applies active styles and aria-current to active route in expanded mode", () => {
      mockUsePathname.mockReturnValue("/dashboard");

      customRender(<AppSidebar role={UserRole.Talent} />);

      const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
      expect(dashboardLink).toHaveAttribute("aria-current", "page");
      expect(dashboardLink).toHaveClass("text-white", "font-semibold");
      expect(within(dashboardLink).getByTestId("sidebar-active-indicator")).toHaveClass("bg-slate-950");

      const dashboardIcon = dashboardLink.querySelector("svg");
      expect(dashboardIcon).toHaveClass("text-emerald-500");

      const settingsLink = screen.getByRole("link", { name: /settings/i });
      expect(settingsLink).not.toHaveAttribute("aria-current");
      expect(settingsLink).toHaveClass("text-slate-600");

      const settingsIcon = settingsLink.querySelector("svg");
      expect(settingsIcon).toHaveClass("text-slate-400");
    });

    it("applies active styles and aria-current to active route in collapsed mode", () => {
      mockUsePathname.mockReturnValue("/dashboard");

      customRender(<AppSidebar isCollapsed={true} role={UserRole.Talent} />);

      const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
      expect(dashboardLink).toHaveAttribute("aria-current", "page");
      expect(dashboardLink).toHaveClass("text-white");
      expect(within(dashboardLink).getByTestId("sidebar-active-indicator")).toHaveClass("bg-slate-950");

      const dashboardIcon = dashboardLink.querySelector("svg");
      expect(dashboardIcon).toHaveClass("text-emerald-500");

      const settingsLink = screen.getByRole("link", { name: /settings/i });
      expect(settingsLink).not.toHaveAttribute("aria-current");
      expect(settingsLink).toHaveClass("text-slate-600");

      const settingsIcon = settingsLink.querySelector("svg");
      expect(settingsIcon).toHaveClass("text-slate-400");
    });

    it("applies active and inactive badge styles appropriately", () => {
      const customItems: SidebarNavItem[] = [
        {
          label: "Custom Analytics",
          href: "/custom/analytics",
          icon: CircleDot,
          badge: 5,
        },
      ];

      mockUsePathname.mockReturnValue("/custom/analytics");
      const { rerender } = customRender(<AppSidebar customNavItems={customItems} />);

      const activeBadge = screen.getByText("5");
      expect(activeBadge).toHaveClass("bg-emerald-500", "text-white");

      mockUsePathname.mockReturnValue("/dashboard");
      rerender(<AppSidebar customNavItems={customItems} />);

      const inactiveBadge = screen.getByText("5");
      expect(inactiveBadge).toHaveClass("bg-slate-100", "text-slate-700");
    });

    it("matches nested sub-routes when exact is not specified", () => {
      mockUsePathname.mockReturnValue("/settings/security");

      customRender(<AppSidebar role={UserRole.Talent} />);

      const settingsLink = screen.getByRole("link", { name: /settings/i });
      expect(settingsLink).toHaveAttribute("aria-current", "page");
    });

    it("does not match prefix for exact navigation items", () => {
      const customItems: SidebarNavItem[] = [
        {
          label: "Jobs Root",
          href: "/jobs",
          icon: CircleDot,
          exact: true,
        },
      ];

      mockUsePathname.mockReturnValue("/jobs/engineering/123");

      customRender(<AppSidebar customNavItems={customItems} />);

      const jobsLink = screen.getByRole("link", { name: /jobs root/i });
      expect(jobsLink).not.toHaveAttribute("aria-current");
    });

    it("selects My Jobs when navigating to edit job route /job/:id/edit in expanded mode", () => {
      mockUsePathname.mockReturnValue("/job/job-abc-123/edit");

      customRender(<AppSidebar role={UserRole.Employer} />);

      const myJobsLink = screen.getByRole("link", { name: /my jobs/i });
      expect(myJobsLink).toHaveAttribute("aria-current", "page");
      expect(myJobsLink).toHaveClass("text-white");
      expect(within(myJobsLink).getByTestId("sidebar-active-indicator")).toHaveClass("bg-slate-950");

      const postJobLink = screen.getByRole("link", { name: /post a job/i });
      expect(postJobLink).not.toHaveAttribute("aria-current");

      const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
      expect(dashboardLink).not.toHaveAttribute("aria-current");
    });

    it("selects My Jobs when navigating to edit job route /job/:id/edit in collapsed mode", () => {
      mockUsePathname.mockReturnValue("/job/job-abc-123/edit");

      customRender(<AppSidebar isCollapsed={true} role={UserRole.Employer} />);

      const myJobsLink = screen.getByRole("link", { name: /my jobs/i });
      expect(myJobsLink).toHaveAttribute("aria-current", "page");
      expect(myJobsLink).toHaveClass("text-white");
      expect(within(myJobsLink).getByTestId("sidebar-active-indicator")).toHaveClass("bg-slate-950");

      const postJobLink = screen.getByRole("link", { name: /post a job/i });
      expect(postJobLink).not.toHaveAttribute("aria-current");
    });

    it("matches custom matchPatterns with string and regex patterns", () => {
      const customItems: SidebarNavItem[] = [
        {
          label: "Custom Section",
          href: "/custom",
          icon: CircleDot,
          matchPatterns: ["/alternative-route", /^\/custom-regex\/[^/]+/],
        },
      ];

      mockUsePathname.mockReturnValue("/alternative-route/sub");
      const { rerender } = customRender(<AppSidebar customNavItems={customItems} />);

      const customLink = screen.getByRole("link", { name: /custom section/i });
      expect(customLink).toHaveAttribute("aria-current", "page");

      mockUsePathname.mockReturnValue("/custom-regex/xyz");
      rerender(<AppSidebar customNavItems={customItems} />);
      expect(customLink).toHaveAttribute("aria-current", "page");

      mockUsePathname.mockReturnValue("/unrelated-route");
      rerender(<AppSidebar customNavItems={customItems} />);
      expect(customLink).not.toHaveAttribute("aria-current");
    });
  });

  describe("Horizontal Scrollbar Bug Fix and Tooltips", () => {
    it("ensures overflow-visible on aside and nav when collapsed", () => {
      customRender(<AppSidebar isCollapsed={true} />);

      const sidebarElement = screen.getByRole("complementary");
      expect(sidebarElement).toHaveClass("overflow-visible");

      const navigationElement = screen.getByRole("navigation");
      expect(navigationElement).toHaveClass("overflow-visible");
    });

    it("does not render hover tooltips in collapsed mode", () => {
      customRender(<AppSidebar isCollapsed={true} role={UserRole.Talent} />);

      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      expect(screen.queryAllByRole("tooltip")).toHaveLength(0);
    });
  });

  describe("Bottom Profile Card and Sign Out", () => {
    it("displays user information, initials, and role badge in expanded mode", () => {
      const testUser: SidebarUser = {
        name: "Sarah Connor",
        email: "sarah@example.com",
        role: UserRole.Talent,
        roleSubtitle: "Senior Developer",
      };

      customRender(<AppSidebar user={testUser} isCollapsed={false} />);

      expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
      expect(screen.getByText("Senior Developer")).toBeInTheDocument();
      expect(screen.getByText("Talent")).toBeInTheDocument();
      expect(screen.getByText("SC")).toBeInTheDocument();
    });

    it("displays default Admin user profile when role=UserRole.Admin and user is omitted", () => {
      customRender(<AppSidebar role={UserRole.Admin} isCollapsed={false} />);

      expect(screen.getByText("Super Admin")).toBeInTheDocument();
      expect(screen.getByText("System Administrator")).toBeInTheDocument();
      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByText("SA")).toBeInTheDocument();
    });

    it("disables useTalentProfile query when role is Admin", () => {
      customRender(<AppSidebar role={UserRole.Admin} isCollapsed={false} />);

      expect(mockUseTalentProfile).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: false })
      );
    });

    it("renders user information and initials fallback in expanded mode", () => {
      const testUser: SidebarUser = {
        name: "Ada Lovelace",
        email: "ada@example.com",
        avatarUrl: "https://example.com/avatar.jpg",
        role: UserRole.Talent,
      };

      customRender(<AppSidebar user={testUser} isCollapsed={false} />);

      expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
      expect(screen.getByText("AL")).toBeInTheDocument();
    });

    it("renders user initials fallback in collapsed mode", () => {
      const testUserWithAvatar: SidebarUser = {
        name: "Ada Lovelace",
        email: "ada@example.com",
        avatarUrl: "https://example.com/avatar.jpg",
        role: UserRole.Talent,
      };

      customRender(<AppSidebar user={testUserWithAvatar} isCollapsed={true} />);

      expect(screen.getByText("AL")).toBeInTheDocument();
    });

    it("renders initials fallback when avatarUrl is absent in collapsed mode", () => {
      const testUserWithoutAvatar: SidebarUser = {
        name: "Grace Hopper",
        email: "grace@example.com",
        avatarUrl: null,
        role: UserRole.Talent,
      };

      customRender(<AppSidebar user={testUserWithoutAvatar} isCollapsed={true} />);

      expect(screen.getByText("GH")).toBeInTheDocument();
    });

    it("dynamically resolves profilePictureUrl, name, and tagline from useTalentProfile when loaded", () => {
      mockUseTalentProfile.mockReturnValue({
        data: {
          id: "talent-1",
          userId: "user-1",
          name: "Alex Johnson",
          email: "alex@example.com",
          tagline: "Senior AI Engineer",
          shortBio: null,
          location: null,
          phone: null,
          linkedInUrl: null,
          additionalUrls: [],
          totalYearsExperience: null,
          expectedSalary: null,
          skillPropositions: [],
          technicalSkills: [],
          softSkills: [],
          toolsAndPlatforms: [],
          profilePictureUrl: "https://storage.talentx.ai/photo.jpg",
          videoIntroUrl: null,
          resumeOriginalFileName: null,
          resumeUrl: null,
          workExperiences: [],
          educations: [],
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: null,
        },
      } as any);

      customRender(<AppSidebar isCollapsed={false} />);

      expect(screen.getByText("Alex Johnson")).toBeInTheDocument();
      expect(screen.getByText("Senior AI Engineer")).toBeInTheDocument();
      expect(screen.getByText("AJ")).toBeInTheDocument();
    });

    it("opens user menu popover on click and closes on Escape", async () => {
      const user = userEvent.setup();
      const mockSignOut = jest.fn();

      customRender(<AppSidebar onSignOut={mockSignOut} isCollapsed={false} />);

      const userMenuTrigger = screen.getByRole("button", { name: /user account menu/i });
      expect(screen.queryByRole("menuitem", { name: /sign out/i })).not.toBeInTheDocument();

      await user.click(userMenuTrigger);

      const signOutMenuItem = screen.getByRole("menuitem", { name: /sign out/i });
      expect(signOutMenuItem).toBeInTheDocument();
      expect(mockSignOut).not.toHaveBeenCalled();

      await user.keyboard("{Escape}");
      expect(screen.queryByRole("menuitem", { name: /sign out/i })).not.toBeInTheDocument();
      expect(mockSignOut).not.toHaveBeenCalled();
    });

    it("invokes onSignOut callback when sign out is clicked in expanded mode", async () => {
      const user = userEvent.setup();
      const mockSignOut = jest.fn();

      customRender(<AppSidebar onSignOut={mockSignOut} isCollapsed={false} />);

      const userMenuTrigger = screen.getByRole("button", { name: /user account menu/i });
      await user.click(userMenuTrigger);

      const signOutMenuItem = screen.getByRole("menuitem", { name: /sign out/i });
      await user.click(signOutMenuItem);

      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it("invokes onSignOut callback when sign out is clicked in collapsed mode", async () => {
      const user = userEvent.setup();
      const mockSignOut = jest.fn();

      customRender(<AppSidebar onSignOut={mockSignOut} isCollapsed={true} />);

      const userMenuTrigger = screen.getByRole("button", { name: /user account menu/i });
      await user.click(userMenuTrigger);

      const signOutMenuItem = screen.getByRole("menuitem", { name: /sign out/i });
      await user.click(signOutMenuItem);

      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it("does not render header logo and portal subtitle when hideHeader is true", () => {
      customRender(<AppSidebar hideHeader={true} role={UserRole.Employer} />);

      expect(screen.queryByText("Employer Portal")).not.toBeInTheDocument();
      expect(screen.queryByRole("img", { name: "TalentX" })).not.toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("calls onNavigate when a navigation link is clicked", async () => {
      const user = userEvent.setup();
      const mockNavigate = jest.fn();

      customRender(<AppSidebar onNavigate={mockNavigate} isCollapsed={false} />);

      const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
      await user.click(dashboardLink);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });
});
