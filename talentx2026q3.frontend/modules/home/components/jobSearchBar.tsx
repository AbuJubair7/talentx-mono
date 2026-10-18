'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Briefcase, MapPin, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EXPERIENCE_LEVELS, EXPERIENCE_LEVEL_LABELS } from '@/types/job'
import type { ExperienceLevel } from '@/types/job'
import { ANIMATED_SEARCH_ROLE_TITLES } from '../constants/animatedSearchRoleTitles'
import { POPULAR_QUICK_SEARCH_TAGS } from '../constants/popularQuickSearchTags'
import { useAnimatedPlaceholder } from '../hooks/useAnimatedPlaceholder'

interface JobSearchBarProps {
  readonly className?: string
}

const EXPERIENCE_LEVEL_ITEMS: Record<string, string> = {
  all: 'Any',
  ...Object.fromEntries(
    EXPERIENCE_LEVELS.map((levelOption) => [levelOption, EXPERIENCE_LEVEL_LABELS[levelOption] ?? levelOption])
  ),
}

export function JobSearchBar({ className = '' }: JobSearchBarProps = {}) {
  const router = useRouter()
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>('')
  const [isKeywordFocused, setIsKeywordFocused] = useState(false)
  const [isLocationFocused, setIsLocationFocused] = useState(false)

  const animatedPlaceholder = useAnimatedPlaceholder({
    roles: ANIMATED_SEARCH_ROLE_TITLES,
    isUserTyping: keyword.length > 0 || isKeywordFocused,
  })

  const handleSearch = (formSubmitEvent: React.FormEvent<HTMLFormElement>) => {
    formSubmitEvent.preventDefault()
    const searchParameters = new URLSearchParams()

    const trimmedKeyword = keyword.trim()
    const trimmedLocation = location.trim()

    if (trimmedKeyword.length > 0) {
      searchParameters.set('keyword', trimmedKeyword)
    }

    if (experienceLevel) {
      searchParameters.set('experienceLevel', experienceLevel)
    }

    if (trimmedLocation.length > 0) {
      searchParameters.set('location', trimmedLocation)
    }

    const queryString = searchParameters.toString()
    router.push(queryString ? `/jobs?${queryString}` : '/jobs')
  }

  const handleTagClick = (tagKeyword: string) => {
    setKeyword(tagKeyword)
    const searchParameters = new URLSearchParams()
    searchParameters.set('keyword', tagKeyword)

    if (experienceLevel) {
      searchParameters.set('experienceLevel', experienceLevel)
    }

    const trimmedLocation = location.trim()
    if (trimmedLocation.length > 0) {
      searchParameters.set('location', trimmedLocation)
    }

    const queryString = searchParameters.toString()
    router.push(queryString ? `/jobs?${queryString}` : '/jobs')
  }

  return (
    <section className={`relative z-20 mx-auto w-full max-w-5xl ${className}`.trim()}>
      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-lg shadow-slate-900/5 hover:border-slate-300 hover:shadow-xl transition-all duration-200">
        {/* Main Search Bar Form */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3"
        >
          {/* Job Title / Keyword Input */}
          <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-50/80 px-4 py-2 border border-slate-300 hover:border-slate-400/90 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-700/20 transition-all min-w-0">
            <div className="flex items-center justify-center size-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
              <Search className="size-4 text-emerald-700" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={keyword}
              onChange={(changeEvent) => setKeyword(changeEvent.target.value)}
              onFocus={() => setIsKeywordFocused(true)}
              onBlur={() => setIsKeywordFocused(false)}
              placeholder={isKeywordFocused ? '' : animatedPlaceholder}
              aria-label="Job title, skill, or keyword"
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-600 placeholder:opacity-100 focus:placeholder:text-transparent font-medium border-0 border-none outline-none focus:outline-none focus:ring-0 focus:border-none focus:shadow-none min-w-0"
              style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
            />
            {keyword.length > 0 && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                aria-label="Clear keyword search"
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Location Input */}
          <div className="flex lg:w-64 items-center gap-3 rounded-2xl bg-slate-50/80 px-4 py-2 border border-slate-300 hover:border-slate-400/90 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-700/20 transition-all min-w-0">
            <div className="flex items-center justify-center size-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
              <MapPin className="size-4 text-emerald-700" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={location}
              onChange={(changeEvent) => setLocation(changeEvent.target.value)}
              onFocus={() => setIsLocationFocused(true)}
              onBlur={() => setIsLocationFocused(false)}
              placeholder={isLocationFocused ? '' : "City, country, or 'Remote'"}
              aria-label="Filter by location"
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-600 placeholder:opacity-100 focus:placeholder:text-transparent font-medium border-0 border-none outline-none focus:outline-none focus:ring-0 focus:border-none focus:shadow-none min-w-0"
              style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
            />
            {location.length > 0 && (
              <button
                type="button"
                onClick={() => setLocation('')}
                aria-label="Clear location search"
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Experience Level Dropdown */}
          <div className="flex lg:w-64 items-center gap-3 rounded-2xl bg-slate-50/80 px-4 py-2 border border-slate-300 hover:border-slate-400/90 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-700/20 transition-all min-w-0">
            <div className="flex items-center justify-center size-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
              <Briefcase className="size-4 text-emerald-700" aria-hidden="true" />
            </div>
            <div className="relative flex-1 min-w-0">
              <Select
                items={EXPERIENCE_LEVEL_ITEMS}
                value={experienceLevel || 'all'}
                onValueChange={(selectedValue) =>
                  setExperienceLevel(
                    selectedValue === 'all' || selectedValue === null
                      ? ''
                      : (selectedValue as ExperienceLevel)
                  )
                }
              >
                <SelectTrigger
                  aria-label="Filter by experience level"
                  className={`h-auto w-full min-w-0 cursor-pointer justify-between rounded-none border-0 p-0 text-sm font-medium focus-visible:ring-0 [&_svg]:text-slate-400 ${
                    experienceLevel === '' ? 'text-slate-600' : 'text-slate-900'
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  side="bottom"
                  sideOffset={17}
                  align="start"
                  alignItemWithTrigger={false}
                  className="rounded-xl border-slate-200 p-1 shadow-xl"
                >
                  <SelectItem
                    value="all"
                    className="cursor-pointer rounded-lg px-3 py-2 text-sm text-slate-600 outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:text-slate-900"
                  >
                    Any
                  </SelectItem>
                  {EXPERIENCE_LEVELS.map((levelOption) => (
                    <SelectItem
                      key={levelOption}
                      value={levelOption}
                      className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-emerald-50 hover:text-emerald-950 focus:bg-emerald-50 focus:text-emerald-950"
                    >
                      {EXPERIENCE_LEVEL_LABELS[levelOption] ?? levelOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {experienceLevel !== '' && (
                <button
                  type="button"
                  onClick={() => setExperienceLevel('')}
                  aria-label="Clear experience level filter"
                  className="absolute right-6 top-1/2 z-10 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Search Submit Button */}
          <Button
            type="submit"
            className="h-12 lg:h-13 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-md shadow-emerald-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 px-6 text-sm shrink-0 gap-2 cursor-pointer transition-colors w-full lg:w-auto"
          >
            <Search className="size-4" aria-hidden="true" />
            <span>Search Jobs</span>
          </Button>
        </form>

        {/* Popular Quick-Search Tags — slow left-to-right ticker, single accent color */}
        <div className="relative overflow-hidden pt-3 sm:pt-4 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <div className="flex w-max animate-marquee-right gap-2 hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
            <div className="flex items-center gap-2">
              {POPULAR_QUICK_SEARCH_TAGS.map((popularTag) => (
                <button
                  key={popularTag.label}
                  type="button"
                  onClick={() => handleTagClick(popularTag.keyword)}
                  className="cursor-pointer whitespace-nowrap rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1"
                >
                  {popularTag.label}
                </button>
              ))}
            </div>
            <div aria-hidden="true" className="flex items-center gap-2">
              {POPULAR_QUICK_SEARCH_TAGS.map((popularTag) => (
                <button
                  key={popularTag.label}
                  type="button"
                  tabIndex={-1}
                  onClick={() => handleTagClick(popularTag.keyword)}
                  className="cursor-pointer whitespace-nowrap rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1"
                >
                  {popularTag.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
