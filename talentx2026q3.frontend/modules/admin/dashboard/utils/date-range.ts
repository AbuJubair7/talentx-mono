import { DASHBOARD_RANGES, type DashboardRangeUnit } from "../constants/dashboard.constants";
import type { AdminDashboardQueryParams, DashboardRange } from "../types/admin-dashboard";

// The start of the UTC hour, day or month `count - 1` units before the one containing `now`, so the range
// covers `count` whole calendar units including the current one.
function alignedStart(now: Date, unit: DashboardRangeUnit, count: number): Date {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();

  switch (unit) {
    case "hour":
      return new Date(Date.UTC(year, month, day, now.getUTCHours() - (count - 1)));
    case "day":
      return new Date(Date.UTC(year, month, day - (count - 1)));
    case "month":
      return new Date(Date.UTC(year, month - (count - 1), 1));
  }
}

// Turns a preset like "7d" into the UTC start and end the API expects: from the start of a whole calendar unit
// (hour, day or month) up to `now`, so every trend bucket is complete except the current one.
// `now` is a parameter so tests can pin the clock.
export function resolveDashboardRange(
  range: DashboardRange,
  now: Date = new Date()
): AdminDashboardQueryParams {
  const config = DASHBOARD_RANGES.find((candidate) => candidate.key === range);
  if (!config) {
    throw new Error(`Unknown dashboard range: ${range}`);
  }

  return {
    startDate: alignedStart(now, config.unit, config.count).toISOString(),
    endDate: now.toISOString(),
  };
}
