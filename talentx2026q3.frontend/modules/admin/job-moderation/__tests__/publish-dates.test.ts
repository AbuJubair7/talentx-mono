import { isRelisted, postedDate } from "../utils/publish-dates";

// Proves the posting date prefers the first publish and a job counts as relisted only when it went live again later.
describe("publish dates", () => {
  it("uses the first publish as the posting date", () => {
    expect(postedDate({ firstPublishedAt: "2026-09-01T00:00:00Z", publishedAt: "2026-10-03T00:00:00Z" })).toBe(
      "2026-09-01T00:00:00Z"
    );
  });

  it("falls back to the latest publish for jobs without a first-publish date", () => {
    expect(postedDate({ firstPublishedAt: null, publishedAt: "2026-10-03T00:00:00Z" })).toBe("2026-10-03T00:00:00Z");
  });

  it("is not relisted when both dates match or one is missing", () => {
    expect(isRelisted({ firstPublishedAt: "2026-09-01T00:00:00Z", publishedAt: "2026-09-01T00:00:00Z" })).toBe(false);
    expect(isRelisted({ firstPublishedAt: null, publishedAt: "2026-10-03T00:00:00Z" })).toBe(false);
    expect(isRelisted({ firstPublishedAt: "2026-09-01T00:00:00Z", publishedAt: null })).toBe(false);
  });

  it("is relisted when the job went live again after it was first posted", () => {
    expect(isRelisted({ firstPublishedAt: "2026-09-01T00:00:00Z", publishedAt: "2026-10-03T00:00:00Z" })).toBe(true);
  });
});
