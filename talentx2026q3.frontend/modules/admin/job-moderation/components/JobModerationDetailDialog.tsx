"use client";

import { BriefcaseBusiness, Loader2, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ApiError } from "@/lib/api/axios";
import { useAdminJobDetails } from "../hooks/useAdminJobDetails";
import { DeactivationReasonPanel } from "./DeactivationReasonPanel";
import { EmployerContactCard } from "./EmployerContactCard";
import { JobModerationContent } from "./JobModerationContent";
import { ModerationActions } from "./ModerationActions";
import { ModerationHistory } from "./ModerationHistory";
import { ModerationStatusBadge } from "./ModerationStatusBadge";

interface JobModerationDetailDialogProps {
  jobId: string | null;
  onClose: () => void;
  customActions?: React.ReactNode;
}

// Dialog with everything an admin needs to moderate one job.
export function JobModerationDetailDialog({ jobId, onClose, customActions }: JobModerationDetailDialogProps) {
  const isOpen = jobId !== null;
  const { data: job, isPending, isError, error, refetch } = useAdminJobDetails(jobId ?? undefined);
  // Drafts, closed and deleted jobs are outside moderation, so the API answers 404 for them.
  const isNotFound = (error as ApiError | null)?.status === 404;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col p-0 border-zinc-200 shadow-2xl rounded-2xl bg-white dark:border-slate-800 dark:bg-slate-900">
        <DialogHeader className="flex flex-row items-start justify-between gap-4 px-6 py-4 border-b border-zinc-200/80 bg-zinc-50/80 shrink-0 pr-12 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <BriefcaseBusiness className="size-4" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold tracking-tight text-zinc-900 dark:text-slate-100 break-words [overflow-wrap:anywhere]">
                {job?.title ?? "Job Details"}
              </DialogTitle>
              <DialogDescription
                className="text-xs text-zinc-500 dark:text-slate-400 truncate block"
                title={job?.companyName}
              >
                {job?.companyName ?? "Review the posting and its moderation history"}
              </DialogDescription>
            </div>
          </div>

          {job && (
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <ModerationStatusBadge status={job.status} isExpired={job.isExpired} />
              {customActions !== undefined ? (
                customActions
              ) : (
                <ModerationActions job={job} onActionSuccess={onClose} />
              )}
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {isPending && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-zinc-400 dark:text-slate-500">
              <Loader2 className="size-8 animate-spin text-emerald-600" />
              <p className="text-sm font-medium text-zinc-600 dark:text-slate-300">Loading job details…</p>
            </div>
          )}

          {isError && isNotFound && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-sm font-semibold text-zinc-800 dark:text-slate-200">
                This job isn&apos;t available for moderation
              </p>
              <p className="max-w-sm text-xs text-zinc-500 dark:text-slate-400">
                It may have been closed, deleted, or moved back to draft by the employer.
              </p>
            </div>
          )}

          {isError && !isNotFound && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">Couldn&apos;t load job details</p>
              <p className="max-w-sm text-xs text-zinc-500 dark:text-slate-400">
                {(error as { message?: string })?.message ?? "Please try again."}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RefreshCw className="size-3.5 text-zinc-500" />
                Retry
              </button>
            </div>
          )}

          {job && (
            <div className="space-y-6">
              <DeactivationReasonPanel
                status={job.status}
                reasonLabel={job.deactivationReasonLabel}
                details={job.deactivationDetails}
                deactivatedAt={job.deactivatedAt}
              />
              <EmployerContactCard
                companyName={job.companyName}
                employerName={job.employerName}
                employerEmail={job.employerEmail}
              />
              <JobModerationContent job={job} />
              <div className="border-t border-zinc-100 pt-5 dark:border-slate-800">
                <ModerationHistory entries={job.history} />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
