import { fireEvent, render, screen } from "@testing-library/react";
import "../test-utils/resize-observer-stub";
import { AdminDashboardView } from "../components/AdminDashboardView";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { buildDashboard } from "../test-utils/dashboard-fixtures";

jest.mock("../hooks/useAdminDashboard");

const mockedUseAdminDashboard = jest.mocked(useAdminDashboard);

type HookResult = ReturnType<typeof useAdminDashboard>;

// Builds the parts of the hook's result the view reads; a test overrides only what it is about.
function hookState(partial: Record<string, unknown> = {}): HookResult {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    isFetching: false,
    isPlaceholderData: false,
    refetch: jest.fn(),
    ...partial,
  } as unknown as HookResult;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseAdminDashboard.mockReturnValue(hookState({ data: buildDashboard() }));
});

// Proves the page shows the right thing for each situation the admin can be in: first load, loaded, switching
// range, and failed, and that the range picker really drives the request.
describe("AdminDashboardView", () => {
  it("asks for the 30-day range on first render", () => {
    render(<AdminDashboardView />);

    expect(mockedUseAdminDashboard).toHaveBeenLastCalledWith("30d");
    expect(screen.getByRole("radio", { name: "30D" })).toHaveAttribute("aria-checked", "true");
  });

  it("shows a skeleton and no numbers while the first load is running", () => {
    mockedUseAdminDashboard.mockReturnValue(hookState({ isLoading: true, isFetching: true }));

    render(<AdminDashboardView />);

    expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("dashboard-content")).not.toBeInTheDocument();
    expect(
      screen.getByText("Platform overview, active metrics, and administrative status.")
    ).toBeInTheDocument();
  });

  it("shows the heading, the admin-only badge and the covered date range once loaded", () => {
    render(<AdminDashboardView />);

    expect(screen.getByRole("heading", { name: "Admin Dashboard", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Admin-only data")).toBeInTheDocument();
    expect(screen.getByText("Platform overview · Sep 1 – Sep 24, 2026")).toBeInTheDocument();
    expect(screen.queryByTestId("dashboard-skeleton")).not.toBeInTheDocument();
  });

  it("shows the key metrics with the selected range in the wording", () => {
    render(<AdminDashboardView />);

    expect(screen.getByText("3,842")).toBeInTheDocument();
    expect(screen.getAllByText(/in the last 30 days$/).length).toBeGreaterThan(0);
  });

  it("shows every panel: the trend, the three status breakdowns and recent activity", () => {
    render(<AdminDashboardView />);

    for (const heading of [
      "Jobs & Recruitment Activity",
      "Applications by status",
      "Employer verification",
      "Jobs by status",
      "Recent platform activity",
    ]) {
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    }
  });

  it("asks for the new range when the admin picks a different preset", () => {
    render(<AdminDashboardView />);

    fireEvent.click(screen.getByRole("radio", { name: "7D" }));

    expect(mockedUseAdminDashboard).toHaveBeenLastCalledWith("7d");
    expect(screen.getByRole("radio", { name: "7D" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getAllByText(/in the last 7 days$/).length).toBeGreaterThan(0);
  });

  it("dims the content while the previous range is shown as a placeholder", () => {
    mockedUseAdminDashboard.mockReturnValue(
      hookState({ data: buildDashboard(), isPlaceholderData: true, isFetching: true })
    );

    render(<AdminDashboardView />);

    expect(screen.getByTestId("dashboard-content")).toHaveClass("opacity-60");
  });

  it("shows the content at full strength once the data is fresh", () => {
    render(<AdminDashboardView />);

    expect(screen.getByTestId("dashboard-content")).toHaveClass("opacity-100");
  });

  it("marks the live region busy only while a request is running", () => {
    const { container, rerender } = render(<AdminDashboardView />);
    expect(container.querySelector("[aria-busy]")).toHaveAttribute("aria-busy", "false");

    mockedUseAdminDashboard.mockReturnValue(hookState({ data: buildDashboard(), isFetching: true }));
    rerender(<AdminDashboardView />);

    expect(container.querySelector("[aria-busy]")).toHaveAttribute("aria-busy", "true");
  });

  it("shows an error banner whose Retry refetches", () => {
    const refetch = jest.fn();
    mockedUseAdminDashboard.mockReturnValue(hookState({ isError: true, refetch }));

    render(<AdminDashboardView />);

    expect(screen.getByRole("alert")).toHaveTextContent("We couldn't load the dashboard data for this range.");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("keeps showing the last numbers next to the error banner when a refresh fails", () => {
    mockedUseAdminDashboard.mockReturnValue(hookState({ data: buildDashboard(), isError: true }));

    render(<AdminDashboardView />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-content")).toBeInTheDocument();
  });

  it("offers Export only once data is loaded and no request is running", () => {
    const { rerender } = render(<AdminDashboardView />);
    expect(screen.getByRole("button", { name: /Export/ })).toBeEnabled();

    mockedUseAdminDashboard.mockReturnValue(hookState({ isLoading: true, isFetching: true }));
    rerender(<AdminDashboardView />);
    expect(screen.getByRole("button", { name: /Export/ })).toBeDisabled();
  });

  it("shows no error banner when everything is fine", () => {
    render(<AdminDashboardView />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
