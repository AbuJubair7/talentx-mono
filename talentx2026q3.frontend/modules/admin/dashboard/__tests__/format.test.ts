import {
  formatBucketLabel,
  formatBucketTooltip,
  formatCompactNumber,
  formatNumber,
  formatPercent,
  formatRangeSpan,
  share,
} from "../utils/format";

// Local-time dates built from parts, so the expected text does not depend on the machine's time zone.
function localIso(year: number, monthIndex: number, day: number, hour = 12): string {
  return new Date(year, monthIndex, day, hour).toISOString();
}

// Proves the number helpers behave on the values the cards and legends feed them, including the empty case.
describe("number formatting", () => {
  it("formats numbers with thousands separators", () => {
    expect(formatNumber(3842)).toBe("3,842");
    expect(formatNumber(0)).toBe("0");
  });

  it("shortens large numbers for chart axes", () => {
    expect(formatCompactNumber(1200)).toBe("1.2K");
    expect(formatCompactNumber(950)).toBe("950");
  });

  it("formats a percentage with the requested decimals", () => {
    expect(formatPercent(12.345)).toBe("12.3%");
    expect(formatPercent(50, 0)).toBe("50%");
  });

  it("computes a share of a total and returns 0 when the total is empty", () => {
    expect(share(25, 200)).toBe(12.5);
    expect(share(5, 0)).toBe(0);
  });
});

// Proves each bucket size is written the way its chart axis and tooltip need, and that UTC-defined buckets are
// not shifted to a neighbouring day by the viewer's time zone.
describe("trend bucket labels", () => {
  it("writes hour buckets as a local time on the axis and with the date in the tooltip", () => {
    const hour = localIso(2026, 8, 10, 15);

    expect(formatBucketLabel(hour, "Hour")).toMatch(/^3\sPM$/);
    expect(formatBucketTooltip(hour, "Hour")).toMatch(/^Sep 10, 3:00\sPM$/);
  });

  it("writes day buckets in UTC", () => {
    expect(formatBucketLabel("2026-09-10T00:00:00Z", "Day")).toBe("Sep 10");
    expect(formatBucketTooltip("2026-09-10T00:00:00Z", "Day")).toBe("Thu, Sep 10, 2026");
  });

  it("writes week buckets by the day the week starts and calls it a week in the tooltip", () => {
    expect(formatBucketLabel("2026-09-07T00:00:00Z", "Week")).toBe("Sep 7");
    expect(formatBucketTooltip("2026-09-07T00:00:00Z", "Week")).toBe("Week of Sep 7, 2026");
  });

  it("writes month buckets as a month name in UTC", () => {
    expect(formatBucketLabel("2026-09-01T00:00:00Z", "Month")).toBe("Sep");
    expect(formatBucketTooltip("2026-09-01T00:00:00Z", "Month")).toBe("September 2026");
  });
});

// Proves the header text for the covered window, and that the year appears on the start only when the range crosses
// a year boundary.
describe("formatRangeSpan", () => {
  it("writes a same-year range with the year once", () => {
    expect(formatRangeSpan(localIso(2026, 8, 1), localIso(2026, 8, 24))).toBe("Sep 1 – Sep 24, 2026");
  });

  it("repeats the year on the start when the range crosses a year", () => {
    expect(formatRangeSpan(localIso(2025, 11, 20), localIso(2026, 0, 5))).toBe("Dec 20, 2025 – Jan 5, 2026");
  });
});
