"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

export interface MonthYearPickerProps {
  id?: string
  name?: string
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  minDate?: string
  maxDate?: string
  className?: string
  "aria-label"?: string
}

export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

const YEARS_PER_PAGE = 12

const MONTH_ALIASES: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
}

export function parseMonthYear(
  rawDate?: string | null
): { year: number; month: number; isYearOnly?: boolean } | null {
  if (!rawDate) return null
  const trimmed = rawDate.trim()
  if (!trimmed) return null

  // Format: "YYYY-MM"
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})$/)
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10)
    const month = parseInt(isoMatch[2], 10) - 1
    if (month >= 0 && month <= 11) return { year, month, isYearOnly: false }
  }

  // Format: "MMM YYYY" or "MMMM YYYY"
  const textMatch = trimmed.match(/^([a-zA-Z]+)[,\s]+(\d{4})$/)
  if (textMatch) {
    const monthAlias = textMatch[1].toLowerCase()
    const year = parseInt(textMatch[2], 10)
    if (monthAlias in MONTH_ALIASES) {
      return { year, month: MONTH_ALIASES[monthAlias], isYearOnly: false }
    }
  }

  // Format: "YYYY" (Year only)
  const yearOnlyMatch = trimmed.match(/^(\d{4})$/)
  if (yearOnlyMatch) {
    return { year: parseInt(yearOnlyMatch[1], 10), month: 0, isYearOnly: true }
  }

  return null
}

export function formatMonthYear(year: number, monthIndex: number): string {
  const monthName = MONTH_NAMES[monthIndex] ?? "Jan"
  return `${monthName} ${year}`
}

export function compareMonthYear(
  dateA?: string | null,
  dateB?: string | null
): number {
  const parsedA = parseMonthYear(dateA)
  const parsedB = parseMonthYear(dateB)
  if (!parsedA || !parsedB) return 0
  if (parsedA.isYearOnly || parsedB.isYearOnly) {
    return parsedA.year - parsedB.year
  }
  const scoreA = parsedA.year * 12 + parsedA.month
  const scoreB = parsedB.year * 12 + parsedB.month
  return scoreA - scoreB
}

export function isDateBefore(
  dateA?: string | null,
  dateB?: string | null
): boolean {
  const parsedA = parseMonthYear(dateA)
  const parsedB = parseMonthYear(dateB)
  if (!parsedA || !parsedB) return false
  if (parsedA.isYearOnly || parsedB.isYearOnly) {
    return parsedA.year < parsedB.year
  }
  const scoreA = parsedA.year * 12 + parsedA.month
  const scoreB = parsedB.year * 12 + parsedB.month
  return scoreA < scoreB
}

