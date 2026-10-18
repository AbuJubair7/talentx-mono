import type { AdminDashboard, DashboardMetrics } from "../types/admin-dashboard";
import { buildReportCsv, downloadCsv, reportFileName } from "../utils/export-report";

const GENERATED_AT = new Date("2026-09-24T10:30:00.000Z");

function metrics(overrides: Partial<DashboardMetrics> = {}): DashboardMetrics {
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

function buildDashboard(overrides: Partial<AdminDashboard> = {}): AdminDashboard {
  return {
    startDate: new Date(2026, 8, 1, 12).toISOString(),
    endDate: new Date(2026, 8, 24, 12).toISOString(),
    metrics: metrics({ totalTalents: 5, totalHires: 2 }),
    totals: metrics({ totalTalents: 100, totalHires: 9 }),
    applicationStatuses: [
      { status: "Applied", count: 6 },
      { status: "Reviewed", count: 3 },
      { status: "Hired", count: 1 },
    ],
    jobStatuses: [
      { status: "Published", count: 3 },
      { status: "PendingReview", count: 1 },
    ],
    verificationStatuses: [
      { status: "Verified", count: 2 },
      { status: "PendingVerification", count: 2 },
    ],
    oldestPendingDays: 4,
    trend: {
      granularity: "Day",
      points: [
        { bucketStart: "2026-09-10T00:00:00Z", publishedJobs: 1, applications: 4, interviews: 2, hires: 0 },
      ],
      previousStartDate: new Date(2026, 7, 9, 12).toISOString(),
      previousEndDate: new Date(2026, 7, 31, 12).toISOString(),
      previousPoints: [],
      previousTotals: { publishedJobs: 0, applications: 5, interviews: 2, hires: 0 },
    },
    activities: [],
    ...overrides,
  };
}

function lines(csv: string): string[] {
  return csv.split("\n");
}

// Proves the CSV carries every panel with the same labels the page uses, both metric columns, and survives values
// that would otherwise break the columns.
describe("buildReportCsv", () => {
  it("starts with a title, the date range, the generation time and the data scope", () => {
    const csv = lines(buildReportCsv(buildDashboard(), GENERATED_AT));

    expect(csv[0]).toBe("TalentX Platform Report");
    // The range text contains a comma, so it must be quoted to stay in one column.
    expect(csv[1]).toBe('Date range,"Sep 1 – Sep 24, 2026"');
    expect(csv[2]).toBe("Generated,2026-09-24T10:30:00.000Z");
    expect(csv[3]).toBe("Data scope,Admin-only platform data");
  });

  it("lists every metric with its all-time value and its in-range value", () => {
    const csv = lines(buildReportCsv(buildDashboard(), GENERATED_AT));

    expect(csv).toContain("Metric,All time,In selected range");
    expect(csv).toContain("Total talents,100,5");
    expect(csv).toContain("Total hires,9,2");
    expect(csv).toContain("Deactivated jobs,0,0");
    expect(csv).toContain("Jobs under review,0,0");
  });

  it("writes the trend with a readable period and one column per series", () => {
    const csv = lines(buildReportCsv(buildDashboard(), GENERATED_AT));

    expect(csv).toContain("Period,Published jobs,Applications,Interviews,Hires");
    expect(csv).toContain("\"Thu, Sep 10, 2026\",1,4,2,0");
  });

  it("compares each series' range total with the previous period, in words", () => {
    const csv = lines(buildReportCsv(buildDashboard(), GENERATED_AT));

    expect(csv).toContain("Trend vs previous period");
    expect(csv).toContain('Series,Selected range,"Previous period (Aug 9 – Aug 31, 2026)",Change');
    // 1 vs 0, 4 vs 5, 2 vs 2, 0 vs 0.
    expect(csv).toContain("Published jobs,1,0,New");
    expect(csv).toContain("Applications,4,5,Down 20%");
    expect(csv).toContain("Interviews,2,2,No change");
    expect(csv).toContain("Hires,0,0,No change");
  });

  it("leaves out the previous-period table when the API sent no previous totals", () => {
    const dashboard = buildDashboard();
    const csv = lines(
      buildReportCsv(
        {
          ...dashboard,
          trend: { ...dashboard.trend, previousTotals: null, previousStartDate: null, previousEndDate: null },
        },
        GENERATED_AT
      )
    );

    expect(csv).not.toContain("Trend vs previous period");
    expect(csv).toContain("Period,Published jobs,Applications,Interviews,Hires");
    expect(csv).toContain("Metric,All time,In selected range");
  });

  it("writes each status table with display labels and each row's share of its total", () => {
    const csv = lines(buildReportCsv(buildDashboard(), GENERATED_AT));

    // "Reviewed" is shown as "Viewed"; 6 + 3 + 1 = 10 applications.
    expect(csv).toContain("Applied,6,60.0%");
    expect(csv).toContain("Viewed,3,30.0%");
    expect(csv).toContain("Under review,1,25.0%");
    expect(csv).toContain("Pending,2,50.0%");
  });

  it("writes activities with the verification label for employers and an empty cell otherwise", () => {
    const csv = lines(
      buildReportCsv(
        buildDashboard({
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
              type: "Talent",
              id: "t-1",
              title: "Aisha Rahman",
              detail: "Data Analyst · Dubai",
              occurredAt: "2026-09-10T09:00:00Z",
              verificationStatus: null,
            },
          ],
        }),
        GENERATED_AT
      )
    );

    expect(csv).toContain("Type,Name,Details,Verification,When (UTC)");
    expect(csv).toContain("Employer,Brightline Logistics,Omar Khan,Pending,2026-09-10T11:00:00Z");
    expect(csv).toContain("Talent,Aisha Rahman,Data Analyst · Dubai,,2026-09-10T09:00:00Z");
  });

  it("quotes values that contain commas or quotes so they stay in one column", () => {
    const csv = lines(
      buildReportCsv(
        buildDashboard({
          activities: [
            {
              type: "Job",
              id: "j-1",
              title: 'Engineer, "Platform"',
              detail: "Acme, Inc.",
              occurredAt: "2026-09-10T11:00:00Z",
              verificationStatus: null,
            },
          ],
        }),
        GENERATED_AT
      )
    );

    expect(csv).toContain('Job,"Engineer, ""Platform""","Acme, Inc.",,2026-09-10T11:00:00Z');
  });

  it("shows 0.0% for every row of an empty table instead of NaN", () => {
    const csv = lines(
      buildReportCsv(
        buildDashboard({ applicationStatuses: [{ status: "Applied", count: 0 }] }),
        GENERATED_AT
      )
    );

    expect(csv).toContain("Applied,0,0.0%");
  });
});

// Proves the file is named after the preset and the day so repeated exports are easy to tell apart.
describe("reportFileName", () => {
  it("includes the range and the date", () => {
    expect(reportFileName("30d", GENERATED_AT)).toBe("talentx-platform-report_30d_2026-09-24.csv");
  });
});

// Proves the download builds a UTF-8 CSV file, triggers exactly one save under the right name, and cleans up.
describe("downloadCsv", () => {
  const createObjectURL = jest.fn((blob: Blob) => (blob ? "blob:report" : ""));
  const revokeObjectURL = jest.fn();
  let clickSpy: jest.SpyInstance;

  beforeEach(() => {
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    clickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  });

  afterEach(() => {
    clickSpy.mockRestore();
    jest.clearAllMocks();
  });

  it("saves a CSV blob under the report name, returns that name, and releases the blob URL", () => {
    const fileName = downloadCsv(buildDashboard(), "7d");

    expect(fileName).toMatch(/^talentx-platform-report_7d_\d{4}-\d{2}-\d{2}\.csv$/);
    const blob = createObjectURL.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("text/csv;charset=utf-8");
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:report");
    // The temporary link is removed again.
    expect(document.querySelector("a[download]")).toBeNull();
  });
});
