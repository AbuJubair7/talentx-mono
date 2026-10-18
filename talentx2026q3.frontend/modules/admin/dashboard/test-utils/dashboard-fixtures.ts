import type { AdminDashboard, DashboardMetrics } from "../types/admin-dashboard";

// Builds a set of headline numbers with every field zero unless overridden, so a test only names the numbers it
// cares about instead of listing all twelve.
export function buildMetrics(overrides: Partial<DashboardMetrics> = {}): DashboardMetrics {
  return {
    totalTalents: 0,
    totalEmployers: 0,
    verifiedEmployers: 0,
    pendingEmployerVerifications: 0,
    totalJobs: 0,
    publishedJobs: 0,
    closedOrExpiredJobs: 0,
    deactivatedJobs: 0,
    underReviewJobs: 0,
    totalApplications: 0,
    totalInterviews: 0,
    totalHires: 0,
    ...overrides,
  };
}

// Builds a complete dashboard response with small realistic values, for component tests that need "some data".
// Local-time dates keep the formatted range text independent of the machine's time zone.
export function buildDashboard(overrides: Partial<AdminDashboard> = {}): AdminDashboard {
  return {
    startDate: new Date(2026, 8, 1, 12).toISOString(),
    endDate: new Date(2026, 8, 24, 12).toISOString(),
    metrics: buildMetrics({ totalTalents: 57, totalApplications: 120, pendingEmployerVerifications: 3 }),
    totals: buildMetrics({
      totalTalents: 3842,
      totalEmployers: 318,
      verifiedEmployers: 300,
      pendingEmployerVerifications: 12,
      totalJobs: 986,
      publishedJobs: 800,
      closedOrExpiredJobs: 150,
      deactivatedJobs: 30,
      underReviewJobs: 6,
      totalApplications: 8120,
      totalInterviews: 2704,
      totalHires: 384,
    }),
    applicationStatuses: [
      { status: "Applied", count: 60 },
      { status: "Reviewed", count: 30 },
      { status: "Shortlisted", count: 15 },
      { status: "Interview", count: 10 },
      { status: "Hired", count: 5 },
      { status: "Rejected", count: 20 },
    ],
    jobStatuses: [
      { status: "Published", count: 30 },
      { status: "Closed", count: 6 },
      { status: "Expired", count: 3 },
      { status: "Deactivated", count: 2 },
      { status: "PendingReview", count: 1 },
    ],
    verificationStatuses: [
      { status: "Verified", count: 6 },
      { status: "PendingVerification", count: 3 },
      { status: "Rejected", count: 1 },
    ],
    oldestPendingDays: 4,
    trend: {
      granularity: "Day",
      points: [
        { bucketStart: "2026-09-10T00:00:00Z", publishedJobs: 2, applications: 12, interviews: 3, hires: 1 },
        { bucketStart: "2026-09-11T00:00:00Z", publishedJobs: 1, applications: 20, interviews: 4, hires: 0 },
      ],
      previousStartDate: new Date(2026, 7, 9, 12).toISOString(),
      previousEndDate: new Date(2026, 7, 31, 12).toISOString(),
      previousPoints: [
        { bucketStart: "2026-08-11T00:00:00Z", publishedJobs: 2, applications: 8, interviews: 3, hires: 1 },
        { bucketStart: "2026-08-12T00:00:00Z", publishedJobs: 1, applications: 12, interviews: 4, hires: 0 },
      ],
      previousTotals: { publishedJobs: 3, applications: 20, interviews: 7, hires: 1 },
    },
    activities: [
      {
        type: "Employer",
        id: "e-1",
        title: "Brightline Logistics",
        detail: "Omar Khan",
        occurredAt: "2026-09-10T11:00:00Z",
        verificationStatus: "PendingVerification",
      },
      {
        type: "Job",
        id: "j-1",
        title: "Senior Designer",
        detail: "Northwind Labs · Remote",
        occurredAt: "2026-09-10T10:00:00Z",
        verificationStatus: null,
      },
      {
        type: "Talent",
        id: "t-1",
        title: "Aisha Rahman",
        detail: "Data Analyst · Dubai",
        occurredAt: "2026-09-10T09:00:00Z",
        verificationStatus: null,
      },
    ],
    ...overrides,
  };
}
