'use client'

import { Suspense, useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHeaderSession } from '@/components/common/use-header-session'
import { useSavedJobIds, useSaveJob, useRemoveSavedJob } from '@/modules/saved-jobs'
import {
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  WORK_ARRANGEMENT_LABELS,
} from '@/types/job'
import type { EmploymentType, ExperienceLevel, WorkArrangement } from '@/types/job'
import { usePublishedJobs } from '../hooks/usePublishedJobs'
import { useJobFilters } from '../hooks/useJobFilters'
import { SearchBar } from './browse/SearchBar'
import { FilterCard } from './browse/FilterCard'
import { PromoCard } from './browse/PromoCard'
import { FilterDrawer } from './browse/FilterDrawer'
import { FeedToolbar, type FeedView } from './browse/FeedToolbar'
import { FeedResults, type EmptyKind } from './browse/FeedResults'
import { Pagination } from './browse/Pagination'
import {
  ALL,
  TRENDING_CHIPS,
  type ActivePill,
  type FacetFilterKey,
  type TrendingChip,
} from './browse/filterConfig'
import { CreateJobAlertDialog } from './CreateJobAlertDialog'
import { JobListViewSkeleton } from './JobSkeleton'

function isSetLike(value: unknown): value is Set<string> {
  return value instanceof Set
}

