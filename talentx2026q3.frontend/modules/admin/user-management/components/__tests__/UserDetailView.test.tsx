import { render, screen, fireEvent } from "@testing-library/react";
import { UserDetailView } from "../UserDetailView";
import { useAdminUserDetails } from "../../hooks/useAdminUserDetails";
import { useAuditLogs } from "@/modules/admin/audit-log/hooks/use-audit-logs";
import type { AdminUserDetails } from "../../types/user";

jest.mock("../../hooks/useAdminUserDetails");
jest.mock("@/modules/admin/audit-log/hooks/use-audit-logs");

const mockedUseAdminUserDetails = useAdminUserDetails as jest.MockedFunction<
  typeof useAdminUserDetails
>;
const mockedUseAuditLogs = useAuditLogs as jest.MockedFunction<typeof useAuditLogs>;

type HookResult = ReturnType<typeof useAdminUserDetails>;
type AuditLogsHookResult = ReturnType<typeof useAuditLogs>;

function hookState(partial: Partial<HookResult>): HookResult {
  return {
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    ...partial,
  } as HookResult;
}

function auditLogsHookState(partial: Partial<AuditLogsHookResult>): AuditLogsHookResult {
  return {
    data: undefined,
    isLoading: false,
    ...partial,
  } as AuditLogsHookResult;
}

function buildDetails(overrides: Partial<AdminUserDetails> = {}): AdminUserDetails {
  return {
    id: "user-1",
    name: "Jordan Smith",
    email: "jordan@talentx.com",
    role: "Talent",
    isVerified: true,
    status: "Active",
    createdAt: "2026-01-16T00:00:00Z",
    talentDetails: null,
    employerDetails: null,
    ...overrides,
  };
}

beforeEach(() => {
  mockedUseAuditLogs.mockReturnValue(auditLogsHookState({ data: { items: [], page: 1, pageSize: 5, totalCount: 0, totalPages: 1 } }));
});

afterEach(() => jest.clearAllMocks());

