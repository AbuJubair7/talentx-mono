import { fireEvent, render, screen } from "@testing-library/react";
import "../test-utils/resize-observer-stub";
import { TrendChart, TrendTooltip } from "../components/TrendChart";
import type { DashboardTrend, DashboardTrendPoint, DashboardTrendTotals } from "../types/admin-dashboard";

const NO_PREVIOUS: DashboardTrendTotals = { publishedJobs: 0, applications: 0, interviews: 0, hires: 0 };

// Builds a daily trend with the given points, previous-period totals (zero unless named) and previous points.
function dailyTrend(
  points: DashboardTrendPoint[],
  previousTotals: Partial<DashboardTrendTotals> = {},
  previousPoints: DashboardTrendPoint[] = []
): DashboardTrend {
  return {
    granularity: "Day",
    points,
    previousStartDate: new Date(2026, 7, 11, 12).toISOString(),
    previousEndDate: new Date(2026, 8, 9, 12).toISOString(),
    previousPoints,
    previousTotals: { ...NO_PREVIOUS, ...previousTotals },
  };
}

const TREND_PREVIOUS_TOTALS: DashboardTrendTotals = { publishedJobs: 3, applications: 20, interviews: 7, hires: 1 };

// Current totals: publishedJobs 3, applications 32, interviews 7, hires 1. Previous: 3, 20, 7, 1.
const TREND = dailyTrend(
  [
    { bucketStart: "2026-09-10T00:00:00Z", publishedJobs: 2, applications: 12, interviews: 3, hires: 1 },
    { bucketStart: "2026-09-11T00:00:00Z", publishedJobs: 1, applications: 20, interviews: 4, hires: 0 },
  ],
  { publishedJobs: 3, applications: 20, interviews: 7, hires: 1 },
  [
    { bucketStart: "2026-08-11T00:00:00Z", publishedJobs: 2, applications: 8, interviews: 3, hires: 1 },
    { bucketStart: "2026-08-12T00:00:00Z", publishedJobs: 1, applications: 12, interviews: 4, hires: 0 },
  ]
);

const SERIES_NAMES = ["Published jobs", "Applications", "Interviews", "Hires"];

// Renders the chart for the 30-day preset.
function renderChart(trend: DashboardTrend) {
  return render(<TrendChart rangeLabel="last 30 days" comparisonLabel="previous 30 days" trend={trend} />);
}

// Sets every series of every point to zero.
function withoutActivity(trend: DashboardTrend): DashboardTrend {
  return {
    ...trend,
    points: trend.points.map((point) => ({ ...point, publishedJobs: 0, applications: 0, interviews: 0, hires: 0 })),
  };
}

// The insight row's dt/dd pairs read the same way as ApplicationStats' rate() helper: walk the dd siblings
// that follow a given dt, rather than searching the whole document (the dominant stream's name, e.g.
// "Applications", also appears inside its own toggle button, so a bare getByText would be ambiguous).
function insightValues(label: string): string[] {
  const values: string[] = [];
  let next = screen.getByText(label).nextElementSibling;
  while (next) {
    values.push(next.textContent ?? "");
    next = next.nextElementSibling;
  }
  return values;
}

