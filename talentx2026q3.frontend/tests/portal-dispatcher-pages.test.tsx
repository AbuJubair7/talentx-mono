import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DashboardPage, { metadata as dashboardMetadata } from "@/app/(portal)/dashboard/page";
import NotificationsPage, { metadata as notificationsMetadata } from "@/app/(portal)/notifications/page";
import SettingsPage, { metadata as settingsMetadata } from "@/app/(portal)/settings/page";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import type { SessionPayload } from "@/lib/auth/jwt";
import { UserRole } from "@/types/auth";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/lib/auth/require-auth", () => ({
  requireAuth: jest.fn(),
}));

jest.mock("@/modules/talent-dashboard/components/talent-dashboard", () => ({
  TalentDashboard: () => <div>Talent Dashboard</div>,
}));


jest.mock("@/modules/employer-jobs", () => ({
  EmployerDashboardClient: () => <div>Employer Dashboard</div>
}));

jest.mock("@/app/(portal)/settings/components/job-alert-notification-row", () => ({
  JobAlertNotificationRow: () => <div>Job Alert Notification Row</div>,
}));

const mockedRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;

// The Settings page renders DeleteAccountSettingsRow, which uses a React Query
// mutation. In the app that context comes from the root layout's Providers.
function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("Portal Dispatcher Pages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("DashboardPage", () => {
    it("defines correct metadata", () => {
      expect(dashboardMetadata).toEqual({
        title: "Dashboard | TalentX",
      });
    });

    it("renders Talent Dashboard when authenticated as Talent", async () => {
      const mockTalentSession: SessionPayload = {
        sub: "talent-1",
        role: UserRole.Talent,
        email: "talent@example.com",
      };
      mockedRequireAuth.mockResolvedValueOnce(mockTalentSession);

      const pageElement = await DashboardPage();
      render(pageElement);

      expect(mockedRequireAuth).toHaveBeenCalledWith([
        UserRole.Talent,
        UserRole.Employer,
      ]);
      expect(screen.getByText("Talent Dashboard")).toBeInTheDocument();
    });

    it("renders Employer Dashboard when authenticated as Employer", async () => {
      const mockEmployerSession: SessionPayload = {
        sub: "employer-1",
        role: UserRole.Employer,
        email: "employer@example.com",
      };
      mockedRequireAuth.mockResolvedValueOnce(mockEmployerSession);

      const pageElement = await DashboardPage();
      render(pageElement);

      expect(mockedRequireAuth).toHaveBeenCalledWith([
        UserRole.Talent,
        UserRole.Employer,
      ]);
      expect(screen.getByText("Employer Dashboard")).toBeInTheDocument();
    });
  });

  describe("NotificationsPage", () => {
    it("defines correct metadata", () => {
      expect(notificationsMetadata).toEqual({
        title: "Notifications | TalentX",
      });
    });

    it("redirects to home when authenticated as Talent", async () => {
      const mockTalentSession: SessionPayload = {
        sub: "talent-1",
        role: UserRole.Talent,
        email: "talent@example.com",
      };
      mockedRequireAuth.mockResolvedValueOnce(mockTalentSession);

      await NotificationsPage();

      expect(mockedRedirect).toHaveBeenCalledWith("/");
    });

    it("renders Employer Notifications when authenticated as Employer", async () => {
      const mockEmployerSession: SessionPayload = {
        sub: "employer-1",
        role: UserRole.Employer,
        email: "employer@example.com",
      };
      mockedRequireAuth.mockResolvedValueOnce(mockEmployerSession);

      const pageElement = await NotificationsPage();
      render(pageElement);

      expect(screen.getByText("Employer Notifications")).toBeInTheDocument();
    });
  });

  describe("SettingsPage", () => {
    it("defines correct metadata", () => {
      expect(settingsMetadata).toEqual({
        title: "Settings | TalentX",
      });
    });

    it("renders Settings page with security section when authenticated as Talent", async () => {
      const mockTalentSession: SessionPayload = {
        sub: "talent-1",
        role: UserRole.Talent,
        email: "talent@example.com",
      };
      mockedRequireAuth.mockResolvedValueOnce(mockTalentSession);

      const pageElement = await SettingsPage();
      renderWithQueryClient(pageElement);

      expect(screen.getByRole("heading", { name: "Security" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
      expect(screen.getByText("Notification Preferences")).toBeInTheDocument();
      expect(screen.getByText("Job Alert Notification Row")).toBeInTheDocument();
      expect(screen.getByText("Security")).toBeInTheDocument();
      expect(screen.getByText("Change Password")).toBeInTheDocument();
    });

    it("renders Settings page when authenticated as Employer", async () => {
      const mockEmployerSession: SessionPayload = {
        sub: "employer-1",
        role: UserRole.Employer,
        email: "employer@example.com",
      };
      mockedRequireAuth.mockResolvedValueOnce(mockEmployerSession);

      const pageElement = await SettingsPage();
      renderWithQueryClient(pageElement);

      expect(screen.getByRole("heading", { name: "Security" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
      expect(screen.queryByText("Notification Preferences")).not.toBeInTheDocument();
      expect(screen.getByText("Security")).toBeInTheDocument();
      expect(screen.getByText("Change Password")).toBeInTheDocument();
    });
  });
});
