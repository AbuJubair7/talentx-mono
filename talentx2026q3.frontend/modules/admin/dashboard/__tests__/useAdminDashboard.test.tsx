import { renderHook, waitFor } from "@testing-library/react";
import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper";
import { adminDashboardKeys, useAdminDashboard } from "../hooks/useAdminDashboard";
import { fetchAdminDashboard } from "../services/admin-dashboard.service";
import type { AdminDashboard, DashboardRange } from "../types/admin-dashboard";

jest.mock("../services/admin-dashboard.service");

const mockedFetchAdminDashboard = jest.mocked(fetchAdminDashboard);

function dashboardNamed(marker: string): AdminDashboard {
  return { startDate: marker } as AdminDashboard;
}

afterEach(() => jest.clearAllMocks());

// Proves the cache keys separate one entry per preset under a shared prefix.
describe("adminDashboardKeys", () => {
  it("builds one key per range under the shared dashboard prefix", () => {
    expect(adminDashboardKeys.all).toEqual(["admin", "dashboard"]);
    expect(adminDashboardKeys.range("7d")).toEqual(["admin", "dashboard", "7d"]);
    expect(adminDashboardKeys.range("7d")).not.toEqual(adminDashboardKeys.range("30d"));
  });
});

// Proves the hook turns a preset into the right request, keeps the old numbers up while a new range loads, and
// surfaces failures so the page can show its error state.
describe("useAdminDashboard", () => {
  it("requests the window that ends now and starts at UTC midnight six days earlier for 7d", async () => {
    const dashboard = dashboardNamed("7d");
    mockedFetchAdminDashboard.mockResolvedValueOnce(dashboard);

    const { result } = renderHook(() => useAdminDashboard("7d"), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(dashboard);
    const { startDate, endDate } = mockedFetchAdminDashboard.mock.calls[0][0];
    const end = new Date(endDate);
    const expectedStart = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() - 6));
    expect(startDate).toBe(expectedStart.toISOString());
  });

  it("keeps the previous range's data on screen while the next range loads", async () => {
    mockedFetchAdminDashboard.mockResolvedValueOnce(dashboardNamed("30d"));
    let resolveSecond: (value: AdminDashboard) => void = () => undefined;
    mockedFetchAdminDashboard.mockReturnValueOnce(
      new Promise<AdminDashboard>((resolve) => {
        resolveSecond = resolve;
      })
    );

    const { result, rerender } = renderHook(({ range }: { range: DashboardRange }) => useAdminDashboard(range), {
      wrapper: createQueryWrapper(),
      initialProps: { range: "30d" },
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ range: "24h" });

    await waitFor(() => expect(result.current.isPlaceholderData).toBe(true));
    expect(result.current.data?.startDate).toBe("30d");

    resolveSecond(dashboardNamed("24h"));
    await waitFor(() => expect(result.current.data?.startDate).toBe("24h"));
  });

  it("reports an error when the request fails", async () => {
    mockedFetchAdminDashboard.mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() => useAdminDashboard("30d"), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error("Network Error"));
  });
});
