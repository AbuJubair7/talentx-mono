'use client';

import { Suspense, useCallback, useMemo } from 'react';
import { Inter } from 'next/font/google';
import { ArrowUpDown, Briefcase, Loader2, Users, X } from 'lucide-react';
import { usePublicCompanies } from '../hooks/usePublicCompanies';
import { useCompanyFilters } from '../hooks/useCompanyFilters';
import { CompanyHero } from './CompanyHero';
import { CompanyFilterDropdown } from './CompanyFilterDropdown';
import { CompanyQuickFilters, resolveActiveChips, type CompanyQuickChipId } from './CompanyQuickFilters';
import { CompanySearchFilterBar } from './CompanySearchFilterBar';
import { CompanySortDirectionToggle } from './CompanySortDirectionToggle';
import { CompanyListView } from './CompanyListView';
import { CompanyListViewSkeleton } from './CompanySkeleton';
import type { CompanyFilterParams, CompanySortDir } from '../types/company-list.types';
import { COMPANY_SORT_OPTIONS, companySortKey } from '../types/company-list.types';
import { COMPANY_SIZE_OPTIONS, INDUSTRY_OPTIONS } from '@/modules/company-profile';

const inter = Inter({ subsets: ['latin'] });

type PillKey = 'keyword' | 'industry' | 'location' | 'companySize' | 'hiring';

