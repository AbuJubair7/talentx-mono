import { formatDateSpan } from "../format-date-span"

describe("formatDateSpan", () => {
  it("returns empty string when neither start date nor end date is provided", () => {
    expect(formatDateSpan()).toBe("")
    expect(formatDateSpan(null, null)).toBe("")
    expect(formatDateSpan(undefined, undefined)).toBe("")
    expect(formatDateSpan("", "")).toBe("")
    expect(formatDateSpan("   ", "   ")).toBe("")
  })

  it("returns only start date when only start date is provided", () => {
    expect(formatDateSpan("Jan 2020")).toBe("Jan 2020")
    expect(formatDateSpan("2020", null)).toBe("2020")
    expect(formatDateSpan("2020", undefined)).toBe("2020")
    expect(formatDateSpan("2020", "")).toBe("2020")
    expect(formatDateSpan("2020", "   ")).toBe("2020")
  })

  it("returns only end date when only end date is provided", () => {
    expect(formatDateSpan(null, "Dec 2022")).toBe("Dec 2022")
    expect(formatDateSpan(undefined, "2022")).toBe("2022")
    expect(formatDateSpan("", "2022")).toBe("2022")
    expect(formatDateSpan("   ", "2022")).toBe("2022")
  })

  it("returns formatted range with en-dash when both dates are provided", () => {
    expect(formatDateSpan("Jan 2020", "Dec 2022")).toBe("Jan 2020 – Dec 2022")
    expect(formatDateSpan("2020", "2022", false)).toBe("2020 – 2022")
    expect(formatDateSpan(" 2020 ", " 2022 ")).toBe("2020 – 2022")
  })

  it("returns start date with Present when isCurrent is true and start date exists", () => {
    expect(formatDateSpan("Jan 2020", null, true)).toBe("Jan 2020 – Present")
    expect(formatDateSpan("2020", undefined, true)).toBe("2020 – Present")
    expect(formatDateSpan("2020", "2022", true)).toBe("2020 – Present")
    expect(formatDateSpan(" 2020 ", "", true)).toBe("2020 – Present")
  })

  it("returns Present when isCurrent is true and start date is missing", () => {
    expect(formatDateSpan(null, null, true)).toBe("Present")
    expect(formatDateSpan(undefined, undefined, true)).toBe("Present")
    expect(formatDateSpan("", "", true)).toBe("Present")
    expect(formatDateSpan("   ", "   ", true)).toBe("Present")
    expect(formatDateSpan(null, "2022", true)).toBe("Present")
  })
})
