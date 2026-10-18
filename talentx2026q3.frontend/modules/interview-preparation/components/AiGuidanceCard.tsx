'use client';

import { Sparkles } from 'lucide-react';
import { formatDateTime } from '@/lib/date';
import type { InterviewPreparationDto } from '../types';

interface AiGuidanceCardProps {
  prep: InterviewPreparationDto;
}

export function AiGuidanceCard({ prep }: AiGuidanceCardProps) {
  const when = prep.scheduledAt ? ` on ${formatDateTime(prep.scheduledAt)}` : '';
  const summary = `This ${prep.interviewType.toLowerCase()} interview for ${prep.jobTitle} at ${prep.companyName}${when} will likely focus on the core requirements of the role. Review the questions and topics below — they're generated from the job posting, your interview details, and your profile.`;

  return (
    <section
      aria-labelledby="ai-summary-heading"
      className="rounded-md border border-ai-line bg-ai-soft p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="ai-summary-heading" className="flex items-center gap-2 text-sm font-semibold text-ai">
          <Sparkles className="h-4 w-4" aria-hidden />
          AI preparation guidance
        </h2>
        <span className="text-xs text-ink-subtle">
          {prep.generationCount > 1 ? `Regenerated · version ${prep.generationCount}` : 'Generated for you'}
        </span>
      </div>
      <p className="mt-3 text-[15px] leading-7 text-ink">{summary}</p>
      {prep.disclaimer && (
        <p className="mt-3 border-t border-ai-line pt-3 text-xs leading-5 text-ink-muted">
          {prep.disclaimer}
        </p>
      )}
    </section>
  );
}
