// Public surface of the admin dashboard module: what other code (the page and, later, the dashboard components)
// is allowed to import.
export { AdminDashboardView } from "./components/AdminDashboardView";
export { DateRangeSelect } from "./components/DateRangeSelect";
export { KeyMetrics } from "./components/KeyMetrics";
export { RecruitmentFunnel } from "./components/RecruitmentFunnel";
export { PeopleMetrics } from "./components/PeopleMetrics";
export { JobMetrics } from "./components/JobMetrics";
export { DashboardSkeleton } from "./components/DashboardSkeleton";
export { DashboardPanel } from "./components/DashboardPanel";
export { TrendChart } from "./components/TrendChart";
export { ApplicationStats } from "./components/ApplicationStats";
export { StatusDonut, type DonutSegment } from "./components/StatusDonut";
export { VerificationStats } from "./components/VerificationStats";
export { JobStats } from "./components/JobStats";
export { RecentActivity } from "./components/RecentActivity";
export { ExportMenu } from "./components/ExportMenu";

export { fetchAdminDashboard } from "./services/admin-dashboard.service";
export { useAdminDashboard, adminDashboardKeys } from "./hooks/useAdminDashboard";

export {
  DASHBOARD_RANGES,
  DEFAULT_DASHBOARD_RANGE,
  METRIC_LABELS,
  APPLICATION_STATUS_LABELS,
  JOB_STATUS_LABELS,
  VERIFICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  JOB_STATUS_COLORS,
  VERIFICATION_STATUS_COLORS,
  TREND_SERIES,
} from "./constants/dashboard.constants";

export { resolveDashboardRange } from "./utils/date-range";
export { downloadCsv, buildReportCsv, reportFileName } from "./utils/export-report";
export {
  formatNumber,
  formatCompactNumber,
  formatPercent,
  share,
  formatBucketLabel,
  formatBucketTooltip,
  formatRangeSpan,
} from "./utils/format";

export type {
  DashboardRange,
  DashboardApplicationStatus,
  DashboardJobStatus,
  DashboardVerificationStatus,
  TrendGranularity,
  DashboardActivityType,
  DashboardMetrics,
  StatusCount,
  DashboardTrendPoint,
  DashboardTrend,
  DashboardActivity,
  AdminDashboard,
  AdminDashboardQueryParams,
} from "./types/admin-dashboard";
export type { TrendSeriesKey } from "./constants/dashboard.constants";
