import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "../header";
import { mapSessionToHeaderUser, type HeaderUser } from "../types";
import { SignInProvider } from "@/components/providers/sign-in-provider";
import { useTalentProfile } from "@/modules/talent-profile/hooks/useTalentProfile";
import { UserRole } from "@/types/auth";
import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: () => null,
  }),
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
}));

jest.mock("@/modules/auth/logout/services/logout.service", () => ({
  logout: jest.fn(),
}));

jest.mock("@/modules/talent-profile/hooks/useTalentProfile", () => ({
  useTalentProfile: jest.fn(() => ({ data: undefined })),
}));

jest.mock("@/modules/notifications/hooks/useUnreadNotificationCount", () => ({
  useUnreadNotificationCount: jest.fn(() => ({ data: 0 })),
}));

const mockUseHeaderSession = jest.fn(
  ({ initialUser }: { initialUser?: HeaderUser | null } = {}) => ({
    user: initialUser ?? null,
    isAuthenticated: Boolean(initialUser && initialUser.role),
    isTalent: Boolean(
      initialUser && (initialUser.role === "Talent" || initialUser.role === "talent")
    ),
    isEmployer: Boolean(
      initialUser && (initialUser.role === "Employer" || initialUser.role === "employer")
    ),
    isLoading: false,
  })
);

jest.mock("@/components/common/use-header-session", () => ({
  useHeaderSession: (options?: { initialUser?: HeaderUser | null }) =>
    mockUseHeaderSession(options),
}));

// The chooser has its own tests; here it only needs to be detectable.
jest.mock("@/modules/jobposting/components/PostJobChooser", () => ({
  PostJobChooser: () => <div data-testid="post-job-chooser" />,
}));

const mockUseTalentProfile = useTalentProfile as jest.MockedFunction<
  typeof useTalentProfile
