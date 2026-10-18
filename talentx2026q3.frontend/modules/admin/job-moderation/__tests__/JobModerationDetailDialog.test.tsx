import { fireEvent, render, screen } from "@testing-library/react";
import { formatShortDate } from "@/lib/date";
import { JobModerationDetailDialog } from "../components/JobModerationDetailDialog";
import { useAdminJobDetails } from "../hooks/useAdminJobDetails";
import type { AdminJobDetails } from "../types/job-moderation";

jest.mock("../hooks/useAdminJobDetails");
// The action buttons have their own tests and need React Query; here they're just a marker.
jest.mock("../components/ModerationActions", () => ({
  ModerationActions: ({ job, onActionSuccess }: { job: { id: string }; onActionSuccess?: () => void }) => (
    <div data-testid="moderation-actions" data-job-id={job.id}>
      <button type="button" onClick={onActionSuccess}>
        Finish action
      </button>
    </div>
  ),
}));

const mockedUseAdminJobDetails = useAdminJobDetails as jest.MockedFunction<typeof useAdminJobDetails>;

type HookResult = ReturnType<typeof useAdminJobDetails>;

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

function buildDetails(overrides: Partial<AdminJobDetails> = {}): AdminJobDetails {
  return {
    id: "job-1",
    title: "Senior Backend Engineer",
    companyName: "Acme Corp",
    description: "Build and run our APIs.",
    requirements: "5+ years of .NET",
    location: "Dhaka",
    city: "Dhaka",
    country: "Bangladesh",
    employmentType: "FullTime",
    experienceLevel: "Senior",
    workArrangement: "FullRemote",
    minOverlapHours: null,
    requiredSkills: ["C#", "PostgreSQL"],
    vacancies: 2,
    salaryType: "Range",
    salaryMin: 1000,
    salaryMax: 2000,
    salaryCurrency: "USD",
    salaryPeriod: "PerMonth",
    status: "Published",
    isExpired: false,
    createdAt: "2026-08-25T00:00:00Z",
    publishedAt: "2026-09-01T00:00:00Z",
    firstPublishedAt: "2026-09-01T00:00:00Z",
    expireAt: "2026-10-01T00:00:00Z",
    employerName: "Riley Chen",
    employerEmail: "riley@acme.com",
    deactivationReason: null,
    deactivationReasonLabel: null,
    deactivationDetails: null,
    deactivatedAt: null,
    history: [],
    ...overrides,
  };
}

afterEach(() => jest.clearAllMocks());