export function MonthYearPicker({
  id,
  name,
  value = "",
  onChange,
  placeholder = "e.g. Jan 2022",
  disabled = false,
  required = false,
  minDate,
  maxDate,
  className,
  "aria-label": ariaLabel,
}: MonthYearPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<"month" | "year">("month")
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  })

  const parsedCurrent = parseMonthYear(value)
  const parsedMin = parseMonthYear(minDate)
  const parsedMax = parseMonthYear(maxDate)
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const [viewYear, setViewYear] = useState<number>(
    parsedCurrent?.year ?? parsedMin?.year ?? currentYear
  )
  const [yearPageStart, setYearPageStart] = useState<number>(
    Math.floor((parsedCurrent?.year ?? parsedMin?.year ?? currentYear) / YEARS_PER_PAGE) *
      YEARS_PER_PAGE
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (parsedCurrent) {
      setViewYear(parsedCurrent.year)
      setYearPageStart(
        Math.floor(parsedCurrent.year / YEARS_PER_PAGE) * YEARS_PER_PAGE
      )
    }
  }, [value])

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const popoverHeight = 290
    const popoverWidth = 264
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    let top: number
    if (spaceBelow < popoverHeight && spaceAbove > popoverHeight) {
      top = rect.top - popoverHeight - 6
    } else {
      top = rect.bottom + 6
    }

    let left = rect.left
    if (left + popoverWidth > window.innerWidth) {
      left = Math.max(8, window.innerWidth - popoverWidth - 8)
    }

    setPopoverPos({ top, left })
  }, [])

  function handleOpen() {
    if (disabled) return
    setView("month")
    updatePosition()
    setIsOpen(true)
  }

  function handleClose() {
    setIsOpen(false)
    setView("month")
  }

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDownOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        handleClose()
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose()
      }
    }

    function handleScrollOrResize() {
      updatePosition()
    }

    document.addEventListener("mousedown", handlePointerDownOutside)
    document.addEventListener("keydown", handleKeyDown)
    window.addEventListener("scroll", handleScrollOrResize, true)
    window.addEventListener("resize", handleScrollOrResize)

    return () => {
      document.removeEventListener("mousedown", handlePointerDownOutside)
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("scroll", handleScrollOrResize, true)
      window.removeEventListener("resize", handleScrollOrResize)
    }
  }, [isOpen, updatePosition])

  function handleMonthSelect(monthIndex: number) {
    const formatted = formatMonthYear(viewYear, monthIndex)
    onChange(formatted)
    handleClose()
  }

  function handleSelectYearOnly(year: number) {
    if (parsedMin && year < parsedMin.year) {
      return
    }
    if (parsedMax && year > parsedMax.year) {
      return
    }
    onChange(String(year))
    handleClose()
  }

  function handleSelectYear(year: number) {
    setViewYear(year)
    setYearPageStart(Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE)
    setView("month")
  }

  function handleClear() {
    onChange("")
    handleClose()
  }

  function handleSelectThisMonth() {
    if (
      parsedMin &&
      (currentYear < parsedMin.year ||
        (currentYear === parsedMin.year && currentMonth < parsedMin.month))
    ) {
      return
    }
    setViewYear(currentYear)
    onChange(formatMonthYear(currentYear, currentMonth))
    handleClose()
  }

  const isPrevYearDisabled = parsedMin ? viewYear <= parsedMin.year : false
  const isNextYearDisabled = parsedMax ? viewYear >= parsedMax.year : false
  const isPrevPageDisabled = parsedMin
    ? yearPageStart <= parsedMin.year
    : false
  const isNextPageDisabled = parsedMax
    ? yearPageStart + YEARS_PER_PAGE - 1 >= parsedMax.year
    : false
  const isYearOnlyDisabled =
    (parsedMin ? viewYear < parsedMin.year : false) ||
    (parsedMax ? viewYear > parsedMax.year : false)
  const isYearOnlySelected = Boolean(
    parsedCurrent?.isYearOnly && parsedCurrent?.year === viewYear
  )

  const minDropdownYear = parsedMin ? parsedMin.year : 1960
  const maxDropdownYear = parsedMax ? parsedMax.year : currentYear + 10
  const dropdownYears = Array.from(
    { length: Math.max(1, maxDropdownYear - minDropdownYear + 1) },
    (_, index) => maxDropdownYear - index
  )

  const yearsGrid = Array.from(
    { length: YEARS_PER_PAGE },
    (_, index) => yearPageStart + index
  )

  return (
    <div ref={containerRef} className={cn("relative w-full min-w-0", className)}>
      <div className="relative flex items-center">
        <input
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          onClick={handleOpen}
          className={cn(
            "h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 pr-8 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus:border-emerald-600 focus:outline-none focus:ring-0 focus-visible:border-emerald-600 focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm"
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label="Open month and year picker"
          onClick={() => {
            if (!disabled) {
              if (isOpen) handleClose()
              else handleOpen()
            }
          }}
          className="absolute right-2 flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-50 cursor-pointer"
        >
          <CalendarIcon className="h-4 w-4 text-emerald-700" aria-hidden="true" />
        </button>
      </div>

      {isOpen && mounted && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popoverRef}
              role="dialog"
              aria-label="Month and year picker"
              style={{
                position: "fixed",
                top: `${popoverPos.top}px`,
                left: `${popoverPos.left}px`,
              }}
              className="z-[99999] w-64 rounded-md border border-slate-200 bg-white p-3 shadow-xl outline-none select-none"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <button
                  type="button"
                  aria-label={view === "month" ? "Previous year" : "Previous 12 years"}
                  disabled={view === "month" ? isPrevYearDisabled : isPrevPageDisabled}
                  onClick={() => {
                    if (view === "month") {
                      setViewYear((previous) => previous - 1)
                    } else {
                      setYearPageStart((start) => start - YEARS_PER_PAGE)
                    }
                  }}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700",
                    (view === "month" ? isPrevYearDisabled : isPrevPageDisabled) &&
                      "cursor-not-allowed opacity-30 hover:bg-transparent"
                  )}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  aria-label={view === "month" ? "Switch to year grid view" : "Switch to month view"}
                  onClick={() => {
                    setYearPageStart(
                      Math.floor(viewYear / YEARS_PER_PAGE) * YEARS_PER_PAGE
                    )
                    setView((current) => (current === "month" ? "year" : "month"))
                  }}
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-bold text-slate-900 hover:bg-slate-100 hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                >
                  <span>
                    {view === "month"
                      ? viewYear
                      : `${yearPageStart} – ${yearPageStart + YEARS_PER_PAGE - 1}`}
                  </span>
                  <ChevronDownIcon
                    className={cn(
                      "h-3.5 w-3.5 text-slate-400 transition-transform duration-150",
                      view === "year" && "rotate-180 text-emerald-700"
                    )}
                  />
                </button>

                <button
                  type="button"
                  aria-label={view === "month" ? "Next year" : "Next 12 years"}
                  disabled={view === "month" ? isNextYearDisabled : isNextPageDisabled}
                  onClick={() => {
                    if (view === "month") {
                      setViewYear((previous) => previous + 1)
                    } else {
                      setYearPageStart((start) => start + YEARS_PER_PAGE)
                    }
                  }}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700",
                    (view === "month" ? isNextYearDisabled : isNextPageDisabled) &&
                      "cursor-not-allowed opacity-30 hover:bg-transparent"
                  )}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>

              {view === "month" ? (
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs">
                    <span className="font-medium text-slate-600">Whole year:</span>
                    <button
                      type="button"
                      disabled={isYearOnlyDisabled}
                      aria-label={`Select whole year ${viewYear}`}
                      onClick={() => handleSelectYearOnly(viewYear)}
                      className={cn(
                        "rounded-md px-2 py-0.5 font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700",
                        isYearOnlyDisabled
                          ? "cursor-not-allowed bg-slate-200 text-slate-400"
                          : "cursor-pointer bg-emerald-700 hover:bg-emerald-800"
                      )}
                    >
                      {isYearOnlySelected ? `Selected (${viewYear})` : `Select ${viewYear}`}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {MONTH_NAMES.map((monthName, monthIndex) => {
                      const formattedCandidate = formatMonthYear(viewYear, monthIndex)
                      const isBeforeMin = minDate
                        ? compareMonthYear(formattedCandidate, minDate) < 0
                        : false
                      const isAfterMax = maxDate
                        ? compareMonthYear(formattedCandidate, maxDate) > 0
                        : false
                      const isMonthDisabled = isBeforeMin || isAfterMax
                      const isSelected =
                        !parsedCurrent?.isYearOnly &&
                        parsedCurrent?.year === viewYear &&
                        parsedCurrent?.month === monthIndex

                      return (
                        <button
                          key={monthName}
                          type="button"
                          disabled={isMonthDisabled}
                          onClick={() => handleMonthSelect(monthIndex)}
                          className={cn(
                            "h-8 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700",
                            isSelected
                              ? "bg-emerald-700 text-white font-semibold shadow-xs"
                              : isMonthDisabled
                              ? "cursor-not-allowed bg-slate-50 text-slate-300"
                              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                          )}
                        >
                          {monthName}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs">
                    <span className="font-medium text-slate-600">Selected year:</span>
                    <button
                      type="button"
                      disabled={isYearOnlyDisabled}
                      aria-label={`Select whole year ${viewYear}`}
                      onClick={() => handleSelectYearOnly(viewYear)}
                      className={cn(
                        "rounded-md px-2 py-0.5 font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700",
                        isYearOnlyDisabled
                          ? "cursor-not-allowed bg-slate-200 text-slate-400"
                          : "cursor-pointer bg-emerald-700 hover:bg-emerald-800"
                      )}
                    >
                      {isYearOnlySelected ? `Selected (${viewYear})` : `Select ${viewYear}`}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {yearsGrid.map((year) => {
                      const isYearBeforeMin = parsedMin ? year < parsedMin.year : false
                      const isYearAfterMax = parsedMax ? year > parsedMax.year : false
                      const isYearDisabled = isYearBeforeMin || isYearAfterMax
                      const isSelected = viewYear === year
                      const isThisYear = currentYear === year

                      return (
                        <button
                          key={year}
                          type="button"
                          disabled={isYearDisabled}
                          onClick={() => handleSelectYear(year)}
                          className={cn(
                            "h-8 rounded-md text-xs font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700",
                            isSelected
                              ? "bg-emerald-700 text-white shadow-xs"
                              : isYearDisabled
                              ? "cursor-not-allowed bg-slate-50 text-slate-300"
                              : isThisYear
                              ? "text-emerald-700 font-bold border border-emerald-300 hover:bg-emerald-50"
                              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                          )}
                        >
                          {year}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                    <span className="text-slate-500 font-medium">Quick jump:</span>
                    <select
                      aria-label="Quick jump year"
                      value={viewYear}
                      onChange={(event) => {
                        const selected = Number(event.target.value)
                        handleSelectYear(selected)
                      }}
                      className="h-6 rounded-md border border-slate-200 bg-slate-50 px-1.5 text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    >
                      {dropdownYears.map((yearOption) => (
                        <option key={yearOption} value={yearOption}>
                          {yearOption}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                <button
                  type="button"
                  onClick={handleClear}
                  className="font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  disabled={isYearOnlyDisabled}
                  onClick={() => handleSelectYearOnly(viewYear)}
                  className={cn(
                    "font-semibold transition-colors",
                    isYearOnlyDisabled
                      ? "cursor-not-allowed text-slate-300"
                      : "cursor-pointer text-emerald-700 hover:text-emerald-800"
                  )}
                >
                  Use {viewYear} only
                </button>
                <button
                  type="button"
                  onClick={handleSelectThisMonth}
                  className="font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  This month
                </button>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  )
}