function CompaniesViewInner() {
  const {
    filters,
    hasActiveFilters,
    setKeyword,
    setIndustry,
    setLocation,
    setCompanySize,
    setHiring,
    setSort,
    setPage,
    clearFilter,
    clearAllFilters,
  } = useCompanyFilters();

  const { data, isPending, isFetching, isError, error, refetch } = usePublicCompanies(filters);

  // Global (unfiltered) summary for the hero cards — never changes with
  // filters, sorting, or pagination. pageSize 1 keeps the payload small;
  // totals are set-level aggregates from the backend.
  const summaryFilters = useMemo<CompanyFilterParams>(
    () => ({ page: 1, pageSize: 1, sortBy: 'name', sortDir: 'asc' }),
    [],
  );
  const { data: summaryData, isPending: isSummaryPending } = usePublicCompanies(summaryFilters);

  const activeSortBy = filters.sortBy ?? 'name';
  const activeSortDir: CompanySortDir = filters.sortDir ?? 'asc';
  const activeSortKey = companySortKey(activeSortBy, activeSortDir);

  const handleSortChange = useCallback(
    (key: string) => {
      const option = COMPANY_SORT_OPTIONS.find((o) => companySortKey(o.value, o.dir) === key);
      if (option) setSort(option.value, option.dir);
    },
    [setSort],
  );

  const handleSortDirToggle = useCallback(() => {
    setSort(activeSortBy, activeSortDir === 'asc' ? 'desc' : 'asc');
  }, [setSort, activeSortBy, activeSortDir]);

  const handleQuickSelect = useCallback(
    (id: CompanyQuickChipId) => {
      switch (id) {
        case 'all':
          clearAllFilters();
          break;
        case 'hiring':
          setHiring(!filters.hiring);
          break;
        case 'vacancies':
          if (filters.sortBy === 'vacancies') setSort('name', 'asc');
          else setSort('vacancies', 'desc');
          break;
        case 'openings':
          if (filters.sortBy === 'openings') setSort('name', 'asc');
          else setSort('openings', 'desc');
          break;
        case 'remote':
          setLocation((filters.location ?? '').toLowerCase().includes('remote') ? '' : 'Remote');
          break;
        case 'software':
          setIndustry(filters.industry === 'Technology & Software' ? '' : 'Technology & Software');
          break;
        case 'finance':
          setIndustry(filters.industry === 'Finance & Banking' ? '' : 'Finance & Banking');
          break;
        case 'health':
          setIndustry(
            filters.industry === 'Healthcare & Life Sciences' ? '' : 'Healthcare & Life Sciences',
          );
          break;
        case 'enterprise':
          setCompanySize(filters.companySize === '1000+' ? '' : '1000+');
          break;
      }
    },
    [
      clearAllFilters,
      setHiring,
      setSort,
      setLocation,
      setIndustry,
      setCompanySize,
      filters.hiring,
      filters.location,
      filters.industry,
      filters.companySize,
      filters.sortBy,
    ],
  );

  const activeChips = resolveActiveChips(filters);

  const totalCount = data?.totalCount ?? 0;
  // Hero cards show platform-wide totals (stable across filters/sort/page).
  const summaryCount = summaryData?.totalCount ?? 0;
  const summaryOpenings = summaryData?.totalOpenings ?? 0;
  const summaryVacancies = summaryData?.totalVacancies ?? 0;
  const isBusy = isPending || isFetching;

  const activePills: { key: PillKey; label: string }[] = [
    filters.keyword ? { key: 'keyword', label: `“${filters.keyword}”` } : null,
    filters.industry ? { key: 'industry', label: filters.industry } : null,
    filters.location ? { key: 'location', label: filters.location } : null,
    filters.companySize ? { key: 'companySize', label: `${filters.companySize} employees` } : null,
    filters.hiring ? { key: 'hiring', label: 'Hiring Now' } : null,
  ].filter((p): p is { key: PillKey; label: string } => p !== null);

  return (
    <div className={`${inter.className} min-h-screen pb-12 sm:pb-20`}>
      {/* Upper section: hero + filter card — same treatment as the browse jobs page:
          white hero with bottom border, page body left on the app background. */}
      <div className="bg-white border-b border-slate-200/80 pt-6 pb-6 sm:pt-8 sm:pb-10 shadow-2xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CompanyHero
            totalCount={summaryCount}
            totalOpenings={summaryOpenings}
            totalVacancies={summaryVacancies}
            isPending={isSummaryPending}
          />

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
            <CompanySearchFilterBar
              filters={filters}
              onKeywordChange={(keyword) => setKeyword(keyword)}
            />

            <div className="mt-3">
              <CompanyQuickFilters
                totalCount={totalCount}
                activeChips={activeChips}
                onSelect={handleQuickSelect}
              />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <CompanyFilterDropdown
                label="Size"
                icon={Users}
                value={filters.companySize ?? ''}
                allLabel="All Sizes"
                options={COMPANY_SIZE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                onChange={(next) => setCompanySize(next)}
                ariaLabel="Filter by company size"
              />

              <CompanyFilterDropdown
                label="Industry"
                icon={Briefcase}
                value={filters.industry ?? ''}
                allLabel="All Industries"
                options={INDUSTRY_OPTIONS.map((industry) => ({
                  value: industry,
                  label: industry,
                }))}
                onChange={(next) => setIndustry(next)}
                ariaLabel="Filter by industry"
              />

              <CompanyFilterDropdown
                label="Sort"
                icon={ArrowUpDown}
                value={activeSortKey}
                defaultValue={companySortKey('name', 'asc')}
                showAllOption={false}
                options={COMPANY_SORT_OPTIONS.map((option) => ({
                  value: companySortKey(option.value, option.dir),
                  label: option.label,
                }))}
                onChange={handleSortChange}
                ariaLabel="Sort companies"
                align="end"
                className="ml-auto"
              />

              <CompanySortDirectionToggle
                sortDir={activeSortDir}
                onToggle={handleSortDirToggle}
              />
            </div>
          </div>

          {/* Active filters directly below the card */}
          {hasActiveFilters && (
            <div className="pt-4">
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-xs font-semibold text-slate-500">
                  Active filters:
                </span>
                <div className="flex flex-1 items-center gap-1.5 overflow-x-auto sm:flex-wrap py-0.5">
                  {activePills.map((pill) => (
                    <button
                      key={pill.key}
                      type="button"
                      onClick={() => clearFilter(pill.key)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 pl-2.5 pr-1.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer whitespace-nowrap"
                      aria-label={`Remove ${pill.key} filter`}
                    >
                      {pill.label}
                      <X className="size-3.5" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="shrink-0 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer whitespace-nowrap ml-1"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: count row over list */}
      <div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <main className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm sm:text-[15px]">
                <span className="font-bold text-slate-900">{isPending ? '–' : totalCount}</span>{' '}
                <span className="text-slate-500">
                  {totalCount === 1 ? 'company' : 'companies'}
                </span>
                {isBusy && !isPending && (
                  <span className="ml-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <Loader2 className="size-3.5 animate-spin" />
                    Updating…
                  </span>
                )}
              </p>
            </div>

            {isPending ? (
              <CompanyListViewSkeleton count={10} />
            ) : isError ? (
              <div className="flex flex-col items-center gap-3 py-12 sm:py-20 text-center rounded-xl bg-white border border-slate-200 p-6 sm:p-8">
                <p className="text-base font-bold text-slate-900">Couldn&apos;t load companies</p>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                  {(error as { message?: string })?.message ??
                    'Something went wrong while fetching companies from the server.'}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-2 rounded-[10px] bg-slate-900 text-white px-5 py-2.5 text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : data ? (
              <CompanyListView
                result={data}
                hasFilters={hasActiveFilters}
                onPageChange={setPage}
                onClearAll={clearAllFilters}
                isUpdating={isFetching}
              />
            ) : null}
          </main>
        </div>
      </div>

      {/* Filter drawer removed: search, location, chips and selects all apply live. */}
    </div>
  );
}

export function CompaniesView() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <CompanyListViewSkeleton count={10} />
        </div>
      }
    >
      <CompaniesViewInner />
    </Suspense>
  );
}
