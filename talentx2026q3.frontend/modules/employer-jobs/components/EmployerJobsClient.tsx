'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, LayoutGrid, LayoutList, Loader2, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';
import { PortalPageHeader } from '@/components/layout';

import { useCloseJob } from '../hooks/useCloseJob';
import { useDeleteJob } from '../hooks/useDeleteJob';
import { useEmployerDashboard } from '../hooks/useEmployerDashboard';
import { useInfiniteEmployerJobs } from '../hooks/useInfiniteEmployerJobs';
import { usePublishJob } from '../hooks/usePublishJob';
import { useReopenJob } from '../hooks/useReopenJob';
import { STATUS_TABS, VIEW_MODE_STORAGE_KEY } from '../constants';
import type {
  EmployerJobListItemDto,
  EmployerJobsClientProps,
  EmployerJobsQueryParams,
  JobActionDialogState,
  JobStatus,
  JobStatusTab,
  JobViewMode,
} from '../types/employer-job.types';
import {
  getInitialEmployerJobsQueryParams,
  isDirectJobStatusParam,
  resolveJobTitle,
  syncEmployerJobsUrl,
} from '../utils';
import {
  EmployerJobsCardView,
  EmployerJobsCardViewSkeleton,
} from './EmployerJobsCardView';
import {
  EmployerJobsTable,
  EmployerJobsTableSkeleton,
} from './EmployerJobsTable';
import { JobActionConfirmDialog } from './JobActionConfirmDialog';
import { JobPipelineSummaryDialog } from './JobPipelineSummaryDialog';

