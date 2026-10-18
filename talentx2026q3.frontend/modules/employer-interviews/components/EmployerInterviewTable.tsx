'use client';

import { Laptop, MapPin, Phone } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDateTime, formatRelativeDay, formatShortDate, formatTimeslotRange, isPast } from '@/lib/date';
import {
  DEFAULT_INTERVIEW_STATUS_STYLE,
  INTERVIEW_STATUS_STYLES,
  INTERVIEW_TYPE_OPTIONS,
} from '../constants/interview.constants';
import type { EmployerInterviewDto, InterviewType } from '../types/interview.types';
import { getInitials } from '../utils/format';
import { InterviewStatusBadge } from './InterviewStatusBadge';

interface EmployerInterviewTableProps {
  interviews: EmployerInterviewDto[];
  isFetching: boolean;
}

function formatType(type: InterviewType): string {
  return INTERVIEW_TYPE_OPTIONS.find((opt) => opt.value === type)?.label ?? type;
}

const TYPE_ICONS: Record<InterviewType, typeof Laptop> = {
  OnlineAssessment: Laptop,
  OnCall: Phone,
  OnSite: MapPin,
};

function AssessmentDeadlineNote({ interview }: { interview: EmployerInterviewDto }) {
  if (!interview.assessmentDeadline) return null;
  const isOverdue = interview.status === 'Pending' && isPast(interview.assessmentDeadline);
  return (
    <p className={cn('mt-1.5 text-[11px] leading-snug', isOverdue ? 'font-medium text-rose-600' : 'text-slate-400')}>
      {isOverdue ? 'Deadline passed' : 'Due'} {formatShortDate(interview.assessmentDeadline)} ·{' '}
      {formatRelativeDay(interview.assessmentDeadline)}
    </p>
  );
}

function InterviewSlotNote({ interview }: { interview: EmployerInterviewDto }) {
  const selectedSlot = interview.timeslots.find((slot) => slot.id === interview.selectedTimeslotId);
  const confirmedStart = interview.scheduledAt ?? selectedSlot?.startTime ?? null;

  if (confirmedStart) {
    return (
      <p className="mt-1.5 text-[11px] leading-snug text-slate-500">
        {formatDateTime(confirmedStart)} · {formatRelativeDay(confirmedStart)}
      </p>
    );
  }

  if (interview.timeslots.length === 0) return null;

  return (
    <Tooltip>
      <TooltipTrigger className="mt-1.5 inline-flex cursor-help items-center text-[11px] leading-snug text-slate-500 underline decoration-dotted underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-sm">
        {interview.timeslots.length} {interview.timeslots.length === 1 ? 'slot' : 'slots'} proposed
      </TooltipTrigger>
      <TooltipContent side="bottom" align="start" className="max-w-xs flex-col items-start gap-1 py-2">
        {interview.timeslots.map((slot) => (
          <p key={slot.id}>{formatTimeslotRange(slot.startTime, slot.endTime)}</p>
        ))}
      </TooltipContent>
    </Tooltip>
  );
}

function InterviewTypeChip({ interview }: { interview: EmployerInterviewDto }) {
  const Icon = TYPE_ICONS[interview.type] ?? Laptop;
  return (
    <div>
      <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 whitespace-nowrap">
        <Icon className="size-3.5 text-slate-400" aria-hidden="true" />
        {formatType(interview.type)}
      </span>
      {interview.type === 'OnlineAssessment' ? (
        <AssessmentDeadlineNote interview={interview} />
      ) : (
        <InterviewSlotNote interview={interview} />
      )}
    </div>
  );
}

function InterviewTimeline({ interview }: { interview: EmployerInterviewDto }) {
  const responded = Boolean(interview.respondedAt);
  const isClosedWithoutResponse = !responded && interview.status === 'Cancelled';
  const statusStyle = INTERVIEW_STATUS_STYLES[interview.status.toLowerCase()] ?? DEFAULT_INTERVIEW_STATUS_STYLE;

  return (
    <div className="flex items-stretch gap-3">
      <div className="flex flex-col items-center">
        <span className="size-1.5 rounded-full bg-slate-400 shrink-0" aria-hidden="true" />
        <span className="w-px flex-1 min-h-[14px] bg-slate-200" aria-hidden="true" />
        {responded || isClosedWithoutResponse ? (
          <span
            className={cn('size-1.5 rounded-full shrink-0', responded ? statusStyle.dot : 'bg-slate-300')}
            aria-hidden="true"
          />
        ) : (
          <span
            className="size-1.5 shrink-0 rounded-full border border-amber-400 bg-white motion-safe:animate-pulse"
            aria-hidden="true"
          />
        )}
      </div>
      <div className="flex flex-col justify-between gap-2.5 text-xs min-w-0">
        <span className="text-slate-500">
          Sent {formatShortDate(interview.sentAt)} · {formatRelativeDay(interview.sentAt)}
        </span>
        <div className="min-w-0">
          {responded ? (
            <span className="font-medium text-slate-700">
              {formatDateTime(interview.respondedAt)} · {formatRelativeDay(interview.respondedAt)}
            </span>
          ) : isClosedWithoutResponse ? (
            <span className="text-slate-400">Invitation cancelled</span>
          ) : (
            <span className="text-amber-600">Awaiting response</span>
          )}
          {interview.status === 'Declined' && interview.declineReason ? (
            <p className="text-slate-400 italic mt-0.5 break-words [overflow-wrap:anywhere] max-w-55">
              &quot;{interview.declineReason}&quot;
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function EmployerInterviewTable({ interviews, isFetching }: EmployerInterviewTableProps) {
  return (
    <div
      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
      aria-busy={isFetching}
      aria-live="polite"
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Candidate
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Type
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Timeline
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3 text-right">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {interviews.map((interview) => {
            const statusStyle = INTERVIEW_STATUS_STYLES[interview.status.toLowerCase()] ?? DEFAULT_INTERVIEW_STATUS_STYLE;
            return (
              <TableRow key={interview.id} className="hover:bg-slate-50/60 border-b border-slate-100 last:border-b-0">
                <TableCell className={cn('px-4 py-4 border-l-[3px]', statusStyle.rail)}>
                  <div className="flex items-center gap-3 min-w-0 max-w-55 sm:max-w-xs">
                    <Avatar className="size-9 border border-slate-200 shrink-0">
                      <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-bold">
                        {getInitials(interview.applicantName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p
                        className="font-semibold text-sm text-slate-900 truncate"
                        title={interview.applicantName}
                      >
                        {interview.applicantName}
                      </p>
                      <p className="text-xs text-slate-500 truncate" title={interview.applicantEmail}>
                        {interview.applicantEmail}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 align-top whitespace-normal">
                  <InterviewTypeChip interview={interview} />
                </TableCell>
                <TableCell className="px-4 py-4 align-top whitespace-normal">
                  <InterviewTimeline interview={interview} />
                </TableCell>
                <TableCell className="px-4 py-4 text-right align-top">
                  <InterviewStatusBadge status={interview.status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