function JobsViewInner() {
  const router = useRouter()
  const [view, setView] = useState<FeedView>('grid')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)

  const {
    filters,
    hasActiveFilters,
    setKeyword,
    setSearch,
    setEmploymentType,
    setExperienceLevel,
    setWorkArrangement,
    setPage,
    clearFilter,
    clearAllFilters,
  } = useJobFilters()

  const { data, isPending, isError, refetch } = usePublishedJobs(filters)

  const { isAuthenticated, isTalent, isEmployer } = useHeaderSession()
  const { data: savedIds } = useSavedJobIds({ enabled: isAuthenticated && !isEmployer })
  const saveMutation = useSaveJob()
  const removeMutation = useRemoveSavedJob()

  const showSaveButton = isTalent
  const isAuthenticatedTalent = isAuthenticated && isTalent

  const keyword = filters.keyword ?? ''
  const location = filters.location ?? ''
  const workArrangement = filters.workArrangement || ALL
  const employmentType = filters.employmentType || ALL
  const experienceLevel = filters.experienceLevel || ALL

  const isSaved = useCallback(
    (id: string) => {
      if (!showSaveButton) return false
      if (isSetLike(savedIds)) return savedIds.has(id)
      if (Array.isArray(savedIds)) return (savedIds as string[]).includes(id)
      return false
    },
    [savedIds, showSaveButton],
  )

  const handleToggleSave = useCallback(
    (jobId: string) => {
      if (!isAuthenticated) {
        router.push('/login')
        return
      }
      if (isSaved(jobId)) {
        removeMutation.mutate(jobId)
      } else {
        saveMutation.mutate(jobId)
      }
    },
    [isAuthenticated, isSaved, removeMutation, saveMutation, router],
  )

  const pendingJobId = saveMutation.isPending
    ? saveMutation.variables
    : removeMutation.isPending
      ? removeMutation.variables
      : undefined

  const activeTrendingLabels = useMemo(
    () =>
      TRENDING_CHIPS.filter((chip) => {
        const patch = chip.patch
        if (patch.keyword !== undefined) return keyword.toLowerCase() === patch.keyword.toLowerCase()
        if (patch.workArrangement) return filters.workArrangement === patch.workArrangement
        if (patch.employmentType) return filters.employmentType === patch.employmentType
        if (patch.experienceLevel) return filters.experienceLevel === patch.experienceLevel
        return false
      }).map((chip) => chip.label),
    [keyword, filters.workArrangement, filters.employmentType, filters.experienceLevel],
  )

  const handleToggleTrending = useCallback(
    (chip: TrendingChip) => {
      const active = activeTrendingLabels.includes(chip.label)
      const { keyword: chipKeyword, workArrangement: chipMode, employmentType: chipType, experienceLevel: chipLevel } =
        chip.patch

      if (chipKeyword !== undefined) {
        setKeyword(active ? '' : chipKeyword)
      } else if (chipMode) {
        setWorkArrangement(active ? '' : chipMode)
      } else if (chipType) {
        setEmploymentType(active ? '' : chipType)
      } else if (chipLevel) {
        setExperienceLevel(active ? '' : chipLevel)
      }
    },
    [activeTrendingLabels, setKeyword, setWorkArrangement, setEmploymentType, setExperienceLevel],
  )

  const handleFacetChange = useCallback(
    (key: FacetFilterKey, value: string) => {
      const next = value === ALL ? '' : value
      if (key === 'workArrangement') setWorkArrangement(next as WorkArrangement | '')
      else if (key === 'employmentType') setEmploymentType(next as EmploymentType | '')
      else setExperienceLevel(next as ExperienceLevel | '')
    },
    [setWorkArrangement, setEmploymentType, setExperienceLevel],
  )

  const activeFacetCount = [workArrangement, employmentType, experienceLevel].filter(
    (value) => value !== ALL,
  ).length
  const activeFiltersCount = [keyword, location, workArrangement, employmentType, experienceLevel].filter(
    Boolean,
  ).length

  const pills = useMemo<ActivePill[]>(() => {
    const next: ActivePill[] = []
    if (keyword) next.push({ key: 'keyword', label: 'Keyword', value: keyword })
    if (location) next.push({ key: 'location', label: 'Location', value: location })
    if (filters.workArrangement) {
      next.push({
        key: 'workArrangement',
        label: 'Work mode',
        value: WORK_ARRANGEMENT_LABELS[filters.workArrangement] ?? filters.workArrangement,
      })
    }
    if (filters.employmentType) {
      next.push({
        key: 'employmentType',
        label: 'Type',
        value: EMPLOYMENT_TYPE_LABELS[filters.employmentType] ?? filters.employmentType,
      })
    }
    if (filters.experienceLevel) {
      next.push({
        key: 'experienceLevel',
        label: 'Level',
        value: EXPERIENCE_LEVEL_LABELS[filters.experienceLevel] ?? filters.experienceLevel,
      })
    }
    return next
  }, [keyword, location, filters.workArrangement, filters.employmentType, filters.experienceLevel])

  const items = data?.items ?? []
  const total = data?.totalCount ?? 0
  const page = data?.page ?? 1
  const totalPages = data?.totalPages ?? 0
  const savedCount = isAuthenticatedTalent && isSetLike(savedIds) ? savedIds.size : 0

  const status = isPending ? 'loading' : isError ? 'error' : 'ready'
  const emptyKind: EmptyKind = status !== 'ready' ? 'none' : items.length > 0 ? 'none' : hasActiveFilters ? 'filtered' : 'catalog'
  const showPagination = status === 'ready' && items.length > 0 && totalPages > 1

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    if (typeof document !== 'undefined') {
      document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="w-full font-sans text-slate-900 antialiased">
      <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 md:pt-14 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900 md:text-[40px] md:leading-[1.1]">
              Browse jobs
            </h1>
            <p className="mt-3 max-w-lg text-[15px] leading-6 text-slate-500">
              Roles from verified startups and enterprise teams, updated every hour.
            </p>
          </div>
          <p className="text-sm text-slate-500" aria-live="polite">
            <span className="font-semibold tabular-nums text-emerald-700">{total}</span> open roles
            <span className="mx-2 text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="font-semibold tabular-nums text-emerald-700">{savedCount}</span> saved
          </p>
        </div>

        <div className="mt-8">
          <SearchBar
            keyword={keyword}
            location={location}
            activeCount={activeFiltersCount}
            activeTrendingLabels={activeTrendingLabels}
            onSearch={setSearch}
            onToggleTrending={handleToggleTrending}
            onOpenFilters={() => setDrawerOpen(true)}
          />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <aside className="hidden lg:col-span-3 lg:block" aria-label="Filters and promotions">
            <div className="sticky top-24 space-y-5">
              <FilterCard
                workArrangement={workArrangement}
                employmentType={employmentType}
                experienceLevel={experienceLevel}
                activeCount={activeFacetCount}
                onChange={handleFacetChange}
                onReset={clearAllFilters}
              />
              {isAuthenticatedTalent && <PromoCard />}
            </div>
          </aside>

          <section id="feed" aria-labelledby="feed-heading" className="scroll-mt-24 lg:col-span-9">
            <FeedToolbar
              total={total}
              view={view}
              onViewChange={setView}
              pills={pills}
              onRemovePill={clearFilter}
              onClearAll={clearAllFilters}
              onCreateAlert={() => setAlertOpen(true)}
            />
            <FeedResults
              status={status}
              view={view}
              items={items}
              emptyKind={emptyKind}
              isAuthenticatedTalent={isAuthenticatedTalent}
              showSaveButton={showSaveButton}
              isSaved={isSaved}
              onToggleSave={handleToggleSave}
              pendingJobId={pendingJobId}
              onRetry={() => refetch()}
              onClearFilters={clearAllFilters}
              onCreateAlert={() => setAlertOpen(true)}
            />
            {showPagination && (
              <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
            )}
          </section>
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        workArrangement={workArrangement}
        employmentType={employmentType}
        experienceLevel={experienceLevel}
        total={total}
        activeCount={activeFacetCount}
        onChange={handleFacetChange}
        onReset={clearAllFilters}
      />

      <CreateJobAlertDialog open={alertOpen} onOpenChange={setAlertOpen} filters={filters} />
    </div>
  )
}

export function JobsView() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <JobListViewSkeleton count={4} />
        </div>
      }
    >
      <JobsViewInner />
    </Suspense>
  )
}
