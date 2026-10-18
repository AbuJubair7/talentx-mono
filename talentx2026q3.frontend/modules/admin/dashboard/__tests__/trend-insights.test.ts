import type { DashboardTrendPoint } from "../types/admin-dashboard";
import {
  computeHireRatioInsight,
  computePeakInsight,
  computeSeriesDelta,
  findBusiestSeries,
  MIN_APPLICATIONS_FOR_RATIO,
  MIN_BASELINE_FOR_PERCENT,
  MIN_TOTAL_FOR_DELTA,
  MIN_TOTAL_FOR_PEAK,
  PEAK_MULTIPLIER,
} from "../utils/trend-insights";

function point(overrides: Partial<DashboardTrendPoint> = {}): DashboardTrendPoint {
  return {
    bucketStart: "2026-09-10T00:00:00Z",
    publishedJobs: 0,
    applications: 0,
    interviews: 0,
    hires: 0,
    ...overrides,
  };
}

// Proves the range is compared with the previous period's total, guarded against tiny numbers and a zero baseline.
describe("computeSeriesDelta", () => {
  it(`returns null when both periods together have under ${MIN_TOTAL_FOR_DELTA} events`, () => {
    const points = [point({ applications: 2 }), point({ applications: 4 })];

    expect(computeSeriesDelta(points, "applications", 3)).toBeNull();
  });

  it("counts the previous period towards the minimum, so a quiet range after a busy one still compares", () => {
    const points = [point({ applications: 1 })];

    expect(computeSeriesDelta(points, "applications", 20)).toEqual({
      current: 1,
      previous: 20,
      absolute: -19,
      percent: -95,
    });
  });

  it("sums every point of the range and compares it with the previous total", () => {
    const points = [point({ applications: 10 }), point({ applications: 10 }), point({ applications: 10 })];

    expect(computeSeriesDelta(points, "applications", 20)).toEqual({
      current: 30,
      previous: 20,
      absolute: 10,
      percent: 50,
    });
  });

  it("reports zero change when both periods match", () => {
    const points = [point({ interviews: 7 })];

    expect(computeSeriesDelta(points, "interviews", 7)).toEqual({
      current: 7,
      previous: 7,
      absolute: 0,
      percent: 0,
    });
  });

  it("reports the absolute change with no percent when the previous period was zero", () => {
    const points = [point({ applications: 12 })];

    expect(computeSeriesDelta(points, "applications", 0)).toEqual({
      current: 12,
      previous: 0,
      absolute: 12,
      percent: null,
    });
  });

  it("reports a negative delta when activity drops", () => {
    const points = [point({ applications: 10 })];

    expect(computeSeriesDelta(points, "applications", 20)).toEqual({
      current: 10,
      previous: 20,
      absolute: -10,
      percent: -50,
    });
  });

  it(`drops the percent when the previous total is under ${MIN_BASELINE_FOR_PERCENT}, keeping the absolute change`, () => {
    // 3 -> 40 would read as ↑1,233%.
    const points = [point({ applications: 40 })];

    expect(computeSeriesDelta(points, "applications", MIN_BASELINE_FOR_PERCENT - 2)).toEqual({
      current: 40,
      previous: 3,
      absolute: 37,
      percent: null,
    });
  });

  it(`shows a percent again once the previous total reaches ${MIN_BASELINE_FOR_PERCENT}`, () => {
    const points = [point({ applications: 10 })];

    expect(computeSeriesDelta(points, "applications", MIN_BASELINE_FOR_PERCENT)?.percent).toBe(100);
  });
});

// Proves the busiest series is picked by its own total, and ties go to the first series in TREND_SERIES.
describe("findBusiestSeries", () => {
  it("returns null when every series is empty", () => {
    expect(findBusiestSeries([point(), point()])).toBeNull();
  });

  it("picks the series with the highest total", () => {
    const points = [
      point({ applications: 30, interviews: 5, hires: 1, publishedJobs: 4 }),
      point({ applications: 30, interviews: 5, hires: 1, publishedJobs: 4 }),
    ];

    expect(findBusiestSeries(points)).toBe("applications");
  });

  it("gives a tie to the series listed first", () => {
    const points = [point({ publishedJobs: 6, applications: 6 })];

    expect(findBusiestSeries(points)).toBe("publishedJobs");
  });

  it("only considers the given series, e.g. the visible ones", () => {
    const points = [point({ applications: 50, interviews: 8 })];

    expect(findBusiestSeries(points, ["interviews", "hires"])).toBe("interviews");
    expect(findBusiestSeries(points, [])).toBeNull();
  });
});

