'use client';

import { evaluationBand } from '../constants';

interface ScoreDialProps {
  score: number;
  label: string;
}

export function ScoreDial({ score, label }: ScoreDialProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  const size = 88;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const band = evaluationBand(clamped);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className={band.className}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 400ms cubic-bezier(0.23, 1, 0.32, 1)' }}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold tabular-nums text-ink">{clamped}</span>
        <span className="text-[10px] uppercase tracking-wide text-ink-subtle">/ 100</span>
      </span>
      <span className="sr-only">{`Overall score ${clamped} out of 100, ${label}`}</span>
    </div>
  );
}
