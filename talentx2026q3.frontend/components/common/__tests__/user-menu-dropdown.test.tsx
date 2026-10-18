import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserMenuDropdown } from "../user-menu-dropdown";
import type { HeaderUser } from "../types";
import { logout } from "@/modules/auth/logout/services/logout.service";
import { WIZARD_BACKUP_KEY } from "@/modules/jobposting/utils/wizard-backup";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: () => null,
  }),
}));

jest.mock("@/modules/auth/logout/services/logout.service", () => ({
  logout: jest.fn(),
}));

const mockLogout = logout as jest.MockedFunction<typeof logout>;

describe("UserMenuDropdown Component", () => {
  const mockTalentUser: HeaderUser = {
    name: "Jane Doe",
    email: "jane@example.com",
    role: "Talent",
    avatarUrl: null,
  };

  const mockEmployerUser: HeaderUser = {
    name: "Acme Corp",
    email: "recruiter@acme.com",
    role: "Employer",
    avatarUrl: "https://example.com/avatar.png",
  };

  const mockAdminUser: HeaderUser = {
    name: "Admin User",
    email: "admin@example.com",
    role: "Admin",
    avatarUrl: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders trigger button with monogram initials when avatarUrl is absent", () => {
    render(<UserMenuDropdown user={mockTalentUser} />);

    const triggerButton = screen.getByTestId("user-menu-trigger");
    expect(triggerButton).toBeInTheDocument();
    expect(triggerButton).toHaveAttribute("aria-label", "User account menu");
    expect(triggerButton).toHaveAttribute("aria-haspopup", "menu");
    expect(triggerButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders trigger button with monogram initials when avatarUrl is provided", () => {
    render(<UserMenuDropdown user={mockEmployerUser} />);

    const triggerButton = screen.getByTestId("user-menu-trigger");
    expect(triggerButton).toBeInTheDocument();
    expect(screen.getByText("AC")).toBeInTheDocument();
  });

  it("opens menu on click and displays talent navigation links, user summary, and sign out", async () => {
    const userInteraction = userEvent.setup();
    render(<UserMenuDropdown user={mockTalentUser} />);

    const triggerButton = screen.getByTestId("user-menu-trigger");
    await userInteraction.click(triggerButton);

    expect(triggerButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Talent")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();

    const profileLink = screen.getByRole("menuitem", { name: /my profile/i });
    expect(profileLink).toHaveAttribute("href", "/profile");

    const dashboardLink = screen.getByRole("menuitem", { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");

    const settingsLink = screen.getByRole("menuitem", { name: /settings/i });
    expect(settingsLink).toHaveAttribute("href", "/settings");

    const signOutButton = screen.getByRole("menuitem", { name: /sign out/i });
    expect(signOutButton).toBeInTheDocument();

    expect(screen.queryByRole("menuitem", { name: /post a job/i })).not.toBeInTheDocument();
  });

  it("opens menu on click and displays employer navigation links including Post a Job", async () => {
    const userInteraction = userEvent.setup();
    render(<UserMenuDropdown user={mockEmployerUser} />);

    const triggerButton = screen.getByTestId("user-menu-trigger");
    await userInteraction.click(triggerButton);

    expect(triggerButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Employer")).toBeInTheDocument();
    expect(screen.getByText("recruiter@acme.com")).toBeInTheDocument();

    const dashboardLink = screen.getByRole("menuitem", { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");

    const postJobLink = screen.getByRole("menuitem", { name: /post a job/i });
    expect(postJobLink).toHaveAttribute("href", "/job/jobpost");

    const settingsLink = screen.getByRole("menuitem", { name: /settings/i });
    expect(settingsLink).toHaveAttribute("href", "/settings");

    const signOutButton = screen.getByRole("menuitem", { name: /sign out/i });
    expect(signOutButton).toBeInTheDocument();

    expect(screen.queryByRole("menuitem", { name: /my profile/i })).not.toBeInTheDocument();
  });

  it("opens menu on click and displays only Dashboard linking to /admin/dashboard for Admin", async () => {
    const userInteraction = userEvent.setup();
    render(<UserMenuDropdown user={mockAdminUser} />);

    const triggerButton = screen.getByTestId("user-menu-trigger");
    await userInteraction.click(triggerButton);

    expect(triggerButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();

    const dashboardLink = screen.getByRole("menuitem", { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute("href", "/admin/dashboard");

    expect(screen.queryByRole("menuitem", { name: /my profile/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /post a job/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /settings/i })).not.toBeInTheDocument();

    const signOutButton = screen.getByRole("menuitem", { name: /sign out/i });
    expect(signOutButton).toBeInTheDocument();
  });

  it("closes menu when Escape key is pressed", async () => {
    const userInteraction = userEvent.setup();
    render(<UserMenuDropdown user={mockTalentUser} />);

    const triggerButton = screen.getByTestId("user-menu-trigger");
    await userInteraction.click(triggerButton);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();

    await userInteraction.keyboard("{Escape}");

    expect(screen.queryByText("Jane Doe")).not.toBeInTheDocument();
    expect(triggerButton).toHaveAttribute("aria-expanded", "false");
  });

  it("formats employer role badge correctly", async () => {
    const userInteraction = userEvent.setup();
    render(<UserMenuDropdown user={mockEmployerUser} />);

    const triggerButton = screen.getByTestId("user-menu-trigger");
    await userInteraction.click(triggerButton);

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Employer")).toBeInTheDocument();
  });

  it("invokes custom onSignOut handler when provided", async () => {
    const userInteraction = userEvent.setup();
    const customSignOut = jest.fn();

    render(<UserMenuDropdown user={mockTalentUser} onSignOut={customSignOut} />);

    const triggerButton = screen.getByTestId("user-menu-trigger");
    await userInteraction.click(triggerButton);

    const signOutButton = screen.getByRole("menuitem", { name: /sign out/i });
    await userInteraction.click(signOutButton);

    expect(customSignOut).toHaveBeenCalledTimes(1);
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it("removes the job wizard's local backup on sign out, so the next user of this browser can't see it", async () => {
    const userInteraction = userEvent.setup();
    window.localStorage.setItem(WIZARD_BACKUP_KEY, "{}");

    render(<UserMenuDropdown user={mockEmployerUser} />);
    await userInteraction.click(screen.getByTestId("user-menu-trigger"));
    await userInteraction.click(screen.getByRole("menuitem", { name: /sign out/i }));

    expect(window.localStorage.getItem(WIZARD_BACKUP_KEY)).toBeNull();
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("applies left-0 positioning class when align='left' is provided", async () => {
    const userInteraction = userEvent.setup();
    render(<UserMenuDropdown user={mockTalentUser} align="left" />);

    const triggerButton = screen.getByTestId("user-menu-trigger");
    await userInteraction.click(triggerButton);

    const menu = screen.getByRole("menu");
    expect(menu).toHaveClass("left-0");
  });

  it("applies right-0 positioning class by default when align is not specified", async () => {
    const userInteraction = userEvent.setup();
    render(<UserMenuDropdown user={mockTalentUser} />);

    const triggerButton = screen.getByTestId("user-menu-trigger");
    await userInteraction.click(triggerButton);

    const menu = screen.getByRole("menu");
    expect(menu).toHaveClass("right-0");
  });
});
