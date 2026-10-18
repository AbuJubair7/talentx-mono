'use client';

import React, { useState, useMemo } from 'react';
import { PortalPageContainer } from '@/components/layout/portal-page-container';
import { PortalPageHeader } from '@/components/layout/portal-page-header';
import { Search, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useJobReports } from '../hooks/useJobReports';
import { PAGE_SIZE, REPORT_STATUS_TABS } from '../constants/job-reports.constants';
import type { JobReportStatus } from '../types/job-reports.types';
import { ReportedJobsTable } from './ReportedJobsTable';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

export function ReportedJobsView() {
  const [activeStatus, setActiveStatus] = useState<JobReportStatus | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      pageSize: PAGE_SIZE,
      searchQuery: debouncedSearch.trim() || undefined,
      status: activeStatus,
    }),
    [currentPage, debouncedSearch, activeStatus]
  );

  const { data, isLoading } = useJobReports(queryParams);

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ? Math.max(1, data.totalPages) : 1;
  const pageSize = data?.pageSize ?? PAGE_SIZE;
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const handleStatusChange = (status: JobReportStatus | undefined) => {
    setActiveStatus(status);
    setCurrentPage(1);
  };

  return (
    <PortalPageContainer>
      <PortalPageHeader 
        title="Reported Jobs" 
        subtitle="Review jobs reported by talent and take moderation action." 
      />

      <div className="mb-5 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Job report status filters"
          className="relative inline-flex w-fit shrink-0 flex-wrap items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800"
        >
          {REPORT_STATUS_TABS.map((tab) => {
            const isActive = activeStatus === tab.status;
            return (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleStatusChange(tab.status)}
                className={cn(
                  "relative whitespace-nowrap rounded-sm px-3.5 py-1.5 text-sm font-medium outline-none transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
                  isActive
                    ? "font-semibold text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeJobReportTabIndicator"
                    className="absolute inset-0 rounded-sm bg-slate-950 shadow-xs"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full max-w-sm">
          <label htmlFor="search-reports" className="sr-only">
            Search reports
          </label>
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <input
            id="search-reports"
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 shadow-2xs outline-none transition-all placeholder:text-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Search jobs, companies..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-md border border-zinc-200/80 bg-white/95 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95">
        <div className="overflow-x-auto">
          <ReportedJobsTable data={items} isLoading={isLoading} />
        </div>
      </div>

      <div className="mt-4 shrink-0">
        <div className="flex flex-col gap-3 rounded-md border border-zinc-200/80 bg-white/90 px-4 py-3 shadow-xs backdrop-blur-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/90">
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            {totalCount === 0
              ? "Showing 0 of 0 reports"
              : `Showing ${startItem}-${endItem} of ${totalCount} reports`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer dark:hover:text-white"
            >
              <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="px-2 text-sm font-medium text-zinc-600 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer dark:hover:text-white"
            >
              <ChevronsRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </PortalPageContainer>
  );
}
