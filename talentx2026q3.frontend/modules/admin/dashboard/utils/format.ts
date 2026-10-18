import type { TrendGranularity } from "../types/admin-dashboard";

const numberFormatter = new Intl.NumberFormat("en-US");
const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

// Full number with thousands separators, e.g. 3842 -> "3,842". Used on the cards and in legends.
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

// Short form for tight spaces such as chart axes, e.g. 1200 -> "1.2K".
export function formatCompactNumber(value: number): string {
  return compactNumberFormatter.format(value);
}

// Formats a percentage value (already multiplied by 100) with a fixed number of decimals, e.g. 12.345 -> "12.3%".
export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

// What percentage `part` is of `total`. Returns 0 for an empty total so a panel with no data shows 0% and never NaN.
export function share(part: number, total: number): number {
  return total === 0 ? 0 : (part / total) * 100;
}

// Picks how a trend bucket's date is written, short for axis labels and long for tooltips. Hour buckets are shown
// in the admin's local time; day, week and month buckets are defined in UTC by the backend, so they are shown in
// UTC to match how the data was grouped (otherwise a bucket could appear on the wrong day).
function bucketFormat(
  granularity: TrendGranularity,
  variant: "label" | "tooltip"
): Intl.DateTimeFormatOptions {
  switch (granularity) {
    case "Hour":
      return variant === "label"
        ? { hour: "numeric" }
        : { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };
    case "Day":
      return variant === "label"
        ? { month: "short", day: "numeric", timeZone: "UTC" }
        : { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" };
    case "Week":
      return variant === "label"
        ? { month: "short", day: "numeric", timeZone: "UTC" }
        : { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" };
    default:
      return variant === "label"
        ? { month: "short", timeZone: "UTC" }
        : { month: "long", year: "numeric", timeZone: "UTC" };
  }
}

// Short text for one tick on the trend chart's x axis, e.g. "3 PM", "Sep 10" or "Sep".
export function formatBucketLabel(bucketStart: string, granularity: TrendGranularity): string {
  return new Intl.DateTimeFormat("en-US", bucketFormat(granularity, "label")).format(new Date(bucketStart));
}

// Full description of a bucket for the chart tooltip and the CSV, e.g. "Week of Sep 7, 2026".
export function formatBucketTooltip(bucketStart: string, granularity: TrendGranularity): string {
  const formatted = new Intl.DateTimeFormat("en-US", bucketFormat(granularity, "tooltip")).format(
    new Date(bucketStart)
  );
  return granularity === "Week" ? `Week of ${formatted}` : formatted;
}

// Writes the covered window for the page header, e.g. "Sep 1 – Sep 24, 2026", in the admin's local time. The year
// is repeated on the start only when the range crosses a year boundary.
export function formatRangeSpan(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const sameYear = start.getFullYear() === end.getFullYear();

  const startText = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(start);
  const endText = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(end);

  return `${startText} – ${endText}`;
}