>;

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTalentProfile.mockReturnValue({ data: undefined } as unknown as ReturnType<
      typeof useTalentProfile
    >);
    mockUseHeaderSession.mockImplementation(
      ({ initialUser }: { initialUser?: HeaderUser | null } = {}) => ({
        user: initialUser ?? null,
        isAuthenticated: Boolean(initialUser && initialUser.role),
        isTalent: Boolean(
          initialUser && (initialUser.role === "Talent" || initialUser.role === "talent")
        ),
        isEmployer: Boolean(
          initialUser && (initialUser.role === "Employer" || initialUser.role === "employer")
        ),
        isLoading: false,
      })
    );
  });

  it("does not render 'Upload Resume' link in desktop or mobile navigation", () => {
    render(<Header />);

    const uploadResumeLinks = screen.queryAllByRole("link", {
      name: /upload resume/i,
    });
    expect(uploadResumeLinks).toHaveLength(0);
    expect(screen.queryByText(/upload resume/i)).not.toBeInTheDocument();
  });

  it("renders public navigation links 'Browse Jobs' and landing section anchors", () => {
    render(<Header />);

    const browseJobsLinks = screen.getAllByRole("link", {
      name: /browse jobs/i,
    });
    expect(browseJobsLinks.length).toBeGreaterThanOrEqual(1);
    expect(browseJobsLinks[0]).toHaveAttribute("href", "/jobs");

    const talentLinks = screen.getAllByRole("link", { name: /^for talent$/i });
    expect(talentLinks.length).toBeGreaterThanOrEqual(1);
    expect(talentLinks[0]).toHaveAttribute("href", "/#for-talent");

    const employerLinks = screen.getAllByRole("link", {
      name: /^for employers$/i,
    });
    expect(employerLinks.length).toBeGreaterThanOrEqual(1);
    expect(employerLinks[0]).toHaveAttribute("href", "/#for-employers");

    const aiLinks = screen.getAllByRole("link", { name: /ai features/i });
    expect(aiLinks.length).toBeGreaterThanOrEqual(1);
    expect(aiLinks[0]).toHaveAttribute("href", "/#ai-features");
  });

  it("renders 'Companies' navigation link to /companies", () => {
    render(<Header />);

    const companiesLinks = screen.getAllByRole("link", {
      name: /^companies$/i,
    });
    expect(companiesLinks.length).toBeGreaterThanOrEqual(1);
    expect(companiesLinks[0]).toHaveAttribute("href", "/companies");
  });

  it("renders 'Sign In' button and 'Get Started' button when user is unauthenticated", () => {
    render(<Header />);

    const signInButtons = screen.getAllByRole("button", { name: /sign in/i });
    expect(signInButtons.length).toBeGreaterThanOrEqual(1);

    const getStartedButtons = screen.getAllByRole("button", {
      name: /get started/i,
    });
    expect(getStartedButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("opens the sign-in role chooser dialog when clicking 'Sign In'", async () => {
    const userInteraction = userEvent.setup();
    render(
      <SignInProvider>
        <Header />
      </SignInProvider>
    );

    await userInteraction.click(
      screen.getAllByRole("button", { name: /sign in/i })[0]
    );

    expect(
      screen.getByRole("heading", { name: /sign in to talentx/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in as employer/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in as talent/i })
    ).toBeInTheDocument();
  });

  it("renders user avatar dropdown trigger when user is authenticated as Employer", () => {
    const mockEmployerUser: HeaderUser = {
      name: "Acme Corp",
      email: "recruiter@acme.com",
      role: "Employer",
      avatarUrl: null,
    };

    render(<Header initialUser={mockEmployerUser} />);

    expect(screen.queryByRole("button", { name: /sign in/i })).not.toBeInTheDocument();
    expect(screen.getByTestId("user-menu-trigger")).toBeInTheDocument();
    expect(screen.getByText("AC")).toBeInTheDocument();
  });

  it("renders user avatar dropdown trigger and reactively overlays profile data for Talent", async () => {
    const userInteraction = userEvent.setup();

    mockUseTalentProfile.mockReturnValue({
      data: {
        id: "talent-123",
        userId: "user-123",
        name: "Alex Smith Updated",
        email: "alex@example.com",
        profilePictureUrl: "https://example.com/alex-avatar.jpg",
        tagline: null,
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
        videoIntroUrl: null,
        resumeOriginalFileName: null,
        resumeUrl: null,
        workExperiences: [],
        educations: [],
      },
    } as unknown as ReturnType<typeof useTalentProfile>);

    const mockTalentUser: HeaderUser = {
      name: "Alex Smith",
      email: "alex@example.com",
      role: "Talent",
      avatarUrl: null,
    };

    render(<Header initialUser={mockTalentUser} />);

    expect(screen.queryByRole("button", { name: /sign in/i })).not.toBeInTheDocument();
    const triggerButton = screen.getByTestId("user-menu-trigger");
    expect(triggerButton).toBeInTheDocument();
    expect(screen.getByText("AU")).toBeInTheDocument();

    await userInteraction.click(triggerButton);
    expect(screen.getByText("Alex Smith Updated")).toBeInTheDocument();
  });

  it("renders initialUser name and initials when reactive profile is not available", () => {
    const mockTalentUser: HeaderUser = {
      name: "Alex Smith",
      email: "alex@example.com",
      role: "Talent",
      avatarUrl: null,
    };

    render(<Header initialUser={mockTalentUser} />);

    expect(screen.getByTestId("user-menu-trigger")).toBeInTheDocument();
    expect(screen.getByText("AS")).toBeInTheDocument();
  });

  it("does not query or apply talent profile when user is Employer", () => {
    mockUseTalentProfile.mockReturnValue({
      data: {
        id: "talent-leak",
        userId: "user-leak",
        name: "Leaked Talent Name",
        email: "leaked@talent.com",
        profilePictureUrl: "https://example.com/leaked-photo.jpg",
      },
    } as unknown as ReturnType<typeof useTalentProfile>);

    const mockEmployerUser: HeaderUser = {
      name: "Acme Corp",
      email: "recruiter@acme.com",
      role: "Employer",
      avatarUrl: null,
    };

    render(<Header initialUser={mockEmployerUser} />);

    expect(screen.getByTestId("user-menu-trigger")).toBeInTheDocument();
    expect(screen.getByText("AC")).toBeInTheDocument();
    expect(screen.queryByText("Leaked Talent Name")).not.toBeInTheDocument();
  });

  it("toggles mobile menu and updates aria-expanded and aria-controls attributes", async () => {
    const userInteraction = userEvent.setup();
    render(<Header />);

    const hamburgerButton = screen.getByRole("button", {
      name: /toggle mobile menu/i,
    });
    expect(hamburgerButton).toBeInTheDocument();
    expect(hamburgerButton).toHaveAttribute("aria-expanded", "false");
    expect(hamburgerButton).toHaveAttribute("aria-controls", "mobile-header-menu");

    await userInteraction.click(hamburgerButton);

    expect(hamburgerButton).toHaveAttribute("aria-expanded", "true");
    const mobileBrowseJobs = screen.getAllByRole("link", {
      name: /browse jobs/i,
    });
    expect(mobileBrowseJobs.length).toBe(2);
  });

  it("renders authenticated user details in mobile drawer when open", async () => {
    const userInteraction = userEvent.setup();
    const mockTalentUser: HeaderUser = {
      name: "Sarah Connor",
      email: "sarah@skynet.local",
      role: "Talent",
      avatarUrl: null,
    };

    render(<Header initialUser={mockTalentUser} />);

    const hamburgerButton = screen.getByRole("button", {
      name: /toggle mobile menu/i,
    });
    await userInteraction.click(hamburgerButton);

    expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
    expect(screen.getByText("sarah@skynet.local")).toBeInTheDocument();
  });

  it("renders unauthenticated header when initialUser is null even if profile data is in cache", () => {
    mockUseTalentProfile.mockReturnValue({
      data: {
        id: "talent-456",
        userId: "user-456",
        name: "Client Talent",
        email: "client.talent@example.com",
        profilePictureUrl: null,
      },
    } as unknown as ReturnType<typeof useTalentProfile>);

    render(<Header />);

    expect(screen.getAllByRole("button", { name: /sign in/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("button", { name: /get started/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByTestId("user-menu-trigger")).not.toBeInTheDocument();
  });

  it("renders authenticated header autonomously when useHeaderSession resolves active user without initialUser prop", () => {
    mockUseHeaderSession.mockReturnValueOnce({
      user: {
        name: "Autonomous Employer",
        email: "auto@employer.com",
        role: "Employer",
        avatarUrl: null,
      },
      isAuthenticated: true,
      isTalent: false,
      isEmployer: true,
      isLoading: false,
    } as ReturnType<typeof mockUseHeaderSession>);

    render(<Header />);

    expect(screen.queryByRole("button", { name: /sign in/i })).not.toBeInTheDocument();
    expect(screen.getByTestId("user-menu-trigger")).toBeInTheDocument();
    expect(screen.getByText("AE")).toBeInTheDocument();
  });

  it("renders notification bell dropdown trigger when user is authenticated as Talent", () => {
    const mockTalentUser: HeaderUser = {
      name: "Alex Smith",
      email: "alex@example.com",
      role: "Talent",
      avatarUrl: null,
    };

    render(<Header initialUser={mockTalentUser} />);

    const bellTriggers = screen.getAllByTestId("notification-bell-trigger");
    expect(bellTriggers.length).toBeGreaterThanOrEqual(1);
    expect(bellTriggers[0]).toBeInTheDocument();
  });

  it("does not render notification bell dropdown trigger when user is unauthenticated", () => {
    render(<Header />);

    expect(screen.queryByTestId("notification-bell-trigger")).not.toBeInTheDocument();
  });

  it("does not render notification bell dropdown trigger when user is Employer", () => {
    const mockEmployerUser: HeaderUser = {
      name: "Acme Corp",
      email: "recruiter@acme.com",
      role: "Employer",
      avatarUrl: null,
    };

    render(<Header initialUser={mockEmployerUser} />);

    expect(screen.queryByTestId("notification-bell-trigger")).not.toBeInTheDocument();
  });
});

// Proves Post a Job links on public pages get the draft chooser, but only for employers.
describe("Header Post a Job chooser", () => {
  function renderWithQueryClient(user: HeaderUser | null) {
    return render(<Header initialUser={user} />, { wrapper: createQueryWrapper() });
  }

  it("mounts the chooser for an employer", () => {
    renderWithQueryClient({ name: "Omar Khan", email: "omar@example.com", role: "Employer" });

    expect(screen.getByTestId("post-job-chooser")).toBeInTheDocument();
  });

  it("does not mount the chooser for a talent or a visitor", () => {
    const { unmount } = renderWithQueryClient({ name: "Aisha Rahman", email: "aisha@example.com", role: "Talent" });
    expect(screen.queryByTestId("post-job-chooser")).not.toBeInTheDocument();
    unmount();

    renderWithQueryClient(null);
    expect(screen.queryByTestId("post-job-chooser")).not.toBeInTheDocument();
  });

  it("does not mount the chooser without a query client", () => {
    render(<Header initialUser={{ name: "Omar Khan", email: "omar@example.com", role: "Employer" }} />);

    expect(screen.queryByTestId("post-job-chooser")).not.toBeInTheDocument();
  });
});

describe("mapSessionToHeaderUser", () => {
  it("returns null when session is null or undefined", () => {
    expect(mapSessionToHeaderUser(null)).toBeNull();
    expect(mapSessionToHeaderUser(undefined)).toBeNull();
  });

  it("returns null when session has no role claim", () => {
    const sessionWithoutRole = {
      email: "user@example.com",
      name: "John Doe",
    };
    expect(mapSessionToHeaderUser(sessionWithoutRole)).toBeNull();
  });

  it("returns null when role is Guest", () => {
    expect(mapSessionToHeaderUser({ role: UserRole.Guest })).toBeNull();
    expect(mapSessionToHeaderUser({ role: "Guest" })).toBeNull();
    expect(mapSessionToHeaderUser({ role: "guest" })).toBeNull();
  });

  it("maps session with standard JWT claims even without sub claim", () => {
    const standardSession = {
      role: UserRole.Employer,
      email: "employer@acme.com",
      name: "Acme Corp",
    };

    const headerUser = mapSessionToHeaderUser(standardSession);

    expect(headerUser).toEqual({
      name: "Acme Corp",
      email: "employer@acme.com",
      role: UserRole.Employer,
      avatarUrl: null,
    });
  });

  it("maps session with ASP.NET schema claim URIs", () => {
    const aspNetSession = {
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Talent",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": "talent@example.com",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": "Jane Talent",
    };

    const headerUser = mapSessionToHeaderUser(aspNetSession);

    expect(headerUser).toEqual({
      name: "Jane Talent",
      email: "talent@example.com",
      role: "Talent",
      avatarUrl: null,
    });
  });

  it("maps unique_name when name claim is missing", () => {
    const sessionWithUniqueName = {
      role: "Talent",
      email: "talent@example.com",
      unique_name: "Unique Jane",
    };

    const headerUser = mapSessionToHeaderUser(sessionWithUniqueName);

    expect(headerUser).toEqual({
      name: "Unique Jane",
      email: "talent@example.com",
      role: "Talent",
      avatarUrl: null,
    });
  });

  it("falls back to 'Employer User' for employer when name is absent", () => {
    const sessionWithoutName = {
      role: UserRole.Employer,
      email: "recruiter@company.com",
    };

    const headerUser = mapSessionToHeaderUser(sessionWithoutName);

    expect(headerUser).toEqual({
      name: "Employer User",
      email: "recruiter@company.com",
      role: UserRole.Employer,
      avatarUrl: null,
    });
  });

  it("falls back to 'Talent User' for talent when name is absent", () => {
    const sessionWithoutName = {
      role: UserRole.Talent,
      email: "talent@domain.com",
    };

    const headerUser = mapSessionToHeaderUser(sessionWithoutName);

    expect(headerUser).toEqual({
      name: "Talent User",
      email: "talent@domain.com",
      role: UserRole.Talent,
      avatarUrl: null,
    });
  });
});


