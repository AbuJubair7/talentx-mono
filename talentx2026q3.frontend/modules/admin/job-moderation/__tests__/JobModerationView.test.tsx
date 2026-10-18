import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { JobModerationView } from "../components/JobModerationView";
import { useAdminJobs } from "../hooks/useAdminJobs";
import type { AdminJobListItem } from "../types/job-moderation";

jest.mock("../hooks/useAdminJobs", () => ({
  useAdminJobs: jest.fn(),
}));
// The dialog has its own tests; here we only check which job the view asks it to show.
jest.mock("../components/JobModerationDetailDialog", () => ({
  JobModerationDetailDialog: ({ jobId, onClose }: { jobId: string | null; onClose: () => void }) => (
    <div data-testid="job-detail-dialog" data-job-id={jobId ?? ""}>
      <button type="button" onClick={onClose}>
        Close dialog
      </button>
    </div>
  ),
}));

// Notification links arrive as /admin/jobs?job={id}; the page passes that id in as initialJobId.
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/admin/jobs",
}));

const mockedUseAdminJobs = useAdminJobs as jest.MockedFunction<typeof useAdminJobs>;

function buildJob(overrides: Partial<AdminJobListItem> = {}): AdminJobListItem {
  return {
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
    firstPublishedAt: "2026-09-01T00:00:00Z",
    expireAt: "2026-10-01T00:00:00Z",
    deactivatedAt: null,
    ...overrides,
  } as AdminJobListItem;
}

