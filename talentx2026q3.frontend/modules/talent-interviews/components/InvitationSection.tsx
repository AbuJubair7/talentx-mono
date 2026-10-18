'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import type { TalentInterviewDto } from '../types/interview.types';
import { TalentInterviewCard } from './TalentInterviewCard';

interface InvitationSectionProps {
  title: string;
  description?: string;
  items: TalentInterviewDto[];
  now: Date;
  highlight?: boolean;
}

export function InvitationSection({ title, description, items, now, highlight }: InvitationSectionProps) {
  if (items.length === 0) return null;
  const id = `section-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <section aria-labelledby={id} className="space-y-3">
      <div className="flex items-baseline gap-2">
        {highlight && <span className="h-2 w-2 translate-y-[-1px] rounded-full bg-amber-500" aria-hidden="true" />}
        <h2 id={id} className="text-sm font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">{items.length}</span>
        {description && <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">— {description}</span>}
      </div>
      <div className="space-y-3">
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((inv) => (
            <TalentInterviewCard key={inv.id} interview={inv} now={now} />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
