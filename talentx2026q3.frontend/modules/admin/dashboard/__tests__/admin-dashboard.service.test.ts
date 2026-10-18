import { apiClient } from "@/lib/api/axios";
import { fetchAdminDashboard } from "../services/admin-dashboard.service";
import { buildDashboard } from "../test-utils/dashboard-fixtures";

const WINDOW = { startDate: "2026-09-01T00:00:00.000Z", endDate: "2026-09-24T00:00:00.000Z" };

// The service imports the named `apiClient`, so the mock must provide that name.
jest.mock("@/lib/api/axios", () => ({
  apiClient: { get: jest.fn() },
}));

const mockedGet = jest.mocked(apiClient.get);

afterEach(() => jest.clearAllMocks());

// Proves the service is a thin call: right URL, the window forwarded as query params, the body handed back, with
// missing previous-period fields filled in as "no comparison".
describe("fetchAdminDashboard", () => {
  it("GETs /admin/dashboard with the start and end as query params and returns the dashboard", async () => {
    const dashboard = buildDashboard();
    mockedGet.mockResolvedValueOnce({ data: dashboard });

    const result = await fetchAdminDashboard(WINDOW);

    expect(mockedGet).toHaveBeenCalledWith("/admin/dashboard", { params: WINDOW });
    expect(result).toEqual(dashboard);
  });

  it("fills in the previous-period fields when the API doesn't send them", async () => {
    const dashboard = buildDashboard();
    const { granularity, points } = dashboard.trend;
    mockedGet.mockResolvedValueOnce({ data: { ...dashboard, trend: { granularity, points } } });

    const result = await fetchAdminDashboard(WINDOW);

    expect(result.trend).toEqual({
      granularity,
      points,
      previousPoints: [],
      previousTotals: null,
      previousStartDate: null,
      previousEndDate: null,
    });
  });

  it("lets a failed request reach the caller so the page can show its error state", async () => {
    mockedGet.mockRejectedValueOnce(new Error("Network Error"));

    await expect(
      fetchAdminDashboard({ startDate: "2026-09-01T00:00:00.000Z", endDate: "2026-09-24T00:00:00.000Z" })
    ).rejects.toThrow("Network Error");
  });
});
