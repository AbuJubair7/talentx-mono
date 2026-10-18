import React from "react";
import {   render as rtlRender , screen, fireEvent, waitFor  } from "@testing-library/react";
import AdminLayout from "@/app/(admin)/layout";
import AdminIndexPage from "@/app/(admin)/admin/page";
import AdminDashboardPage, {
  metadata as dashboardMetadata,
} from "@/app/(admin)/admin/dashboard/page";
import AdminAuditLogPage, {
  metadata as auditLogMetadata,
} from "@/app/(admin)/admin/audit-log/page";
import AdminUsersPage, {
  metadata as usersMetadata,
} from "@/app/(admin)/admin/users/page";
import AdminJobsPage, {
  metadata as jobsMetadata,
} from "@/app/(admin)/admin/jobs/page";
import AdminReviewsPage, {
  metadata as reviewsMetadata,
} from "@/app/(admin)/admin/reviews/page";
import { requireAuth } from "@/lib/auth/require-auth";
import type { SessionPayload } from "@/lib/auth/jwt";
import { UserRole } from "@/types/auth";
import { useAuditLogs } from "@/modules/admin/audit-log/hooks/use-audit-logs";
import { useAdminUsers } from "@/modules/admin/user-management/hooks/useAdminUsers";
import { useAdminUserStats } from "@/modules/admin/user-management/hooks/useAdminUserStats";
import { useAdminUserDetails } from "@/modules/admin/user-management/hooks/useAdminUserDetails";
import { useUpdateUserAccountStatus } from "@/modules/admin/user-management/hooks/useUpdateUserAccountStatus";
import { useAdminJobs } from "@/modules/admin/job-moderation/hooks/useAdminJobs";
import { useAdminJobDetails } from "@/modules/admin/job-moderation/hooks/useAdminJobDetails";
import { useAdminCompanyReviews } from "@/modules/admin/review-moderation/hooks/useAdminCompanyReviews";
import { useAdminCompanyReviewStats } from "@/modules/admin/review-moderation/hooks/useAdminCompanyReviewStats";
import { useAdminCompanyReviewDetails } from "@/modules/admin/review-moderation/hooks/useAdminCompanyReviewDetails";
import { useApproveCompanyReview } from "@/modules/admin/review-moderation/hooks/useApproveCompanyReview";
import { useRejectCompanyReview } from "@/modules/admin/review-moderation/hooks/useRejectCompanyReview";
import { useHideCompanyReview } from "@/modules/admin/review-moderation/hooks/useHideCompanyReview";
import { useUnhideCompanyReview } from "@/modules/admin/review-moderation/hooks/useUnhideCompanyReview";

const mockRedirect = jest.fn((destinationUrl: string) => {
  throw new Error(`NEXT_REDIRECT: ${destinationUrl}`);
});

jest.mock("next/navigation", () => ({
  redirect: (destinationUrl: string) => mockRedirect(destinationUrl),
  usePathname: () => "/admin/dashboard",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: () => null,
  }),
}));

jest.mock("@/lib/auth/require-auth", () => ({
  requireAuth: jest.fn(),
}));

jest.mock("@/modules/talent-profile/hooks/useTalentProfile", () => ({
  useTalentProfile: jest.fn(() => ({ data: undefined })),
}));

jest.mock("@/modules/jobposting/hooks/useCurrentEmployer", () => ({
  useCurrentEmployer: jest.fn(() => ({ data: undefined })),
}));


jest.mock("@/modules/notifications", () => ({
  useUnreadNotificationCount: jest.fn(() => ({ data: 0 })),
  NotificationBellDropdown: () => null,
}));

jest.mock("@/modules/admin/audit-log/hooks/use-audit-logs", () => ({
  useAuditLogs: jest.fn(),
}));

jest.mock("@/modules/admin/user-management/hooks/useAdminUsers", () => ({
  useAdminUsers: jest.fn(),
  adminUserKeys: {
    all: ["admin", "users"],
    list: jest.fn(),
    detail: jest.fn(),
    stats: jest.fn(),
  },
}));

jest.mock("@/modules/admin/user-management/hooks/useAdminUserStats", () => ({
  useAdminUserStats: jest.fn(),
}));

