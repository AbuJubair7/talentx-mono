import { render, screen, within } from "@testing-library/react";
import { KeyMetrics } from "../components/KeyMetrics";
import { buildMetrics } from "../test-utils/dashboard-fixtures";

// Checks the three titled sections and that each gets the right numbers.
describe("KeyMetrics", () => {
  const totals = buildMetrics({ totalApplications: 90, totalTalents: 33, totalJobs: 107 });
  const metrics = buildMetrics({ totalApplications: 12 });

  it("shows the recruitment funnel, talents & employers and jobs sections", () => {
    render(<KeyMetrics metrics={metrics} totals={totals} rangeLabel="last 30 days" />);

    expect(screen.getByRole("region", { name: "Recruitment funnel" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Talents & employers" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Jobs" })).toBeInTheDocument();
  });

  it("passes the numbers and range wording to each section", () => {
    render(<KeyMetrics metrics={metrics} totals={totals} rangeLabel="last 24 hours" />);

    const funnel = within(screen.getByRole("region", { name: "Recruitment funnel" }));
    expect(funnel.getByText("90")).toBeInTheDocument();
    expect(funnel.getByText("+12 submitted in the last 24 hours")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Talents & employers" })).getByText("33")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Jobs" })).getByText("107")).toBeInTheDocument();
  });
});
