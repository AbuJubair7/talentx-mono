import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { MonthYearPicker, parseMonthYear, formatMonthYear } from "../MonthYearPicker"

describe("parseMonthYear", () => {
  it.each([
    ["Jan 2021", { year: 2021, month: 0 }],
    ["September 2019", { year: 2019, month: 8 }],
    ["2021", { year: 2021, month: null }],
    ["2021-05", { year: 2021, month: 4 }],
    ["2021-05-15", { year: 2021, month: 4 }],
    ["05/2021", { year: 2021, month: 4 }],
    ["Jan 5, 2021", { year: 2021, month: 0 }],
  ])("parses %s", (input, expected) => {
    expect(parseMonthYear(input)).toEqual(expected)
  })

  it.each(["", "Present", "Expected", "not a date"])("returns null for %s", (input) => {
    expect(parseMonthYear(input)).toBeNull()
  })
})

describe("formatMonthYear", () => {
  it("formats month and year as short month + year", () => {
    expect(formatMonthYear(2021, 0)).toBe("Jan 2021")
    expect(formatMonthYear(2021, 11)).toBe("Dec 2021")
  })
})

describe("MonthYearPicker", () => {
  it("shows the placeholder when empty", () => {
    render(<MonthYearPicker value="" onChange={jest.fn()} />)
    expect(screen.getByRole("button", { name: /select date/i })).toBeInTheDocument()
  })

  it("shows the formatted value for month + year and year-only", () => {
    const { rerender } = render(<MonthYearPicker value="May 2020" onChange={jest.fn()} />)
    expect(screen.getByRole("button", { name: /may 2020/i })).toBeInTheDocument()

    rerender(<MonthYearPicker value="2018" onChange={jest.fn()} />)
    expect(screen.getByRole("button", { name: /2018/i })).toBeInTheDocument()
  })

  it("opens a calendar of months and reports the selected month", async () => {
    const onChange = jest.fn()
    render(<MonthYearPicker value="Jan 2021" onChange={onChange} />)

    await userEvent.click(screen.getByRole("button", { name: /jan 2021/i }))
    await userEvent.click(screen.getByRole("button", { name: "Mar" }))

    expect(onChange).toHaveBeenCalledWith("Mar 2021")
  })
})
