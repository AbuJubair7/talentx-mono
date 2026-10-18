import React from "react";
import { render, screen } from "@testing-library/react";
import EmployerJobManagementLayout from "@/app/(portal)/job/layout";
import JobListingLayout, {
  metadata as jobListingMetadata,
} from "@/app/(portal)/job/job-listing/layout";
import { getAuthCookies } from "@/modules/auth/shared/auth-cookies.service";
import { decodeAccessToken } from "@/lib/auth/jwt";
import { UserRole } from "@/types/auth";

const mockRedirect = jest.fn((destinationUrl: string) => {
  throw new Error(`NEXT_REDIRECT: ${destinationUrl}`);
});

jest.mock("next/navigation", () => ({
  redirect: (destinationUrl: string) => mockRedirect(destinationUrl),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: () => null,
  }),
  usePathname: () => "/job/job-listing",
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@/modules/auth/shared/auth-cookies.service", () => ({
  getAuthCookies: jest.fn(),
}));

jest.mock("@/lib/auth/jwt", () => ({
  decodeAccessToken: jest.fn(),
}));

const mockedGetAuthCookies = getAuthCookies as jest.MockedFunction<
  typeof getAuthCookies
>;
const mockedDecodeAccessToken = decodeAccessToken as jest.MockedFunction<
  typeof decodeAccessToken
>;

describe("Employer Job Guard Route Protection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("EmployerJobManagementLayout", () => {
    it("successfully renders child content when user is authenticated with UserRole.Employer", async () => {
      mockedGetAuthCookies.mockResolvedValueOnce({
        accessToken: "valid-employer-token",
        refreshToken: "valid-employer-refresh-token",
      });
      mockedDecodeAccessToken.mockReturnValueOnce({
        sub: "employer-user-id-123",
        role: UserRole.Employer,
        email: "employer@example.com",
        name: "Acme Corp Recruiter",
      });

      const layoutElement = await EmployerJobManagementLayout({
        children: (
          <div data-testid="employer-child-content">
            Employer Protected Content
          </div>
        ),
      });

      render(layoutElement);

      expect(mockRedirect).not.toHaveBeenCalled();
      expect(screen.getByTestId("employer-child-content")).toBeInTheDocument();
      expect(
        screen.getByText("Employer Protected Content")
      ).toBeInTheDocument();
    });

    it("triggers redirect to /not-authorized when user is authenticated with UserRole.Talent", async () => {
      mockedGetAuthCookies.mockResolvedValueOnce({
        accessToken: "valid-talent-token",
        refreshToken: "valid-talent-refresh-token",
      });
      mockedDecodeAccessToken.mockReturnValueOnce({
        sub: "talent-user-id-456",
        role: UserRole.Talent,
        email: "talent@example.com",
        name: "Alex Talent",
      });

      await expect(
        EmployerJobManagementLayout({
          children: (
            <div data-testid="protected-content">Should Not Render</div>
          ),
        })
      ).rejects.toThrow("NEXT_REDIRECT: /not-authorized");

      expect(mockRedirect).toHaveBeenCalledTimes(1);
      expect(mockRedirect).toHaveBeenCalledWith("/not-authorized");
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("triggers redirect to /not-authorized when user has UserRole.Guest", async () => {
      mockedGetAuthCookies.mockResolvedValueOnce({
        accessToken: "valid-guest-token",
        refreshToken: "valid-guest-refresh-token",
      });
      mockedDecodeAccessToken.mockReturnValueOnce({
        sub: "guest-user-id-789",
        role: UserRole.Guest,
      });

      await expect(
        EmployerJobManagementLayout({
          children: (
            <div data-testid="protected-content">Should Not Render</div>
          ),
        })
      ).rejects.toThrow("NEXT_REDIRECT: /not-authorized");

      expect(mockRedirect).toHaveBeenCalledTimes(1);
      expect(mockRedirect).toHaveBeenCalledWith("/not-authorized");
    });

    it("triggers redirect to /login when unauthenticated without session or refresh token", async () => {
      mockedGetAuthCookies.mockResolvedValueOnce({
        accessToken: null,
        refreshToken: null,
      });
      mockedDecodeAccessToken.mockReturnValueOnce(null);

      await expect(
        EmployerJobManagementLayout({
          children: (
            <div data-testid="protected-content">Should Not Render</div>
          ),
        })
      ).rejects.toThrow("NEXT_REDIRECT: /login");

      expect(mockRedirect).toHaveBeenCalledTimes(1);
      expect(mockRedirect).toHaveBeenCalledWith("/login");
    });
  });

  describe("JobListingLayout", () => {
    it("defines correct metadata for employer dashboard", () => {
      expect(jobListingMetadata).toEqual({
        title: "Employer Dashboard | TalentX",
      });
    });

    it("renders children directly without redundant inner header navigation", () => {
      render(
        <JobListingLayout>
          <div data-testid="job-listing-children">Job Listing Page Content</div>
        </JobListingLayout>
      );

      expect(screen.getByTestId("job-listing-children")).toBeInTheDocument();
      expect(screen.getByText("Job Listing Page Content")).toBeInTheDocument();
      expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    });
  });
});
