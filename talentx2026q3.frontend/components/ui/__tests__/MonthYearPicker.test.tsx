import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import {
  compareMonthYear,
  formatMonthYear,
  isDateBefore,
  MonthYearPicker,
  parseMonthYear,
} from "../MonthYearPicker"

describe("MonthYearPicker helpers", () => {
  it("parses MMM YYYY and MMMM YYYY strings correctly", () => {
    expect(parseMonthYear("Jan 2024")).toEqual({ year: 2024, month: 0, isYearOnly: false })
    expect(parseMonthYear("December 2022")).toEqual({ year: 2022, month: 11, isYearOnly: false })
    expect(parseMonthYear("2024-03")).toEqual({ year: 2024, month: 2, isYearOnly: false })
    expect(parseMonthYear("2020")).toEqual({ year: 2020, month: 0, isYearOnly: true })
    expect(parseMonthYear("")).toBeNull()
    expect(parseMonthYear(null)).toBeNull()
    expect(parseMonthYear("Present")).toBeNull()
  })

  it("formats month and year correctly", () => {
    expect(formatMonthYear(2024, 0)).toBe("Jan 2024")
    expect(formatMonthYear(2022, 11)).toBe("Dec 2022")
  })

  it("compares month and year strings properly", () => {
    expect(isDateBefore("Jan 2022", "Feb 2022")).toBe(true)
    expect(isDateBefore("Dec 2021", "Jan 2022")).toBe(true)
    expect(isDateBefore("Jan 2024", "Dec 2022")).toBe(false)
    expect(isDateBefore("Jan 2022", "Jan 2022")).toBe(false)
    expect(isDateBefore("Present", "Jan 2022")).toBe(false)
    expect(isDateBefore("2020", "2022")).toBe(true)
    expect(isDateBefore("2022", "2020")).toBe(false)
    expect(isDateBefore("2020", "2020")).toBe(false)
    expect(compareMonthYear("Jan 2022", "Jan 2022")).toBe(0)
    expect(compareMonthYear("2020", "2022")).toBe(-2)
  })
})

