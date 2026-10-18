'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarDays, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEFAULT_STATUS_CONFIG, STATUS_CONFIG } from '../constants';
import { useApplicationStatusHistory } from '../hooks/use-application-status-history';
import type { ApplicationStatus } from '../types';
import { formatShortDate } from '../types/helpers';

interface ApplicationTimelineProps {
  applicationId: string;
  appliedDate: string;
  currentStatus: ApplicationStatus;
}

function statusLabel(status: ApplicationStatus): string {
  return STATUS_CONFIG[status]?.label ?? status;
}

function statusDot(status: ApplicationStatus): string {
  return STATUS_CONFIG[status]?.dot ?? DEFAULT_STATUS_CONFIG.dot;
}

function statusText(status: ApplicationStatus): string {
  return STATUS_CONFIG[status]?.text ?? DEFAULT_STATUS_CONFIG.text;
}

function statusIcon(status: ApplicationStatus) {
  return STATUS_CONFIG[status]?.Icon ?? DEFAULT_STATUS_CONFIG.Icon;
}

export function ApplicationTimeline({
  applicationId,
  appliedDate,
  currentStatus,
}: ApplicationTimelineProps) {
  const { data, isPending, isError, error, refetch } =
    useApplicationStatusHistory(applicationId);
  const router = useRouter();

  if (isPending) {
    return (
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <p className="flex items-center gap-2 text-[13px] text-slate-500">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading timeline…
        </p>
      </div>
    );
  }

  if (isError) {
    const detail =
      error instanceof Error && error.message
        ? error.message
        : "Please try again.";
    return (
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 text-[13px] shadow-xs">
        <p className="text-rose-600">
          Couldn&apos;t load the status timeline. {detail}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 cursor-pointer rounded-md border border-slate-200/80 bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700"
        >
          Try again
        </button>
      </div>
    );
  }

  // The timeline always starts with the applied date, then replays recorded
  // changes. The initial "nothing → Applied" record is skipped to avoid a
  // duplicate Applied node, and the live status is appended when history
  // doesn't reach it yet (e.g. changes made before recording existed).
  const rawNodes: { toStatus: ApplicationStatus; changedAt: string | null }[] = [
    { toStatus: 'Applied', changedAt: appliedDate },
  ];
  for (const event of data ?? []) {
    if (!event?.toStatus) {
      continue;
    }
    if (event.fromStatus === null && event.toStatus === 'Applied') {
      continue;
    }
    rawNodes.push({ toStatus: event.toStatus, changedAt: event.changedAt });
  }
  if (rawNodes[rawNodes.length - 1].toStatus !== currentStatus) {
    rawNodes.push({ toStatus: currentStatus, changedAt: null });
  }

  // An interview invitation and its acceptance are one flow, not two steps:
  // collapse a consecutive Invited → Interview pair into a single Interview
  // node showing the invited date.
  const nodes: typeof rawNodes = [];
  for (const node of rawNodes) {
    const previous = nodes[nodes.length - 1];
    if (previous?.toStatus === 'Invited' && node.toStatus === 'Interview') {
      nodes[nodes.length - 1] = { toStatus: 'Interview', changedAt: previous.changedAt };
    } else {
      nodes.push(node);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Application timeline
        </p>
        <p className="text-xs text-slate-400">
          {nodes.length} {nodes.length === 1 ? 'step' : 'steps'}
        </p>
      </div>

      <ol aria-label="Application status timeline">
        {nodes.map((node, index) => {
          const isLast = index === nodes.length - 1;
          const Icon = statusIcon(node.toStatus);
          // Only the live Invited step links out to /interviews —
          // past steps stay static.
          const isInvitedLink =
            isLast && node.toStatus === 'Invited';
          const body = (
            <>
              <p
                className={cn(
                  'flex flex-wrap items-center gap-x-2 text-[13px]',
                  isLast ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                )}
              >
                <span>
                  Step {index + 1} · {statusLabel(node.toStatus)}
                </span>
                {isLast && (
                  <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                    Current
                  </span>
                )}
              </p>
              {node.changedAt !== null ? (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  {formatShortDate(node.changedAt)}
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-slate-400">
                  Date not recorded
                </p>
              )}
              {isInvitedLink && (
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-indigo-600">
                  View invitation
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </p>
              )}
            </>
          );
          return (
            <li key={`${node.toStatus}-${node.changedAt ?? 'current'}-${index}`} className="relative flex gap-3 pb-4 last:pb-0">
              <div className="flex flex-col items-center" aria-hidden="true">
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full border',
                    isLast
                      ? cn(statusDot(node.toStatus), 'border-transparent text-white shadow-xs')
                      : 'border-slate-200 bg-slate-50'
                  )}
                >
                  <Icon className={cn('size-4', !isLast && statusText(node.toStatus))} />
                </span>
                {!isLast && (
                  <span className="w-px flex-1 bg-slate-200" />
                )}
              </div>

              {isInvitedLink ? (
                <button
                  type="button"
                  onClick={() => router.push('/interviews')}
                  aria-label="View interview invitation"
                  className="min-w-0 flex-1 cursor-pointer rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-1.5 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {body}
                </button>
              ) : (
                <div
                  className={cn(
                    'min-w-0 flex-1 rounded-lg px-3 py-1.5',
                    isLast && 'border border-emerald-100 bg-emerald-50/70'
                  )}
                >
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
