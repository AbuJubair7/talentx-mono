'use client';

import { cn } from '@/lib/utils';
import { AI_SCORE_BAND_STYLES, getAiScoreBand } from '../../utils/score';
import { isFiniteNumber } from '../../utils/profileData';
import { APPLICANT_FALLBACKS } from '../../constants';

interface MatchScoreRingProps {
  score: number | null;
  size?: number;
  stroke?: number;
  className?: string;
}

export function MatchScoreRing({ score, size = 104, stroke = 8, className }: MatchScoreRingProps) {
  const hasScore = isFiniteNumber(score);
  const clamped = hasScore ? Math.min(100, Math.max(0, Math.round(score))) : 0;
  const band = getAiScoreBand(clamped);
  const config = AI_SCORE_BAND_STYLES[band];

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className={cn('group/score relative flex shrink-0 flex-col items-center', className)}>
      <div
        tabIndex={0}
        role="img"
        aria-label={hasScore ? `AI match score ${clamped} out of 100` : 'AI match score not available'}
        className="relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
          {hasScore && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={config.stroke}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 400ms cubic-bezier(0.23, 1, 0.32, 1)' }}
            />
          )}
        </svg>
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center font-bold tracking-tight',
            hasScore ? cn('text-ink', config.text) : 'text-ink-subtle'
          )}
        >
          {hasScore ? (
            <>
              <span style={{ fontSize: size * 0.25 }}>{clamped}</span>
              <span className="ml-0.5 text-sm font-semibold text-ink-muted">%</span>
            </>
          ) : (
            <span className="text-xs font-medium">{APPLICANT_FALLBACKS.SCORE_NOT_AVAILABLE}</span>
          )}
        </span>
      </div>
      <span className="mt-2 text-[13px] font-medium text-ink-muted">AI Match Score</span>

      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-20 mt-1 w-64 rounded-lg bg-ink px-3 py-2.5 text-left text-[12px] leading-relaxed text-white opacity-0 shadow-overlay transition-opacity duration-150 group-hover/score:opacity-100 group-focus-within/score:opacity-100 md:left-1/2 md:right-auto md:-translate-x-1/2"
      >
        {hasScore ? (
          <>
            <span className="block font-semibold">AI match score {clamped} out of 100</span>
            <span className="text-slate-300">
              Based on how closely skills, experience, and seniority align with the role requirements.
            </span>
          </>
        ) : (
          <span className="block font-semibold">
            AI match score not available yet. Run &ldquo;Score with AI&rdquo; from the applicant list.
          </span>
        )}
      </span>
    </div>
  );
}
