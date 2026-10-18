'use client'

import { useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { EmploymentType, ExperienceLevel, WorkArrangement, JobFilterParams } from '@/types/job'

const PAGE_SIZE = 12

export function useJobFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters: JobFilterParams = useMemo(() => ({
    keyword: searchParams.get('keyword') ?? searchParams.get('q') ?? undefined,
    location: searchParams.get('location') ?? undefined,
    employmentType: (searchParams.get('employmentType') ?? undefined) as EmploymentType | undefined,
    experienceLevel: (
      searchParams.get('experienceLevel') ??
      searchParams.get('experience') ??
      undefined
    ) as ExperienceLevel | undefined,
    workArrangement: (searchParams.get('workArrangement') ?? undefined) as WorkArrangement | undefined,
    page: Number(searchParams.get('page') ?? '1'),
    pageSize: PAGE_SIZE,
  }), [searchParams])

  const buildParams = useCallback(
    (overrides: Partial<Record<string, string | undefined>>) => {
      const next = new URLSearchParams()

      const current: Record<string, string | undefined> = {
        keyword: filters.keyword,
        location: filters.location,
        employmentType: filters.employmentType,
        experienceLevel: filters.experienceLevel,
        workArrangement: filters.workArrangement,
        page: String(filters.page ?? 1),
      }

      const merged = { ...current, ...overrides }

      for (const [key, value] of Object.entries(merged)) {
        if (value !== undefined && value !== '' && value !== 'undefined') {
          next.set(key, value)
        }
      }
      return next
    },
    [filters],
  )

  const navigate = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString()
      router.push(qs ? `/jobs?${qs}` : '/jobs', { scroll: false })
    },
    [router],
  )

  const setKeyword = useCallback(
    (value: string) => navigate(buildParams({ keyword: value || undefined, page: '1' })),
    [buildParams, navigate],
  )

  const setLocation = useCallback(
    (value: string) => navigate(buildParams({ location: value || undefined, page: '1' })),
    [buildParams, navigate],
  )

  const setSearch = useCallback(
    (keyword: string, location: string) =>
      navigate(buildParams({ keyword: keyword || undefined, location: location || undefined, page: '1' })),
    [buildParams, navigate],
  )

  const setEmploymentType = useCallback(
    (value: EmploymentType | '') =>
      navigate(buildParams({ employmentType: value || undefined, page: '1' })),
    [buildParams, navigate],
  )

  const setExperienceLevel = useCallback(
    (value: ExperienceLevel | '') =>
      navigate(buildParams({ experienceLevel: value || undefined, page: '1' })),
    [buildParams, navigate],
  )

  const setWorkArrangement = useCallback(
    (value: WorkArrangement | '') =>
      navigate(buildParams({ workArrangement: value || undefined, page: '1' })),
    [buildParams, navigate],
  )

  const setPage = useCallback(
    (page: number) => navigate(buildParams({ page: String(page) })),
    [buildParams, navigate],
  )

  const clearFilter = useCallback(
    (key: keyof Omit<JobFilterParams, 'page' | 'pageSize'>) =>
      navigate(buildParams({ [key]: undefined, page: '1' })),
    [buildParams, navigate],
  )

  const clearAllFilters = useCallback(() => {
    router.push('/jobs', { scroll: false })
  }, [router])

  const hasActiveFilters =
    !!filters.keyword ||
    !!filters.location ||
    !!filters.employmentType ||
    !!filters.experienceLevel ||
    !!filters.workArrangement

  return {
    filters,
    hasActiveFilters,
    setKeyword,
    setLocation,
    setSearch,
    setEmploymentType,
    setExperienceLevel,
    setWorkArrangement,
    setPage,
    clearFilter,
    clearAllFilters,
    PAGE_SIZE,
  }
}
