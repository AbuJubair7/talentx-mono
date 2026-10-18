import React from "react";
import {   render as rtlRender , screen  } from "@testing-library/react";
import PortalLayout from "@/app/(portal)/layout";
import { requireAuth } from "@/lib/auth/require-auth";
import type { SessionPayload } from "@/lib/auth/jwt";
import { UserRole } from "@/types/auth";

jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
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


jest.mock("@/modules/notifications/hooks", () => ({
  ...jest.requireActual("@/modules/notifications/hooks"),
  useNotificationsRealtime: jest.fn(),
  useUnreadNotificationCount: jest.fn(() => ({ data: 0 })),
}));

jest.mock("@/components/layout/utils/sidebar-cookie", () => ({
  getSidebarCollapsedCookie: jest.fn(() => Promise.resolve(false)),
}));

import { getSidebarCollapsedCookie } from "@/components/layout/utils/sidebar-cookie";

const mockedRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockedGetSidebarCollapsedCookie =
  getSidebarCollapsedCookie as jest.MockedFunction<
    typeof getSidebarCollapsedCookie
  >;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const customRender = (ui: any, options = {}) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return rtlRender(ui, { wrapper: ({ children }: any) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>, ...options });
};

describe("PortalLayout Server Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("enforces authentication and renders AppShell with role='talent' when authenticated as Talent", async () => {
    const mockSession: SessionPayload = {
      sub: "talent-user-123",
      role: UserRole.Talent,
      email: "alex.talent@example.com",
      name: "Alex Talent",
    };
    mockedRequireAuth.mockResolvedValueOnce(mockSession);

    const layoutComponent = await PortalLayout({
      children: <div data-testid="portal-child-content">Talent Child Content</div>,
    });

    customRender(layoutComponent);

    expect(mockedRequireAuth).toHaveBeenCalledTimes(1);
    expect(mockedRequireAuth).toHaveBeenCalledWith([
      UserRole.Employer,
      UserRole.Talent,
    ]);
    expect(screen.getByTestId("portal-child-content")).toBeInTheDocument();
    expect(screen.getByText("Alex Talent")).toBeInTheDocument();
    expect(screen.getByText("Job Seeker")).toBeInTheDocument();
    expect(screen.getAllByText("Talent Portal").length).toBeGreaterThanOrEqual(1);
  });

  it("enforces authentication and renders AppShell with role='employer' when authenticated as Employer", async () => {
    const mockSession: SessionPayload = {
      sub: "employer-user-456",
      role: UserRole.Employer,
      email: "recruiter.manager@example.com",
      name: "Morgan Recruiter",
    };
    mockedRequireAuth.mockResolvedValueOnce(mockSession);

    const layoutComponent = await PortalLayout({
      children: <div data-testid="portal-child-content">Employer Child Content</div>,
    });

    customRender(layoutComponent);

    expect(mockedRequireAuth).toHaveBeenCalledTimes(1);
    expect(mockedRequireAuth).toHaveBeenCalledWith([
      UserRole.Employer,
      UserRole.Talent,
    ]);
    expect(screen.getByTestId("portal-child-content")).toBeInTheDocument();
    expect(screen.getByText("Morgan Recruiter")).toBeInTheDocument();
    expect(screen.getByText("Hiring Manager")).toBeInTheDocument();
    expect(screen.getAllByText("Employer Portal").length).toBeGreaterThanOrEqual(1);
  });

  it("gracefully falls back when session has no email provided for Talent", async () => {
    const mockSession: SessionPayload = {
      sub: "talent-user-anonymous",
      role: UserRole.Talent,
    };
    mockedRequireAuth.mockResolvedValueOnce(mockSession);

    const layoutComponent = await PortalLayout({
      children: <div data-testid="portal-fallback-content">Fallback Content</div>,
    });

    customRender(layoutComponent);

    expect(mockedRequireAuth).toHaveBeenCalledTimes(1);
    expect(mockedRequireAuth).toHaveBeenCalledWith([
      UserRole.Employer,
      UserRole.Talent,
    ]);
    expect(screen.getByTestId("portal-fallback-content")).toBeInTheDocument();
    expect(screen.getByText("Talent User")).toBeInTheDocument();
    expect(screen.getByText("Job Seeker")).toBeInTheDocument();
  });

  it("gracefully falls back when session has no email provided for Employer", async () => {
    const mockSession: SessionPayload = {
      sub: "employer-user-anonymous",
      role: UserRole.Employer,
    };
    mockedRequireAuth.mockResolvedValueOnce(mockSession);

    const layoutComponent = await PortalLayout({
      children: <div data-testid="portal-fallback-content">Fallback Content</div>,
    });

    customRender(layoutComponent);

    expect(mockedRequireAuth).toHaveBeenCalledTimes(1);
    expect(mockedRequireAuth).toHaveBeenCalledWith([
      UserRole.Employer,
      UserRole.Talent,
    ]);
    expect(screen.getByTestId("portal-fallback-content")).toBeInTheDocument();
    expect(screen.getByText("Employer User")).toBeInTheDocument();
    expect(screen.getByText("Hiring Manager")).toBeInTheDocument();
  });

  it("propagates redirection or error when requireAuth rejects (e.g. Guest role or unauthenticated)", async () => {
    const authenticationError = new Error("NEXT_REDIRECT");
    mockedRequireAuth.mockRejectedValueOnce(authenticationError);

    await expect(
      PortalLayout({
        children: <div>Should Not Render</div>,
      })
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockedRequireAuth).toHaveBeenCalledTimes(1);
    expect(mockedRequireAuth).toHaveBeenCalledWith([
      UserRole.Employer,
      UserRole.Talent,
    ]);
  });

  it("passes initialCollapsed=true to AppShell when sidebar cookie is collapsed", async () => {
    mockedRequireAuth.mockResolvedValueOnce({
      sub: "talent-user-123",
      role: UserRole.Talent,
      email: "alex.talent@example.com",
      name: "Alex Talent",
    });
    mockedGetSidebarCollapsedCookie.mockResolvedValueOnce(true);

    const layoutComponent = await PortalLayout({
      children: <div data-testid="portal-child-content">Content</div>,
    });

    customRender(layoutComponent);

    const desktopSidebar = screen.getByRole("complementary", {
      name: "Sidebar",
    });
    expect(desktopSidebar).toHaveClass("w-20");
  });
});
