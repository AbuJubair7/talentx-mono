'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatEmploymentType } from '@/modules/job-listing';
import type { SavedJobResponse } from '@/modules/saved-jobs';
import { avatarColor, formatEnumString, formatShortDate, getInitials } from '../types/helpers';
import { EmptyRow, ErrorRow, LoadingRow } from './table-states';

const COLUMN_COUNT = 5;

export function SavedJobsTable({
  savedJobs,
  isLoading,
  isError,
  onRemove,
  removingJobId,
  onRetry,
}: {
  savedJobs: SavedJobResponse[];
  isLoading: boolean;
  isError: boolean;
  onRemove: (jobId: string) => void;
  removingJobId?: string;
  onRetry?: () => void;
}) {
  const router = useRouter();
  const [confirmRemoveJobId, setConfirmRemoveJobId] = useState<string | null>(null);
  const jobPendingRemoval = savedJobs.find((job) => job.jobId === confirmRemoveJobId);

  function handleConfirmRemove() {
    if (confirmRemoveJobId) {
      onRemove(confirmRemoveJobId);
    }
    setConfirmRemoveJobId(null);
  }

  return (
    <div className="max-h-[500px] w-full max-w-full overflow-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full min-w-[720px] text-[15px]">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-slate-100 bg-white">
            <th className="bg-white px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Company / Role
            </th>
            <th className="bg-white px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Employment Type
            </th>
            <th className="bg-white px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Posted Date
            </th>
            <th className="bg-white px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Location
            </th>
            <th className="bg-white px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <LoadingRow colSpan={COLUMN_COUNT} />
          ) : isError ? (
            <ErrorRow
              colSpan={COLUMN_COUNT}
              message="Couldn't load your saved jobs. Please try again."
              onRetry={onRetry}
            />
          ) : savedJobs.length === 0 ? (
            <EmptyRow
              colSpan={COLUMN_COUNT}
              message="No saved jobs yet. Bookmark a role to find it here later."
              actionLabel="Browse jobs"
              actionHref="/jobs"
            />
          ) : (
            savedJobs.map((job) => (
              <tr
                key={job.savedJobId}
                role="link"
                tabIndex={0}
                onClick={() => router.push(`/jobs/${job.jobId}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    router.push(`/jobs/${job.jobId}`);
                  }
                }}
                className="group cursor-pointer transition-colors hover:bg-slate-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-700"
              >
                <td className="px-5 py-2.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-md text-[13px] font-bold text-white',
                        avatarColor(job.companyName),
                      )}
                      aria-hidden="true"
                    >
                      {getInitials(job.companyName)}
                    </div>

                    <div className="min-w-0">
                      <p className="max-w-[200px] truncate font-bold text-slate-900">
                        {job.companyName}
                      </p>

                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/jobs/${job.jobId}`}
                          onClick={(e) => e.stopPropagation()}
                           className="block max-w-[200px] truncate text-[13px] text-slate-500 transition-colors hover:text-emerald-700"
                          title={job.jobTitle}
                        >
                          {job.jobTitle}
                        </Link>

                        {!job.isAvailable && (
                          <span className="group/unavail relative inline-flex shrink-0 items-center">
                            <AlertCircle
                              className="size-3.5 text-rose-600"
                              aria-hidden="true"
                            />
                            <div
                              role="tooltip"
                              className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 w-max max-w-[220px] -translate-y-1/2 rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 opacity-0 shadow-lg transition-opacity duration-150 group-hover/unavail:opacity-100"
                            >
                              This job is no longer available
                            </div>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Employment Type */}
                <td className="whitespace-nowrap px-5 py-2.5 text-[15px] text-slate-600">
                  {job.employmentType ? (
                    <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[13px] font-medium text-slate-600">
                      {formatEnumString(job.employmentType)}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                <td className="whitespace-nowrap px-5 py-2.5 text-[15px] text-slate-500">
                  {formatShortDate(job.postedDate)}
                </td>

                <td className="max-w-[160px] truncate px-5 py-2.5 text-slate-600">
                  {job.location || '—'}
                </td>

                <td className="px-5 py-2.5 text-left">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmRemoveJobId(job.jobId);
                    }}
                    disabled={removingJobId === job.jobId}
                    aria-label={`Remove ${job.jobTitle} from saved jobs`}
                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Bookmark className="size-4 fill-current" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Dialog
        open={confirmRemoveJobId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmRemoveJobId(null);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogTitle>Remove saved job?</DialogTitle>
          <DialogDescription>
            {jobPendingRemoval
              ? `"${jobPendingRemoval.jobTitle}" will be removed from your saved jobs list. You can always save it again later.`
              : 'This job will be removed from your saved jobs list. You can always save it again later.'}
          </DialogDescription>
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose>
              <Button
                variant="outline"
                onClick={() => setConfirmRemoveJobId(null)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleConfirmRemove}
              className="cursor-pointer bg-rose-600 text-white hover:bg-rose-700"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
