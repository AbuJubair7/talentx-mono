import {
  APPLICATION_STATUS_LABELS,
  JOB_STATUS_LABELS,
  METRIC_LABELS,
  TREND_SERIES,
  VERIFICATION_STATUS_LABELS,
} from "../constants/dashboard.constants";
import type { AdminDashboard, DashboardMetrics, DashboardRange } from "../types/admin-dashboard";
import { formatBucketTooltip, formatPercent, formatRangeSpan, share } from "./format";

// One spreadsheet cell; everything is written out as text in the CSV.
type Cell = string | number;

// Makes a value safe to put in a CSV: prefixes a leading =, +, - or @ with a quote mark so Excel/Sheets can't run it
// as a formula, then wraps it in quotes and doubles inner quotes when it contains a comma, quote or line break, so
// names like `Acme, Inc.` do not spill into the next column.
function escapeCell(cell: Cell): string {
  const raw = String(cell);
  const value = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

// Lays out one titled table: the title, a header row, the data rows and a blank separator line.
function section(title: string, header: Cell[], rows: Cell[][]): Cell[][] {
  return [[title], header, ...rows, []];
}

// Turns "label + count" entries into rows with each entry's share of the total, for the three status tables.
function statusRows(entries: { label: string; count: number }[]): Cell[][] {
  const total = entries.reduce((sum, entry) => sum + entry.count, 0);
  return entries.map((entry) => [entry.label, entry.count, formatPercent(share(entry.count, total))]);
}

// The change from the previous period in words ("Up 60%", "Down 12%", "No change", "New"), so no cell starts with a
// sign that the formula guard would have to prefix.
function changeLabel(current: number, previous: number): string {
  if (previous === 0) return current === 0 ? "No change" : "New";
  const percent = Math.round(((current - previous) / previous) * 100);
  if (percent === 0) return "No change";
  return `${percent > 0 ? "Up" : "Down"} ${Math.abs(percent)}%`;
}

// Each series' range total against the previous period, or nothing when the API sent no previous-period data.
function previousPeriodSection(data: AdminDashboard): Cell[][] {
  const { previousTotals, previousStartDate, previousEndDate } = data.trend;
  if (!previousTotals) return [];

  const span = previousStartDate && previousEndDate ? ` (${formatRangeSpan(previousStartDate, previousEndDate)})` : "";
  return section(
    "Trend vs previous period",
    ["Series", "Selected range", `Previous period${span}`, "Change"],
    TREND_SERIES.map((series) => {
      const current = data.trend.points.reduce((sum, point) => sum + point[series.key], 0);
      const previous = previousTotals[series.key];
      return [series.label, current, previous, changeLabel(current, previous)];
    })
  );
}

// Builds one CSV containing every panel of the dashboard (metrics, trend, the three status tables and the activity
// feed) from the payload already on screen, so an admin can hand the numbers to someone without screenshots.
// `generatedAt` is a parameter so tests can pin the timestamp.
export function buildReportCsv(data: AdminDashboard, generatedAt: Date = new Date()): string {
  const metricKeys = Object.keys(METRIC_LABELS) as (keyof DashboardMetrics)[];
  const metricRows = metricKeys.map((key) => [METRIC_LABELS[key], data.totals[key], data.metrics[key]]);

  const rows: Cell[][] = [
    ["TalentX Platform Report"],
    ["Date range", formatRangeSpan(data.startDate, data.endDate)],
    ["Generated", generatedAt.toISOString()],
    ["Data scope", "Admin-only platform data"],
    [],
    ...section("Key metrics", ["Metric", "All time", "In selected range"], metricRows),
    ...section(
      "Recruitment trend",
      ["Period", ...TREND_SERIES.map((series) => series.label)],
      data.trend.points.map((point) => [
        formatBucketTooltip(point.bucketStart, data.trend.granularity),
        ...TREND_SERIES.map((series) => point[series.key]),
      ])
    ),
    ...previousPeriodSection(data),
    ...section(
      "Applications by status",
      ["Status", "Count", "Share"],
      statusRows(
        data.applicationStatuses.map((entry) => ({
          label: APPLICATION_STATUS_LABELS[entry.status],
          count: entry.count,
        }))
      )
    ),
    ...section(
      "Jobs by status",
      ["Status", "Count", "Share"],
      statusRows(
        data.jobStatuses.map((entry) => ({ label: JOB_STATUS_LABELS[entry.status], count: entry.count }))
      )
    ),
    ...section(
      "Employer verification",
      ["Status", "Count", "Share"],
      statusRows(
        data.verificationStatuses.map((entry) => ({
          label: VERIFICATION_STATUS_LABELS[entry.status],
          count: entry.count,
        }))
      )
    ),
    ...section(
      "Recent platform activity",
      ["Type", "Name", "Details", "Verification", "When (UTC)"],
      data.activities.map((activity) => [
        activity.type,
        activity.title,
        activity.detail,
        activity.verificationStatus ? VERIFICATION_STATUS_LABELS[activity.verificationStatus] : "",
        activity.occurredAt,
      ])
    ),
  ];

  return rows.map((row) => row.map(escapeCell).join(",")).join("\n");
}

// Names the downloaded file after the preset and the day, e.g. "talentx-platform-report_30d_2026-09-24.csv", so
// several exports sort and tell themselves apart.
export function reportFileName(range: DashboardRange, generatedAt: Date = new Date()): string {
  return `talentx-platform-report_${range}_${generatedAt.toISOString().slice(0, 10)}.csv`;
}

// Saves the report in the browser and returns the file name (so the UI can show it in a toast). It builds a temporary
// link to an in-memory file and clicks it; the BOM keeps Excel reading the file as UTF-8.
export function downloadCsv(data: AdminDashboard, range: DashboardRange): string {
  const generatedAt = new Date();
  const fileName = reportFileName(range, generatedAt);
  const blob = new Blob([`﻿${buildReportCsv(data, generatedAt)}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return fileName;
}
