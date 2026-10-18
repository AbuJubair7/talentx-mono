import { cn } from '@/lib/utils';
import { APPLICANT_FALLBACKS } from '../constants';
import { AI_SCORE_BAND_STYLES, getAiScoreBand } from '../utils/score';

interface AiScoreBadgeProps {
  score: number | null;
  className?: string;
}

export function AiScoreBadge({ score, className }: AiScoreBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-400 italic">
        {APPLICANT_FALLBACKS.PENDING_AI_SCORE}
      </span>
    );
  }

  const roundedScore = Math.round(score);
  const band = getAiScoreBand(roundedScore);
  const config = AI_SCORE_BAND_STYLES[band];

  const size = 40;
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, roundedScore)) / 100);

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`AI match score ${roundedScore} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
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
          style={{ transition: 'stroke-dashoffset 260ms cubic-bezier(0.23, 1, 0.32, 1)' }}
        />
      </svg>
      <span
        className={cn('absolute inset-0 flex items-center justify-center text-[11px] font-bold', config.text)}
      >
        {roundedScore}%
      </span>
    </div>
  );
}