jest.mock("@/modules/admin/user-management/hooks/useAdminUserDetails", () => ({
  useAdminUserDetails: jest.fn(),
}));

jest.mock("@/modules/admin/user-management/hooks/useUpdateUserAccountStatus", () => ({
  useUpdateUserAccountStatus: jest.fn(),
}));

// The page imports the job-moderation barrel, which also pulls in the detail and
// mutation hooks, so every hook module is mocked to keep React Query out of this test.
jest.mock("@/modules/admin/job-moderation/hooks/useAdminJobs", () => ({
  useAdminJobs: jest.fn(),
  adminJobKeys: {
    all: ["admin", "jobs"],
    list: jest.fn(),
    detail: jest.fn(),
  },
}));

// The dashboard page renders the dashboard view, which loads its data through this hook. Here it just stays in its
// first-load state, so the page test only checks the page shell.
jest.mock("@/modules/admin/dashboard/hooks/useAdminDashboard", () => ({
  useAdminDashboard: () => ({
    data: undefined,
    isLoading: true,
    isError: false,
    isFetching: true,
    isPlaceholderData: false,
    refetch: () => undefined,
  }),
  adminDashboardKeys: { all: ["admin", "dashboard"], range: () => ["admin", "dashboard"] },
}));

jest.mock("@/modules/admin/job-moderation/hooks/useAdminJobDetails", () => ({
  useAdminJobDetails: jest.fn(),
}));

jest.mock("@/modules/admin/job-moderation/hooks/useDeactivateJob", () => ({
  useDeactivateJob: jest.fn(),
}));

jest.mock("@/modules/admin/job-moderation/hooks/useReactivateJob", () => ({
  useReactivateJob: jest.fn(),
}));

// The page imports the review-moderation barrel, which also pulls in the detail and
// mutation hooks, so every hook module is mocked to keep React Query out of this test.
jest.mock("@/modules/admin/review-moderation/hooks/useAdminCompanyReviews", () => ({
  useAdminCompanyReviews: jest.fn(),
  adminCompanyReviewKeys: {
    all: ["admin", "company-reviews"],
    list: jest.fn(),
    detail: jest.fn(),
    stats: jest.fn(),
  },
}));

jest.mock("@/modules/admin/review-moderation/hooks/useAdminCompanyReviewStats", () => ({
  useAdminCompanyReviewStats: jest.fn(),
}));

jest.mock("@/modules/admin/review-moderation/hooks/useAdminCompanyReviewDetails", () => ({
  useAdminCompanyReviewDetails: jest.fn(),
}));

jest.mock("@/modules/admin/review-moderation/hooks/useApproveCompanyReview", () => ({
  useApproveCompanyReview: jest.fn(),
}));

jest.mock("@/modules/admin/review-moderation/hooks/useRejectCompanyReview", () => ({
  useRejectCompanyReview: jest.fn(),
}));

jest.mock("@/modules/admin/review-moderation/hooks/useHideCompanyReview", () => ({
  useHideCompanyReview: jest.fn(),
}));

jest.mock("@/modules/admin/review-moderation/hooks/useUnhideCompanyReview", () => ({
  useUnhideCompanyReview: jest.fn(),
}));

const mockedRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockedUseAuditLogs = useAuditLogs as jest.MockedFunction<typeof useAuditLogs>;
const mockedUseAdminUsers = useAdminUsers as jest.MockedFunction<typeof useAdminUsers>;
const mockedUseAdminUserStats = useAdminUserStats as jest.MockedFunction<typeof useAdminUserStats>;
const mockedUseAdminUserDetails = useAdminUserDetails as jest.MockedFunction<typeof useAdminUserDetails>;
const mockedUseUpdateUserAccountStatus = useUpdateUserAccountStatus as jest.MockedFunction<
  typeof useUpdateUserAccountStatus
>;
jest.mock("@/components/layout/utils/sidebar-cookie", () => ({
  getSidebarCollapsedCookie: jest.fn(() => Promise.resolve(false)),
}));

import { getSidebarCollapsedCookie } from "@/components/layout/utils/sidebar-cookie";

