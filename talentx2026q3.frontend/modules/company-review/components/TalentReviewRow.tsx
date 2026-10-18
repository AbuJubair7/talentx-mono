'use client';

import { useState } from 'react';
import { AlertCircle, CalendarClock, Edit3, Lock, MessageSquarePlus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/date';
import { INTERVIEW_TYPE_LABELS } from '@/modules/talent-interviews';
import { REVIEW_MODERATION_REASON_LABELS } from '../constants/company-review.constants';
import type { MyCompanyReviewItemDto } from '../types/company-review.types';
import { ReviewCard } from './ReviewCard';
import { ReviewFormDialog } from './ReviewFormDialog';
import { ReviewStatusBadge } from './ReviewStatusBadge';
import { WithdrawReviewDialog } from './WithdrawReviewDialog';

interface TalentReviewRowProps {
  item: MyCompanyReviewItemDto;
}

export function TalentReviewRow({ item }: TalentReviewRowProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const { review } = item;
  const showModerationNote =
    review !== null &&
    (review.status === 'Rejected' || review.status === 'Hidden') &&
    (review.moderationReason !== null || review.moderationDetails !== null);

  const isActionable = !review && item.canSubmit;
  const isLocked = !review && !item.canSubmit;

  return (
    <div
      className={`space-y-4 rounded-2xl border p-5 shadow-xs transition-all duration-200 sm:p-6 ${
        isActionable
          ? 'border-emerald-200 bg-gradient-to-r from-emerald-50/30 via-white to-white shadow-sm hover:border-emerald-300 hover:shadow-md'
          : isLocked
            ? 'border-slate-200/80 bg-slate-50/60'
            : 'border-slate-200 bg-white hover:shadow-sm'
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h3 className="truncate text-base font-bold text-slate-900">{item.companyName}</h3>
          <p className="truncate text-sm font-semibold text-slate-700">{item.jobTitle}</p>
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {INTERVIEW_TYPE_LABELS[item.interviewType] ?? item.interviewType}
          </span>
        </div>
        {review ? (
          <ReviewStatusBadge status={review.status} />
        ) : isActionable ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 shadow-2xs">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            Ready to Review
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            <Lock className="size-3 text-slate-400" aria-hidden="true" />
            Locked
          </span>
        )}
      </div>

      {/* State A: Locked until interview date or completion */}
      {isLocked && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-100/70 p-3.5">
          <p className="flex items-center gap-2 text-xs font-medium text-slate-700">
            {item.reviewUnlocksAt ? (
              <>
                <CalendarClock className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
                Review opens on {formatDateTime(item.reviewUnlocksAt)}
              </>
            ) : (
              <>
                <Lock className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
                Available after your interview
              </>
            )}
          </p>
          <Button type="button" size="sm" disabled className="cursor-not-allowed opacity-60 text-xs">
            Write review
          </Button>
        </div>
      )}

      {/* State B: Actionable (Can submit review) */}
      {isActionable && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
          <p className="flex items-center gap-2 text-xs font-medium text-emerald-900">
            <MessageSquarePlus className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
            Your interview concluded! Share your experience to help fellow job seekers.
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => setFormOpen(true)}
            className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 shrink-0 font-medium"
          >
            <MessageSquarePlus className="mr-1.5 size-3.5" aria-hidden="true" />
            Write review
          </Button>
        </div>
      )}

      {/* State C: Review Withdrawn */}
      {review && review.status === 'Withdrawn' && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
          You withdrew this review. It can no longer be edited or republished.
        </div>
      )}

      {/* State D: Review Published / Submitted */}
      {review && review.status !== 'Withdrawn' && (
        <ReviewCard
          sentiment={review.sentiment}
          comment={review.comment}
          ratings={review.ratings}
          date={review.submittedAt}
        />
      )}

      {/* State E: Moderation Note Banner (Rejected / Hidden) */}
      {showModerationNote && review && (
        <div className="space-y-1.5 rounded-xl border border-amber-200/90 bg-amber-50/80 p-4 text-xs text-amber-950">
          <div className="flex items-center gap-1.5 font-semibold text-amber-900">
            <AlertCircle className="size-4 shrink-0 text-amber-600" aria-hidden="true" />
            <span>
              {review.status === 'Hidden' ? 'Hidden by a moderator' : 'Not approved by a moderator'}
              {review.moderationReason ? ` — ${REVIEW_MODERATION_REASON_LABELS[review.moderationReason]}` : ''}
            </span>
          </div>
          {review.moderationDetails && (
            <p className="whitespace-pre-line break-words text-slate-700 pl-5 [overflow-wrap:anywhere]">
              {review.moderationDetails}
            </p>
          )}
          {review.status === 'Rejected' && (
            <p className="text-slate-600 font-medium pl-5 pt-0.5">
              You can update your review addressing the feedback and resubmit.
            </p>
          )}
        </div>
      )}

      {/* Card Action Controls */}
      {review && (item.canEdit || item.canWithdraw) && (
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
          {item.canWithdraw && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setWithdrawOpen(true)}
              className="cursor-pointer text-xs text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              <RotateCcw className="mr-1 size-3 text-slate-500" aria-hidden="true" />
              Withdraw
            </Button>
          )}
          {item.canEdit && (
            <Button
              type="button"
              size="sm"
              onClick={() => setFormOpen(true)}
              className="cursor-pointer text-xs bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              <Edit3 className="mr-1 size-3" aria-hidden="true" />
              Edit
            </Button>
          )}
        </div>
      )}

      <ReviewFormDialog item={item} open={formOpen} onOpenChange={setFormOpen} />
      <WithdrawReviewDialog item={item} open={withdrawOpen} onOpenChange={setWithdrawOpen} />
    </div>
  );
}

