import { Hourglass, ShieldAlert } from 'lucide-react';

import { formatShortDate } from '@/lib/date';
import type { JobStatus } from '../types/employer-job.types';

interface DeactivationBannerProps {
  status: JobStatus;
  reasonLabel?: string | null;
  details?: string | null;
  deactivatedAt?: string | null;
  // The detail page explains what to do next; the edit page already shows the form below it.
  showNextStep?: boolean;
}

// Banner explaining a deactivation or an ongoing admin review.
export function DeactivationBanner({
  status,
  reasonLabel,
  details,
  deactivatedAt,
  showNextStep = true,
}: DeactivationBannerProps) {
  if (status !== 'Deactivated' && status !== 'PendingReview') {
    return null;
  }

  const isUnderReview = status === 'PendingReview';
  const Icon = isUnderReview ? Hourglass : ShieldAlert;

  return (
    <div
      role="status"
      className={
        isUnderReview
          ? 'flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900'
          : 'flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900'
      }
    >
      <Icon
        className={isUnderReview ? 'mt-0.5 size-5 shrink-0 text-amber-600' : 'mt-0.5 size-5 shrink-0 text-rose-600'}
        aria-hidden="true"
      />
      <div className="min-w-0 space-y-1">
        <p className="font-semibold">
          {isUnderReview
            ? 'Under admin review — editing is locked until the review is complete.'
            : 'An admin deactivated this job'}
        </p>

        {reasonLabel && (
          <p className="font-medium">
            {isUnderReview ? 'Original reason: ' : 'Reason: '}
            {reasonLabel}
          </p>
        )}

        {details && <p className="whitespace-pre-line break-words opacity-90">{details}</p>}

        {deactivatedAt && (
          <p className={isUnderReview ? 'text-xs text-amber-700' : 'text-xs text-rose-700'}>
            {formatShortDate(deactivatedAt, '')}
          </p>
        )}

        {showNextStep && !isUnderReview && (
          <p className="pt-0.5 font-medium">Fix the issues below, then resubmit for review.</p>
        )}
        {showNextStep && isUnderReview && (
          <p className="pt-0.5">You&apos;ll get an email as soon as an admin has looked at it.</p>
        )}
      </div>
    </div>
  );
}