const mockedUseAdminJobs = useAdminJobs as jest.MockedFunction<typeof useAdminJobs>;
const mockedUseAdminJobDetails = useAdminJobDetails as jest.MockedFunction<typeof useAdminJobDetails>;
const mockedUseAdminCompanyReviews = useAdminCompanyReviews as jest.MockedFunction<typeof useAdminCompanyReviews>;
const mockedUseAdminCompanyReviewStats = useAdminCompanyReviewStats as jest.MockedFunction<
  typeof useAdminCompanyReviewStats
>;
const mockedUseAdminCompanyReviewDetails = useAdminCompanyReviewDetails as jest.MockedFunction<
  typeof useAdminCompanyReviewDetails
>;
const mockedUseApproveCompanyReview = useApproveCompanyReview as jest.MockedFunction<typeof useApproveCompanyReview>;
const mockedUseRejectCompanyReview = useRejectCompanyReview as jest.MockedFunction<typeof useRejectCompanyReview>;
const mockedUseHideCompanyReview = useHideCompanyReview as jest.MockedFunction<typeof useHideCompanyReview>;
const mockedUseUnhideCompanyReview = useUnhideCompanyReview as jest.MockedFunction<typeof useUnhideCompanyReview>;
const mockedGetSidebarCollapsedCookie =
  getSidebarCollapsedCookie as jest.MockedFunction<
    typeof getSidebarCollapsedCookie
  >;


import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const customRender = (ui: any, options = {}) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return rtlRender(ui, { wrapper: ({ children }: any) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>, ...options });
};