// Proves the chart is described in words, offers a toggle for each of the four series, never lets the admin hide them
// all, and shows a message instead of a flat chart when nothing happened.
describe("TrendChart", () => {
  it("describes the bucket size in the subtitle", () => {
    renderChart(TREND);

    expect(screen.getByText("Daily activity in the last 30 days")).toBeInTheDocument();
  });

  it.each([
    ["Hour", "Hourly"],
    ["Week", "Weekly"],
    ["Month", "Monthly"],
  ] as const)("calls a %s trend %s", (granularity, word) => {
    renderChart({ ...TREND, granularity });

    expect(screen.getByText(`${word} activity in the last 30 days`)).toBeInTheDocument();
  });

  it("offers one toggle per series, all shown to begin with", () => {
    renderChart(TREND);

    for (const name of SERIES_NAMES) {
      expect(screen.getByRole("button", { name })).toHaveAttribute("aria-pressed", "true");
    }
  });

  it("hides a series when its toggle is clicked and shows it again on a second click", () => {
    renderChart(TREND);
    const applications = screen.getByRole("button", { name: "Applications" });

    fireEvent.click(applications);
    expect(applications).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(applications);
    expect(applications).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps the last visible series on, so the chart is never empty", () => {
    renderChart(TREND);

    fireEvent.click(screen.getByRole("button", { name: "Published jobs" }));
    fireEvent.click(screen.getByRole("button", { name: "Applications" }));
    fireEvent.click(screen.getByRole("button", { name: "Interviews" }));
    // Hires is the last one left; hiding it must be refused.
    fireEvent.click(screen.getByRole("button", { name: "Hires" }));

    expect(screen.getByRole("button", { name: "Hires" })).toHaveAttribute("aria-pressed", "true");
  });

  it("describes the chart for screen readers when there is activity", () => {
    renderChart(TREND);

    expect(
      screen.getByRole("img", { name: "Daily trend of published jobs, applications, interviews and hires" })
    ).toBeInTheDocument();
  });

  it("shows a message instead of a chart when every bucket is empty", () => {
    renderChart(withoutActivity(TREND));

    expect(screen.getByText("No activity in the last 30 days")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("shows the same message when there are no points at all", () => {
    renderChart({ ...dailyTrend([]), granularity: "Hour" });

    expect(screen.getByText("No activity in the last 30 days")).toBeInTheDocument();
  });

  describe("delta badges", () => {
    it("compares each series with the previous period", () => {
      renderChart(TREND);

      // Applications: 32 now vs 20 before -> +60% (+12).
      expect(screen.getByText("↑60% (+12)")).toBeInTheDocument();
    });

    it("shows a downward change", () => {
      renderChart({ ...TREND, previousTotals: { ...TREND_PREVIOUS_TOTALS, applications: 64 } });

      // Applications: 32 now vs 64 before -> -50% (-32).
      expect(screen.getByText("↓50% (-32)")).toBeInTheDocument();
    });

    it("shows a neutral arrow, not ↑, when nothing changed", () => {
      renderChart(TREND);

      // Interviews: 7 now vs 7 before.
      expect(screen.getByText("→0% (+0)")).toBeInTheDocument();
    });

    it("hides the badge for a series whose totals are too small to trust", () => {
      renderChart(TREND);

      // Hires: 1 now + 1 before = 2 (< threshold) -> no badge appended to the button's text at all.
      expect(screen.getByRole("button", { name: "Hires" }).textContent).toBe("Hires");
    });

    it("shows a plain absolute change when the previous period was zero", () => {
      renderChart({ ...TREND, previousTotals: { ...TREND_PREVIOUS_TOTALS, applications: 0 } });

      expect(screen.getByText("+32")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Applications" })).toHaveAccessibleDescription(
        "New vs the previous 30 days (0 → 32)"
      );
    });

    it("shows the absolute change, not an inflated percent, when the previous total is tiny", () => {
      renderChart({ ...TREND, previousTotals: { ...TREND_PREVIOUS_TOTALS, applications: 4 } });

      // 4 -> 32 would read as ↑700%.
      expect(screen.getByText("+28")).toBeInTheDocument();
      expect(screen.queryByText(/700%/)).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Applications" })).toHaveAccessibleDescription(
        "Up 28 vs the previous 30 days (4 → 32)"
      );
    });

    it("does not change the toggle button's accessible name", () => {
      renderChart(TREND);

      expect(screen.getByRole("button", { name: "Applications" })).toBeInTheDocument();
    });

    it("describes the change in words for screen readers and on hover", () => {
      renderChart(TREND);
      const applications = screen.getByRole("button", { name: "Applications" });

      expect(applications).toHaveAccessibleDescription("Up 60% vs the previous 30 days (20 → 32)");
      expect(applications).toHaveAttribute(
        "title",
        expect.stringContaining("Up 60% vs the previous 30 days (20 → 32), ")
      );
      expect(screen.getByRole("button", { name: "Interviews" })).toHaveAccessibleDescription(
        "About the same as the previous 30 days (7 → 7)"
      );
    });

    it("says what the changes are measured against", () => {
      renderChart(TREND);

      expect(screen.getByText("Change vs previous 30 days")).toBeInTheDocument();
    });

    it("leaves out the caption when no series has a badge", () => {
      renderChart({ ...TREND, previousTotals: NO_PREVIOUS, points: TREND.points.map((point) => ({ ...point, applications: 1 })) });

      expect(screen.queryByText("Change vs previous 30 days")).not.toBeInTheDocument();
    });
  });

  describe("compare to previous", () => {
    beforeEach(() => {
      window.localStorage.clear();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("offers the comparison off by default, with no previous lines drawn", () => {
      const { container } = renderChart(TREND);

      expect(screen.getByRole("button", { name: "Compare to previous" })).toHaveAttribute("aria-pressed", "false");
      expect(container.querySelectorAll(".trend-previous-line")).toHaveLength(0);
    });

    it("draws the previous period when turned on and remembers the choice", () => {
      const { container } = renderChart(TREND);

      fireEvent.click(screen.getByRole("button", { name: "Compare to previous" }));

      expect(screen.getByRole("button", { name: "Compare to previous" })).toHaveAttribute("aria-pressed", "true");
      expect(container.querySelectorAll(".trend-previous-line").length).toBeGreaterThan(0);
      expect(window.localStorage.getItem("admin-dashboard:compare-previous")).toBe("true");
      expect(screen.getByText("Tip: hide series to compare one at a time.")).toBeInTheDocument();
    });

    it("starts with the comparison on when it was left on last time", () => {
      window.localStorage.setItem("admin-dashboard:compare-previous", "true");

      renderChart(TREND);

      expect(screen.getByRole("button", { name: "Compare to previous" })).toHaveAttribute("aria-pressed", "true");
    });

    it("still works when browser storage is unavailable", () => {
      jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("blocked");
      });
      jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("blocked");
      });
      renderChart(TREND);
      const toggle = screen.getByRole("button", { name: "Compare to previous" });

      expect(toggle).toHaveAttribute("aria-pressed", "false");
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-pressed", "true");
    });

    it("still renders, with no comparison at all, when the API sent no previous-period data", () => {
      renderChart({
        ...TREND,
        previousPoints: [],
        previousTotals: null,
        previousStartDate: null,
        previousEndDate: null,
      });

      expect(
        screen.getByRole("img", { name: "Daily trend of published jobs, applications, interviews and hires" })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Applications" }).textContent).toBe("Applications");
      expect(screen.queryByText("Change vs previous 30 days")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Compare to previous" })).not.toBeInTheDocument();
    });

    it("leaves out the toggle when there is no previous period to draw", () => {
      renderChart({ ...TREND, previousPoints: [] });

      expect(screen.queryByRole("button", { name: "Compare to previous" })).not.toBeInTheDocument();
    });
  });

  describe("tooltip", () => {
    const row = {
      ...TREND.points[0],
      fullLabel: "Thu, Sep 10, 2026",
      previous: TREND.previousPoints[0],
      previousLabel: "Tue, Aug 11, 2026",
    };

    it("shows only the current values while the comparison is off", () => {
      render(<TrendTooltip active payload={[{ payload: row }]} />);

      expect(screen.getByText("Thu, Sep 10, 2026")).toBeInTheDocument();
      expect(screen.queryByText(/vs /)).not.toBeInTheDocument();
    });

    it("adds the matching previous bucket and its values while the comparison is on", () => {
      render(<TrendTooltip active payload={[{ payload: row }]} showPrevious />);

      expect(screen.getByText("vs Tue, Aug 11, 2026")).toBeInTheDocument();
      // Applications: 12 now, 8 in the matching previous bucket.
      expect(screen.getByText("12")).toBeInTheDocument();
      expect(screen.getByText("· 8")).toBeInTheDocument();
    });
  });

  describe("insight row", () => {
    it("shows hires per 100 applications for the period, and no longer a busiest-stream share", () => {
      renderChart(TREND);

      // 1 hire / 32 applications.
      expect(insightValues("Hires per 100 applications")).toEqual([
        "3.1",
        "1 hire and 32 applications this period",
      ]);
      expect(screen.queryByText("Busiest stream")).not.toBeInTheDocument();
    });

    it("leaves out the hire ratio when there are too few applications to mean anything", () => {
      renderChart({ ...TREND, points: TREND.points.map((point) => ({ ...point, applications: 4 })) });

      expect(screen.queryByText("Hires per 100 applications")).not.toBeInTheDocument();
    });

    it("shows a peak day only when a bucket stands out from that series' average", () => {
      const flat = dailyTrend([
        { bucketStart: "2026-09-10T00:00:00Z", publishedJobs: 0, applications: 10, interviews: 0, hires: 0 },
        { bucketStart: "2026-09-11T00:00:00Z", publishedJobs: 0, applications: 10, interviews: 0, hires: 0 },
      ]);
      const { rerender } = renderChart(flat);
      expect(screen.queryByText("Peak day")).not.toBeInTheDocument();

      const spiked = dailyTrend([
        { bucketStart: "2026-09-10T00:00:00Z", publishedJobs: 0, applications: 2, interviews: 0, hires: 0 },
        { bucketStart: "2026-09-11T00:00:00Z", publishedJobs: 0, applications: 20, interviews: 0, hires: 0 },
      ]);
      rerender(<TrendChart rangeLabel="last 30 days" comparisonLabel="previous 30 days" trend={spiked} />);
      expect(insightValues("Peak day")[0]).toBe("Sep 11 · 20 applications");
    });

    it("moves the peak to the busiest visible series when a line is hidden", () => {
      const trend = dailyTrend([
        { bucketStart: "2026-09-10T00:00:00Z", publishedJobs: 0, applications: 2, interviews: 12, hires: 0 },
        { bucketStart: "2026-09-11T00:00:00Z", publishedJobs: 0, applications: 30, interviews: 1, hires: 0 },
      ]);
      renderChart(trend);
      expect(insightValues("Peak day")[0]).toBe("Sep 11 · 30 applications");

      fireEvent.click(screen.getByRole("button", { name: "Applications" }));

      expect(insightValues("Peak day")[0]).toBe("Sep 10 · 12 interviews");
    });

    it("omits the whole row when there is no activity", () => {
      renderChart(withoutActivity(TREND));

      expect(screen.queryByText("Hires per 100 applications")).not.toBeInTheDocument();
      expect(screen.queryByText("Peak day")).not.toBeInTheDocument();
    });
  });
});
