import { render, screen, within } from "@testing-library/react";
import { PeopleMetrics } from "../components/PeopleMetrics";
import { buildMetrics } from "../test-utils/dashboard-fixtures";

// Finds the card that contains a label.
function cardFor(label: string): HTMLElement {
  return screen.getByText(label).closest("div.rounded-2xl") as HTMLElement;
}

// Checks the four cards: totals, "+N new in the range", verified share, and the pending card's highlight and link.
describe("PeopleMetrics", () => {
  const totals = buildMetrics({
    totalTalents: 33,
    totalEmployers: 28,
    verifiedEmployers: 22,
    pendingEmployerVerifications: 6,
  });
  const metrics = buildMetrics({ totalTalents: 5, totalEmployers: 3 });

  it("shows talents and employers as totals with the new ones in the range", () => {
    render(<PeopleMetrics rangeLabel="last 30 days" metrics={metrics} totals={totals} />);

    expect(within(cardFor("Talents")).getByText("33")).toBeInTheDocument();
    expect(within(cardFor("Talents")).getByText("+5")).toBeInTheDocument();
    expect(within(cardFor("Employers")).getByText("28")).toBeInTheDocument();
    expect(within(cardFor("Employers")).getByText("+3")).toBeInTheDocument();
    expect(screen.getAllByText("new in the last 30 days")).toHaveLength(2);
  });

  it("shows verified employers with their share of all employers", () => {
    render(<PeopleMetrics rangeLabel="last 30 days" metrics={metrics} totals={totals} />);

    // 22 / 28.
    expect(screen.getByText("79% of all employers")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Verified share of all employers" })).toHaveAttribute(
      "aria-valuenow",
      "79"
    );
  });

  it("highlights pending verification and links to the review queue while employers wait", () => {
    render(<PeopleMetrics rangeLabel="last 30 days" metrics={metrics} totals={totals} />);

    const pending = screen.getByTestId("pending-verification-card");
    expect(pending).toHaveClass("bg-amber-50");
    expect(within(pending).getByText("6")).toBeInTheDocument();
    expect(within(pending).getByRole("link", { name: /Review queue/ })).toHaveAttribute("href", "/admin/employers");
  });

  it("shows a plain pending card without a link when nobody is waiting", () => {
    render(<PeopleMetrics rangeLabel="last 30 days" metrics={metrics} totals={{ ...totals, pendingEmployerVerifications: 0 }} />);

    expect(screen.queryByTestId("pending-verification-card")).not.toBeInTheDocument();
    expect(screen.getByText("Nobody is waiting")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Review queue/ })).not.toBeInTheDocument();
  });

  it("shows 0% verified, never NaN, when there are no employers", () => {
    const { container } = render(<PeopleMetrics rangeLabel="last 30 days" metrics={buildMetrics()} totals={buildMetrics()} />);

    expect(screen.getByText("0% of all employers")).toBeInTheDocument();
    expect(container.textContent).not.toContain("NaN");
  });
});