describe("Admin Route Group & Pages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuditLogs.mockReturnValue({
      data: {
        items: [
          {
            id: "1",
            timestamp: "2026-09-14 01:32:30",
            actor: "superadmin@ait.com",
            isSystem: false,
            action: "Update · platform_refresh_token_family",
            ipAddress: "192.168.1.100",
          },
          {
            id: "2",
            timestamp: "2026-09-14 00:56:46",
            actor: "superadmin@ait.com",
            isSystem: false,
            action: "Login Success",
            ipAddress: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
          },
          {
            id: "3",
            timestamp: "2026-09-14 00:56:41",
            actor: "System",
            isSystem: true,
            action: "Insert · platform_refresh_token",
            ipAddress: null,
          },
        ],
        page: 1,
        pageSize: 10,
        totalCount: 5790,
        totalPages: 579,
      },
      isLoading: false,
    } as any);

    mockedUseAdminUsers.mockReturnValue({
      data: {
        items: [
          {
            id: "user-1",
            name: "Jordan Smith",
            email: "jordan@talentx.com",
            role: "Talent",
            isVerified: true,
            status: "Active",
            createdAt: "2026-01-16T00:00:00Z",
          },
        ],
        page: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
      },
      isLoading: false,
    } as ReturnType<typeof useAdminUsers>);

    mockedUseAdminUserStats.mockReturnValue({
      data: {
        totalUsers: 14,
        talentsCount: 10,
        employersCount: 4,
        guestsCount: 0,
        deactivatedCount: 1,
      },
      isLoading: false,
    } as ReturnType<typeof useAdminUserStats>);

    mockedUseAdminUserDetails.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAdminUserDetails>);

    mockedUseUpdateUserAccountStatus.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateUserAccountStatus>);

    mockedUseAdminJobs.mockReturnValue({
      data: {
        items: [
          {
            id: "job-1",
            title: "Senior Backend Engineer",
            companyName: "Acme Corp",
            employerName: "Riley Chen",
            employerEmail: "riley@acme.com",
            status: "Published",
            isExpired: false,
            location: "Dhaka",
            employmentType: "FullTime",
            workArrangement: "Remote",
            applicantCount: 4,
            publishedAt: "2026-09-01T00:00:00Z",
            expireAt: "2026-10-01T00:00:00Z",
            deactivatedAt: null,
          },
        ],
        page: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAdminJobs>);

    mockedUseAdminJobDetails.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAdminJobDetails>);

    mockedUseAdminCompanyReviews.mockReturnValue({
      data: {
        items: [
          {
            id: "review-1",
            status: "Pending",
            sentiment: "Positive",
            comment: "Great recruitment process.",
            ratings: { recruitmentProcess: 4, communication: 4, interviewExperience: null, professionalism: 5 },
            companyId: "company-1",
            companyName: "Acme Corp",
            jobTitle: "Senior Backend Engineer",
            reviewerName: "Jordan Smith",
            reviewerEmail: "jordan@talentx.com",
            reviewerUserId: "user-1",
            submittedAt: "2026-09-20T00:00:00Z",
            updatedAt: null,
            publishedAt: null,
            moderationReason: null,
            moderationDetails: null,
            moderatedAt: null,
          },
        ],
        page: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAdminCompanyReviews>);

    mockedUseAdminCompanyReviewStats.mockReturnValue({
      data: {
        total: 4,
        pendingCount: 1,
        publishedCount: 1,
        rejectedCount: 1,
        hiddenCount: 1,
        withdrawnCount: 0,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useAdminCompanyReviewStats>);

    mockedUseAdminCompanyReviewDetails.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useAdminCompanyReviewDetails>);

    mockedUseApproveCompanyReview.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useApproveCompanyReview>);

    mockedUseRejectCompanyReview.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useRejectCompanyReview>);

    mockedUseHideCompanyReview.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useHideCompanyReview>);

    mockedUseUnhideCompanyReview.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUnhideCompanyReview>);
  });

  describe("AdminLayout Server Component", () => {
    it("enforces requireAuth([UserRole.Admin]) and renders AppShell with user information", async () => {
      const mockSession: SessionPayload = {
        sub: "admin-123",
        role: UserRole.Admin,
        name: "Security Lead",
        email: "security@talentx.com",
      };
      mockedRequireAuth.mockResolvedValueOnce(mockSession);

      const layoutElement = await AdminLayout({
        children: <div data-testid="admin-child">Admin Child Content</div>,
      });

      customRender(layoutElement);

      expect(mockedRequireAuth).toHaveBeenCalledTimes(1);
      expect(mockedRequireAuth).toHaveBeenCalledWith([UserRole.Admin]);
      expect(screen.getByTestId("admin-child")).toBeInTheDocument();
      expect(screen.getByText("Security Lead")).toBeInTheDocument();
      expect(screen.getByText("System Administrator")).toBeInTheDocument();
    });

    it("falls back to 'Super Admin' and 'superadmin@ait.com' when session details are missing", async () => {
      const mockSession: SessionPayload = {
        sub: "admin-456",
        role: UserRole.Admin,
        name: "   ",
        email: "",
      };
      mockedRequireAuth.mockResolvedValueOnce(mockSession);

      const layoutElement = await AdminLayout({
        children: <div data-testid="fallback-admin-child">Fallback Child</div>,
      });

      customRender(layoutElement);

      expect(mockedRequireAuth).toHaveBeenCalledWith([UserRole.Admin]);
      expect(screen.getByTestId("fallback-admin-child")).toBeInTheDocument();
      expect(screen.getByText("Super Admin")).toBeInTheDocument();
      expect(screen.getByText("System Administrator")).toBeInTheDocument();
    });

    it("propagates error when requireAuth rejects (unauthenticated or unauthorized)", async () => {
      mockedRequireAuth.mockRejectedValueOnce(new Error("NEXT_REDIRECT: /not-authorized"));

      await expect(
        AdminLayout({
          children: <div>Should not be reached</div>,
        })
      ).rejects.toThrow("NEXT_REDIRECT: /not-authorized");

      expect(mockedRequireAuth).toHaveBeenCalledWith([UserRole.Admin]);
    });

    it("passes initialCollapsed=true to AppShell when sidebar cookie is collapsed", async () => {
      mockedRequireAuth.mockResolvedValueOnce({
        sub: "admin-123",
        role: UserRole.Admin,
        name: "Security Lead",
        email: "security@talentx.com",
      });
      mockedGetSidebarCollapsedCookie.mockResolvedValueOnce(true);

      const layoutElement = await AdminLayout({
        children: <div data-testid="admin-child">Admin Child Content</div>,
      });

      customRender(layoutElement);

      const desktopSidebar = screen.getByRole("complementary", {
        name: "Sidebar",
      });
      expect(desktopSidebar).toHaveClass("w-20");
    });
  });

  describe("AdminIndexPage", () => {
    it("redirects immediately to /admin/dashboard", () => {
      expect(() => AdminIndexPage()).toThrow("NEXT_REDIRECT: /admin/dashboard");
      expect(mockRedirect).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  describe("AdminDashboardPage", () => {
    it("exports valid page metadata", () => {
      expect(dashboardMetadata).toEqual({
        title: "Admin Dashboard | TalentX",
        description: "Platform overview, active metrics, and administrative status.",
      });
    });

    it("renders page header and subtitle", () => {
      customRender(<AdminDashboardPage />);

      expect(
        screen.getByRole("heading", { name: "Admin Dashboard", level: 1 })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Platform overview, active metrics, and administrative status."
        )
      ).toBeInTheDocument();
    });
  });

  describe("AdminAuditLogPage", () => {
    it("exports valid page metadata", () => {
      expect(auditLogMetadata).toEqual({
        title: "Audit Log | TalentX",
        description: "Audit Log Insights",
      });
    });

    it("renders page header, search input, date filter, and structured table with events", () => {
      const { container } = customRender(<AdminAuditLogPage />);

      expect(
        screen.getByRole("heading", { name: "Audit Log", level: 1 })
      ).toBeInTheDocument();
      expect(screen.getByText("Audit Log Insights")).toBeInTheDocument();

      // Search, Event type, & Date filter
      expect(screen.getByPlaceholderText("Search Action")).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: "Filter by event type" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Filter by date" })).toBeInTheDocument();
      expect(screen.getByText("Select date")).toBeInTheDocument();

      // Verify Organization filter and combobox are NOT in document
      expect(
        screen.queryByRole("combobox", { name: "Filter by organization" })
      ).not.toBeInTheDocument();
      expect(screen.queryByText("All Organizations")).not.toBeInTheDocument();

      // Table column headers: Timestamp, Actor, IP Address, Action Event
      const timestampHeader = screen.getByRole("columnheader", { name: "Timestamp" });
      expect(timestampHeader).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: "Actor" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: "IP Address" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: "Action Event" })
      ).toBeInTheDocument();
      expect(timestampHeader.closest("tr")?.className).toContain("text-zinc-500");

      // Verify Organization column is NOT in document
      expect(
        screen.queryByRole("columnheader", { name: "Organization" })
      ).not.toBeInTheDocument();

      // Verify items rendered from mock
      expect(screen.getAllByText("superadmin@ait.com").length).toBeGreaterThan(0);
      expect(screen.getAllByText("System").length).toBeGreaterThan(0);
      expect(
        screen.getByText("Update · platform_refresh_token_family")
      ).toBeInTheDocument();
      expect(screen.getByText("Login Success")).toBeInTheDocument();
      expect(
        screen.getByText("Insert · platform_refresh_token")
      ).toBeInTheDocument();

      // Verify IP Address column cells (IPv4, IPv6, null fallback em-dash)
      const ipv4Cell = screen.getByText("192.168.1.100");
      expect(ipv4Cell).toBeInTheDocument();
      expect(ipv4Cell.className).toContain("font-mono");

      const ipv6Cell = screen.getByText("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
      expect(ipv6Cell).toBeInTheDocument();
      expect(ipv6Cell.className).toContain("font-mono");

      const fallbackCell = screen.getByText("—");
      expect(fallbackCell).toBeInTheDocument();
      expect(fallbackCell.className).toContain("font-mono");

      // Verify dynamic action color styling
      const updateCell = screen.getByText("Update · platform_refresh_token_family");
      expect(updateCell.className).toContain("text-sky-600");
      const loginSuccessCell = screen.getByText("Login Success");
      expect(loginSuccessCell.className).toContain("text-emerald-600");

      // Verify Date picker interaction: selecting and clearing date
      const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
      expect(dateInput).toBeInTheDocument();
      fireEvent.change(dateInput, { target: { value: "2026-09-14" } });
      expect(screen.getByText("2026-09-14")).toBeInTheDocument();
      expect(mockedUseAuditLogs).toHaveBeenLastCalledWith(
        expect.objectContaining({
          startDate: "2026-09-14T00:00:00Z",
          endDate: "2026-09-14T23:59:59.999Z",
        })
      );

      const clearBtn = screen.getByRole("button", { name: "Clear date" });
      expect(clearBtn).toBeInTheDocument();
      fireEvent.click(clearBtn);
      expect(screen.getByText("Select date")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Clear date" })).not.toBeInTheDocument();

      // Pagination
      expect(screen.getByText(/Showing 1-10 of 5790 events/)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    });

    it("renders empty state message when no records are returned", () => {
      mockedUseAuditLogs.mockReturnValueOnce({
        data: {
          items: [],
          page: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
        },
        isLoading: false,
      } as any);

      customRender(<AdminAuditLogPage />);

      const emptyCell = screen.getByText("No matching audit events found.");
      expect(emptyCell).toBeInTheDocument();
      expect(emptyCell).toHaveAttribute("colspan", "4");
      expect(screen.getByText("Showing 0 of 0 events")).toBeInTheDocument();
    });

    it("renders skeleton rows during loading state", () => {
      mockedUseAuditLogs.mockReturnValueOnce({
        data: undefined,
        isLoading: true,
      } as any);

      const { container } = customRender(<AdminAuditLogPage />);

      const skeletonRows = container.querySelectorAll("tr.animate-pulse");
      expect(skeletonRows.length).toBe(5);
      skeletonRows.forEach((row) => {
        expect(row.querySelectorAll("td").length).toBe(4);
      });
    });

    it("filters audit logs by event type and updates query params", () => {
      customRender(<AdminAuditLogPage />);

      const eventTypeSelect = screen.getByRole("combobox", {
        name: "Filter by event type",
      });
      expect(eventTypeSelect).toBeInTheDocument();

      const options = ["All Events", "Login", "Insert", "Update", "Delete"];
      options.forEach((opt) => {
        expect(screen.getByRole("option", { name: opt })).toBeInTheDocument();
      });

      fireEvent.change(eventTypeSelect, { target: { value: "Login" } });
      expect(mockedUseAuditLogs).toHaveBeenLastCalledWith(
        expect.objectContaining({
          actionType: "Login",
        })
      );

      fireEvent.change(eventTypeSelect, { target: { value: "" } });
      expect(mockedUseAuditLogs).toHaveBeenLastCalledWith(
        expect.objectContaining({
          actionType: undefined,
        })
      );
    });
  });

  describe("AdminUsersPage", () => {
    it("exports valid page metadata", () => {
      expect(usersMetadata).toEqual({
        title: "User Management | TalentX",
        description: "Manage Talent and Employer accounts",
      });
    });

    it("renders page header, stat cards, segmented tabs, and the users table", () => {
      customRender(<AdminUsersPage />);

      expect(
        screen.getByRole("heading", { name: "User Management", level: 1 })
      ).toBeInTheDocument();

      expect(screen.getByText("Total Users")).toBeInTheDocument();
      expect(screen.getByText("14")).toBeInTheDocument();

      expect(screen.getByRole("tab", { name: "All Users" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Talents" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Employers" })).toBeInTheDocument();
      expect(screen.queryByRole("tab", { name: "Guests" })).not.toBeInTheDocument();

      expect(screen.getByRole("columnheader", { name: "User Details" })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: "Role" })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: "Account Status" })).toBeInTheDocument();

      // Verify no IP Address column
      expect(
        screen.queryByRole("columnheader", { name: "IP Address" })
      ).not.toBeInTheDocument();

      expect(screen.getByText("Jordan Smith")).toBeInTheDocument();
      expect(screen.getByText("jordan@talentx.com")).toBeInTheDocument();
    });

    it("switching to the Employers tab requests users filtered by the Employer role", () => {
      customRender(<AdminUsersPage />);

      fireEvent.click(screen.getByRole("tab", { name: "Employers" }));

      expect(mockedUseAdminUsers).toHaveBeenLastCalledWith(
        expect.objectContaining({ role: "Employer" })
      );
    });

    it("opens the account details drawer when a row's View action is clicked", () => {
      customRender(<AdminUsersPage />);

      fireEvent.click(screen.getByRole("button", { name: "View details for Jordan Smith" }));

      expect(mockedUseAdminUserDetails).toHaveBeenLastCalledWith("user-1");
    });
  });

  describe("AdminJobsPage", () => {
    // The page is an async server component that reads ?job= from searchParams.
    async function renderJobsPage(searchParams: { job?: string | string[] } = {}) {
      customRender(await AdminJobsPage({ searchParams: Promise.resolve(searchParams) }));
    }

    it("exports valid page metadata", () => {
      expect(jobsMetadata).toEqual({
        title: "Job Moderation | TalentX",
        description: "Review published jobs and take down ones that break the rules",
      });
    });

    it("renders page header, status tabs, and the jobs table", async () => {
      await renderJobsPage();

      expect(
        screen.getByRole("heading", { name: "Job Moderation", level: 1 })
      ).toBeInTheDocument();

      for (const tab of ["All", "Under review", "Published", "Deactivated"]) {
        expect(screen.getByRole("tab", { name: tab })).toBeInTheDocument();
      }

      for (const column of ["Job", "Employer", "Status", "Applicants", "Posted", "Expires"]) {
        expect(screen.getByRole("columnheader", { name: column })).toBeInTheDocument();
      }

      expect(screen.getByText("Senior Backend Engineer")).toBeInTheDocument();
      expect(screen.getByText("riley@acme.com")).toBeInTheDocument();
      expect(screen.getByText("Showing 1-1 of 1 jobs")).toBeInTheDocument();
    });

    it("switching to the Under review tab requests PendingReview jobs", async () => {
      await renderJobsPage();

      fireEvent.click(screen.getByRole("tab", { name: "Under review" }));

      expect(mockedUseAdminJobs).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: "PendingReview", page: 1 })
      );
    });

    it("opens the job details dialog when a row is clicked", async () => {
      await renderJobsPage();

      fireEvent.click(screen.getByRole("button", { name: "View details for Senior Backend Engineer" }));

      expect(mockedUseAdminJobDetails).toHaveBeenLastCalledWith("job-1");
    });

    it("opens the job named by ?job= straight away", async () => {
      await renderJobsPage({ job: "job-9" });

      expect(mockedUseAdminJobDetails).toHaveBeenLastCalledWith("job-9");
    });
  });

  describe("AdminReviewsPage", () => {
    it("exports valid page metadata", () => {
      expect(reviewsMetadata).toEqual({
        title: "Review Moderation | TalentX",
        description: "Approve, reject, hide or unhide talent reviews of companies",
      });
    });

    it("renders page header, status tabs, and the reviews table", () => {
      customRender(<AdminReviewsPage />);

      expect(
        screen.getByRole("heading", { name: "Review Moderation", level: 1 })
      ).toBeInTheDocument();

      for (const tab of ["Pending", "Published", "Rejected", "Hidden", "Withdrawn", "All"]) {
        expect(screen.getByRole("tab", { name: new RegExp(tab) })).toBeInTheDocument();
      }

      for (const column of ["Company / Job", "Sentiment", "Comment", "Ratings", "Reviewer", "Status / Submitted"]) {
        expect(screen.getByRole("columnheader", { name: column })).toBeInTheDocument();
      }

      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
      expect(screen.getByText("jordan@talentx.com")).toBeInTheDocument();
      expect(screen.getByText("Showing 1-1 of 1 reviews")).toBeInTheDocument();
    });

    it("defaults to the Pending tab and requests Pending reviews", () => {
      customRender(<AdminReviewsPage />);

      expect(screen.getByRole("tab", { name: /Pending/ })).toHaveAttribute("aria-selected", "true");
      expect(mockedUseAdminCompanyReviews).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: "Pending", page: 1 })
      );
    });

    it("switching to the Published tab requests Published reviews", () => {
      customRender(<AdminReviewsPage />);

      fireEvent.click(screen.getByRole("tab", { name: /Published/ }));

      expect(mockedUseAdminCompanyReviews).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: "Published", page: 1 })
      );
    });

    it("opens the review details dialog when a row is clicked", () => {
      customRender(<AdminReviewsPage />);

      fireEvent.click(screen.getByRole("button", { name: "View details for review of Acme Corp" }));

      expect(mockedUseAdminCompanyReviewDetails).toHaveBeenLastCalledWith("review-1");
    });

    it("approves a pending review from its row action", async () => {
      const mutateAsync = jest.fn().mockResolvedValue({});
      mockedUseApproveCompanyReview.mockReturnValue({ mutateAsync, isPending: false } as unknown as ReturnType<
        typeof useApproveCompanyReview
      >);
      customRender(<AdminReviewsPage />);

      fireEvent.click(screen.getByRole("button", { name: "Approve" }));
      fireEvent.click(screen.getByRole("button", { name: "Approve review" }));

      await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith("review-1"));
    });
  });
});