// Employer "My Jobs" page: search, status tabs, view toggle and the list.
export function EmployerJobsClient({ className }: EmployerJobsClientProps) {
  const searchParams = useSearchParams();
  const urlStatusParam = searchParams.get('status');
  const urlIsExpiredParam = searchParams.get('isExpired');
  const initialUrlSearchParam = searchParams.get('search') ?? '';

  const [queryParams, setQueryParams] = useState<EmployerJobsQueryParams>(() =>
    getInitialEmployerJobsQueryParams({
      urlStatusParam,
      urlIsExpiredParam,
      initialUrlSearchParam,
    })
  );

  useEffect(() => {
    if (urlIsExpiredParam === 'true' || urlStatusParam === 'Expired') {
      setQueryParams((previousQueryParams) => {
        if (previousQueryParams.isExpired && !previousQueryParams.status) return previousQueryParams;
        return { ...previousQueryParams, page: 1, status: undefined, isExpired: true };
      });
    } else if (urlStatusParam === 'Active' || urlStatusParam === 'Published') {
      setQueryParams((previousQueryParams) => {
        if (previousQueryParams.status === 'Published' && previousQueryParams.isExpired === false) return previousQueryParams;
        return { ...previousQueryParams, page: 1, status: 'Published', isExpired: false };
      });
    } else if (isDirectJobStatusParam(urlStatusParam)) {
      setQueryParams((previousQueryParams) => {
        if (previousQueryParams.status === urlStatusParam && previousQueryParams.isExpired === undefined) return previousQueryParams;
        return { ...previousQueryParams, page: 1, status: urlStatusParam as JobStatus, isExpired: undefined };
      });
    } else if (urlStatusParam === 'All') {
      setQueryParams((previousQueryParams) => {
        if (!previousQueryParams.status && previousQueryParams.isExpired === undefined) return previousQueryParams;
        return { ...previousQueryParams, page: 1, status: undefined, isExpired: undefined };
      });
    } else if (!urlStatusParam && !urlIsExpiredParam) {
      setQueryParams((previousQueryParams) => {
        if (!previousQueryParams.status && previousQueryParams.isExpired === undefined) return previousQueryParams;
        return { ...previousQueryParams, page: 1, status: undefined, isExpired: undefined };
      });
    }
  }, [urlStatusParam, urlIsExpiredParam]);
  const [viewMode, setViewMode] = useState<JobViewMode>(() => {
    if (typeof window === 'undefined') return 'list';
    try {
      const storedViewMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (storedViewMode === 'list' || storedViewMode === 'cards') {
        return storedViewMode;
      }
    } catch {
    }
    return 'list';
  });
  const [searchQuery, setSearchQuery] = useState(initialUrlSearchParam);
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    const trimmedSearchQuery = debouncedSearchQuery.trim();
    const nextSearchTerm = trimmedSearchQuery.length > 0 ? trimmedSearchQuery : undefined;

    setQueryParams((previousQueryParams) => {
      if (previousQueryParams.searchTerm === nextSearchTerm) {
        return previousQueryParams;
      }
      return {
        ...previousQueryParams,
        page: 1,
        searchTerm: nextSearchTerm,
      };
    });

    if (typeof window !== 'undefined') {
      const currentUrl = new URL(window.location.href);
      const currentUrlSearch = (currentUrl.searchParams.get('search') ?? '').trim();
      if (currentUrlSearch !== trimmedSearchQuery) {
        syncEmployerJobsUrl({
          pathname: currentUrl.pathname,
          status:
            queryParams.status === 'Published' && queryParams.isExpired === false
              ? 'Active'
              : queryParams.status,
          isExpired: queryParams.isExpired,
          search: trimmedSearchQuery,
        });
      }
    }
  }, [debouncedSearchQuery, queryParams.isExpired, queryParams.status]);

  const handleSelectViewMode = (nextViewMode: JobViewMode) => {
    setViewMode(nextViewMode);
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, nextViewMode);
    } catch {
    }
  };

  const [actionDialogState, setActionDialogState] = useState<JobActionDialogState>({
    isOpen: false,
    jobId: '',
    jobTitle: '',
    intent: 'close',
  });
  const [selectedPipelineJob, setSelectedPipelineJob] = useState<EmployerJobListItemDto | null>(null);
  const triggerCardRef = useRef<HTMLElement | null>(null);

  const {
    data: dashboardData,
    isPending: isDashboardPending,
  } = useEmployerDashboard();

  const {
    data: infiniteJobsData,
    isPending,
    isError,
    error: queryError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteEmployerJobs(queryParams);

  const closeJobMutation = useCloseJob();
  const deleteJobMutation = useDeleteJob();
  const reopenJobMutation = useReopenJob();
  const publishJobMutation = usePublishJob();

  const activeTab: JobStatusTab = queryParams.isExpired
    ? 'Expired'
    : queryParams.status === 'Published' && !queryParams.isExpired
      ? 'Active'
      : (queryParams.status as JobStatusTab) || 'All';

  const handleSelectTab = (selectedTab: JobStatusTab) => {
    setQueryParams((previousQueryParams) => {
      if (selectedTab === 'Expired') {
        return {
          ...previousQueryParams,
          page: 1,
          status: undefined,
          isExpired: true,
        };
      }
      if (selectedTab === 'Active') {
        return {
          ...previousQueryParams,
          page: 1,
          status: 'Published',
          isExpired: false,
        };
      }
      if (selectedTab === 'All') {
        return {
          ...previousQueryParams,
          page: 1,
          status: undefined,
          isExpired: undefined,
        };
      }
      return {
        ...previousQueryParams,
        page: 1,
        status: selectedTab as JobStatus,
        isExpired: undefined,
      };
    });

    syncEmployerJobsUrl({
      pathname: typeof window !== 'undefined' ? window.location.pathname : '',
      status:
        selectedTab === 'Expired' || selectedTab === 'All'
          ? undefined
          : selectedTab,
      isExpired: selectedTab === 'Expired' ? true : undefined,
      search: searchQuery,
    });
  };

  const jobList = infiniteJobsData?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = infiniteJobsData?.pages[0]?.totalCount ?? 0;

  const scrollSentinelRef = useRef<HTMLDivElement>(null);
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const sentinelEntry = entries[0];
      if (sentinelEntry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const sentinelElement = scrollSentinelRef.current;
    if (!sentinelElement) return;
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: '200px',
    });
    observer.observe(sentinelElement);
    return () => observer.disconnect();
  }, [handleIntersection]);

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const mainElement = document.querySelector('main');
      const mainScrollTop = mainElement ? mainElement.scrollTop : 0;
      const currentScroll = Math.max(scrollY, mainScrollTop);
      setShowBackToTop(currentScroll > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (mainElement) {
        mainElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleScrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const mainElement = typeof document !== 'undefined' ? document.querySelector('main') : null;
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenCloseJob = (jobId: string, jobTitle?: string) => {
    setActionDialogState({
      isOpen: true,
      jobId,
      jobTitle: resolveJobTitle(jobId, jobList, jobTitle),
      intent: 'close',
    });
  };

  const handleOpenDeleteJob = (jobId: string, jobTitle?: string) => {
    setActionDialogState({
      isOpen: true,
      jobId,
      jobTitle: resolveJobTitle(jobId, jobList, jobTitle),
      intent: 'delete',
    });
  };

  const handleReopenJob = (jobId: string, jobTitle?: string) => {
    setActionDialogState({
      isOpen: true,
      jobId,
      jobTitle: resolveJobTitle(jobId, jobList, jobTitle),
      intent: 'reopen',
    });
  };

  const handlePublishJob = (jobId: string, jobTitle?: string) => {
    setActionDialogState({
      isOpen: true,
      jobId,
      jobTitle: resolveJobTitle(jobId, jobList, jobTitle),
      intent: 'publish',
    });
  };

  const handleConfirmAction = async () => {
    try {
      switch (actionDialogState.intent) {
        case 'close':
          await closeJobMutation.mutateAsync(actionDialogState.jobId);
          break;
        case 'delete':
          await deleteJobMutation.mutateAsync(actionDialogState.jobId);
          break;
        case 'reopen':
          await reopenJobMutation.mutateAsync(actionDialogState.jobId);
          break;
        case 'publish':
          await publishJobMutation.mutateAsync(actionDialogState.jobId);
          break;
      }
      setActionDialogState((previousDialogState) => ({
        ...previousDialogState,
        isOpen: false,
      }));
    } catch {
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex flex-col gap-6">
          <PortalPageHeader
            title="Jobs"
            subtitle="View and manage all jobs across their hiring lifecycle."
            actions={
              <Link
                href="/job/jobpost"
                className="inline-flex items-center gap-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 text-sm font-medium shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 shrink-0 cursor-pointer"
              >
                <Plus className="size-4" aria-hidden="true" />
                Post a Job
              </Link>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
            <div className="bg-white border border-slate-200/80 rounded-md p-4 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Jobs
              </span>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {isDashboardPending ? (
                  <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate-200" aria-hidden="true" />
                ) : (
                  dashboardData?.totalPostedJobs ?? 0
                )}
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-md p-4 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Jobs
              </span>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {isDashboardPending ? (
                  <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate-200" aria-hidden="true" />
                ) : (
                  dashboardData?.activeJobsCount ?? 0
                )}
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-md p-4 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Draft Jobs
              </span>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {isDashboardPending ? (
                  <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate-200" aria-hidden="true" />
                ) : (
                  dashboardData?.draftJobsCount ?? 0
                )}
              </p>
            </div>
          </div>
        </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Job status filters"
          className="relative inline-flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-md"
        >
          {STATUS_TABS.map((tabOption) => {
            const isActive = activeTab === tabOption.value;
            return (
              <button
                key={tabOption.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSelectTab(tabOption.value)}
                className={cn(
                  'relative px-3.5 py-1.5 text-sm font-medium rounded-sm cursor-pointer whitespace-nowrap outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2',
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeJobStatusTabIndicator"
                    className="absolute inset-0 rounded-sm bg-slate-950 shadow-xs"
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 35,
                    }}
                  />
                )}
                <span className="relative z-10">{tabOption.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(changeEvent) => setSearchQuery(changeEvent.target.value)}
              className="bg-slate-100 rounded-lg border-0 pl-9 text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-300 h-9"
              aria-label="Search jobs"
            />
          </div>

          <div
            role="group"
            aria-label="View switch"
            className="relative inline-flex items-center rounded-md border border-slate-200 bg-slate-100 p-1 shrink-0"
          >
            <button
              type="button"
              onClick={() => handleSelectViewMode('list')}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              className={cn(
                'relative inline-flex items-center justify-center rounded-sm p-1.5 text-sm font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-1',
                viewMode === 'list'
                  ? 'text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              {viewMode === 'list' && (
                <motion.div
                  layoutId="activeJobViewModeIndicator"
                  className="absolute inset-0 rounded-sm bg-white shadow-xs"
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 35,
                  }}
                />
              )}
              <LayoutList className="relative z-10 size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => handleSelectViewMode('cards')}
              aria-label="Card view"
              aria-pressed={viewMode === 'cards'}
              className={cn(
                'relative inline-flex items-center justify-center rounded-sm p-1.5 text-sm font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-1',
                viewMode === 'cards'
                  ? 'text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              {viewMode === 'cards' && (
                <motion.div
                  layoutId="activeJobViewModeIndicator"
                  className="absolute inset-0 rounded-sm bg-white shadow-xs"
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 35,
                  }}
                />
              )}
              <LayoutGrid className="relative z-10 size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {isPending && (
        viewMode === 'list' ? (
          <EmployerJobsTableSkeleton />
        ) : (
          <EmployerJobsCardViewSkeleton />
        )
      )}

      {!isPending && isError && (
        <div className="flex w-full items-center justify-center rounded-md border border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="flex max-w-md flex-col items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900">Couldn&apos;t load your jobs</h3>
            <p className="text-sm text-slate-500">
              {queryError?.message || 'Failed to load your jobs.'}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => refetch()}
              className="mt-2 cursor-pointer"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {!isPending && !isError && (
        <>
          {viewMode === 'list' ? (
            <EmployerJobsTable
              jobs={jobList}
              onCloseJob={handleOpenCloseJob}
              onDeleteJob={handleOpenDeleteJob}
              onReopenJob={handleReopenJob}
              onPublishJob={handlePublishJob}
            />
          ) : (
            <EmployerJobsCardView
              jobs={jobList}
              onCloseJob={handleOpenCloseJob}
              onDeleteJob={handleOpenDeleteJob}
              onReopenJob={handleReopenJob}
              onPublishJob={handlePublishJob}
              onSelectJob={(job) => {
                triggerCardRef.current = document.activeElement as HTMLElement;
                setSelectedPipelineJob(job);
              }}
            />
          )}

          <div ref={scrollSentinelRef} className="h-px" aria-hidden="true" />

          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="size-6 animate-spin text-slate-400" aria-label="Loading more jobs" />
            </div>
          )}

          {!hasNextPage && totalCount > 0 && (
            <p className="py-4 text-center text-sm text-slate-400">
              Showing all {totalCount} jobs
            </p>
          )}
        </>
      )}

      <JobActionConfirmDialog
        open={actionDialogState.isOpen}
        onOpenChange={(nextOpen) =>
          setActionDialogState((previousState) => ({
            ...previousState,
            isOpen: nextOpen,
          }))
        }
        jobTitle={actionDialogState.jobTitle}
        intent={actionDialogState.intent}
        isPending={
          closeJobMutation.isPending ||
          deleteJobMutation.isPending ||
          reopenJobMutation.isPending ||
          publishJobMutation.isPending
        }
        onConfirm={handleConfirmAction}
      />

      <JobPipelineSummaryDialog
        job={selectedPipelineJob}
        isOpen={Boolean(selectedPipelineJob)}
        onClose={() => {
          setSelectedPipelineJob(null);
          setTimeout(() => triggerCardRef.current?.focus(), 0);
        }}
      />

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            type="button"
            onClick={handleScrollToTop}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            aria-label="Back to top"
            className="fixed bottom-6 right-6 z-30 flex size-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 cursor-pointer dark:bg-emerald-700 dark:hover:bg-emerald-800"
          >
            <ArrowUp className="size-5" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
