"use client"

import { useState, useRef, useEffect } from "react"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

interface DatePickerFieldProps {
  id?: string
  value: string
  onChange: (value: string) => void
  min?: string
  error?: string
  required?: boolean
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function parseDate(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split("-").map(Number)
  return { year, month: month - 1, day }
}

function formatDate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0")
  const d = String(day).padStart(2, "0")
  return `${year}-${m}-${d}`
}

function isDateBefore(year: number, month: number, day: number, minStr: string): boolean {
  const min = parseDate(minStr)
  if (!min) return false
  const date = new Date(year, month, day)
  const minDate = new Date(min.year, min.month, min.day)
  return date < minDate
}

export function DatePickerField({
  id,
  value,
  onChange,
  min,
  error,
  required,
}: DatePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const parsed = parseDate(value)
  const today = new Date()
  const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && parsed) {
      setViewYear(parsed.year)
      setViewMonth(parsed.month)
    }
  }, [isOpen])

  function handlePrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  function handleSelectDay(day: number) {
    onChange(formatDate(viewYear, viewMonth, day))
    setIsOpen(false)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const displayValue = parsed
    ? `${MONTHS[parsed.month]} ${parsed.day}, ${parsed.year}`
    : ""

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-11 w-full items-center gap-3 rounded-md border bg-slate-50/80 px-3.5 text-sm font-medium shadow-sm transition-all duration-200 hover:border-slate-500 hover:shadow hover:bg-white focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 cursor-pointer ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-0"
            : isOpen
              ? "border-emerald-600"
              : "border-slate-300"
        }`}
      >
        <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
        <span className={displayValue ? "text-slate-900" : "text-slate-400"}>
          {displayValue || "Select date"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          {/* Month/Year navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-slate-900">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="flex h-8 items-center justify-center text-[11px] font-bold uppercase tracking-wider text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isSelected =
                parsed?.year === viewYear &&
                parsed?.month === viewMonth &&
                parsed?.day === day
              const isDisabled = min ? isDateBefore(viewYear, viewMonth, day, min) : false
              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === day

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => !isDisabled && handleSelectDay(day)}
                  disabled={isDisabled}
                  className={`flex h-9 items-center justify-center rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white font-bold shadow-sm"
                      : isToday
                        ? "border border-emerald-300 text-emerald-700 font-bold"
                        : isDisabled
                          ? "text-slate-300 cursor-not-allowed"
                          : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Today button */}
          <div className="mt-2 flex justify-center border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={() => {
                const t = new Date()
                onChange(formatDate(t.getFullYear(), t.getMonth(), t.getDate()))
                setIsOpen(false)
              }}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
