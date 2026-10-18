import { apiClient } from "@/lib/api/axios";
import type { AdminDashboard, AdminDashboardQueryParams, DashboardTrend } from "../types/admin-dashboard";

// The previous-period fields of the trend, which older or partially deployed APIs don't send yet.
type PreviousPeriodField = "previousPoints" | "previousTotals" | "previousStartDate" | "previousEndDate";

// The dashboard as the API may return it: everything, except that the previous-period fields can be missing.
type AdminDashboardResponse = Omit<AdminDashboard, "trend"> & {
  trend: Omit<DashboardTrend, PreviousPeriodField> & Partial<Pick<DashboardTrend, PreviousPeriodField>>;
};

// Fills in missing previous-period fields as "no comparison", so the chart hides it instead of crashing.
function withPreviousPeriodDefaults(dashboard: AdminDashboardResponse): AdminDashboard {
  const { trend } = dashboard;
  return {
    ...dashboard,
    trend: {
      ...trend,
      previousPoints: trend.previousPoints ?? [],
      previousTotals: trend.previousTotals ?? null,
      previousStartDate: trend.previousStartDate ?? null,
      previousEndDate: trend.previousEndDate ?? null,
    },
  };
}

// Calls GET /admin/dashboard for the given window and returns everything the dashboard shows. All numbers are
// computed by the backend, so the frontend only renders what comes back; the endpoint itself is Admin-only.
export async function fetchAdminDashboard(
  params: AdminDashboardQueryParams
): Promise<AdminDashboard> {
  const response = await apiClient.get<AdminDashboardResponse>("/admin/dashboard", { params });
  return withPreviousPeriodDefaults(response.data);
}
