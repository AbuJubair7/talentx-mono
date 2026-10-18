'use client';

import React from 'react';

type ScoreBand = 'strong' | 'good' | 'moderate' | 'low';

const BAND_CONFIG: Record<ScoreBand, { stroke: string; text: string; bg: string }> = {
  strong: { stroke: '#0F6E56', text: 'text-[#0F6E56]', bg: 'bg-[#0F6E56]' },
  good: { stroke: '#475569', text: 'text-slate-600', bg: 'bg-slate-500' },
  moderate: { stroke: '#92700C', text: 'text-amber-700', bg: 'bg-amber-600' },
  low: { stroke: '#94a3b8', text: 'text-slate-400', bg: 'bg-slate-300' },
};

function getBand(score: number): ScoreBand {
  if (score >= 85) return 'strong';
  if (score >= 70) return 'good';
  if (score >= 50) return 'moderate';
  return 'low';
}

interface ScoreDialProps {
  score: number;
  size?: 'sm' | 'lg';
  label?: string;
}

export function ScoreDial({ score, size = 'sm', label }: ScoreDialProps) {
  const rounded = Math.round(score);
  const band = getBand(rounded);
  const config = BAND_CONFIG[band];

  const px = size === 'lg' ? 88 : 52;
  const stroke = size === 'lg' ? 6 : 4;
  const radius = (px - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, rounded)) / 100);

  return (
    <div
      className="relative shrink-0"
      style={{ width: px, height: px }}
      role="img"
      aria-label={`Match score ${rounded} out of 100`}
    >
      <svg width={px} height={px} className="-rotate-90">
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={px / 2}
          cy={px / 2}
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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={size === 'lg' ? 'text-2xl font-bold' : 'text-base font-semibold'}
          style={{ color: config.stroke }}
        >
          {rounded}
        </span>
        {size === 'lg' && (
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
            {label ?? 'match'}
          </span>
        )}
      </div>
    </div>
  );
}
