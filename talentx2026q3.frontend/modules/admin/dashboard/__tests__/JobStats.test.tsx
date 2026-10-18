import { render, screen } from "@testing-library/react";
import "../test-utils/resize-observer-stub";
import { JobStats } from "../components/JobStats";
import type { DashboardJobStatus, StatusCount } from "../types/admin-dashboard";

const STATUSES: StatusCount<DashboardJobStatus>[] = [
  { status: "Published", count: 30 },
  { status: "Closed", count: 6 },
  { status: "Expired", count: 3 },
  { status: "Deactivated", count: 2 },
  { status: "PendingReview", count: 1 },
];

// Proves the panel covers the five moderation-relevant statuses (never drafts), with readable names and the total, and
// shows the "act on this" callout, with the total waiting and a link to moderation, only when jobs are waiting.
describe("JobStats", () => {
  it("states how many jobs were created in the period", () => {
    render(<JobStats rangeLabel="last 30 days" statuses={STATUSES} awaitingCount={0} />);

    expect(screen.getByText("42 jobs created in the last 30 days")).toBeInTheDocument();
  });

  it("lists the five statuses, showing Published as Active and PendingReview as Under review, and no Draft", () => {
    render(<JobStats rangeLabel="last 30 days" statuses={STATUSES} awaitingCount={0} />);

    for (const label of ["Active", "Closed", "Expired", "Deactivated", "Under review"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.queryByText("Draft")).not.toBeInTheDocument();
    expect(screen.queryByText("PendingReview")).not.toBeInTheDocument();
  });

  it("shows the total in the middle of the donut", () => {
    render(<JobStats rangeLabel="last 30 days" statuses={STATUSES} awaitingCount={0} />);

    expect(screen.getByRole("img", { name: "Jobs by status breakdown" })).toHaveTextContent("42");
  });

  it("shows how many jobs are waiting in total and links to the moderation page", () => {
    render(<JobStats rangeLabel="last 30 days" statuses={STATUSES} awaitingCount={6} />);

    expect(screen.getByText("6 jobs are awaiting review")).toBeInTheDocument();
    expect(screen.getByText("Resubmitted by employers after a deactivation")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Review queue/ })).toHaveAttribute("href", "/admin/jobs");
  });

  it("counts the whole queue, not only the jobs created in the period", () => {
    // Only 1 job created in the period is under review, but 6 are waiting overall.
    render(<JobStats rangeLabel="last 30 days" statuses={STATUSES} awaitingCount={6} />);

    expect(screen.getByText("6 jobs are awaiting review")).toBeInTheDocument();
  });

  it("uses the singular for one job", () => {
    render(<JobStats rangeLabel="last 30 days" statuses={STATUSES} awaitingCount={1} />);

    expect(screen.getByText("1 job is awaiting review")).toBeInTheDocument();
  });

  it("hides the callout when no job is waiting", () => {
    render(<JobStats rangeLabel="last 30 days" statuses={STATUSES} awaitingCount={0} />);

    expect(screen.queryByText(/awaiting review/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Review queue/ })).not.toBeInTheDocument();
  });
});
