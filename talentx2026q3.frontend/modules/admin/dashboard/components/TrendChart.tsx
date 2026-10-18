"use client";

import { LineChart as LineChartIcon } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { TREND_SERIES, type TrendSeriesKey } from "../constants/dashboard.constants";
import type { DashboardTrend, DashboardTrendPoint, TrendGranularity } from "../types/admin-dashboard";
import {
  formatBucketLabel,
  formatBucketTooltip,
  formatCompactNumber,
  formatNumber,
  formatRangeSpan,
} from "../utils/format";
import {
  computeHireRatioInsight,
  computePeakInsight,
  findBusiestSeries,
  computeSeriesDelta,
  type SeriesDelta,
} from "../utils/trend-insights";
import { DashboardPanel } from "./DashboardPanel";

// What the chart needs: the whole trend (bucket size, one point per bucket, previous-period totals) and how to name
// the selected range and the period it is compared with.
interface TrendChartProps {
  trend: DashboardTrend;
  rangeLabel: string;
  comparisonLabel: string;
}

// A trend point with its tooltip date added, plus the previous period's bucket at the same position (both windows have
// the same buckets), so the tooltip and the dashed comparison lines don't recompute anything on hover.
type ChartRow = DashboardTrendPoint & {
  fullLabel: string;
  previous: DashboardTrendPoint | null;
  previousLabel: string | null;
};

// Where this browser remembers whether the admin wants the previous period drawn.
const COMPARE_STORAGE_KEY = "admin-dashboard:compare-previous";

