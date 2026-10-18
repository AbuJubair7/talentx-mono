import React from "react";
import { render, screen } from "@testing-library/react";
import ProfilePage, { metadata } from "@/app/(portal)/profile/page";
import { requireAuth } from "@/lib/auth/require-auth";
import type { SessionPayload } from "@/lib/auth/jwt";
import { UserRole } from "@/types/auth";

jest.mock("@/lib/auth/require-auth", () => ({
  requireAuth: jest.fn(),
}));

const mockRedirect = jest.fn((destinationUrl: string) => {
  throw new Error(`NEXT_REDIRECT: ${destinationUrl}`);
});

jest.mock("next/navigation", () => ({
  redirect: (destinationUrl: string) => mockRedirect(destinationUrl),
}));

jest.mock("@/modules/talent-profile", () => ({
  TalentProfileView: () => (
    <div data-testid="talent-profile-view">Mocked TalentProfileView Component</div>
  ),
}));

jest.mock("@/modules/company-profile", () => ({
  EmployerCompanyPage: () => (
    <div data-testid="company-profile-view">Mocked EmployerCompanyPage Component</div>
  ),
}));

const mockedRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

describe("ProfilePage Server Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("defines the expected server page metadata", () => {
    expect(metadata).toEqual({
      title: "Profile | TalentX",
    });
  });

  it("renders TalentProfileView when authenticated user is a Talent", async () => {
    const mockTalentSession: SessionPayload = {
      sub: "talent-123",
      role: UserRole.Talent,
      email: "talent@example.com",
    };
    mockedRequireAuth.mockResolvedValueOnce(mockTalentSession);

    const pageElement = await ProfilePage({ searchParams: Promise.resolve({}) });
    render(pageElement);

    expect(mockedRequireAuth).toHaveBeenCalledTimes(1);
    expect(mockedRequireAuth).toHaveBeenCalledWith([
      UserRole.Talent,
      UserRole.Employer,
    ]);
    expect(screen.getByTestId("talent-profile-view")).toBeInTheDocument();
  });

  it("redirects to /company when authenticated user is an Employer", async () => {
    const mockEmployerSession: SessionPayload = {
      sub: "employer-123",
      role: UserRole.Employer,
      email: "employer@example.com",
    };
    mockedRequireAuth.mockResolvedValueOnce(mockEmployerSession);

    await expect(
      ProfilePage({ searchParams: Promise.resolve({}) })
    ).rejects.toThrow("NEXT_REDIRECT: /company");

    expect(mockedRequireAuth).toHaveBeenCalledTimes(1);
    expect(mockedRequireAuth).toHaveBeenCalledWith([
      UserRole.Talent,
      UserRole.Employer,
    ]);
    expect(mockRedirect).toHaveBeenCalledWith("/company");
  });
});