// Proves a peak is only reported when it's meaningfully above the series' own average, and gives its bucket label.
describe("computePeakInsight", () => {
  it("returns null for an empty list of points", () => {
    expect(computePeakInsight([], "applications", "Day")).toBeNull();
  });

  it("returns null when the series has no activity at all", () => {
    const points = [point(), point()];

    expect(computePeakInsight(points, "applications", "Day")).toBeNull();
  });

  it(`returns null when the busiest bucket is under ${PEAK_MULTIPLIER}x the average`, () => {
    // Average 8, max 10 -> 1.25x, below the threshold.
    const points = [point({ applications: 6 }), point({ applications: 10 }), point({ applications: 8 })];

    expect(computePeakInsight(points, "applications", "Day")).toBeNull();
  });

  it("reports the busiest bucket, its value and how far above average it is", () => {
    // Average (2+3+15)/3 = 6.67, max 15 -> 2.25x, above the threshold.
    const points = [
      point({ bucketStart: "2026-09-08T00:00:00Z", applications: 2 }),
      point({ bucketStart: "2026-09-09T00:00:00Z", applications: 3 }),
      point({ bucketStart: "2026-09-10T00:00:00Z", applications: 15 }),
    ];

    const peak = computePeakInsight(points, "applications", "Day");

    expect(peak).toEqual({ key: "applications", bucketLabel: "Sep 10", value: 15, multiple: 2.25 });
  });

  it(`returns null when the series has fewer than ${MIN_TOTAL_FOR_PEAK} events, however spiky`, () => {
    // 1 of 3 events in one bucket would read as "3.0× the average".
    const points = [point({ applications: 1 }), point(), point()];

    expect(computePeakInsight(points, "applications", "Day")).toBeNull();
  });

  it("keeps the earliest bucket when several share the highest value", () => {
    const points = [
      point({ bucketStart: "2026-09-08T00:00:00Z", applications: 10 }),
      point({ bucketStart: "2026-09-09T00:00:00Z", applications: 10 }),
      point({ bucketStart: "2026-09-10T00:00:00Z", applications: 0 }),
      point({ bucketStart: "2026-09-11T00:00:00Z", applications: 0 }),
    ];

    expect(computePeakInsight(points, "applications", "Day")?.bucketLabel).toBe("Sep 8");
  });
});

// Proves the hire ratio is hires per 100 applications in the period, guarded against tiny samples and capped at 100.
describe("computeHireRatioInsight", () => {
  it("returns null when there were no applications in the visible points", () => {
    expect(computeHireRatioInsight([point({ hires: 2 })])).toBeNull();
  });

  it(`returns null below ${MIN_APPLICATIONS_FOR_RATIO} applications, so 1 hire out of 1 is not shown as 100`, () => {
    const points = [point({ applications: MIN_APPLICATIONS_FOR_RATIO - 1, hires: 1 })];

    expect(computeHireRatioInsight(points)).toBeNull();
  });

  it("computes hires per 100 applications across all points", () => {
    const points = [point({ applications: 40, hires: 1 }), point({ applications: 60, hires: 3 })];

    expect(computeHireRatioInsight(points)).toEqual({ perHundred: 4, applications: 100, hires: 4 });
  });

  it("is 0 when nobody was hired", () => {
    const points = [point({ applications: 50, hires: 0 })];

    expect(computeHireRatioInsight(points)).toEqual({ perHundred: 0, applications: 50, hires: 0 });
  });

  it("caps at 100 when hires from earlier applications outnumber this period's applications", () => {
    const points = [point({ applications: 10, hires: 15 })];

    expect(computeHireRatioInsight(points)?.perHundred).toBe(100);
  });
});
