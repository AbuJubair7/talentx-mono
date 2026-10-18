import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchAdminDashboard } from "../services/admin-dashboard.service";
import type { DashboardRange } from "../types/admin-dashboard";
import { resolveDashboardRange } from "../utils/date-range";

// React Query cache keys for the dashboard: one entry per range preset, all under a common prefix so the whole
// dashboard can be invalidated at once.
export const adminDashboardKeys = {
  all: ["admin", "dashboard"] as const,
  range: (range: DashboardRange) => [...adminDashboardKeys.all, range] as const,
};

// Loads the dashboard for the selected preset and caches each preset separately, so switching back to a range
// seen a moment ago is instant. While a new range loads, the previous numbers stay on screen instead of flashing
// empty, which is what lets the page dim rather than reload.
export function useAdminDashboard(range: DashboardRange) {
  return useQuery({
    // Keyed by the preset, not the timestamps: `now` is resolved inside the query function, so the key stays
    // stable across renders instead of changing every millisecond.
    queryKey: adminDashboardKeys.range(range),
    queryFn: () => fetchAdminDashboard(resolveDashboardRange(range)),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
