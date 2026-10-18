import { DASHBOARD_RANGES } from "../constants/dashboard.constants";
import type { DashboardRange } from "../types/admin-dashboard";
import { resolveDashboardRange } from "../utils/date-range";

const NOW = new Date("2026-09-24T12:00:00.000Z");
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// The same rules the backend applies to the requested span, written out here so a change to a preset length
// that would silently move it into another bucket size (or past the 366-day cap) fails a test.
function backendGranularityFor(spanMs: number): "Hour" | "Day" | "Week" | "Month" {
  if (spanMs <= 2 * DAY_MS) return "Hour";
  if (spanMs <= 30 * DAY_MS) return "Day";
  if (spanMs <= 90 * DAY_MS) return "Week";
  return "Month";
}

function spanOf(range: DashboardRange): number {
  const { startDate, endDate } = resolveDashboardRange(range, NOW);
  return new Date(endDate).getTime() - new Date(startDate).getTime();
}

// Proves each preset becomes the calendar-aligned window the API needs and that the presets keep meaning what
// their labels say.
describe("resolveDashboardRange", () => {
  it.each([
    ["24h", "2026-09-23T13:00:00.000Z"],
    ["7d", "2026-09-18T00:00:00.000Z"],
    ["30d", "2026-08-26T00:00:00.000Z"],
    ["90d", "2026-06-27T00:00:00.000Z"],
    ["12m", "2025-10-01T00:00:00.000Z"],
  ] as const)("starts %s on a whole UTC unit, counting the current one", (range, expectedStart) => {
    expect(resolveDashboardRange(range, NOW).startDate).toBe(expectedStart);
  });

  it("aligns the start even when now is mid-hour", () => {
    const midHour = new Date("2026-09-24T12:45:30.000Z");

    expect(resolveDashboardRange("24h", midHour).startDate).toBe("2026-09-23T13:00:00.000Z");
    expect(resolveDashboardRange("7d", midHour).startDate).toBe("2026-09-18T00:00:00.000Z");
  });

  it("crosses a year boundary for 12m in January", () => {
    expect(resolveDashboardRange("12m", new Date("2026-01-15T08:00:00.000Z")).startDate).toBe(
      "2025-02-01T00:00:00.000Z"
    );
  });

  it("ends at now, as a UTC ISO instant", () => {
    const { endDate } = resolveDashboardRange("7d", NOW);

    expect(endDate).toBe("2026-09-24T12:00:00.000Z");
  });

  it.each([
    ["24h", "Hour"],
    ["7d", "Day"],
    ["30d", "Day"],
    ["90d", "Week"],
    ["12m", "Month"],
  ] as const)("gives %s a span the backend buckets as %s", (range, expected) => {
    expect(backendGranularityFor(spanOf(range))).toBe(expected);
  });

  it("keeps every preset inside the backend's 366-day limit", () => {
    for (const { key } of DASHBOARD_RANGES) {
      expect(spanOf(key)).toBeLessThanOrEqual(366 * DAY_MS);
    }
  });

  it("uses the current time when no clock is passed", () => {
    jest.useFakeTimers().setSystemTime(NOW);

    try {
      expect(resolveDashboardRange("24h").endDate).toBe("2026-09-24T12:00:00.000Z");
    } finally {
      jest.useRealTimers();
    }
  });

  it("throws for a preset it does not know", () => {
    expect(() => resolveDashboardRange("1y" as DashboardRange, NOW)).toThrow("Unknown dashboard range: 1y");
  });
});
