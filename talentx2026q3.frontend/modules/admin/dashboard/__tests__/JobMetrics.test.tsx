import { render, screen } from "@testing-library/react";
import { JobMetrics } from "../components/JobMetrics";
import { buildMetrics } from "../test-utils/dashboard-fixtures";

// Returns the count and percentage shown under a legend label.
function legendValues(label: string): string[] {
  const term = screen.getByText(label);
  const values: string[] = [];
  let next = term.nextElementSibling;
  while (next) {
    values.push(next.textContent ?? "");
    next = next.nextElementSibling;
  }
  return values;
}

// Checks the total, "+N posted in the range", the legend counts and shares, colours and the empty case.
describe("JobMetrics", () => {
  const totals = buildMetrics({
    totalJobs: 107,
    publishedJobs: 53,
    closedOrExpiredJobs: 41,
    deactivatedJobs: 11,
    underReviewJobs: 2,
  });
  const metrics = buildMetrics({ totalJobs: 9 });

  it("shows the all-time total and the jobs posted in the range", () => {
    render(<JobMetrics rangeLabel="last 30 days" metrics={metrics} totals={totals} />);

    expect(screen.getByText("107")).toBeInTheDocument();
    expect(screen.getByText("+9")).toBeInTheDocument();
    expect(screen.getByText("posted in the last 30 days")).toBeInTheDocument();
  });

  it("lists each status with its count and share of all jobs", () => {
    render(<JobMetrics rangeLabel="last 30 days" metrics={metrics} totals={totals} />);

    expect(legendValues("Active")).toEqual(["53", "49.5%"]);
    expect(legendValues("Closed / expired")).toEqual(["41", "38.3%"]);
    expect(legendValues("Deactivated")).toEqual(["11", "10.3%"]);
    expect(legendValues("Under review")).toEqual(["2", "1.9%"]);
  });

  it("colours deactivated red and under review amber, as in job moderation", () => {
    render(<JobMetrics rangeLabel="last 30 days" metrics={metrics} totals={totals} />);

    expect(screen.getByText("Deactivated").querySelector("span")).toHaveClass("bg-rose-500");
    expect(screen.getByText("Under review").querySelector("span")).toHaveClass("bg-amber-500");
  });

  it("describes the status bar for screen readers", () => {
    render(<JobMetrics rangeLabel="last 30 days" metrics={metrics} totals={totals} />);

    expect(
      screen.getByRole("img", { name: "Active: 53, Closed / expired: 41, Deactivated: 11, Under review: 2" })
    ).toBeInTheDocument();
  });

  it("shows zeros, never NaN, when there are no jobs", () => {
    const { container } = render(<JobMetrics rangeLabel="last 30 days" metrics={buildMetrics()} totals={buildMetrics()} />);

    expect(legendValues("Active")).toEqual(["0", "0.0%"]);
    expect(container.textContent).not.toContain("NaN");
  });
});
