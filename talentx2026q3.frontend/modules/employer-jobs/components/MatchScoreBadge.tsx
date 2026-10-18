import React from 'react';

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function MatchScoreBadge({ score, size = 'md' }: MatchScoreBadgeProps) {
  const rounded = Math.round(score);

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (rounded >= 85) {
    colorClasses = 'bg-[#0F6E56]/10 text-[#0F6E56] border-[#0F6E56]/20';
    dotColor = 'bg-[#0F6E56]';
  } else if (rounded >= 70) {
    colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
    dotColor = 'bg-slate-500';
  } else if (rounded >= 50) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-600';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs sm:text-sm px-2.5 py-1',
    lg: 'text-sm sm:text-base px-3.5 py-1.5 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-2xs ${colorClasses} ${sizeClasses}`}
      aria-label={`${rounded}% match`}
    >
      <span className={`size-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{rounded}% Match</span>
    </span>
  );
}
