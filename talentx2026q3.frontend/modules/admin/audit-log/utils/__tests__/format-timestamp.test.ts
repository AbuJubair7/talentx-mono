import { formatToLocalTime } from "../format-timestamp";

describe("formatToLocalTime", () => {
  it("returns empty string when input is empty or null", () => {
    expect(formatToLocalTime("")).toBe("");
  });

  it("returns input string unchanged if invalid date format", () => {
    expect(formatToLocalTime("invalid-date-string")).toBe("invalid-date-string");
  });

  it("correctly parses UTC string and formats to local yyyy-MM-dd HH:mm:ss", () => {
    const inputUtc = "2026-09-14 04:05:21";
    const formatted = formatToLocalTime(inputUtc);

    // Verify it matches yyyy-MM-dd HH:mm:ss regex
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);

    const expectedDate = new Date("2026-09-14T04:05:21Z");
    const pad = (n: number) => n.toString().padStart(2, "0");
    const expected = `${expectedDate.getFullYear()}-${pad(expectedDate.getMonth() + 1)}-${pad(expectedDate.getDate())} ${pad(expectedDate.getHours())}:${pad(expectedDate.getMinutes())}:${pad(expectedDate.getSeconds())}`;

    expect(formatted).toBe(expected);
  });

  it("correctly parses ISO 8601 UTC string with Z", () => {
    const inputIso = "2026-09-14T04:05:21Z";
    const formatted = formatToLocalTime(inputIso);

    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);

    const expectedDate = new Date("2026-09-14T04:05:21Z");
    const pad = (n: number) => n.toString().padStart(2, "0");
    const expected = `${expectedDate.getFullYear()}-${pad(expectedDate.getMonth() + 1)}-${pad(expectedDate.getDate())} ${pad(expectedDate.getHours())}:${pad(expectedDate.getMinutes())}:${pad(expectedDate.getSeconds())}`;

    expect(formatted).toBe(expected);
  });
});