describe("UserDetailView", () => {
  it("renders nothing meaningful when closed", () => {
    mockedUseAdminUserDetails.mockReturnValue(hookState({}));
    render(
      <UserDetailView
        userId={null}
        isOpen={false}
        onClose={jest.fn()}
        onRequestStatusChange={jest.fn()}
      />
    );
    expect(screen.queryByText("Account Details")).not.toBeInTheDocument();
  });

  it("shows a loading state while fetching", () => {
    mockedUseAdminUserDetails.mockReturnValue(hookState({ isPending: true }));
    render(
      <UserDetailView
        userId="user-1"
        isOpen
        onClose={jest.fn()}
        onRequestStatusChange={jest.fn()}
      />
    );
    expect(screen.getByText("Loading account details…")).toBeInTheDocument();
  });

  it("shows an error state with a retry action", () => {
    mockedUseAdminUserDetails.mockReturnValue(
      hookState({ isError: true, error: new Error("Network error") })
    );
    render(
      <UserDetailView
        userId="user-1"
        isOpen
        onClose={jest.fn()}
        onRequestStatusChange={jest.fn()}
      />
    );
    expect(screen.getByText("Couldn't load account details")).toBeInTheDocument();
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  it("renders the Talent section for a Talent user", () => {
    mockedUseAdminUserDetails.mockReturnValue(
      hookState({
        data: buildDetails({
          talentDetails: {
            tagline: "Senior Engineer",
            shortBio: "Bio text",
            location: "Remote",
            phone: "123",
            linkedInUrl: null,
            additionalUrls: [],
            totalYearsExperience: 5,
            expectedSalary: null,
            skillPropositions: [],
            technicalSkills: [],
            softSkills: [],
            toolsAndPlatforms: [],
          },
        }),
      })
    );
    render(
      <UserDetailView
        userId="user-1"
        isOpen
        onClose={jest.fn()}
        onRequestStatusChange={jest.fn()}
      />
    );

    expect(screen.getByText("Talent Profile")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.queryByText("Employer Profile")).not.toBeInTheDocument();
  });

  it("renders the Employer section for an Employer user", () => {
    mockedUseAdminUserDetails.mockReturnValue(
      hookState({
        data: buildDetails({
          role: "Employer",
          status: "Active",
          employerDetails: { companyName: "Acme Inc", verificationStatus: "PendingVerification" },
        }),
      })
    );
    render(
      <UserDetailView
        userId="user-1"
        isOpen
        onClose={jest.fn()}
        onRequestStatusChange={jest.fn()}
      />
    );

    expect(screen.getByText("Employer Profile")).toBeInTheDocument();
    expect(screen.getByText("Acme Inc")).toBeInTheDocument();
    expect(screen.queryByText("Talent Profile")).not.toBeInTheDocument();
  });

  it("shows a Deactivate button for an Active user and requests Deactivated on click", () => {
    const onRequestStatusChange = jest.fn();
    mockedUseAdminUserDetails.mockReturnValue(
      hookState({ data: buildDetails({ status: "Active" }) })
    );
    render(
      <UserDetailView
        userId="user-1"
        isOpen
        onClose={jest.fn()}
        onRequestStatusChange={onRequestStatusChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Deactivate" }));

    expect(onRequestStatusChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-1" }),
      "Deactivated"
    );
  });

  it("shows an Activate button for a Deactivated user and requests Active on click", () => {
    const onRequestStatusChange = jest.fn();
    mockedUseAdminUserDetails.mockReturnValue(
      hookState({ data: buildDetails({ status: "Deactivated" }) })
    );
    render(
      <UserDetailView
        userId="user-1"
        isOpen
        onClose={jest.fn()}
        onRequestStatusChange={onRequestStatusChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Activate" }));

    expect(onRequestStatusChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-1" }),
      "Active"
    );
  });

  it("hides the status action for a Guest user", () => {
    mockedUseAdminUserDetails.mockReturnValue(
      hookState({ data: buildDetails({ role: "Guest" }) })
    );
    render(
      <UserDetailView
        userId="user-1"
        isOpen
        onClose={jest.fn()}
        onRequestStatusChange={jest.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: "Deactivate" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Activate" })).not.toBeInTheDocument();
  });

  it("renders recent admin activity filtered to the account's email", () => {
    mockedUseAuditLogs.mockReturnValue(
      auditLogsHookState({
        data: {
          items: [
            {
              id: "log-1",
              timestamp: "2026-01-20T10:00:00Z",
              actor: "admin@talentx.com",
              isSystem: false,
              action: "Deactivated account jordan@talentx.com",
            },
          ],
          page: 1,
          pageSize: 5,
          totalCount: 1,
          totalPages: 1,
        },
      })
    );
    mockedUseAdminUserDetails.mockReturnValue(hookState({ data: buildDetails() }));

    render(
      <UserDetailView
        userId="user-1"
        isOpen
        onClose={jest.fn()}
        onRequestStatusChange={jest.fn()}
      />
    );

    expect(mockedUseAuditLogs).toHaveBeenCalledWith(
      expect.objectContaining({ searchQuery: "jordan@talentx.com" })
    );
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    expect(screen.getByText("Deactivated account jordan@talentx.com")).toBeInTheDocument();
  });

  it("shows an empty state when there is no admin activity for the account", () => {
    mockedUseAuditLogs.mockReturnValue(
      auditLogsHookState({
        data: { items: [], page: 1, pageSize: 5, totalCount: 0, totalPages: 1 },
      })
    );
    mockedUseAdminUserDetails.mockReturnValue(hookState({ data: buildDetails() }));

    render(
      <UserDetailView
        userId="user-1"
        isOpen
        onClose={jest.fn()}
        onRequestStatusChange={jest.fn()}
      />
    );

    expect(screen.getByText("No admin activity recorded for this account.")).toBeInTheDocument();
  });
});
