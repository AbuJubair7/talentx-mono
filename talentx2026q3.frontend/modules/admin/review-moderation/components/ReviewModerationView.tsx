"use client";

import { ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { PortalPageContainer, PortalPageHeader } from "@/components/layout";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { CompanyReviewStatus } from "@/modules/company-review";
import { useAdminCompanyReviews } from "../hooks/useAdminCompanyReviews";
import { useAdminCompanyReviewStats } from "../hooks/useAdminCompanyReviewStats";
import { useApproveCompanyReview } from "../hooks/useApproveCompanyReview";
import { useRejectCompanyReview } from "../hooks/useRejectCompanyReview";
import { useHideCompanyReview } from "../hooks/useHideCompanyReview";
import { useUnhideCompanyReview } from "../hooks/useUnhideCompanyReview";
import type {
  AdminCompanyReviewListItem,
  AdminCompanyReviewsQueryParams,
  AdminCompanyReviewStats,
  ModerationReasonPayload,
} from "../types/review-moderation";
import { ApproveReviewDialog } from "./ApproveReviewDialog";
import { ModerationReasonDialog, type ModerationReasonAction } from "./ModerationReasonDialog";
import { ReviewDetailDialog } from "./ReviewDetailDialog";
import { ReviewModerationTable } from "./ReviewModerationTable";
import { UnhideReviewDialog } from "./UnhideReviewDialog";

const PAGE_SIZE = 10;

const STATUS_TABS: { label: string; status: CompanyReviewStatus | undefined; countKey: keyof AdminCompanyReviewStats | null }[] = [
  { label: "Pending", status: "Pending", countKey: "pendingCount" },
  { label: "Published", status: "Published", countKey: "publishedCount" },
  { label: "Rejected", status: "Rejected", countKey: "rejectedCount" },
  { label: "Hidden", status: "Hidden", countKey: "hiddenCount" },
  { label: "Withdrawn", status: "Withdrawn", countKey: "withdrawnCount" },
  { label: "All", status: undefined, countKey: "total" },
];

type PendingAction =
  | { type: "approve"; item: AdminCompanyReviewListItem }
  | { type: "unhide"; item: AdminCompanyReviewListItem }
  | { type: ModerationReasonAction; item: AdminCompanyReviewListItem };

// Admin "Review Moderation" page: status tabs with counts, search, pagination, table and
// the four moderation actions (each with its own confirm dialog).
export function ReviewModerationView() {
  const [activeStatus, setActiveStatus] = useState<CompanyReviewStatus | undefined>("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);
  // Adjusted during render (not an effect) when the debounced value settles, so the reset
  // happens in the same render as the new query rather than one tick later.
  const [appliedSearch, setAppliedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== appliedSearch) {
    setAppliedSearch(debouncedSearch);
    setCurrentPage(1);
  }
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const searchInputId = useId();

  const approveMutation = useApproveCompanyReview();
  const rejectMutation = useRejectCompanyReview();
  const hideMutation = useHideCompanyReview();
  const unhideMutation = useUnhideCompanyReview();

  const { data: stats } = useAdminCompanyReviewStats();

  const queryParams: AdminCompanyReviewsQueryParams = useMemo(
    () => ({
      page: currentPage,
      pageSize: PAGE_SIZE,
      searchQuery: debouncedSearch.trim() || undefined,
      status: activeStatus,
    }),
    [currentPage, debouncedSearch, activeStatus]
  );

  const { data, isLoading, isError, refetch } = useAdminCompanyReviews(queryParams);

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ? Math.max(1, data.totalPages) : 1;
  const pageSize = data?.pageSize ?? PAGE_SIZE;
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const handleStatusChange = (status: CompanyReviewStatus | undefined) => {
    setActiveStatus(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const clearPendingAction = () => setPendingAction(null);

  const handleConfirmApprove = async () => {
    if (!pendingAction || pendingAction.type !== "approve") return;
    try {
      await approveMutation.mutateAsync(pendingAction.item.id);
      clearPendingAction();
    } catch {
      // onError toast already surfaces the failure; keep the dialog open to retry.
    }
  };

  const handleConfirmUnhide = async () => {
    if (!pendingAction || pendingAction.type !== "unhide") return;
    try {
      await unhideMutation.mutateAsync(pendingAction.item.id);
      clearPendingAction();
    } catch {
      // Same here.
    }
  };

  const handleConfirmReason = async (payload: ModerationReasonPayload) => {
    if (!pendingAction || (pendingAction.type !== "reject" && pendingAction.type !== "hide")) return;
    const mutation = pendingAction.type === "reject" ? rejectMutation : hideMutation;
    try {
      await mutation.mutateAsync({ id: pendingAction.item.id, payload });
      clearPendingAction();
    } catch {
      // The dialog stays open with the admin's text; the hook already showed the error toast.
    }
  };

  return (
    <PortalPageContainer>
      <PortalPageHeader
        title="Review Moderation"
        subtitle="Approve, reject, hide or unhide talent reviews of companies."
      />

      <div className="mb-5 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Review status filters"
          className="relative inline-flex w-fit flex-wrap items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800"
        >
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatus === tab.status;
            const count = tab.countKey ? stats?.[tab.countKey] : undefined;
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
                    layoutId="activeReviewModerationTabIndicator"
                    className="absolute inset-0 rounded-sm bg-slate-950 shadow-xs"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">
                  {tab.label}
                  {typeof count === "number" && (
                    <span
                      className={cn(
                        "ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                        isActive ? "bg-white/20" : "bg-slate-200 dark:bg-slate-700"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full max-w-sm">
          <label htmlFor={searchInputId} className="sr-only">
            Search reviews
          </label>
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <input
            id={searchInputId}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 shadow-2xs outline-none transition-all placeholder:text-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Search by company or job title"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-md border border-zinc-200/80 bg-white/95 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95">
        <div className="overflow-x-auto">
          <ReviewModerationTable
            items={items}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => void refetch()}
            onView={setSelectedReviewId}
            onApprove={(item) => setPendingAction({ type: "approve", item })}
            onReject={(item) => setPendingAction({ type: "reject", item })}
            onHide={(item) => setPendingAction({ type: "hide", item })}
            onUnhide={(item) => setPendingAction({ type: "unhide", item })}
          />
        </div>
      </div>

      <div className="mt-4 shrink-0">
        <div className="flex flex-col gap-3 rounded-md border border-zinc-200/80 bg-white/90 px-4 py-3 shadow-xs backdrop-blur-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/90">
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            {totalCount === 0
              ? "Showing 0 of 0 reviews"
              : `Showing ${startItem}-${endItem} of ${totalCount} reviews`}
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

      <ReviewDetailDialog reviewId={selectedReviewId} onClose={() => setSelectedReviewId(null)} />

      <ApproveReviewDialog
        open={pendingAction?.type === "approve"}
        onOpenChange={(open) => !open && clearPendingAction()}
        companyName={pendingAction?.item.companyName ?? ""}
        isPending={approveMutation.isPending}
        onConfirm={handleConfirmApprove}
      />

      <UnhideReviewDialog
        open={pendingAction?.type === "unhide"}
        onOpenChange={(open) => !open && clearPendingAction()}
        companyName={pendingAction?.item.companyName ?? ""}
        isPending={unhideMutation.isPending}
        onConfirm={handleConfirmUnhide}
      />

      <ModerationReasonDialog
        open={pendingAction?.type === "reject" || pendingAction?.type === "hide"}
        onOpenChange={(open) => !open && clearPendingAction()}
        action={pendingAction?.type === "hide" ? "hide" : "reject"}
        companyName={pendingAction?.item.companyName ?? ""}
        isPending={rejectMutation.isPending || hideMutation.isPending}
        onConfirm={handleConfirmReason}
      />
    </PortalPageContainer>
  );
}
