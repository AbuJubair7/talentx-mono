'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Building2,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Link2,
  MapPin,
  MessageSquareText,
  Monitor,
  Navigation,
  Sparkles,
  Video,
  X,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { INTERVIEW_TYPE_LABELS } from '../constants/interview.constants';
import type { InterviewType, TalentInterviewDto } from '../types/interview.types';
import {
  formatRelative,
  formatShortDate,
  formatWhen,
  getDisplayStatus,
  getInterviewScheduledDate,
  getInterviewWhen,
  initials,
  mapsHref,
  toHref,
} from '../utils/interview.utils';
import { DateTile, type DateTileTone } from './DateTile';
import { InterviewStatusBadge } from './InterviewStatusBadge';
import { AcceptInterviewDialog } from './AcceptInterviewDialog';
import { DeclineInterviewDialog } from './DeclineInterviewDialog';

interface TalentInterviewCardProps {
  interview: TalentInterviewDto;
  now?: Date;
}

const modeIcon: Record<InterviewType, React.ElementType> = {
  OnlineAssessment: Monitor,
  OnSite: Building2,
  OnCall: Video,
};

export function TalentInterviewCard({ interview, now = new Date() }: TalentInterviewCardProps) {
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayStatus = getDisplayStatus(interview, now);
  const isPastItem = displayStatus === 'expired' || displayStatus === 'completed';
  const whenIso = getInterviewWhen(interview);
  const scheduledDate = getInterviewScheduledDate(interview);

  const ModeIcon = modeIcon[interview.type] ?? Monitor;
  const typeLabel = INTERVIEW_TYPE_LABELS[interview.type] ?? interview.type;

  const whenLabel =
    interview.type === 'OnlineAssessment'
      ? 'Complete by'
      : interview.status === 'Pending' && interview.timeslots.length > 1
      ? 'Proposed timeslots'
      : interview.status === 'Pending' && interview.timeslots.length === 1
      ? 'Proposed time'
      : 'Scheduled';

  const tone: DateTileTone =
    displayStatus === 'pending' ? 'pending' : displayStatus === 'accepted' ? 'upcoming' : 'muted';

  const linkOrLocation = interview.assessmentUrl || interview.locationOrLink;
  const isLink = Boolean(
    interview.assessmentUrl ||
      (interview.locationOrLink &&
        (interview.locationOrLink.startsWith('http') || interview.locationOrLink.includes('.')))
  );

  const copyLink = async () => {
    if (!linkOrLocation) return;
    try {
      await navigator.clipboard.writeText(toHref(linkOrLocation));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition-shadow hover:shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-5',
        displayStatus === 'pending'
          ? 'border-amber-200 ring-1 ring-amber-100 dark:border-amber-900/50 dark:ring-amber-900/20'
          : '',
        isPastItem || displayStatus === 'declined' ? 'bg-slate-50/70 dark:bg-slate-900/60' : ''
      )}
    >
      <div className="flex gap-4">
        <DateTile iso={whenIso} tone={tone} />

        <div className="min-w-0 flex-1">
          {/* Header row */}
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <h3
                className={cn(
                  'break-words text-base font-semibold leading-tight [overflow-wrap:anywhere] sm:text-lg',
                  isPastItem || displayStatus === 'declined'
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-slate-900 dark:text-white'
                )}
                title={interview.jobTitle}
              >
                {interview.jobTitle}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                <span className="break-words font-medium text-slate-700 [overflow-wrap:anywhere] dark:text-slate-300">{interview.companyName}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <ModeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {typeLabel}
                </span>
              </div>
            </div>
            <InterviewStatusBadge status={displayStatus} />
          </div>

          {/* Invited line */}
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {initials(interview.companyName)}
            </div>
            <p className="min-w-0 truncate">
              Invited by {interview.companyName} · {formatShortDate(interview.sentAt)}
            </p>
          </div>

          {/* Details DL */}
          <dl className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/50 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="text-xs text-slate-500 dark:text-slate-400">{whenLabel}</dt>
                <dd className="font-medium text-slate-900 dark:text-white">
                  {formatWhen(whenIso)}
                  {scheduledDate && (() => {
                    const relativeStr = formatRelative(whenIso, now);
                    return (
                      <span
                        className={cn(
                          'ml-2 text-xs font-normal',
                          isPastItem ? 'text-slate-400 dark:text-slate-500' : 'text-emerald-700 dark:text-emerald-400'
                        )}
                      >
                        {relativeStr ? `(Your local time · ${relativeStr})` : '(Your local time)'}
                      </span>
                    );
                  })()}
                  {interview.status === 'Pending' && interview.timeslots.length > 1 && (
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {interview.timeslots.length} slots offered
                    </span>
                  )}
                </dd>
              </div>
            </div>

            {linkOrLocation && (
              <div className="flex items-start gap-2.5">
                {interview.type === 'OnSite' ? (
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                ) : (
                  <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <dt className="text-xs text-slate-500 dark:text-slate-400">
                    {interview.type === 'OnSite' ? 'Location' : 'Link'}
                  </dt>
                  <dd className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
                    <span className="truncate">{linkOrLocation}</span>
                    {isLink && (
                      <button
                        type="button"
                        onClick={copyLink}
                        className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={copied ? 'Link copied' : 'Copy link'}
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </dd>
                </div>
              </div>
            )}
          </dl>

          {/* Instructions note */}
          {interview.instructions && (
            <div className="mt-3 flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
              <MessageSquareText
                className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500"
                aria-hidden="true"
              />
              <p className="min-w-0 break-words leading-relaxed [overflow-wrap:anywhere]">
                <span className="sr-only">Note from employer: </span>
                {interview.instructions}
              </p>
            </div>
          )}

          {/* Actions */}
          {interview.status === 'Pending' && displayStatus === 'expired' && (
            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-100 px-3 py-2.5 text-sm font-semibold text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300"
              >
                <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                This invitation has expired and can no longer be accepted or declined.
              </p>
            </div>
          )}

          {interview.status === 'Pending' && displayStatus !== 'expired' && (
            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeclineOpen(true)}
                className="cursor-pointer gap-1.5"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Decline
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setAcceptOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer gap-1.5"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                Accept
              </Button>
            </div>
          )}

          {interview.status === 'Accepted' && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              {linkOrLocation && (
                <a
                  href={isLink ? toHref(linkOrLocation) : mapsHref(linkOrLocation)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {isLink ? (
                    <>
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      {interview.type === 'OnlineAssessment' ? 'Open assessment' : 'Join call'}
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4" aria-hidden="true" />
                      Get directions
                    </>
                  )}
                </a>
              )}

              <Link
                href={`/interviews/${interview.id}/prepare`}
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  'bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 cursor-pointer shadow-2xs ml-auto'
                )}
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Prepare for Interview
              </Link>
            </div>
          )}
        </div>
      </div>

      <AcceptInterviewDialog interview={interview} open={acceptOpen} onOpenChange={setAcceptOpen} />
      <DeclineInterviewDialog interview={interview} open={declineOpen} onOpenChange={setDeclineOpen} />
    </motion.article>
  );
}