describe("JobModerationDetailDialog", () => {
  it("renders nothing and fetches nothing while closed", () => {
    mockedUseAdminJobDetails.mockReturnValue(hookState({ isPending: true }));

    render(<JobModerationDetailDialog jobId={null} onClose={jest.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mockedUseAdminJobDetails).toHaveBeenCalledWith(undefined);
  });

  it("asks for the selected job and shows a spinner while it loads", () => {
    mockedUseAdminJobDetails.mockReturnValue(hookState({ isPending: true }));

    render(<JobModerationDetailDialog jobId="job-1" onClose={jest.fn()} />);

    expect(mockedUseAdminJobDetails).toHaveBeenCalledWith("job-1");
    expect(screen.getByText("Loading job details…")).toBeInTheDocument();
  });

  it("shows the error with a Retry that refetches", () => {
    const refetch = jest.fn();
    mockedUseAdminJobDetails.mockReturnValue(
      hookState({ isError: true, error: { status: 500, message: "Server exploded" } as never, refetch })
    );

    render(<JobModerationDetailDialog jobId="job-1" onClose={jest.fn()} />);

    expect(screen.getByText("Couldn't load job details")).toBeInTheDocument();
    expect(screen.getByText("Server exploded")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("explains a 404 instead of offering a Retry that can't succeed", () => {
    mockedUseAdminJobDetails.mockReturnValue(
      hookState({ isError: true, error: { status: 404, message: "Job not found." } as never })
    );

    render(<JobModerationDetailDialog jobId="job-1" onClose={jest.fn()} />);

    expect(screen.getByText("This job isn't available for moderation")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
  });

  it("renders the posting, employer, status and history", () => {
    mockedUseAdminJobDetails.mockReturnValue(hookState({ data: buildDetails() }));

    render(<JobModerationDetailDialog jobId="job-1" onClose={jest.fn()} />);

    expect(screen.getByRole("heading", { name: "Senior Backend Engineer" })).toBeInTheDocument();
    expect(screen.getAllByText("Acme Corp").length).toBeGreaterThan(0);
    // The status badge is the span reading "Published".
    expect(screen.getByText("Published", { selector: "span" })).toBeInTheDocument();

    expect(screen.getByText("Full Time")).toBeInTheDocument();
    expect(screen.getByText("Full Remote")).toBeInTheDocument();
    expect(screen.getByText("Dhaka, Bangladesh")).toBeInTheDocument();
    expect(screen.getByText("1,000-2,000 USD/month")).toBeInTheDocument();
    expect(screen.getByText("Build and run our APIs.")).toBeInTheDocument();
    expect(screen.getByText("5+ years of .NET")).toBeInTheDocument();
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /riley@acme\.com/ })).toHaveAttribute("href", "mailto:riley@acme.com");
    expect(screen.getByText("No moderation actions yet.")).toBeInTheDocument();
    // Nothing is down, so there is no reason panel.
    expect(screen.queryByRole("region", { name: "Deactivation reason" })).not.toBeInTheDocument();
  });

  it("shows when the job was first posted and when it was last published", () => {
    mockedUseAdminJobDetails.mockReturnValue(hookState({ data: buildDetails() }));

    render(<JobModerationDetailDialog jobId="job-1" onClose={jest.fn()} />);

    expect(screen.getByText("First posted").nextElementSibling).toHaveTextContent(
      formatShortDate("2026-09-01T00:00:00Z")
    );
    expect(screen.getByText("Last published").nextElementSibling).toHaveTextContent(
      formatShortDate("2026-09-01T00:00:00Z")
    );
    expect(screen.queryByText(/\(relisted\)/)).not.toBeInTheDocument();
  });

  it("marks the last publish as a relisting when the job went live again", () => {
    mockedUseAdminJobDetails.mockReturnValue(
      hookState({
        data: buildDetails({ firstPublishedAt: "2026-09-01T12:00:00Z", publishedAt: "2026-10-03T12:00:00Z" }),
      })
    );

    render(<JobModerationDetailDialog jobId="job-1" onClose={jest.fn()} />);

    expect(screen.getByText("First posted").nextElementSibling).toHaveTextContent(
      formatShortDate("2026-09-01T12:00:00Z")
    );
    expect(screen.getByText("Last published").nextElementSibling).toHaveTextContent(
      `${formatShortDate("2026-10-03T12:00:00Z")} (relisted)`
    );
  });

  it("shows the reason panel for a deactivated job", () => {
    mockedUseAdminJobDetails.mockReturnValue(
      hookState({
        data: buildDetails({
          status: "Deactivated",
          deactivationReason: "Spam",
          deactivationReasonLabel: "Spam",
          deactivationDetails: "Links to an unrelated external site.",
          deactivatedAt: "2026-09-10T08:00:00Z",
        }),
      })
    );

    render(<JobModerationDetailDialog jobId="job-1" onClose={jest.fn()} />);

    expect(screen.getByRole("region", { name: "Deactivation reason" })).toBeInTheDocument();
    expect(screen.getByText("Deactivated: Spam")).toBeInTheDocument();
  });

  it("offers the moderation actions for the loaded job", () => {
    mockedUseAdminJobDetails.mockReturnValue(hookState({ data: buildDetails() }));

    render(<JobModerationDetailDialog jobId="job-1" onClose={jest.fn()} />);

    expect(screen.getByTestId("moderation-actions")).toHaveAttribute("data-job-id", "job-1");
  });

  it("closes itself when a deactivate or reactivate succeeds", () => {
    mockedUseAdminJobDetails.mockReturnValue(hookState({ data: buildDetails() }));
    const onClose = jest.fn();

    render(<JobModerationDetailDialog jobId="job-1" onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Finish action" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
