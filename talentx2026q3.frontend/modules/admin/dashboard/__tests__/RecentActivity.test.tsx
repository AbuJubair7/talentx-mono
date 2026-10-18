import { fireEvent, render, screen, within } from "@testing-library/react";
import { RecentActivity } from "../components/RecentActivity";
import { buildDashboard } from "../test-utils/dashboard-fixtures";

const ACTIVITIES = buildDashboard().activities;

// Checks the tabs and counts, filtering, row content, the verification badge and the empty state.
describe("RecentActivity", () => {
  it("names the range in the subtitle", () => {
    render(<RecentActivity activities={ACTIVITIES} rangeLabel="last 7 days" />);

    expect(
      screen.getByText("Newest talents, employers and published jobs in the last 7 days")
    ).toBeInTheDocument();
  });

  it("links View more to the audit log", () => {
    render(<RecentActivity activities={ACTIVITIES} rangeLabel="last 30 days" />);

    expect(screen.getByRole("link", { name: /View more/ })).toHaveAttribute("href", "/admin/audit-log");
  });

  it("shows a tab per type with its count, All selected first", () => {
    render(<RecentActivity activities={ACTIVITIES} rangeLabel="last 30 days" />);

    expect(screen.getByRole("tab", { name: "All 3" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Talents 1" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Employers 1" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Jobs 1" })).toBeInTheDocument();
  });

  it("lists every activity with its action and detail under All", () => {
    render(<RecentActivity activities={ACTIVITIES} rangeLabel="last 30 days" />);

    const list = within(screen.getByRole("tabpanel"));
    expect(list.getAllByRole("listitem")).toHaveLength(3);
    expect(list.getByText("Job published · Northwind Labs · Remote")).toBeInTheDocument();
    expect(list.getByText("Talent registered · Data Analyst · Dubai")).toBeInTheDocument();
  });

  it("shows only the chosen type when a tab is clicked", () => {
    render(<RecentActivity activities={ACTIVITIES} rangeLabel="last 30 days" />);

    fireEvent.click(screen.getByRole("tab", { name: "Jobs 1" }));

    const list = within(screen.getByRole("tabpanel"));
    expect(list.getAllByRole("listitem")).toHaveLength(1);
    expect(list.getByText("Senior Designer")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Jobs 1" })).toHaveAttribute("aria-selected", "true");
  });

  it("shows the verification badge on employers only", () => {
    render(<RecentActivity activities={ACTIVITIES} rangeLabel="last 30 days" />);

    expect(screen.getByText("Pending")).toHaveClass("bg-amber-100");
    expect(screen.getAllByText(/^(Verified|Pending|Rejected)$/)).toHaveLength(1);
  });

  it("shows a relative time with the exact time in the markup", () => {
    render(<RecentActivity activities={ACTIVITIES} rangeLabel="last 30 days" />);

    expect(screen.getAllByRole("listitem")[0].querySelector("time")).toHaveAttribute(
      "datetime",
      "2026-09-10T11:00:00Z"
    );
  });

  it("drops the separator when an activity has no detail", () => {
    render(
      <RecentActivity
        activities={[{ ...ACTIVITIES[2], detail: "" }]}
        rangeLabel="last 30 days"
      />
    );

    expect(screen.getByText("Talent registered")).toBeInTheDocument();
  });

  it("shows an empty state for a tab with nothing in it", () => {
    render(<RecentActivity activities={[ACTIVITIES[2]]} rangeLabel="last 24 hours" />);

    fireEvent.click(screen.getByRole("tab", { name: "Jobs 0" }));

    expect(screen.getByText("No activity in the last 24 hours")).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});