function hookState(partial: Record<string, unknown> = {}) {
  return {
    data: {
      items: [buildJob()],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    ...partial,
  } as unknown as ReturnType<typeof useAdminJobs>;
}

describe("JobModerationView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAdminJobs.mockReturnValue(hookState());
  });

  it("requests the first page of all jobs on mount", () => {
    render(<JobModerationView />);

    expect(mockedUseAdminJobs).toHaveBeenLastCalledWith({
      page: 1,
      pageSize: 10,
      searchQuery: undefined,
      status: undefined,
    });
  });

  it("renders job rows with their company, employer and status badge", () => {
    render(<JobModerationView />);

    expect(screen.getByText("Senior Backend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Riley Chen")).toBeInTheDocument();
    expect(screen.getByText("riley@acme.com")).toBeInTheDocument();
    // "Published" is also a tab label, so look for the badge inside the job's row.
    const jobRow = screen.getByText("Senior Backend Engineer").closest("tr") as HTMLElement;
    expect(within(jobRow).getByText("Published")).toBeInTheDocument();
  });

  it.each([
    ["Under review", "PendingReview"],
    ["Published", "Published"],
    ["Deactivated", "Deactivated"],
    ["All", undefined],
  ])("the %s tab filters by status %s", (tabLabel, expectedStatus) => {
    render(<JobModerationView />);

    fireEvent.click(screen.getByRole("tab", { name: tabLabel }));

    expect(screen.getByRole("tab", { name: tabLabel })).toHaveAttribute("aria-selected", "true");
    expect(mockedUseAdminJobs).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: expectedStatus })
    );
  });

  it("switching tabs sends the user back to page 1", () => {
    mockedUseAdminJobs.mockReturnValue(
      hookState({ data: { items: [buildJob()], page: 1, pageSize: 10, totalCount: 25, totalPages: 3 } })
    );
    render(<JobModerationView />);

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(mockedUseAdminJobs).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));

    fireEvent.click(screen.getByRole("tab", { name: "Deactivated" }));
    expect(mockedUseAdminJobs).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, status: "Deactivated" })
    );
  });

  describe("search", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it("waits 300ms, trims the query, and resets to page 1", () => {
      mockedUseAdminJobs.mockReturnValue(
        hookState({ data: { items: [buildJob()], page: 1, pageSize: 10, totalCount: 25, totalPages: 3 } })
      );
      render(<JobModerationView />);

      fireEvent.click(screen.getByRole("button", { name: "Next page" }));
      fireEvent.change(screen.getByLabelText("Search jobs"), { target: { value: "  backend  " } });

      // Not sent yet: the debounce has not elapsed.
      expect(mockedUseAdminJobs).toHaveBeenLastCalledWith(
        expect.objectContaining({ searchQuery: undefined, page: 2 })
      );

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockedUseAdminJobs).toHaveBeenLastCalledWith(
        expect.objectContaining({ searchQuery: "backend", page: 1 })
      );
    });
  });

  it("renders 5 skeleton rows while loading", () => {
    mockedUseAdminJobs.mockReturnValue(hookState({ data: undefined, isLoading: true }));

    const { container } = render(<JobModerationView />);

    expect(container.querySelectorAll("tr.animate-pulse")).toHaveLength(5);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("renders the empty state when no jobs match", () => {
    mockedUseAdminJobs.mockReturnValue(
      hookState({ data: { items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 0 } })
    );

    render(<JobModerationView />);

    expect(screen.getByText("No matching jobs found.")).toBeInTheDocument();
    expect(screen.getByText("Showing 0 of 0 jobs")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
  });

  it("shows an error row with a retry that refetches", () => {
    const refetch = jest.fn();
    mockedUseAdminJobs.mockReturnValue(hookState({ data: undefined, isError: true, refetch }));

    render(<JobModerationView />);

    expect(screen.getByText("Couldn't load jobs.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("shows 'Account not found' when the employer record is missing", () => {
    mockedUseAdminJobs.mockReturnValue(
      hookState({
        data: {
          items: [buildJob({ employerName: "", employerEmail: "" })],
          page: 1,
          pageSize: 10,
          totalCount: 1,
          totalPages: 1,
        },
      })
    );

    render(<JobModerationView />);

    expect(screen.getByText("Account not found")).toBeInTheDocument();
  });

  it("opens the detail dialog for a clicked row and clears it on close", () => {
    render(<JobModerationView />);
    const dialog = screen.getByTestId("job-detail-dialog");
    expect(dialog).toHaveAttribute("data-job-id", "");

    fireEvent.click(screen.getByRole("button", { name: "View details for Senior Backend Engineer" }));
    expect(dialog).toHaveAttribute("data-job-id", "job-1");

    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(dialog).toHaveAttribute("data-job-id", "");
  });

  describe("?job= link from a notification", () => {
    afterEach(() => window.history.replaceState(null, "", "/"));

    it("opens the detail dialog for that job on load", () => {
      render(<JobModerationView initialJobId="job-9" />);

      expect(screen.getByTestId("job-detail-dialog")).toHaveAttribute("data-job-id", "job-9");
    });

    it("leaves the dialog closed without the param", () => {
      render(<JobModerationView />);

      expect(screen.getByTestId("job-detail-dialog")).toHaveAttribute("data-job-id", "");
    });

    it("closes the dialog and removes the param through the router", () => {
      const { rerender } = render(<JobModerationView initialJobId="job-9" />);

      fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
      expect(mockReplace).toHaveBeenCalledWith("/admin/jobs", { scroll: false });

      // The router's navigation re-renders the page without ?job=.
      rerender(<JobModerationView initialJobId={null} />);
      expect(screen.getByTestId("job-detail-dialog")).toHaveAttribute("data-job-id", "");
    });

    it("keeps the URL's other query params when removing ?job=", () => {
      window.history.replaceState(null, "", "/admin/jobs?job=job-9&ref=bell");
      render(<JobModerationView initialJobId="job-9" />);

      fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));

      expect(mockReplace).toHaveBeenCalledWith("/admin/jobs?ref=bell", { scroll: false });
    });

    it("does not touch the URL when a dialog opened from a row is closed", () => {
      render(<JobModerationView />);

      fireEvent.click(screen.getByRole("button", { name: "View details for Senior Backend Engineer" }));
      fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));

      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("opens the same job again when the link is followed a second time", () => {
      const { rerender } = render(<JobModerationView initialJobId="job-9" />);
      fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
      rerender(<JobModerationView initialJobId={null} />);
      expect(screen.getByTestId("job-detail-dialog")).toHaveAttribute("data-job-id", "");

      rerender(<JobModerationView initialJobId="job-9" />);
      expect(screen.getByTestId("job-detail-dialog")).toHaveAttribute("data-job-id", "job-9");
    });

    it("opens a different job when a link for another job arrives after one was closed", () => {
      const { rerender } = render(<JobModerationView initialJobId="job-9" />);
      fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));

      rerender(<JobModerationView initialJobId="job-2" />);

      expect(screen.getByTestId("job-detail-dialog")).toHaveAttribute("data-job-id", "job-2");
    });
  });

  it("opens the detail dialog from the keyboard", () => {
    render(<JobModerationView />);

    fireEvent.keyDown(screen.getByRole("button", { name: "View details for Senior Backend Engineer" }), {
      key: "Enter",
    });

    expect(screen.getByTestId("job-detail-dialog")).toHaveAttribute("data-job-id", "job-1");
  });

  it("shows the pagination summary and disables Next on the last page", () => {
    mockedUseAdminJobs.mockReturnValue(
      hookState({ data: { items: [buildJob()], page: 1, pageSize: 10, totalCount: 25, totalPages: 3 } })
    );
    render(<JobModerationView />);

    expect(screen.getByText("Showing 1-10 of 25 jobs")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
    expect(screen.getByText("Showing 21-25 of 25 jobs")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });
});
