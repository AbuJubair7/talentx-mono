"use client";

import { ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useId, useMemo, useOptimistic, useState } from "react";
import { cn } from "@/lib/utils";
import { PortalPageContainer, PortalPageHeader } from "@/components/layout";
import { useAdminJobs } from "../hooks/useAdminJobs";
import type { AdminJobsQueryParams, ModerationStatus } from "../types/job-moderation";
import { JobModerationDetailDialog } from "./JobModerationDetailDialog";
import { JobModerationTable } from "./JobModerationTable";

const PAGE_SIZE = 10;

// "Under review" sits second: those jobs are waiting on the admin.
const STATUS_TABS: { label: string; status: ModerationStatus | undefined }[] = [
  { label: "All", status: undefined },
  { label: "Under review", status: "PendingReview" },
  { label: "Published", status: "Published" },
  { label: "Deactivated", status: "Deactivated" },
];

// Props for the moderation page: the job named by ?job= in the URL (from a notification link), if any.
interface JobModerationViewProps {
  initialJobId?: string | null;
}

// Admin "Job Moderation" page: search, status tabs, pagination, table and detail dialog.
export function JobModerationView({ initialJobId = null }: JobModerationViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeStatus, setActiveStatus] = useState<ModerationStatus | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const searchInputId = useId();

  // ?job= opens that job's dialog. Closing clears it optimistically, so the dialog shuts at once
  // and stays shut while the router removes the param from the URL.
  const [urlJobId, setUrlJobId] = useOptimistic(initialJobId);
  const openJobId = urlJobId ?? selectedJobId;

  const handleCloseDetail = () => {
    setSelectedJobId(null);
    if (urlJobId) {
      const params = new URLSearchParams(window.location.search);
      params.delete("job");
      const query = params.toString();
      startTransition(() => {
        setUrlJobId(null);
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const queryParams: AdminJobsQueryParams = useMemo(
    () => ({
      page: currentPage,
      pageSize: PAGE_SIZE,
      searchQuery: debouncedSearch.trim() || undefined,
      status: activeStatus,
    }),
    [currentPage, debouncedSearch, activeStatus]
  );

  const { data, isLoading, isError, refetch } = useAdminJobs(queryParams);

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ? Math.max(1, data.totalPages) : 1;
  const pageSize = data?.pageSize ?? PAGE_SIZE;
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const handleStatusChange = (status: ModerationStatus | undefined) => {
    setActiveStatus(status);
    setCurrentPage(1);
  };

  return (
    <PortalPageContainer>
      <PortalPageHeader
        title="Job Moderation"
        subtitle="Review published jobs and take down ones that break the rules."
      />

      <div className="mb-5 flex shrink-0 flex-col gap-3">
        <div
          role="tablist"
          aria-label="Job status filters"
          className="relative inline-flex w-fit shrink-0 flex-wrap items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800"
        >
          {STATUS_TABS.map((tab) => {
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
                    layoutId="activeJobModerationTabIndicator"
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
          <label htmlFor={searchInputId} className="sr-only">
            Search jobs
          </label>
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <input
            id={searchInputId}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 shadow-2xs outline-none transition-all placeholder:text-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Search by job, company, location or employer"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-md border border-zinc-200/80 bg-white/95 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95">
        <div className="overflow-x-auto">
          <JobModerationTable
            items={items}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => void refetch()}
            onView={setSelectedJobId}
          />
        </div>
      </div>

      <div className="mt-4 shrink-0">
        <div className="flex flex-col gap-3 rounded-md border border-zinc-200/80 bg-white/90 px-4 py-3 shadow-xs backdrop-blur-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/90">
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            {totalCount === 0
              ? "Showing 0 of 0 jobs"
              : `Showing ${startItem}-${endItem} of ${totalCount} jobs`}
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

      <JobModerationDetailDialog jobId={openJobId} onClose={handleCloseDetail} />
    </PortalPageContainer>
  );
}