// Reads the saved "Compare to previous" choice; off when storage is unavailable (private mode, blocked site data).
function readComparePreference(): boolean {
  try {
    return window.localStorage.getItem(COMPARE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

// Saves the "Compare to previous" choice; a failure only means it isn't remembered next time.
function saveComparePreference(enabled: boolean): void {
  try {
    window.localStorage.setItem(COMPARE_STORAGE_KEY, String(enabled));
  } catch {
    // Not remembered; the toggle still works for this visit.
  }
}

// How the bucket size is described in the panel subtitle.
const GRANULARITY_LABELS: Record<TrendGranularity, string> = {
  Hour: "Hourly",
  Day: "Daily",
  Week: "Weekly",
  Month: "Monthly",
};

// How the standout bucket is labeled in the insight row, matching the bucket size.
const PEAK_INSIGHT_LABELS: Record<TrendGranularity, string> = {
  Hour: "Peak hour",
  Day: "Peak day",
  Week: "Peak week",
  Month: "Peak month",
};

// How one and several events of each series are written in the peak insight, e.g. "21 published jobs".
const SERIES_UNITS: Record<TrendSeriesKey, [singular: string, plural: string]> = {
  publishedJobs: ["published job", "published jobs"],
  applications: ["application", "applications"],
  interviews: ["interview", "interviews"],
  hires: ["hire", "hires"],
};

// A fixed pixel size for the print-only chart. Printed pages don't fire the resize events recharts'
// ResponsiveContainer relies on, so it keeps its wide on-screen size and clips off the printed page;
// a literal size sidesteps that entirely, the same way the fixed-size donut charts already print fine.
const PRINT_CHART_WIDTH = 620;
const PRINT_CHART_HEIGHT = 260;

// The hover card for one point in time: the period, then every series' value at that moment (all four, even a
// hidden one, so the admin can compare without toggling). With the comparison on, it also names the matching previous
// bucket and shows each series' value there.
export function TrendTooltip({
  active,
  payload,
  showPrevious = false,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartRow }>;
  showPrevious?: boolean;
}) {
  if (!active || !payload?.length) return null;

  const row = payload[0].payload;
  const previous = showPrevious ? row.previous : null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="text-xs text-zinc-500 dark:text-slate-400">{row.fullLabel}</p>
      {previous && <p className="text-xs text-zinc-400 dark:text-slate-500">vs {row.previousLabel}</p>}
      {TREND_SERIES.map((series) => (
        <p key={series.key} className="mt-1 flex items-center justify-between gap-6 text-sm">
          <span className="flex items-center gap-1.5 text-zinc-600 dark:text-slate-300">
            <span className="size-2 rounded-full" style={{ backgroundColor: series.color }} aria-hidden="true" />
            {series.label}
          </span>
          <span className="tabular-nums">
            <span className="font-semibold text-zinc-900 dark:text-slate-100">{formatNumber(row[series.key])}</span>
            {previous && (
              <span className="text-zinc-400 dark:text-slate-500"> · {formatNumber(previous[series.key])}</span>
            )}
          </span>
        </p>
      ))}
    </div>
  );
}

// Whole-number percent change, so the arrow always agrees with the number shown (a 0.4% rise reads as flat, not ↑0%).
function roundedPercent(delta: SeriesDelta): number | null {
  return delta.percent === null ? null : Math.round(delta.percent);
}

// Signed absolute change, e.g. "+12", "-3", "+0".
function formatSignedNumber(value: number): string {
  return `${value >= 0 ? "+" : ""}${formatNumber(value)}`;
}

// The change as a sentence, for screen readers and the chip's hover text, e.g.
// "Up 60% vs the previous 30 days (20 → 32)", or "Up 37 vs …" when the previous total is too small for a percent.
function describeDelta(delta: SeriesDelta, comparisonLabel: string): string {
  const percent = roundedPercent(delta);
  const counts = `(${formatNumber(delta.previous)} → ${formatNumber(delta.current)})`;
  if (delta.previous === 0) return `New vs the ${comparisonLabel} ${counts}`;
  const change = percent === null ? delta.absolute : percent;
  if (change === 0) return `About the same as the ${comparisonLabel} ${counts}`;
  const amount = percent === null ? formatNumber(Math.abs(change)) : `${formatNumber(Math.abs(change))}%`;
  return `${change > 0 ? "Up" : "Down"} ${amount} vs the ${comparisonLabel} ${counts}`;
}

// A series chip's delta badge: arrow, percent and absolute change, or just the absolute change ("+37") when the
// previous total is too small for a meaningful percent.
// aria-hidden: screen readers get the sentence from describeDelta instead, as the chip's description.
function DeltaBadge({ delta }: { delta: SeriesDelta }) {
  const percent = roundedPercent(delta);
  const text =
    percent === null
      ? formatSignedNumber(delta.absolute)
      : `${percent > 0 ? "↑" : percent < 0 ? "↓" : "→"}${formatNumber(Math.abs(percent))}% (${formatSignedNumber(delta.absolute)})`;

  return (
    <span aria-hidden="true" className="text-[10px] font-normal text-zinc-400 dark:text-slate-500">
      {text}
    </span>
  );
}

// Shows how published jobs, applications, interviews and hires moved over the selected period, all four on one chart so
// their spikes can be compared at a glance. Applications are usually far more numerous than hires, so the chips above
// the chart hide or show each line: hiding the big one lets the small ones fill the chart. At least one line always
// stays visible, and a period with no activity at all shows a message instead of a flat chart.
export function TrendChart({ trend, rangeLabel, comparisonLabel }: TrendChartProps) {
  const [hiddenSeries, setHiddenSeries] = useState<ReadonlySet<TrendSeriesKey>>(new Set());
  // Read once on mount: the chart only renders in the browser after the data loads, so there's no server render to
  // disagree with.
  const [comparePrevious, setComparePrevious] = useState(readComparePreference);
  const descriptionIdPrefix = useId();

  const rows: ChartRow[] = useMemo(
    () =>
      trend.points.map((point, index) => {
        const previous = trend.previousPoints[index] ?? null;
        return {
          ...point,
          fullLabel: formatBucketTooltip(point.bucketStart, trend.granularity),
          previous,
          previousLabel: previous ? formatBucketTooltip(previous.bucketStart, trend.granularity) : null,
        };
      }),
    [trend]
  );
  // The axis is keyed on the unique bucketStart, not the short label: short labels can repeat (two "3 PM"s or two
  // "Oct"s), and recharts resolves a hovered point by its key, so a repeat showed the wrong bucket's tooltip.
  const formatTick = (bucketStart: string) => formatBucketLabel(bucketStart, trend.granularity);
  const hasActivity = rows.some((row) =>
    TREND_SERIES.some((series) => row[series.key] > 0)
  );
  const visibleSeries = TREND_SERIES.filter((series) => !hiddenSeries.has(series.key));
  const canCompare = hasActivity && trend.previousPoints.length > 0;
  const showPrevious = canCompare && comparePrevious;

  // The previous period as a faded, dashed copy of each visible line, in the same colour. Built once and placed in both
  // the on-screen and the print chart.
  const previousLines = showPrevious
    ? visibleSeries.map((series) => (
        <Line
          key={`${series.key}-previous`}
          className="trend-previous-line"
          type="monotone"
          dataKey={(row: ChartRow) => row.previous?.[series.key] ?? null}
          stroke={series.color}
          strokeOpacity={0.45}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={false}
          activeDot={false}
          legendType="none"
          isAnimationActive={false}
        />
      ))
    : null;

  // Turns the previous-period lines on or off and remembers the choice in this browser.
  const toggleComparePrevious = () => {
    setComparePrevious((current) => {
      saveComparePreference(!current);
      return !current;
    });
  };

  // Each series' change against the previous period (none at all when the API sent no previous totals), and the dates
  // of that period for the chips' hover text.
  const deltas = useMemo(() => {
    const previousTotals = trend.previousTotals;
    return Object.fromEntries(
      TREND_SERIES.map((series) => [
        series.key,
        previousTotals ? computeSeriesDelta(trend.points, series.key, previousTotals[series.key]) : null,
      ])
    ) as Record<TrendSeriesKey, SeriesDelta | null>;
  }, [trend.points, trend.previousTotals]);
  const hasAnyDelta = TREND_SERIES.some((series) => deltas[series.key] !== null);
  const previousSpan =
    trend.previousStartDate && trend.previousEndDate
      ? formatRangeSpan(trend.previousStartDate, trend.previousEndDate)
      : null;

  // The standout bucket (if any) of the busiest visible series, so hiding a line also moves the peak to what's shown,
  // and hires per 100 applications.
  const peakInsight = useMemo(() => {
    const visibleKeys = TREND_SERIES.filter((series) => !hiddenSeries.has(series.key)).map((series) => series.key);
    const busiest = findBusiestSeries(trend.points, visibleKeys);
    return busiest ? computePeakInsight(trend.points, busiest, trend.granularity) : null;
  }, [trend.points, trend.granularity, hiddenSeries]);
  const hireRatio = useMemo(() => computeHireRatioInsight(trend.points), [trend.points]);
  const hasInsights = peakInsight !== null || hireRatio !== null;

  // Flips one line on or off, but refuses to hide the last visible one.
  const toggleSeries = (key: TrendSeriesKey) => {
    setHiddenSeries((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else if (next.size < TREND_SERIES.length - 1) {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <DashboardPanel
      id="recruitment-trend"
      title="Jobs & Recruitment Activity"
      description={`${GRANULARITY_LABELS[trend.granularity]} activity in the ${rangeLabel}`}
      action={
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex flex-wrap justify-end gap-2" role="group" aria-label="Show or hide series">
            {TREND_SERIES.map((series) => {
              const isVisible = !hiddenSeries.has(series.key);
              const delta = deltas[series.key];
              const description = delta ? describeDelta(delta, comparisonLabel) : null;
              const descriptionId = `${descriptionIdPrefix}-${series.key}`;
              return (
                <span key={series.key} className="contents">
                  <button
                    type="button"
                    aria-pressed={isVisible}
                    aria-describedby={description ? descriptionId : undefined}
                    title={description ? [description, previousSpan].filter(Boolean).join(", ") : undefined}
                    onClick={() => toggleSeries(series.key)}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none",
                      isVisible
                        ? "border-zinc-300 text-zinc-900 dark:border-slate-600 dark:text-slate-100"
                        : "border-zinc-200 text-zinc-400 line-through dark:border-slate-800 dark:text-slate-500"
                    )}
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: isVisible ? series.color : "#D0D5DD" }}
                      aria-hidden="true"
                    />
                    {series.label}
                    {delta && <DeltaBadge delta={delta} />}
                  </button>
                  {/* Outside the button so it describes the chip without becoming part of its name. */}
                  {description && (
                    <span id={descriptionId} className="sr-only">
                      {description}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
            {hasAnyDelta && (
              <p className="text-[11px] text-zinc-500 dark:text-slate-400">Change vs {comparisonLabel}</p>
            )}
            {canCompare && (
              <button
                type="button"
                aria-pressed={comparePrevious}
                onClick={toggleComparePrevious}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none",
                  comparePrevious
                    ? "border-zinc-400 bg-zinc-100 text-zinc-900 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
                    : "border-zinc-200 text-zinc-500 dark:border-slate-700 dark:text-slate-400"
                )}
              >
                <span className="w-3 border-t border-dashed border-current" aria-hidden="true" />
                Compare to previous
              </button>
            )}
          </div>
          {showPrevious && visibleSeries.length > 1 && (
            <p className="text-[11px] text-zinc-400 dark:text-slate-500">Tip: hide series to compare one at a time.</p>
          )}
        </div>
      }
    >
      {hasActivity ? (
        <>
          <div
            className="h-72 w-full print:hidden"
            role="img"
            aria-label={`${GRANULARITY_LABELS[trend.granularity]} trend of published jobs, applications, interviews and hires`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="#E4E7EC" />
                <XAxis
                  dataKey="bucketStart"
                  tickFormatter={formatTick}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#667085", fontSize: 12 }}
                  minTickGap={24}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  allowDecimals={false}
                  tick={{ fill: "#667085", fontSize: 12 }}
                  tickFormatter={(value: number) => formatCompactNumber(value)}
                />
                <Tooltip
                  cursor={{ stroke: "#D0D5DD", strokeWidth: 1 }}
                  isAnimationActive={false}
                  content={<TrendTooltip showPrevious={showPrevious} />}
                />
                {previousLines}
                {visibleSeries.map((series) => (
                  <Line
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    stroke={series.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: "#FFFFFF" }}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Print-only duplicate. Drawn at a fixed size (recharts needs literal pixels), then stretched to the full
              print width by CSS (globals.css), which keeps its proportions instead of leaving it half-width. */}
          <div aria-hidden="true" className="print-trend-chart hidden print:block">
            <LineChart
              width={PRINT_CHART_WIDTH}
              height={PRINT_CHART_HEIGHT}
              data={rows}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid vertical={false} stroke="#E4E7EC" />
              <XAxis
                dataKey="bucketStart"
                tickFormatter={formatTick}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#667085", fontSize: 12 }}
                minTickGap={24}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                allowDecimals={false}
                tick={{ fill: "#667085", fontSize: 12 }}
                tickFormatter={(value: number) => formatCompactNumber(value)}
              />
              {previousLines}
              {visibleSeries.map((series) => (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  stroke={series.color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </div>

          {hasInsights && (
            <dl className="mt-4 grid grid-cols-1 gap-4 border-t border-zinc-200/80 pt-4 sm:grid-cols-2 dark:border-slate-800">
              {peakInsight && (
                <div>
                  <dt className="text-[13px] text-zinc-500 dark:text-slate-400">{PEAK_INSIGHT_LABELS[trend.granularity]}</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-slate-100">
                    {peakInsight.bucketLabel} · {formatNumber(peakInsight.value)}{" "}
                    {SERIES_UNITS[peakInsight.key][peakInsight.value === 1 ? 0 : 1]}
                  </dd>
                  <dd className="text-xs text-zinc-500 dark:text-slate-400">
                    {peakInsight.multiple.toFixed(1)}× the average
                  </dd>
                </div>
              )}
              {hireRatio && (
                <div>
                  <dt className="text-[13px] text-zinc-500 dark:text-slate-400">Hires per 100 applications</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-slate-100">
                    {hireRatio.perHundred.toFixed(1)}
                  </dd>
                  <dd className="text-xs text-zinc-500 dark:text-slate-400">
                    {formatNumber(hireRatio.hires)} {hireRatio.hires === 1 ? "hire" : "hires"} and{" "}
                    {formatNumber(hireRatio.applications)} applications this period
                  </dd>
                </div>
              )}
            </dl>
          )}
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <LineChartIcon className="size-6 text-zinc-400 dark:text-slate-500" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-slate-100">No activity in the {rangeLabel}</p>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-slate-400">Try a wider date range.</p>
        </div>
      )}
    </DashboardPanel>
  );
}
