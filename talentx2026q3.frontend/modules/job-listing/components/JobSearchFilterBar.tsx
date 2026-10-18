'use client'

import { useState } from 'react'
import { Search, MapPin, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { EmploymentType, ExperienceLevel, WorkArrangement, JobFilterParams } from '@/types/job'

interface JobSearchFilterBarProps {
  filters: JobFilterParams
  onKeywordChange: (value: string) => void
  onLocationChange: (value: string) => void
  onSearchSubmit?: (keyword: string, location: string) => void
  onEmploymentTypeChange?: (value: EmploymentType | '') => void
  onExperienceLevelChange?: (value: ExperienceLevel | '') => void
  onWorkArrangementChange?: (value: WorkArrangement | '') => void
  onClearAll?: () => void
  hasActiveFilters?: boolean
  onOpenMobileFilters?: () => void
  activeFiltersCount?: number
}

const POPULAR_SEARCH_TAGS = [
  { label: 'Full Remote', filter: { workArrangement: 'FullRemote' as WorkArrangement } },
  { label: 'Full Time', filter: { employmentType: 'FullTime' as EmploymentType } },
  { label: 'React', filter: { keyword: 'React' } },
  { label: '.NET / C#', filter: { keyword: '.NET' } },
  { label: 'Senior', filter: { experienceLevel: 'SeniorLevel' as ExperienceLevel } },
  { label: 'Entry Level', filter: { experienceLevel: 'EntryLevel' as ExperienceLevel } },
]

export function JobSearchFilterBar({
  filters,
  onKeywordChange,
  onLocationChange,
  onSearchSubmit,
  onEmploymentTypeChange,
  onExperienceLevelChange,
  onWorkArrangementChange,
  onOpenMobileFilters,
  activeFiltersCount = 0,
}: JobSearchFilterBarProps) {
  const [prevKeyword, setPrevKeyword] = useState(filters.keyword ?? '')
  const [keywordInput, setKeywordInput] = useState(filters.keyword ?? '')

  if ((filters.keyword ?? '') !== prevKeyword) {
    setPrevKeyword(filters.keyword ?? '')
    setKeywordInput(filters.keyword ?? '')
  }

  const [prevLocation, setPrevLocation] = useState(filters.location ?? '')
  const [locationInput, setLocationInput] = useState(filters.location ?? '')

  if ((filters.location ?? '') !== prevLocation) {
    setPrevLocation(filters.location ?? '')
    setLocationInput(filters.location ?? '')
  }

  const commitKeyword = () => onKeywordChange(keywordInput.trim())
  const commitLocation = () => onLocationChange(locationInput.trim())

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearchSubmit) {
      onSearchSubmit(keywordInput.trim(), locationInput.trim())
    } else {
      commitKeyword()
      commitLocation()
    }
  }

  const handleQuickTagClick = (tag: typeof POPULAR_SEARCH_TAGS[number]) => {
    if (tag.filter.workArrangement && onWorkArrangementChange) {
      onWorkArrangementChange(tag.filter.workArrangement)
    } else if (tag.filter.employmentType && onEmploymentTypeChange) {
      onEmploymentTypeChange(tag.filter.employmentType)
    } else if (tag.filter.experienceLevel && onExperienceLevelChange) {
      onExperienceLevelChange(tag.filter.experienceLevel)
    } else if (tag.filter.keyword) {
      setKeywordInput(tag.filter.keyword)
      onKeywordChange(tag.filter.keyword)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all space-y-4">
      {/* Primary Search Inputs Form */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch gap-3">
        {/* Keyword Search Input */}
        <div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-50/90 px-4 py-3 border border-slate-200/90 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-3 focus-within:ring-emerald-500/10 transition-all">
          <Search className="size-4.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="Job title, keywords, skills, or company..."
            aria-label="Search by keyword"
            className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {keywordInput && (
            <button
              type="button"
              onClick={() => {
                setKeywordInput('')
                onKeywordChange('')
              }}
              aria-label="Clear keyword search"
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-200/60 cursor-pointer shrink-0"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Location Search Input */}
        <div className="flex md:w-72 items-center gap-2.5 rounded-xl bg-slate-50/90 px-3.5 py-3 border border-slate-200/90 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-3 focus-within:ring-emerald-500/10 transition-all">
          <MapPin className="size-4.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            placeholder="City, country, or remote..."
            aria-label="Filter by location"
            className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none min-w-0"
          />
          {locationInput && (
            <button
              type="button"
              onClick={() => {
                setLocationInput('')
                onLocationChange('')
              }}
              aria-label="Clear location search"
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-200/60 cursor-pointer shrink-0"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Filter Drawer Trigger Button */}
          {onOpenMobileFilters && (
            <Button
              type="button"
              variant="outline"
              onClick={onOpenMobileFilters}
              className="lg:hidden flex-1 md:flex-none h-11 rounded-xl border-slate-200 text-slate-700 font-semibold text-sm gap-2"
            >
              <SlidersHorizontal className="size-4 text-emerald-600" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="size-5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          )}

          {/* Search CTA Button */}
          <Button
            type="submit"
            className="flex-1 md:flex-none h-11 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white hover:bg-slate-800 gap-2 shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            <Search className="size-4" />
            <span>Search Jobs</span>
          </Button>
        </div>
      </form>

      {/* Popular Trending Keywords */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-400 mr-1 select-none">
          Trending:
        </span>
        {POPULAR_SEARCH_TAGS.map((tag) => (
          <button
            key={tag.label}
            type="button"
            onClick={() => handleQuickTagClick(tag)}
            className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-transparent transition-all cursor-pointer"
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  )
}