describe("MonthYearPicker Component", () => {
  const user = userEvent.setup()

  it("renders with placeholder and value", () => {
    const onChange = jest.fn()
    render(
      <MonthYearPicker
        id="test-picker"
        value="Mar 2023"
        onChange={onChange}
        placeholder="Select month"
        aria-label="Start date"
      />
    )

    const input = screen.getByRole("textbox", { name: "Start date" })
    expect(input).toHaveValue("Mar 2023")
  })

  it("opens popover on click and selects a month", async () => {
    const onChange = jest.fn()
    render(
      <MonthYearPicker
        id="test-picker"
        value="Jan 2024"
        onChange={onChange}
        aria-label="Start date"
      />
    )

    const input = screen.getByRole("textbox", { name: "Start date" })
    await user.click(input)

    expect(screen.getByRole("dialog", { name: /month and year picker/i })).toBeInTheDocument()

    const juneButton = screen.getByRole("button", { name: "Jun" })
    await user.click(juneButton)

    expect(onChange).toHaveBeenCalledWith("Jun 2024")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("navigates years with previous and next buttons", async () => {
    const onChange = jest.fn()
    render(
      <MonthYearPicker
        value="Jan 2024"
        onChange={onChange}
        aria-label="Start date"
      />
    )

    await user.click(screen.getByRole("textbox", { name: "Start date" }))

    expect(screen.getByText("2024")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /previous year/i }))
    expect(screen.getByText("2023")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /next year/i }))
    expect(screen.getByText("2024")).toBeInTheDocument()
  })

  it("disables months earlier than minDate", async () => {
    const onChange = jest.fn()
    render(
      <MonthYearPicker
        value="Jun 2024"
        minDate="May 2024"
        onChange={onChange}
        aria-label="End date"
      />
    )

    await user.click(screen.getByRole("textbox", { name: "End date" }))

    const aprilButton = screen.getByRole("button", { name: "Apr" })
    expect(aprilButton).toBeDisabled()

    const juneButton = screen.getByRole("button", { name: "Jun" })
    expect(juneButton).not.toBeDisabled()
  })

  it("closes popover when Escape key is pressed", async () => {
    const onChange = jest.fn()
    render(
      <MonthYearPicker
        value=""
        onChange={onChange}
        aria-label="Date"
      />
    )

    await user.click(screen.getByRole("textbox", { name: "Date" }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()

    fireEvent.keyDown(document, { key: "Escape" })
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("toggles year grid view and selects year from grid", async () => {
    const onChange = jest.fn()
    render(
      <MonthYearPicker
        value="Jan 2024"
        onChange={onChange}
        aria-label="Start date"
      />
    )

    await user.click(screen.getByRole("textbox", { name: "Start date" }))
    await user.click(screen.getByRole("button", { name: /switch to year grid view/i }))

    const year2020Button = screen.getByRole("button", { name: "2020" })
    await user.click(year2020Button)

    expect(screen.getByText("2020")).toBeInTheDocument()
    const marButton = screen.getByRole("button", { name: "Mar" })
    await user.click(marButton)

    expect(onChange).toHaveBeenCalledWith("Mar 2020")
  })

  it("jumps to year via quick jump dropdown", async () => {
    const onChange = jest.fn()
    render(
      <MonthYearPicker
        value="Jan 2024"
        onChange={onChange}
        aria-label="Start date"
      />
    )

    await user.click(screen.getByRole("textbox", { name: "Start date" }))
    await user.click(screen.getByRole("button", { name: /switch to year grid view/i }))

    const jumpSelect = screen.getByRole("combobox", { name: /quick jump year/i })
    await user.selectOptions(jumpSelect, "2015")

    expect(screen.getByText("2015")).toBeInTheDocument()
    const sepButton = screen.getByRole("button", { name: "Sep" })
    await user.click(sepButton)

    expect(onChange).toHaveBeenCalledWith("Sep 2015")
  })

  it("selects year-only via Month View banner button", async () => {
    const onChange = jest.fn()
    render(
      <MonthYearPicker
        value="Jan 2024"
        onChange={onChange}
        aria-label="Start date"
      />
    )

    await user.click(screen.getByRole("textbox", { name: "Start date" }))
    const selectYearButton = screen.getByRole("button", {
      name: /select whole year 2024/i,
    })
    await user.click(selectYearButton)

    expect(onChange).toHaveBeenCalledWith("2024")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("selects year-only via bottom bar Use year only button", async () => {
    const onChange = jest.fn()
    render(
      <MonthYearPicker
        value="Jan 2024"
        onChange={onChange}
        aria-label="Start date"
      />
    )

    await user.click(screen.getByRole("textbox", { name: "Start date" }))
    const useYearOnlyButton = screen.getByRole("button", {
      name: /use 2024 only/i,
    })
    await user.click(useYearOnlyButton)

    expect(onChange).toHaveBeenCalledWith("2024")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("selects year-only via Year Grid View banner button", async () => {
    const onChange = jest.fn()
    render(
      <MonthYearPicker
        value="Jan 2024"
        onChange={onChange}
        aria-label="Start date"
      />
    )

    await user.click(screen.getByRole("textbox", { name: "Start date" }))
    await user.click(screen.getByRole("button", { name: /switch to year grid view/i }))

    const year2020Button = screen.getByRole("button", { name: "2020" })
    await user.click(year2020Button)

    const select2020Button = screen.getByRole("button", {
      name: /select whole year 2020/i,
    })
    await user.click(select2020Button)

    expect(onChange).toHaveBeenCalledWith("2020")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("disables year-only selection when year is outside bounds", async () => {
    const onChange = jest.fn()
    render(
      <MonthYearPicker
        value="2023"
        minDate="2024"
        onChange={onChange}
        aria-label="End date"
      />
    )

    await user.click(screen.getByRole("textbox", { name: "End date" }))
    const selectYearButton = screen.getByRole("button", {
      name: /select whole year 2023/i,
    })
    const useYearOnlyButton = screen.getByRole("button", {
      name: /use 2023 only/i,
    })

    expect(selectYearButton).toBeDisabled()
    expect(useYearOnlyButton).toBeDisabled()
  })
})
