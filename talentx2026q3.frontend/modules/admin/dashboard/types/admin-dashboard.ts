// The date-range presets the admin can pick; each one maps to a start/end pair sent to the API.
export type DashboardRange = "24h" | "7d" | "30d" | "90d" | "12m";

// Application statuses the dashboard reports. "Reviewed" is what the backend calls a viewed application, and the
// backend already folds "Invited" into "Interview", so those are the only values that can arrive.
export type DashboardApplicationStatus =
  | "Applied"
  | "Reviewed"
  | "Shortlisted"
  | "Interview"
  | "Hired"
  | "Rejected";

// Job statuses the dashboard reports. Drafts are never included: they are private to the employer.
export type DashboardJobStatus =
  | "Published"
  | "Closed"
  | "Expired"
  | "Deactivated"
  | "PendingReview";

// Where an employer stands in the verification flow.
export type DashboardVerificationStatus = "PendingVerification" | "Verified" | "Rejected";

// How wide each point on the trend chart is. The backend picks it from the length of the range.
export type TrendGranularity = "Hour" | "Day" | "Week" | "Month";

// What kind of platform event a row in the recent-activity feed describes.
export type DashboardActivityType = "Talent" | "Employer" | "Job";

// The twelve headline numbers. The same shape is used twice in the response: once for the selected range
// (`metrics`) and once for all time (`totals`), so cards can show both without a second request.
export interface DashboardMetrics {
  totalTalents: number;
  totalEmployers: number;
  verifiedEmployers: number;
  pendingEmployerVerifications: number;
  totalJobs: number;
  publishedJobs: number;
  closedOrExpiredJobs: number;
  deactivatedJobs: number;
  // Jobs an employer resubmitted after a deactivation, now waiting for an admin decision.
  underReviewJobs: number;
  totalApplications: number;
  totalInterviews: number;
  totalHires: number;
}

// One row of a "count per status" breakdown, generic so applications, jobs and verification share one shape.
export interface StatusCount<TStatus extends string> {
  status: TStatus;
  count: number;
}

// One point on the trend chart: how many of each event happened inside a single time bucket.
export interface DashboardTrendPoint {
  // Start of the hour/day/week/month bucket, in UTC.
  bucketStart: string;
  publishedJobs: number;
  applications: number;
  interviews: number;
  hires: number;
}

// Each series' total over a whole window, keyed like a trend point.
export type DashboardTrendTotals = Omit<DashboardTrendPoint, "bucketStart">;

// The whole trend series plus the bucket size, so the chart knows how to label its axis, and the totals of the window
// just before the range (same length, shifted back), so each series can show its change against it.
// The previous-period fields are null / empty when the API doesn't send them (no comparison is shown then).
export interface DashboardTrend {
  granularity: TrendGranularity;
  points: DashboardTrendPoint[];
  previousStartDate: string | null;
  previousEndDate: string | null;
  // The previous window bucket by bucket; same buckets as `points`, so they line up by position.
  previousPoints: DashboardTrendPoint[];
  previousTotals: DashboardTrendTotals | null;
}

// One entry in the recent-activity feed: a new talent, a new employer or a newly published job.
export interface DashboardActivity {
  type: DashboardActivityType;
  id: string;
  title: string;
  detail: string;
  occurredAt: string;
  // Only set for Employer activities, so the feed can show a verification badge.
  verificationStatus: DashboardVerificationStatus | null;
}

// The full response of GET /admin/dashboard: everything the page renders, computed on the server.
export interface AdminDashboard {
  startDate: string;
  endDate: string;
  // Counts inside the selected range.
  metrics: DashboardMetrics;
  // The same counts over all time, whatever the range.
  totals: DashboardMetrics;
  applicationStatuses: StatusCount<DashboardApplicationStatus>[];
  jobStatuses: StatusCount<DashboardJobStatus>[];
  verificationStatuses: StatusCount<DashboardVerificationStatus>[];
  // Age of the oldest pending employer verification; not limited to the range. Null when none are pending.
  oldestPendingDays: number | null;
  trend: DashboardTrend;
  activities: DashboardActivity[];
}

// The query-string the dashboard endpoint accepts: the window the numbers should cover.
export interface AdminDashboardQueryParams {
  // UTC ISO instants, used exactly as sent.
  startDate: string;
  endDate: string;
}
