'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type {
  CompanyFilterParams,
  CompanySortBy,
  CompanySortDir,
} from '../types/company-list.types';
import { DEFAULT_COMPANY_PAGE_SIZE } from '../types/company-list.types';

const PAGE_SIZE = DEFAULT_COMPANY_PAGE_SIZE;

const VALID_SORT_BYS: readonly CompanySortBy[] = ['name', 'openings', 'vacancies', 'newest'];

function parsePage(raw: string | null): number {
  const page = Number(raw ?? '1');
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

function parseSortBy(raw: string | null): CompanySortBy {
  return VALID_SORT_BYS.includes(raw as CompanySortBy) ? (raw as CompanySortBy) : 'name';
}

function parseSortDir(raw: string | null): CompanySortDir {
  return raw === 'desc' ? 'desc' : 'asc';
}

export function useCompanyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: CompanyFilterParams = useMemo(
    () => ({
      // Canonical params; `q` / `size` are legacy aliases still accepted on read.
      keyword: searchParams.get('keyword') ?? searchParams.get('q') ?? undefined,
      industry: searchParams.get('industry') ?? undefined,
      location: searchParams.get('location') ?? undefined,
      companySize: searchParams.get('companySize') ?? searchParams.get('size') ?? undefined,
      hiring: searchParams.get('hiring') === 'true' ? true : undefined,
      sortBy: parseSortBy(searchParams.get('sortBy')),
      sortDir: parseSortDir(searchParams.get('sortDir')),
      page: parsePage(searchParams.get('page')),
      pageSize: PAGE_SIZE,
    }),
    [searchParams],
  );

  const buildParams = useCallback(
    (overrides: Partial<Record<string, string | undefined>>) => {
      const next = new URLSearchParams();

      const current: Record<string, string | undefined> = {
        keyword: filters.keyword,
        industry: filters.industry,
        location: filters.location,
        companySize: filters.companySize,
        hiring: filters.hiring ? 'true' : undefined,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
        page: String(filters.page ?? 1),
      };

      const merged = { ...current, ...overrides };

      for (const [key, value] of Object.entries(merged)) {
        if (value !== undefined && value !== '' && value !== 'undefined') {
          next.set(key, value);
        }
      }
      return next;
    },
    [filters],
  );

  const navigate = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString();
      router.push(qs ? `/companies?${qs}` : '/companies', { scroll: false });
    },
    [router],
  );

  const setKeyword = useCallback(
    (value: string) => navigate(buildParams({ keyword: value || undefined, page: '1' })),
    [buildParams, navigate],
  );

  const setSearch = useCallback(
    (keyword: string, location: string) =>
      navigate(
        buildParams({
          keyword: keyword || undefined,
          location: location || undefined,
          page: '1',
        }),
      ),
    [buildParams, navigate],
  );

  const setIndustry = useCallback(
    (value: string) => navigate(buildParams({ industry: value || undefined, page: '1' })),
    [buildParams, navigate],
  );

  const setLocation = useCallback(
    (value: string) => navigate(buildParams({ location: value || undefined, page: '1' })),
    [buildParams, navigate],
  );

  const setCompanySize = useCallback(
    (value: string) => navigate(buildParams({ companySize: value || undefined, page: '1' })),
    [buildParams, navigate],
  );

  const setHiring = useCallback(
    (value: boolean) =>
      navigate(buildParams({ hiring: value ? 'true' : undefined, page: '1' })),
    [buildParams, navigate],
  );

  /**
   * Commits several filters in a single navigation (auto-applied on change).
   * Empty values clear the corresponding filter. Page resets to 1.
   */
  const applyFilters = useCallback(
    (patch: {
      industry?: string;
      location?: string;
      companySize?: string;
    }) =>
      navigate(
        buildParams({
          industry: patch.industry || undefined,
          location: patch.location || undefined,
          companySize: patch.companySize || undefined,
          page: '1',
        }),
      ),
    [buildParams, navigate],
  );

  const setSort = useCallback(
    (sortBy: CompanySortBy, sortDir: CompanySortDir = 'asc') =>
      navigate(buildParams({ sortBy, sortDir, page: '1' })),
    [buildParams, navigate],
  );

  const setPage = useCallback(
    (page: number) => navigate(buildParams({ page: String(page) })),
    [buildParams, navigate],
  );

  const clearFilter = useCallback(
    (key: keyof Omit<CompanyFilterParams, 'page' | 'pageSize'>) =>
      navigate(buildParams({ [key]: undefined, page: '1' })),
    [buildParams, navigate],
  );

  const clearAllFilters = useCallback(() => {
    router.push('/companies', { scroll: false });
  }, [router]);

  const hasActiveFilters =
    !!filters.keyword ||
    !!filters.industry ||
    !!filters.location ||
    !!filters.companySize ||
    !!filters.hiring;

  return {
    filters,
    hasActiveFilters,
    setKeyword,
    setSearch,
    setIndustry,
    setLocation,
    setCompanySize,
    setHiring,
    applyFilters,
    setSort,
    setPage,
    clearFilter,
    clearAllFilters,
    PAGE_SIZE,
  };
}
