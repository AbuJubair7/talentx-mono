import type { DashboardTrendPoint, TrendGranularity } from "../types/admin-dashboard";
import type { TrendSeriesKey } from "../constants/dashboard.constants";
import { TREND_SERIES } from "../constants/dashboard.constants";
import { formatBucketLabel } from "./format";

// Below this many events across both periods, a swing (e.g. 2 -> 4) is too noisy to show as a percentage.
export const MIN_TOTAL_FOR_DELTA = 10;
// Below this previous total a percentage exaggerates (1 -> 20 reads as ↑1,900%), so only the absolute change is shown.
export const MIN_BASELINE_FOR_PERCENT = 5;
// How far above its own average a bucket must be to count as a real peak, not just noise.
export const PEAK_MULTIPLIER = 1.5;
// Below this many events in the series, one busy bucket ("1 of 3 events on Monday = 3× the average") isn't a real peak.
export const MIN_TOTAL_FOR_PEAK = 10;
// Below this many applications in the period, "1 hire out of 1 application = 100" says nothing, so no ratio is shown.
export const MIN_APPLICATIONS_FOR_RATIO = 10;

// One series' change from the previous period to the selected range.
export interface SeriesDelta {
  current: number;
  previous: number;
  absolute: number;
  // Null when the previous total is under MIN_BASELINE_FOR_PERCENT (including zero): a percent off a tiny base is
  // meaningless or exaggerated, so only the absolute change is shown.
  percent: number | null;
}

// Total of one series across the given points.
function sumSeries(points: DashboardTrendPoint[], key: TrendSeriesKey): number {
  return points.reduce((sum, point) => sum + point[key], 0);
}

// Compares one series' total in the range with its total in the previous period, or null when there isn't enough
// data to trust the comparison.
export function computeSeriesDelta(
  points: DashboardTrendPoint[],
  key: TrendSeriesKey,
  previous: number
): SeriesDelta | null {
  const current = sumSeries(points, key);
  if (current + previous < MIN_TOTAL_FOR_DELTA) return null;

  return {
    current,
    previous,
    absolute: current - previous,
    percent: previous < MIN_BASELINE_FOR_PERCENT ? null : ((current - previous) / previous) * 100,
  };
}

// The series with the most events this period among `keys` (all four by default, or just the visible ones), used to
// pick which series the peak insight describes. Only the series are compared with each other; their totals are never
// added together, since jobs, applications, interviews and hires are different kinds of events. A tie goes to the
// series listed first.
export function findBusiestSeries(
  points: DashboardTrendPoint[],
  keys: readonly TrendSeriesKey[] = TREND_SERIES.map((series) => series.key)
): TrendSeriesKey | null {
  if (keys.length === 0) return null;
  const totals = keys.map((key) => ({ key, total: sumSeries(points, key) }));
  const top = totals.reduce((max, entry) => (entry.total > max.total ? entry : max));
  return top.total > 0 ? top.key : null;
}

// The busiest single bucket for one series, only when it's meaningfully above that series' own average.
export interface PeakInsight {
  // Which series the peak belongs to, so the insight can say "21 published jobs", not just "21".
  key: TrendSeriesKey;
  bucketLabel: string;
  value: number;
  multiple: number;
}

// The series' standout bucket, or null when the series is too small (MIN_TOTAL_FOR_PEAK) or no bucket stands out
// (PEAK_MULTIPLIER). The average counts every bucket in the range, empty ones included (the backend zero-fills them).
export function computePeakInsight(
  points: DashboardTrendPoint[],
  key: TrendSeriesKey,
  granularity: TrendGranularity
): PeakInsight | null {
  const total = sumSeries(points, key);
  if (points.length === 0 || total < MIN_TOTAL_FOR_PEAK) return null;

  const average = total / points.length;
  // The strict `>` keeps the earliest bucket when several share the highest value.
  const peak = points.reduce((max, point) => (point[key] > max[key] ? point : max));
  const multiple = peak[key] / average;
  if (multiple < PEAK_MULTIPLIER) return null;

  return { key, bucketLabel: formatBucketLabel(peak.bucketStart, granularity), value: peak[key], multiple };
}

// Hires for every 100 applications in the same period. Not a cohort conversion rate: a hire in the period may come
// from an application sent before it, so the value is capped at 100.
export interface HireRatioInsight {
  perHundred: number;
  applications: number;
  hires: number;
}

// Hires per 100 applications in the period, or null when there are too few applications for the ratio to mean anything.
export function computeHireRatioInsight(points: DashboardTrendPoint[]): HireRatioInsight | null {
  const applications = sumSeries(points, "applications");
  if (applications < MIN_APPLICATIONS_FOR_RATIO) return null;

  const hires = sumSeries(points, "hires");
  return { perHundred: Math.min((hires / applications) * 100, 100), applications, hires };
}
