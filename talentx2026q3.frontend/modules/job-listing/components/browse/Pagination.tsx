'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

const BUTTON_CLASS =
  'inline-flex h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-colors duration-150 ease-out hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300 disabled:shadow-none disabled:hover:bg-white motion-reduce:transition-none'

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between gap-4">
      <button type="button" className={BUTTON_CLASS} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="size-4" aria-hidden="true" />
        Previous
      </button>
      <p className="text-sm text-slate-500" aria-live="polite">
        Page <span className="font-semibold tabular-nums text-slate-900">{page}</span> of{' '}
        <span className="tabular-nums">{totalPages}</span>
      </p>
      <button
        type="button"
        className={BUTTON_CLASS}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  )
}
