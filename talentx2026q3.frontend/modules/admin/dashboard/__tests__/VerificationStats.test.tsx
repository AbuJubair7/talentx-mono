import { render, screen } from "@testing-library/react";
import "../test-utils/resize-observer-stub";
import { VerificationStats } from "../components/VerificationStats";
import type { DashboardVerificationStatus, StatusCount } from "../types/admin-dashboard";

const STATUSES: StatusCount<DashboardVerificationStatus>[] = [
  { status: "Verified", count: 6 },
  { status: "PendingVerification", count: 3 },
  { status: "Rejected", count: 1 },
];

// Proves the panel labels and totals the employer statuses, and shows the "act on this" callout only when someone is
// waiting, with the total waiting, a correct day count and a link to the review page.
describe("VerificationStats", () => {
  it("states how many employers registered in the period and lists the statuses by their display names", () => {
    render(<VerificationStats rangeLabel="last 30 days" statuses={STATUSES} awaitingCount={0} oldestPendingDays={null} />);

    expect(screen.getByText("10 employers registered in the last 30 days")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });

  it("shows how many employers are waiting in total, how long the oldest has waited, and links to the review page", () => {
    render(<VerificationStats rangeLabel="last 30 days" statuses={STATUSES} awaitingCount={12} oldestPendingDays={4} />);

    expect(screen.getByText("12 employers are awaiting review")).toBeInTheDocument();
    expect(screen.getByText("Oldest request waiting 4 days")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Review queue/ })).toHaveAttribute("href", "/admin/employers");
  });

  it("counts the whole queue, not only the employers registered in the period", () => {
    // Only 3 employers registered in the period are pending, but 12 are waiting overall.
    render(<VerificationStats rangeLabel="last 30 days" statuses={STATUSES} awaitingCount={12} oldestPendingDays={40} />);

    expect(screen.getByText("12 employers are awaiting review")).toBeInTheDocument();
  });

  it("uses the singular for one employer and one day", () => {
    render(<VerificationStats rangeLabel="last 30 days" statuses={STATUSES} awaitingCount={1} oldestPendingDays={1} />);

    expect(screen.getByText("1 employer is awaiting review")).toBeInTheDocument();
    expect(screen.getByText("Oldest request waiting 1 day")).toBeInTheDocument();
  });

  it("shows 0 days for a request made today", () => {
    render(<VerificationStats rangeLabel="last 30 days" statuses={STATUSES} awaitingCount={2} oldestPendingDays={0} />);

    expect(screen.getByText("Oldest request waiting 0 days")).toBeInTheDocument();
  });

  it("leaves out the waiting time when it is not known", () => {
    render(<VerificationStats rangeLabel="last 30 days" statuses={STATUSES} awaitingCount={2} oldestPendingDays={null} />);

    expect(screen.getByText("2 employers are awaiting review")).toBeInTheDocument();
    expect(screen.queryByText(/Oldest request waiting/)).not.toBeInTheDocument();
  });

  it("hides the callout when nobody is waiting", () => {
    render(<VerificationStats rangeLabel="last 30 days" statuses={STATUSES} awaitingCount={0} oldestPendingDays={null} />);

    expect(screen.queryByText(/awaiting review/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Review queue/ })).not.toBeInTheDocument();
  });
});
