import React from 'react';

export type DateTileTone = 'pending' | 'upcoming' | 'muted';

const tones: Record<DateTileTone, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
  upcoming: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300',
  muted: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300',
};

interface DateTileProps {
  iso: string;
  tone: DateTileTone;
}

export function DateTile({ iso, tone }: DateTileProps) {
  let d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    d = new Date();
  }

  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  const weekday = d.toLocaleString('en-US', { weekday: 'short' });

  return (
    <div
      className={`flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-lg border sm:h-[4.5rem] sm:w-16 ${tones[tone]}`}
      aria-hidden="true"
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{month}</span>
      <span className="text-2xl font-semibold leading-none">{day}</span>
      <span className="mt-0.5 text-[10px] font-medium uppercase opacity-70">{weekday}</span>
    </div>
  );
}
