"use client";

import { ChevronDown, ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { PortalPageContainer, PortalPageHeader } from "@/components/layout";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { useUpdateUserAccountStatus } from "../hooks/useUpdateUserAccountStatus";
import type {
  AdminAccountStatus,
  AdminUserDetails,
  AdminUserListItem,
  AdminUserRole,
  UsersQueryParams,
} from "../types/user";
import { UserDetailView } from "./UserDetailView";
import { UserStatsCards } from "./UserStatsCards";
import { UserStatusConfirmDialog } from "./UserStatusConfirmDialog";
import { UserTable } from "./UserTable";

interface StatusChangeRequest {
  userId: string;
  userName: string;
  newStatus: AdminAccountStatus;
}

const SEGMENTS: { label: string; role: AdminUserRole | undefined }[] = [
  { label: "All Users", role: undefined },
  { label: "Talents", role: "Talent" },
  { label: "Employers", role: "Employer" },
];

export function UserManagementView() {
  const [activeRole, setActiveRole] = useState<AdminUserRole | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminAccountStatus | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [statusChangeRequest, setStatusChangeRequest] = useState<StatusChangeRequest | null>(null);
  const searchInputId = useId();

  const updateUserAccountStatusMutation = useUpdateUserAccountStatus();

  const requestStatusChange = (
    user: AdminUserListItem | AdminUserDetails,
    newStatus: AdminAccountStatus
  ) => {
    setStatusChangeRequest({ userId: user.id, userName: user.name, newStatus });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangeRequest) {
      return;
    }
    try {
      await updateUserAccountStatusMutation.mutateAsync({
        id: statusChangeRequest.userId,
        newStatus: statusChangeRequest.newStatus,
      });
      setStatusChangeRequest(null);
    } catch {
      // onError toast already surfaces the failure; keep the dialog open to retry.
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const queryParams: UsersQueryParams = useMemo(
    () => ({
      page: currentPage,
      pageSize: 10,
      searchQuery: debouncedSearch.trim() || undefined,
      role: activeRole,
      status: statusFilter || undefined,
    }),
    [currentPage, debouncedSearch, activeRole, statusFilter]
  );

  const { data, isLoading } = useAdminUsers(queryParams);

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ? Math.max(1, data.totalPages) : 1;
  const pageSize = data?.pageSize ?? 10;
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const handleSegmentChange = (role: AdminUserRole | undefined) => {
    setActiveRole(role);
    setCurrentPage(1);
  };

  return (
    <PortalPageContainer>
      <PortalPageHeader
        title="User Management"
        subtitle="View, search, and manage Talent and Employer accounts."
      />

      <div className="mb-5 shrink-0">
        <UserStatsCards />
      </div>

      <div
        role="tablist"
        aria-label="User segment filters"
        className="relative mb-5 inline-flex w-fit shrink-0 flex-wrap items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800"
      >
        {SEGMENTS.map((segment) => {
          const isActive = activeRole === segment.role;
          return (
            <button
              key={segment.label}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleSegmentChange(segment.role)}
              className={cn(
                "relative whitespace-nowrap rounded-sm px-3.5 py-1.5 text-sm font-medium outline-none transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
                isActive
                  ? "font-semibold text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeUserSegmentIndicator"
                  className="absolute inset-0 rounded-sm bg-slate-950 shadow-xs"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">{segment.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-5 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <label htmlFor={searchInputId} className="sr-only">
            Search users
          </label>
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <input
            id={searchInputId}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 shadow-2xs outline-none transition-all placeholder:text-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative inline-flex items-center rounded-md border border-zinc-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <select
            aria-label="Filter by account status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as AdminAccountStatus | "");
              setCurrentPage(1);
            }}
            className="h-10 appearance-none bg-transparent pl-3.5 pr-9 text-sm font-normal text-zinc-700 dark:text-slate-300 cursor-pointer outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-white rounded-md"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Deactivated">Deactivated</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-slate-400"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-md border border-zinc-200/80 bg-white/95 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95">
        <div className="overflow-x-auto">
          <UserTable
            items={items}
            isLoading={isLoading}
            onView={setSelectedUserId}
            onRequestStatusChange={requestStatusChange}
          />
        </div>
      </div>

      <div className="mt-4 shrink-0">
        <div className="flex flex-col gap-3 rounded-md border border-zinc-200/80 bg-white/90 px-4 py-3 shadow-xs backdrop-blur-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/90">
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            {totalCount === 0
              ? "Showing 0 of 0 users"
              : `Showing ${startItem}-${endItem} of ${totalCount} users`}
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
            <span className="px-2 text-sm font-medium text-zinc-600 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
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

      <UserDetailView
        userId={selectedUserId}
        isOpen={selectedUserId !== null}
        onClose={() => setSelectedUserId(null)}
        onRequestStatusChange={requestStatusChange}
      />

      {statusChangeRequest && (
        <UserStatusConfirmDialog
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setStatusChangeRequest(null);
            }
          }}
          userName={statusChangeRequest.userName}
          newStatus={statusChangeRequest.newStatus}
          isPending={updateUserAccountStatusMutation.isPending}
          onConfirm={handleConfirmStatusChange}
        />
      )}
    </PortalPageContainer>
  );
}
