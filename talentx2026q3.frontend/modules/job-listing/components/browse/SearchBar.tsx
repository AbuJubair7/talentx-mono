'use client'

import { useState } from 'react'
import { MapPin, Search, SlidersHorizontal } from 'lucide-react'
import { TRENDING_CHIPS, type TrendingChip } from './filterConfig'

interface SearchBarProps {
  keyword: string
  location: string
  activeCount: number
  activeTrendingLabels: string[]
  onSearch: (keyword: string, location: string) => void
  onToggleTrending: (chip: TrendingChip) => void
  onOpenFilters: () => void
}

const INPUT_CLASS =
  'h-12 w-full rounded-xl bg-transparent pl-11 pr-3 text-[15px] text-slate-900 placeholder:text-slate-400 transition-colors duration-150 ease-out hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none'

export function SearchBar({
  keyword,
  location,
  activeCount,
  activeTrendingLabels,
  onSearch,
  onToggleTrending,
  onOpenFilters,
}: SearchBarProps) {
  const [keywordDraft, setKeywordDraft] = useState(keyword)
  const [locationDraft, setLocationDraft] = useState(location)

  // Keep drafts in sync when filters change elsewhere (pills, trending, reset).
  const [prevKeyword, setPrevKeyword] = useState(keyword)
  if (keyword !== prevKeyword) {
    setPrevKeyword(keyword)
    setKeywordDraft(keyword)
  }

  const [prevLocation, setPrevLocation] = useState(location)
  if (location !== prevLocation) {
    setPrevLocation(location)
    setLocationDraft(location)
  }

  return (
    <section
      aria-label="Search jobs"
      className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]"
    >
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          onSearch(keywordDraft, locationDraft)
        }}
        className="flex flex-col gap-1.5 p-2 md:flex-row md:items-center"
      >
        <label className="relative flex flex-1 items-center">
          <span className="sr-only">Keywords</span>
          <Search className="pointer-events-none absolute left-4 size-[18px] text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={keywordDraft}
            onChange={(event) => setKeywordDraft(event.target.value)}
            placeholder="Job title, keywords, or company"
            className={INPUT_CLASS}
          />
        </label>

        <div className="hidden h-7 w-px shrink-0 bg-slate-200 md:block" aria-hidden="true" />

        <label className="relative flex items-center md:w-64">
          <span className="sr-only">Location</span>
          <MapPin className="pointer-events-none absolute left-4 size-[18px] text-slate-400" aria-hidden="true" />
          <input
            type="text"
            value={locationDraft}
            onChange={(event) => setLocationDraft(event.target.value)}
            placeholder="City or remote"
            className={INPUT_CLASS}
          />
        </label>

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-colors duration-150 ease-out hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none md:flex-none lg:hidden"
          >
            <SlidersHorizontal className="size-4 text-slate-500" aria-hidden="true" />
            Filters
            {activeCount > 0 && (
              <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-semibold text-white">
                {activeCount}
                <span className="sr-only"> active</span>
              </span>
            )}
          </button>
          <button
            type="submit"
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(5,150,105,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] transition-colors duration-150 ease-out hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 motion-reduce:transition-none md:flex-none"
          >
            <Search className="size-4" aria-hidden="true" />
            Search
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-4 py-3">
        <span className="mr-1 text-xs font-medium text-slate-500">Trending:</span>
        {TRENDING_CHIPS.map((chip) => {
          const active = activeTrendingLabels.includes(chip.label)
          return (
            <button
              key={chip.label}
              type="button"
              aria-pressed={active}
              onClick={() => onToggleTrending(chip)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none ${
                active
                  ? 'border-emerald-600/30 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
              }`}
            >
              {chip.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}
