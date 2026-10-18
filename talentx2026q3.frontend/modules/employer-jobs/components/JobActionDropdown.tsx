'use client';

import { useRouter } from 'next/navigation';
import { MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { JobActionDropdownProps, JobStatus } from '../types/employer-job.types';

// Per-job "..." menu on the employer's job list; actions depend on status.
export function JobActionDropdown({
  jobId,
  jobTitle,
  jobStatus,
  isExpired,
  expireAt,
  onClose,
  onDelete,
  onReopen,
  onPublish,
}: JobActionDropdownProps) {
  const router = useRouter();

  // An admin's decision outranks the deadline: a deactivated job that is also expired must not
  // be offered the Expired job's "Edit & Re-publish" action.
  const isModerated = jobStatus === 'Deactivated' || jobStatus === 'PendingReview';
  const isExpiredJob = !isModerated && (jobStatus === 'Expired' || Boolean(isExpired));
  const effectiveStatus: JobStatus = isExpiredJob ? 'Expired' : jobStatus;

  // While an admin is reviewing a resubmitted job, the employer can only look at it.
  const isUnderReview = effectiveStatus === 'PendingReview';
  const isDeactivated = effectiveStatus === 'Deactivated';

  const handleReopenClick = () => {
    if (expireAt) {
      const expirationDate = new Date(expireAt);
      if (!isNaN(expirationDate.getTime()) && expirationDate < new Date()) {
        toast.error(
          'Application deadline has passed. Please update the deadline before reopening.'
        );
        router.push(`/job/${jobId}/edit`);
        return;
      }
    }
    onReopen?.(jobId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex size-8 items-center justify-center rounded-md border border-slate-200/80 bg-slate-50/60 text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
        aria-label={`Job actions for ${jobTitle}`}
        aria-haspopup="menu"
      >
        <MoreVertical className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLinkItem
          href={`/job/job-listing/${jobId}`}
          className="cursor-pointer"
        >
          View Details
        </DropdownMenuLinkItem>
        {!isUnderReview && (
          <DropdownMenuLinkItem
            href={`/job/${jobId}/edit`}
            className="cursor-pointer"
          >
            {effectiveStatus === 'Expired'
              ? 'Edit & Re-publish'
              : isDeactivated
                ? 'Fix & Resubmit'
                : 'Edit'}
          </DropdownMenuLinkItem>
        )}
        {!isUnderReview && <DropdownMenuSeparator />}
        {effectiveStatus === 'Draft' && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onPublish?.(jobId)}
          >
            Publish
          </DropdownMenuItem>
        )}
        {effectiveStatus === 'Published' && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onClose(jobId)}
          >
            Close Job
          </DropdownMenuItem>
        )}
        {effectiveStatus === 'Closed' && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleReopenClick}
          >
            Reopen
          </DropdownMenuItem>
        )}
        {(effectiveStatus === 'Draft' ||
          effectiveStatus === 'Published' ||
          effectiveStatus === 'Closed') && <DropdownMenuSeparator />}
        {/* Nothing is deletable mid-review: the admin is looking at this job right now. */}
        {!isUnderReview && (
          <DropdownMenuItem
            className="text-rose-600 focus:text-rose-700 cursor-pointer"
            onClick={() => onDelete(jobId)}
          >
            Delete Job
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
