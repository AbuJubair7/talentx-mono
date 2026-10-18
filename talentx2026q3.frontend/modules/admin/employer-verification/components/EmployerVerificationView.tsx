"use client";

import { useEffect, useId, useState } from "react";
import {
  Building2,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalPageContainer, PortalPageHeader } from "@/components/layout";
import { usePendingEmployers } from "../hooks/usePendingEmployers";
import type { PendingEmployer } from "../types/employer-verification";
import { EMPLOYER_VERIFICATION_CONSTANTS } from "../constants/employer-verification.constants";
import { getVerificationStatusBadge } from "../constants/verification-status.constants";
import {
  formatEmployerDate,
  getEmployerInitial,
} from "../utils/employer-verification.utils";
import { EmployerDetailPanel } from "./EmployerDetailPanel";

export function EmployerVerificationView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(
    EMPLOYER_VERIFICATION_CONSTANTS.DEFAULT_PAGE_NUMBER
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchInputId = useId();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(EMPLOYER_VERIFICATION_CONSTANTS.DEFAULT_PAGE_NUMBER);
    }, EMPLOYER_VERIFICATION_CONSTANTS.SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data, isLoading } = usePendingEmployers({
    searchQuery: debouncedSearch.trim() || undefined,
    status: statusFilter || undefined,
    page: currentPage,
    pageSize: EMPLOYER_VERIFICATION_CONSTANTS.DEFAULT_PAGE_SIZE,
  });

  const employers: PendingEmployer[] = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const pageSize = data?.pageSize ?? EMPLOYER_VERIFICATION_CONSTANTS.DEFAULT_PAGE_SIZE;
  const totalPages = data ? Math.max(1, Math.ceil(totalCount / pageSize)) : 1;
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <PortalPageContainer>
      <PortalPageHeader
        title="Employer Verification"
        subtitle="Review and verify employer accounts and onboarding requests."
      />

      {/* Filter Controls */}
      <div className="mb-5 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <label htmlFor={searchInputId} className="sr-only">
            Search employers
          </label>
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <input
            id={searchInputId}
            type="text"
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-9 text-sm text-zinc-900 shadow-2xs outline-none transition-all placeholder:text-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Search by name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="relative inline-flex items-center rounded-md border border-zinc-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <select
            aria-label="Filter by verification status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(EMPLOYER_VERIFICATION_CONSTANTS.DEFAULT_PAGE_NUMBER);
            }}
            className="h-10 appearance-none bg-transparent pl-3.5 pr-9 text-sm font-normal text-zinc-700 dark:text-slate-300 cursor-pointer outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-white rounded-md"
          >
            <option value="">All Statuses</option>
            <option value="PendingVerification">Pending Verification</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400 dark:text-slate-400"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Table Card Container */}
      <div className="flex flex-col overflow-hidden rounded-md border border-zinc-200/80 bg-white/95 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-zinc-100 bg-zinc-50/90 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                <th className="px-5 py-3.5 font-semibold">Employer & Contact</th>
                <th className="px-5 py-3.5 font-semibold">Company</th>
                  <th className="px-5 py-3.5 font-semibold">Verification Status</th>
                  <th className="px-5 py-3.5 font-semibold">Registered Date</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-slate-800/60">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-zinc-200 dark:bg-slate-800" />
                          <div className="space-y-1.5">
                            <div className="h-4 w-36 rounded bg-zinc-200 dark:bg-slate-800" />
                            <div className="h-3 w-28 rounded bg-zinc-200 dark:bg-slate-800" />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-slate-800" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-5 w-28 rounded-full bg-zinc-200 dark:bg-slate-800" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-slate-800" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="ml-auto h-8 w-20 rounded-lg bg-zinc-200 dark:bg-slate-800" />
                      </td>
                    </tr>
                  ))
                ) : employers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-16 text-center text-sm text-zinc-500 dark:text-slate-400"
                    >
                      <Building2 className="mx-auto size-9 text-zinc-300 dark:text-slate-600 mb-2" />
                      <p className="font-medium text-zinc-700 dark:text-slate-300">
                        No employers found
                      </p>
                      <p className="text-xs text-zinc-400 dark:text-slate-500 mt-1">
                        Try adjusting your search terms or status filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  employers.map((employer) => {
                    const statusConfig = getVerificationStatusBadge(
                      employer.verificationStatus
                    );
                    const StatusIcon = statusConfig.icon;
                    const isPending =
                      employer.verificationStatus === "PendingVerification";

                    return (
                      <tr
                        key={employer.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`View details for ${employer.name}`}
                        onClick={() => setSelectedId(employer.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedId(employer.id);
                          }
                        }}
                        className="group cursor-pointer outline-none transition-colors hover:bg-zinc-50/70 focus-visible:bg-zinc-50/70 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-700 dark:hover:bg-slate-800/40 dark:focus-visible:bg-slate-800/40"
                      >
                        <td className="px-5 py-4 max-w-[220px] min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-slate-800 dark:text-slate-300">
                              {getEmployerInitial(employer.name)}
                            </div>
                            <div className="min-w-0">
                              <p
                                className="truncate font-medium text-zinc-900 dark:text-slate-100"
                                title={employer.name}
                              >
                                {employer.name}
                              </p>
                              <p
                                className="truncate text-xs text-zinc-500 dark:text-slate-400"
                                title={employer.email}
                              >
                                {employer.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 max-w-[200px] min-w-0">
                          <div className="flex min-w-0 items-center gap-1.5 text-zinc-700 dark:text-slate-300">
                            <Building2 className="size-3.5 shrink-0 text-zinc-400 dark:text-slate-500" />
                            <span
                              className="truncate block font-medium"
                              title={employer.companyName}
                            >
                              {employer.companyName}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusConfig.className}`}
                          >
                            <StatusIcon className="size-3" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-zinc-600 dark:text-slate-400">
                          {formatEmployerDate(employer.createdAt)}
                        </td>
                        <td
                          className="px-5 py-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedId(employer.id)}
                            className={
                              isPending
                                ? "cursor-pointer gap-1.5 border-amber-300/80 bg-amber-50/40 text-amber-800 hover:border-amber-400 hover:bg-amber-100/70 hover:text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
                                : "cursor-pointer gap-1.5 border-zinc-200 text-zinc-700 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
                            }
                          >
                            {isPending ? (
                              <>
                                <ShieldCheck className="size-3.5" />
                                Review
                              </>
                            ) : (
                              <>
                                <Eye className="size-3.5" />
                                View Details
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      {/* Pagination Controls */}
      <div className="mt-4 shrink-0">
        <div className="flex flex-col gap-3 rounded-md border border-zinc-200/80 bg-white/90 px-4 py-3 shadow-2xs backdrop-blur-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/90">
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            {totalCount === 0
              ? "Showing 0 of 0 employers"
              : `Showing ${startItem}-${endItem} of ${totalCount} employers`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage <= 1 || isLoading}
              onClick={() =>
                setCurrentPage((p) =>
                  Math.max(EMPLOYER_VERIFICATION_CONSTANTS.DEFAULT_PAGE_NUMBER, p - 1)
                )
              }
              className="inline-flex size-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer dark:hover:text-white dark:focus-visible:ring-white"
            >
              <ChevronsLeft className="size-4" aria-hidden="true" />
            </button>
            <span className="px-2 text-sm font-medium text-zinc-600 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex size-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer dark:hover:text-white dark:focus-visible:ring-white"
            >
              <ChevronsRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <EmployerDetailPanel
        employerId={selectedId}
        isOpen={selectedId !== null}
        onClose={() => setSelectedId(null)}
      />
    </PortalPageContainer>
  );
}
