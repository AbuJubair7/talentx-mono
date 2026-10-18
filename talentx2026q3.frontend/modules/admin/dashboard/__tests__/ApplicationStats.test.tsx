import { render, screen, within } from "@testing-library/react";
import { ApplicationStats } from "../components/ApplicationStats";
import type { DashboardApplicationStatus, StatusCount } from "../types/admin-dashboard";

const STATUSES: StatusCount<DashboardApplicationStatus>[] = [
  { status: "Applied", count: 60 },
  { status: "Reviewed", count: 20 },
  { status: "Shortlisted", count: 10 },
  { status: "Interview", count: 5 },
  { status: "Hired", count: 5 },
  { status: "Rejected", count: 0 },
];

// The list item for one status, found by its label.
function row(label: string): HTMLElement {
  return screen.getByText(label).closest("li") as HTMLElement;
}

// The number shown under a funnel-rate heading.
function rate(label: string): string {
  return screen.getByText(label).nextElementSibling?.textContent ?? "";
}

// Proves each status gets a labelled row with its count and share, in the order given, that the funnel rates are
// computed from the right statuses, and that an empty panel stays sensible.
describe("ApplicationStats", () => {
  it("states how many applications the panel covers", () => {
    render(<ApplicationStats rangeLabel="last 30 days" statuses={STATUSES} />);

    expect(screen.getByText("Current status of 100 applications submitted in the last 30 days")).toBeInTheDocument();
  });

  it("lists the statuses in pipeline order, showing the backend's Reviewed as Viewed", () => {
    render(<ApplicationStats rangeLabel="last 30 days" statuses={STATUSES} />);

    const labels = screen.getAllByRole("listitem").map((item) => item.textContent ?? "");
    expect(labels[0]).toContain("Applied");
    expect(labels[1]).toContain("Viewed");
    expect(labels[2]).toContain("Shortlisted");
    expect(labels[5]).toContain("Rejected");
    expect(screen.queryByText("Reviewed")).not.toBeInTheDocument();
  });

  it("shows each status's count and share of all applications", () => {
    render(<ApplicationStats rangeLabel="last 30 days" statuses={STATUSES} />);

    expect(within(row("Applied")).getByText("60")).toBeInTheDocument();
    expect(within(row("Applied")).getByText("60%")).toBeInTheDocument();
    expect(within(row("Rejected")).getByText("0%")).toBeInTheDocument();
  });

  it("computes the funnel rates: shortlist counts later stages, interview counts hired, hire counts hired only", () => {
    render(<ApplicationStats rangeLabel="last 30 days" statuses={STATUSES} />);

    // Shortlisted 10 + Interview 5 + Hired 5 = 20 of 100.
    expect(rate("Shortlist rate")).toBe("20.0%");
    // Interview 5 + Hired 5 = 10 of 100.
    expect(rate("Interview rate")).toBe("10.0%");
    expect(rate("Hire rate")).toBe("5.0%");
  });

  it("explains that the rates are based on current status, not everyone who ever reached a stage", () => {
    render(<ApplicationStats rangeLabel="last 30 days" statuses={STATUSES} />);

    expect(
      screen.getByText("Based on current status — an applicant rejected after reaching a stage isn't counted there.")
    ).toBeInTheDocument();
  });

  it("shows zeros, never NaN, when there are no applications", () => {
    const empty = STATUSES.map((entry) => ({ ...entry, count: 0 }));

    const { container } = render(<ApplicationStats rangeLabel="last 30 days" statuses={empty} />);

    expect(rate("Hire rate")).toBe("0.0%");
    expect(container.textContent).not.toContain("NaN");
  });
});
