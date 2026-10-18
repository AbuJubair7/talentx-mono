'use client'

import { useMemo, useState } from 'react'
import { Popover } from '@base-ui/react/popover'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, X } from 'lucide-react'

import { cn } from '@/lib/utils'

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const YEARS_PER_PAGE = 12

interface ParsedMonthYear {
  year: number
  month: number | null
}

function monthIndexFromName(name: string): number | null {
  const key = name.trim().slice(0, 3).toLowerCase()
  const index = MONTHS_SHORT.findIndex((month) => month.toLowerCase() === key)
  return index === -1 ? null : index
}

export function parseMonthYear(value: string): ParsedMonthYear | null {
  const raw = value?.trim()
  if (!raw) return null

  const isoMatch = raw.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/)
  if (isoMatch) {
    const month = Number(isoMatch[2]) - 1
    return { year: Number(isoMatch[1]), month: month >= 0 && month <= 11 ? month : null }
  }

  const slashMatch = raw.match(/^(\d{1,2})\/(\d{4})$/)
  if (slashMatch) {
    const month = Number(slashMatch[1]) - 1
    return { year: Number(slashMatch[2]), month: month >= 0 && month <= 11 ? month : null }
  }

  const monthYearMatch = raw.match(/^([A-Za-z]{3,})\.?\s+(\d{4})$/)
  if (monthYearMatch) {
    return { year: Number(monthYearMatch[2]), month: monthIndexFromName(monthYearMatch[1]) }
  }

  const monthDayYearMatch = raw.match(/^([A-Za-z]{3,})\.?\s+\d{1,2},?\s+(\d{4})$/)
  if (monthDayYearMatch) {
    return { year: Number(monthDayYearMatch[2]), month: monthIndexFromName(monthDayYearMatch[1]) }
  }

  const yearOnlyMatch = raw.match(/^(\d{4})$/)
  if (yearOnlyMatch) {
    return { year: Number(yearOnlyMatch[1]), month: null }
  }

  const fallback = new Date(raw)
  if (!Number.isNaN(fallback.getTime())) {
    return { year: fallback.getFullYear(), month: fallback.getMonth() }
  }

  return null
}

export function formatMonthYear(year: number, month: number): string {
  return `${MONTHS_SHORT[month]} ${year}`
}

interface MonthYearPickerProps {
  id?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  clearable?: boolean
  className?: string
  minDate?: string
}

export function MonthYearPicker({
  id,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select date',
  clearable = true,
  className,
  minDate,
}: MonthYearPickerProps) {
  const today = useMemo(() => new Date(), [])
  const parsed = parseMonthYear(value)
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'month' | 'year'>('month')
  const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear())
  const [yearPageStart, setYearPageStart] = useState(
    Math.floor((parsed?.year ?? today.getFullYear()) / YEARS_PER_PAGE) * YEARS_PER_PAGE
  )

  const displayValue = parsed
    ? parsed.month === null
      ? `${parsed.year}`
      : formatMonthYear(parsed.year, parsed.month)
    : ''

  const showClear = clearable && Boolean(value) && !disabled

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const initialYear = parsed?.year ?? today.getFullYear()
      setView('month')
      setViewYear(initialYear)
      setYearPageStart(Math.floor(initialYear / YEARS_PER_PAGE) * YEARS_PER_PAGE)
    }
    setOpen(nextOpen)
  }

  const handleSelectMonth = (month: number) => {
    onChange(formatMonthYear(viewYear, month))
    setOpen(false)
  }

  const handleSelectYear = (year: number) => {
    setViewYear(year)
    setView('month')
  }

  const handlePrev = () => {
    if (view === 'month') {
      setViewYear((year) => year - 1)
    } else {
      setYearPageStart((start) => start - YEARS_PER_PAGE)
    }
  }

  const handleNext = () => {
    if (view === 'month') {
      setViewYear((year) => year + 1)
    } else {
      setYearPageStart((start) => start + YEARS_PER_PAGE)
    }
  }

  const years = Array.from({ length: YEARS_PER_PAGE }, (_, index) => yearPageStart + index)

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <div className="relative">
        <Popover.Trigger
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            'flex w-full items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm transition-colors focus:border-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2',
            disabled
              ? 'cursor-not-allowed bg-slate-50 text-slate-400'
              : 'cursor-pointer text-slate-900 hover:border-slate-300',
            showClear && 'pr-9',
            className
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
          <span className={cn('truncate', displayValue ? 'text-slate-900' : 'text-slate-400')}>
            {displayValue || placeholder}
          </span>
        </Popover.Trigger>

        {showClear ? (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear date"
            className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="isolate z-[100]"
        >
          <Popover.Popup className="w-72 rounded-md border border-slate-200 bg-white p-3 shadow-xl outline-none">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                aria-label={view === 'month' ? 'Previous year' : 'Previous years'}
                className="flex size-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <ChevronLeftIcon className="size-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => setView((current) => (current === 'month' ? 'year' : 'month'))}
                className="rounded-md px-2 py-1 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                {view === 'month'
                  ? viewYear
                  : `${yearPageStart} – ${yearPageStart + YEARS_PER_PAGE - 1}`}
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label={view === 'month' ? 'Next year' : 'Next years'}
                className="flex size-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <ChevronRightIcon className="size-4" aria-hidden="true" />
              </button>
            </div>

            {view === 'month' ? (
              <div className="grid grid-cols-3 gap-1">
                {MONTHS_SHORT.map((label, index) => {
                  const isSelected = parsed?.year === viewYear && parsed?.month === index
                  const isCurrent = today.getFullYear() === viewYear && today.getMonth() === index
                  const parsedMin = minDate ? parseMonthYear(minDate) : null
                  const isBeforeMin = parsedMin
                    ? viewYear < parsedMin.year ||
                      (viewYear === parsedMin.year && parsedMin.month !== null && index < parsedMin.month)
                    : false
                  return (
                    <button
                      key={label}
                      type="button"
                      disabled={isBeforeMin}
                      onClick={() => handleSelectMonth(index)}
                      className={cn(
                        'flex h-9 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-1',
                        isSelected
                          ? 'bg-emerald-700 font-bold text-white shadow-xs'
                          : isBeforeMin
                            ? 'cursor-not-allowed bg-slate-50 text-slate-300'
                            : isCurrent
                              ? 'font-bold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50'
                              : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-900'
                      )}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {years.map((year) => {
                  const isSelected = parsed?.year === year
                  const isCurrent = today.getFullYear() === year
                  const parsedMin = minDate ? parseMonthYear(minDate) : null
                  const isYearBeforeMin = parsedMin ? year < parsedMin.year : false
                  return (
                    <button
                      key={year}
                      type="button"
                      disabled={isYearBeforeMin}
                      onClick={() => handleSelectYear(year)}
                      className={cn(
                        'flex h-9 items-center justify-center rounded-md text-sm font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-1',
                        isSelected
                          ? 'bg-emerald-700 font-bold text-white shadow-xs'
                          : isYearBeforeMin
                            ? 'cursor-not-allowed bg-slate-50 text-slate-300'
                            : isCurrent
                              ? 'font-bold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50'
                              : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-900'
                      )}
                    >
                      {year}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
              <button
                type="button"
                onClick={() => {
                  onChange('')
                  setOpen(false)
                }}
                className="rounded-md px-2 py-1 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange(formatMonthYear(today.getFullYear(), today.getMonth()))
                  setOpen(false)
                }}
                className="rounded-md px-2 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                This month
              </button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
