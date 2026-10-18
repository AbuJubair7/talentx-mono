'use client';

import Link from 'next/link';
import { FileText, Lock, ShieldCheck } from 'lucide-react';
import { formatDateTime, formatShortDate } from '@/lib/date';
import { useTalentProfile } from '@/modules/talent-profile/hooks/useTalentProfile';
import type { InterviewPreparationDto } from '../types';

interface ContextSidebarProps {
  prep: InterviewPreparationDto;
  accessWindowMinutes?: number;
}

function accessEnd(scheduledAt: string, windowMinutes: number): string {
  const start = new Date(scheduledAt).getTime();
  return formatDateTime(new Date(start + windowMinutes * 60_000));
}

export function ContextSidebar({ prep, accessWindowMinutes }: ContextSidebarProps) {
  const { data: profile } = useTalentProfile();

  const profileLine = profile
    ? [
        profile.tagline,
        profile.totalYearsExperience != null
          ? `${profile.totalYearsExperience} years`
          : null,
        profile.workExperiences[0]?.companyName,
      ]
        .filter(Boolean)
        .join(' · ')
    : null;

  return (
    <div className="space-y-4 lg:sticky lg:top-6">
      <section
        aria-labelledby="sources-heading"
        className="rounded-md border border-line bg-surface shadow-card"
      >
        <h2
          id="sources-heading"
          className="border-b border-line px-5 py-4 text-sm font-semibold text-ink"
        >
          What this guidance is based on
        </h2>

        <div className="space-y-3 border-b border-line px-5 py-4">
          <p className="text-xs font-medium text-ink-subtle">Interview</p>
          <dl className="grid grid-cols-[88px_1fr] gap-y-1.5 text-sm">
            <dt className="text-ink-subtle">Type</dt>
            <dd className="text-ink">{prep.interviewType}</dd>
            {prep.scheduledAt && (
              <>
                <dt className="text-ink-subtle">When</dt>
                <dd className="text-ink">{formatDateTime(prep.scheduledAt)}</dd>
              </>
            )}
          </dl>
        </div>

        <div className="space-y-3 border-b border-line px-5 py-4">
          <p className="text-xs font-medium text-ink-subtle">Job posting</p>
          <dl className="grid grid-cols-[88px_1fr] gap-y-1.5 text-sm">
            <dt className="text-ink-subtle">Title</dt>
            <dd className="text-ink">{prep.jobTitle}</dd>
            <dt className="text-ink-subtle">Company</dt>
            <dd className="text-ink">{prep.companyName}</dd>
          </dl>
        </div>

        {profile && (
          <div className="space-y-3 px-5 py-4">
            <p className="text-xs font-medium text-ink-subtle">Your profile</p>
            {profile.resumeOriginalFileName && (
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas">
                  <FileText className="h-4 w-4 text-ink-muted" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {profile.resumeOriginalFileName}
                  </p>
                  {profile.updatedAt && (
                    <p className="text-xs text-ink-subtle">
                      Updated {formatShortDate(profile.updatedAt)}
                    </p>
                  )}
                </div>
              </div>
            )}
            {profileLine && <p className="text-sm text-ink-muted">{profileLine}</p>}
            <Link
              href="/profile"
              className="inline-block rounded text-sm font-medium text-brand hover:text-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Update profile
            </Link>
          </div>
        )}
      </section>

      <section
        aria-labelledby="privacy-heading"
        className="rounded-md border border-line bg-surface p-5 shadow-card"
      >
        <h2
          id="privacy-heading"
          className="flex items-center gap-2 text-sm font-semibold text-ink"
        >
          <ShieldCheck className="h-4 w-4 text-success" aria-hidden />
          Private to you
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-ink-muted">
          {prep.companyName} and other employers can&apos;t see this preparation, your practice
          progress, or the questions you generate.
        </p>
        {prep.scheduledAt && (
          <p className="mt-3 flex items-start gap-2 border-t border-line pt-3 text-xs text-ink-subtle">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {accessWindowMinutes != null ? (
              <span>
                Access ends {accessEnd(prep.scheduledAt, accessWindowMinutes)} (
                {accessWindowMinutes} minutes after your interview starts).
              </span>
            ) : (
              <span>
                Access ends shortly after your interview starts on{' '}
                {formatDateTime(prep.scheduledAt)}.
              </span>
            )}
          </p>
        )}
      </section>
    </div>
  );
}
