"use client";

import React, { useState, useId, useRef, useEffect, useMemo } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
} from "lucide-react";
import { PortalPageContainer, PortalPageHeader } from "@/components/layout";
import { useAuditLogs } from "@/modules/admin/audit-log/hooks/use-audit-logs";
import type { AuditLogsQueryParams } from "@/modules/admin/audit-log/types/audit-log";
import { formatToLocalTime } from "@/modules/admin/audit-log/utils/format-timestamp";

function getActionColor(action: string): string {
  if (action.startsWith("Insert") || action.startsWith("Login Success")) {
    return "text-emerald-600 dark:text-emerald-400";
  }
  if (action.startsWith("Update")) {
    return "text-sky-600 dark:text-sky-400";
  }
  if (
    action.startsWith("Delete") ||
    action.startsWith("Failed") ||
    action.includes("Failed")
  ) {
    return "text-rose-600 dark:text-rose-400";
  }
  return "text-slate-600 dark:text-slate-400";
}

export function AuditLogView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const searchInputId = useId();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const queryParams: AuditLogsQueryParams = useMemo(() => {
    return {
      page: currentPage,
      pageSize: 10,
      searchQuery: debouncedSearch.trim() || undefined,
      actionType: selectedEventType || undefined,
      startDate: selectedDate ? `${selectedDate}T00:00:00Z` : undefined,
      endDate: selectedDate ? `${selectedDate}T23:59:59.999Z` : undefined,
    };
  }, [currentPage, debouncedSearch, selectedEventType, selectedDate]);

  const { data, isLoading } = useAuditLogs(queryParams);

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ? Math.max(1, data.totalPages) : 1;
  const pageSize = data?.pageSize ?? 10;
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const getPageNumbers = (current: number, total: number) => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, 5];
    }
    if (current >= total - 2) {
      return [total - 4, total - 3, total - 2, total - 1, total];
    }
    return [current - 2, current - 1, current, current + 1, current + 2];
  };

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const handleDateButtonClick = () => {
    if (dateInputRef.current) {
      if ("showPicker" in HTMLInputElement.prototype) {
        try {
          dateInputRef.current.showPicker();
        } catch {
          dateInputRef.current.focus();
        }
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate("");
    setCurrentPage(1);
  };

  return (
    <PortalPageContainer>
      <PortalPageHeader
        title="Audit Log"
        subtitle="Audit Log Insights"
      />

      <div className="mb-5 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <label htmlFor={searchInputId} className="sr-only">
            Search Action
          </label>
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <input
            id={searchInputId}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 shadow-2xs outline-none transition-all placeholder:text-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Search Action"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative inline-flex items-center rounded-md border border-zinc-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <select
              aria-label="Filter by event type"
              value={selectedEventType}
              onChange={(e) => {
                setSelectedEventType(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 appearance-none bg-transparent pl-3.5 pr-9 text-sm font-normal text-zinc-700 dark:text-slate-300 cursor-pointer outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-white rounded-md"
            >
              <option value="">All Events</option>
              <option value="Login">Login</option>
              <option value="Insert">Insert</option>
              <option value="Update">Update</option>
              <option value="Delete">Delete</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-slate-400"
              aria-hidden="true"
            />
          </div>
          <div className="relative inline-flex items-center">
            <input
              type="date"
              ref={dateInputRef}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            />
            <div className="inline-flex items-center rounded-md border border-zinc-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                aria-label="Filter by date"
                onClick={handleDateButtonClick}
                className="whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 py-2 inline-flex h-10 w-auto items-center justify-start gap-2 rounded-md px-3.5 text-sm font-normal text-zinc-700 hover:text-zinc-900 dark:text-slate-300 dark:hover:text-white cursor-pointer"
              >
                <Calendar
                  className="h-4 w-4 shrink-0 text-zinc-400"
                  aria-hidden="true"
                />
                <span className="truncate">{selectedDate || "Select date"}</span>
              </button>
              {selectedDate && (
                <button
                  type="button"
                  aria-label="Clear date"
                  onClick={handleClearDate}
                  className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex flex-col overflow-hidden rounded-md border border-zinc-200/80 bg-white/95 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-zinc-100 dark:border-slate-800">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                <th className="px-5 py-3.5 font-semibold">Timestamp</th>
                <th className="px-5 py-3.5 font-semibold">Actor</th>
                <th className="px-5 py-3.5 font-semibold">IP Address</th>
                <th className="px-5 py-3.5 font-semibold">Action Event</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-slate-800/60">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="h-4 w-36 rounded bg-zinc-200 dark:bg-slate-800" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-slate-800" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-28 rounded bg-zinc-200 dark:bg-slate-800" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-slate-800" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="h-32 text-center text-sm text-zinc-500 dark:text-slate-400"
                  >
                    No matching audit events found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td
                      suppressHydrationWarning
                      className="whitespace-nowrap px-5 py-4 font-mono text-[13px] text-zinc-600 dark:text-slate-400"
                    >
                      {formatToLocalTime(item.timestamp)}
                    </td>
                    <td className="px-5 py-4 max-w-[200px] min-w-0">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span
                          className="font-medium text-zinc-800 dark:text-slate-200 truncate block"
                          title={item.actor}
                        >
                          {item.actor}
                        </span>
                        {item.isSystem && (
                          <span className="shrink-0 rounded-full bg-zinc-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:text-slate-400">
                            System
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-mono text-[13px] text-zinc-600 dark:text-slate-400">
                      {item.ipAddress ? item.ipAddress : "—"}
                    </td>
                    <td className={`px-5 py-4 font-medium ${getActionColor(item.action)}`}>
                      {item.action}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

      {/* Pagination Footer */}
      <div className="mt-4 shrink-0">
        <div className="flex flex-col gap-3 rounded-md border border-zinc-200/80 bg-white/90 px-4 py-3 shadow-xs backdrop-blur-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/90">
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            {totalCount === 0
              ? "Showing 0 of 0 events"
              : `Showing ${startItem}-${endItem} of ${totalCount} events`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer dark:hover:text-white dark:focus-visible:ring-white"
            >
              <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                aria-current={currentPage === pageNumber ? "page" : undefined}
                onClick={() => setCurrentPage(pageNumber)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 cursor-pointer ${
                  currentPage === pageNumber
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "border border-zinc-200/80 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer dark:hover:text-white dark:focus-visible:ring-white"
            >
              <ChevronsRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </PortalPageContainer>
  );
}
