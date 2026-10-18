import type {
  DashboardApplicationStatus,
  DashboardJobStatus,
  DashboardMetrics,
  DashboardRange,
  DashboardVerificationStatus,
} from "../types/admin-dashboard";

// The calendar unit a preset counts in; ranges start on a whole unit in UTC.
export type DashboardRangeUnit = "hour" | "day" | "month";

// Describes one range preset: how it is labelled in the UI and how many whole units it covers, counting the
// current (partial) one. The backend picks the trend bucket size from the span (<=2 days hourly, <=30 daily,
// <=90 weekly, else monthly) and rejects spans over 366 days, so these must not drift past those limits.
interface DashboardRangeConfig {
  key: DashboardRange;
  label: string;
  longLabel: string;
  // The window the trend deltas compare against, e.g. "previous 30 days".
  previousLabel: string;
  unit: DashboardRangeUnit;
  count: number;
}

// The presets shown in the range picker, shortest first. Single source for both the picker and the
// start/end calculation, so what the admin sees and what is requested can never disagree.
export const DASHBOARD_RANGES: readonly DashboardRangeConfig[] = [
  { key: "24h", label: "24H", longLabel: "Last 24 hours", previousLabel: "previous 24 hours", unit: "hour", count: 24 },
  { key: "7d", label: "7D", longLabel: "Last 7 days", previousLabel: "previous 7 days", unit: "day", count: 7 },
  { key: "30d", label: "30D", longLabel: "Last 30 days", previousLabel: "previous 30 days", unit: "day", count: 30 },
  { key: "90d", label: "90D", longLabel: "Last 90 days", previousLabel: "previous 90 days", unit: "day", count: 90 },
  { key: "12m", label: "12M", longLabel: "Last 12 months", previousLabel: "previous 12 months", unit: "month", count: 12 },
];

// The range selected when the page first opens.
export const DEFAULT_DASHBOARD_RANGE: DashboardRange = "30d";

// Human-readable names for the twelve headline metrics, used by the cards and by the CSV export.
export const METRIC_LABELS: Record<keyof DashboardMetrics, string> = {
  totalTalents: "Total talents",
  totalEmployers: "Total employers",
  verifiedEmployers: "Verified employers",
  pendingEmployerVerifications: "Pending verification",
  totalJobs: "Total jobs",
  // Published and not yet past its deadline, i.e. jobs talents can apply to right now.
  publishedJobs: "Active jobs",
  closedOrExpiredJobs: "Closed / expired jobs",
  deactivatedJobs: "Deactivated jobs",
  underReviewJobs: "Jobs under review",
  totalApplications: "Total applications",
  totalInterviews: "Total interviews",
  totalHires: "Total hires",
};

// Display names for application statuses. The backend's `Reviewed` is shown as "Viewed".
export const APPLICATION_STATUS_LABELS: Record<DashboardApplicationStatus, string> = {
  Applied: "Applied",
  Reviewed: "Viewed",
  Shortlisted: "Shortlisted",
  Interview: "Interview",
  Hired: "Hired",
  Rejected: "Rejected",
};

// Display names for job statuses; `PendingReview` reads as "Under review", matching the moderation page.
export const JOB_STATUS_LABELS: Record<DashboardJobStatus, string> = {
  // Published jobs past their deadline are counted as Expired, so these are the live ones.
  Published: "Active",
  Closed: "Closed",
  Expired: "Expired",
  Deactivated: "Deactivated",
  PendingReview: "Under review",
};

// Display names for employer verification statuses.
export const VERIFICATION_STATUS_LABELS: Record<DashboardVerificationStatus, string> = {
  Verified: "Verified",
  PendingVerification: "Pending",
  Rejected: "Rejected",
};

// One colour per application status so the bars read as a pipeline. Hex values because recharts needs
// real colours, not Tailwind classes.
export const APPLICATION_STATUS_COLORS: Record<DashboardApplicationStatus, string> = {
  Applied: "#98A2B3",
  Reviewed: "#7FA0E8",
  Shortlisted: "#2E5BCC",
  Interview: "#0E9384",
  Hired: "#0B6B57",
  Rejected: "#D92D20",
};

// One colour per job status; deactivated red and under review amber, as in the moderation badges.
export const JOB_STATUS_COLORS: Record<DashboardJobStatus, string> = {
  Published: "#0B6B57",
  Closed: "#475467",
  Expired: "#98A2B3",
  Deactivated: "#D92D20",
  PendingReview: "#DC6803",
};

// One colour per verification status: green good, amber waiting, red rejected.
export const VERIFICATION_STATUS_COLORS: Record<DashboardVerificationStatus, string> = {
  Verified: "#0B6B57",
  PendingVerification: "#DC6803",
  Rejected: "#D92D20",
};

// The four lines drawn on the trend chart; each key is a field of a trend point.
export type TrendSeriesKey = "publishedJobs" | "applications" | "interviews" | "hires";

// Label and colour for each trend line. Drives the chart lines, the legend toggles and the CSV columns.
export const TREND_SERIES: readonly { key: TrendSeriesKey; label: string; color: string }[] = [
  { key: "publishedJobs", label: "Published jobs", color: "#2E5BCC" },
  { key: "applications", label: "Applications", color: "#F79009" },
  { key: "interviews", label: "Interviews", color: "#7A5AF8" },
  // Green, like the other success figures on the dashboard.
  { key: "hires", label: "Hires", color: "#12B76A" },
];
