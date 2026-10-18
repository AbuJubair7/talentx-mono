'use client';

import { CalendarClock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateTime, timeUntil } from '@/lib/date';
import type { InterviewPreparationDto } from '../types';

interface PrepHeaderProps {
  prep: InterviewPreparationDto;
  onRegenerate: () => void;
  regenerateDisabled: boolean;
  regenerating?: boolean;
}

export function PrepHeader({ prep, onRegenerate, regenerateDisabled, regenerating = false }: PrepHeaderProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-muted">
          Interview preparation · {prep.companyName}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {prep.jobTitle}
        </h1>
        <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
          <li className="rounded-md bg-surface px-2 py-0.5 font-medium text-ink ring-1 ring-line">
            {prep.interviewType}
          </li>
          {prep.scheduledAt && (
            <li className="flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4 text-ink-subtle" aria-hidden />
              {formatDateTime(prep.scheduledAt)}
            </li>
          )}
        </ul>
      </div>

      <div className="flex items-center gap-3">
        {prep.scheduledAt && (
          <div className="rounded-lg border border-line bg-surface px-4 py-2 text-right">
            <p className="text-xs text-ink-subtle">Interview starts in</p>
            <p className="text-base font-semibold tabular-nums text-ink">
              {timeUntil(prep.scheduledAt)}
            </p>
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onRegenerate}
          disabled={regenerateDisabled}
          className="gap-2 border-brand bg-brand text-white hover:border-brand-hover hover:bg-brand-hover focus-visible:ring-brand disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin motion-reduce:animate-none' : ''}`} aria-hidden />
          {regenerating ? 'Regenerating…' : 'Regenerate'}
        </Button>
      </div>
    </div>
  );
}
