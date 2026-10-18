import { render, screen } from "@testing-library/react";
import { RecruitmentFunnel } from "../components/RecruitmentFunnel";
import { buildMetrics } from "../test-utils/dashboard-fixtures";

// Checks all-time counts, the in-range line, conversion rates, bar sizes and the no-data case.
describe("RecruitmentFunnel", () => {
  const totals = buildMetrics({ totalApplications: 90, totalInterviews: 22, totalHires: 3 });
  const metrics = buildMetrics({ totalApplications: 12 });

  it("shows the all-time counts for each stage", () => {
    render(<RecruitmentFunnel metrics={metrics} totals={totals} rangeLabel="last 30 days" />);

    expect(screen.getByText("90")).toBeInTheDocument();
    expect(screen.getByText("22")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows how many applications came in during the range", () => {
    render(<RecruitmentFunnel metrics={metrics} totals={totals} rangeLabel="last 30 days" />);

    expect(screen.getByText("+12 submitted in the last 30 days")).toBeInTheDocument();
  });

  it("shows the interview and hire conversion rates and the hire share of applications", () => {
    render(<RecruitmentFunnel metrics={metrics} totals={totals} rangeLabel="last 30 days" />);

    // 22 / 90 and 3 / 22.
    expect(screen.getByText("24.4%")).toBeInTheDocument();
    expect(screen.getByText("13.6%")).toBeInTheDocument();
    expect(screen.getByText("3.3% of all applications")).toBeInTheDocument();
  });

  it("sizes each bar against all applications", () => {
    render(<RecruitmentFunnel metrics={metrics} totals={totals} rangeLabel="last 30 days" />);

    const bars = screen.getAllByRole("progressbar");
    expect(bars.map((bar) => bar.getAttribute("aria-valuenow"))).toEqual(["100", "24", "3"]);
  });

  it("caps a bar at 100% when interviews outnumber applications", () => {
    render(
      <RecruitmentFunnel
        metrics={metrics}
        totals={buildMetrics({ totalApplications: 10, totalInterviews: 15 })}
        rangeLabel="last 30 days"
      />
    );

    expect(screen.getByRole("progressbar", { name: "Interviews compared with all applications" })).toHaveAttribute(
      "aria-valuenow",
      "100"
    );
  });

  it("shows 0% everywhere and never NaN when there is no data", () => {
    const { container } = render(
      <RecruitmentFunnel metrics={buildMetrics()} totals={buildMetrics()} rangeLabel="last 30 days" />
    );

    expect(screen.getAllByText("0.0%")).toHaveLength(2);
    expect(screen.getByText("0.0% of all applications")).toBeInTheDocument();
    expect(container.textContent).not.toContain("NaN");
  });
});
