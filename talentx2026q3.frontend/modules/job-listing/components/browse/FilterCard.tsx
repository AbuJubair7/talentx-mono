'use client'

import { FilterSections } from './FilterSections'
import type { FacetFilterKey } from './filterConfig'

interface FilterCardProps {
  workArrangement: string
  employmentType: string
  experienceLevel: string
  activeCount: number
  onChange: (key: FacetFilterKey, value: string) => void
  onReset: () => void
}

export function FilterCard({
  workArrangement,
  employmentType,
  experienceLevel,
  activeCount,
  onChange,
  onReset,
}: FilterCardProps) {
  return (
    <section
      aria-labelledby="sidebar-filters-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_6px_-2px_rgba(15,23,42,0.05)]"
    >
      <div className="flex items-center justify-between">
        <h2
          id="sidebar-filters-heading"
          className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-slate-900"
        >
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-semibold text-white">
              {activeCount}
              <span className="sr-only"> active</span>
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={onReset}
          disabled={activeCount === 0}
          className="rounded text-sm font-medium text-slate-500 transition-colors duration-150 ease-out hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:text-slate-300 motion-reduce:transition-none"
        >
          Reset all
        </button>
      </div>
      <div className="mt-2">
        <FilterSections
          workArrangement={workArrangement}
          employmentType={employmentType}
          experienceLevel={experienceLevel}
          onChange={onChange}
          idPrefix="sidebar"
        />
      </div>
    </section>
  )
}
