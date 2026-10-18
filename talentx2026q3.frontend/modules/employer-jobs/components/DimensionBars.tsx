'use client';

import React from 'react';
import type { CandidateMatch } from '../types/employer-job.types';

type DimensionStatus = 'available' | 'unavailable';

interface Dimension {
  key: string;
  label: string;
  status: DimensionStatus;
  detail: string;
  score: number;
}

export function deriveDimensions(candidate: CandidateMatch): Dimension[] {
  const overallScore = candidate.score / 100;

  const hasSkills = candidate.technicalSkills && candidate.technicalSkills.length > 0;
  const hasExperience = candidate.totalYearsExperience != null;
  const hasLocation = Boolean(candidate.location);

  return [
    {
      key: 'skills',
      label: 'Skills & technologies',
      status: hasSkills ? 'available' : 'unavailable',
      detail: hasSkills
        ? `${candidate.technicalSkills.length} skill${candidate.technicalSkills.length !== 1 ? 's' : ''} listed`
        : 'Not stated on profile',
      score: hasSkills ? Math.min(1, 0.5 + overallScore * 0.5) : 0,
    },
    {
      key: 'experience',
      label: 'Years of experience',
      status: hasExperience ? 'available' : 'unavailable',
      detail: hasExperience
        ? `${candidate.totalYearsExperience} years`
        : 'Not stated on profile',
      score: hasExperience
        ? Math.min(1, (candidate.totalYearsExperience! / 15) * overallScore)
        : 0,
    },
    {
      key: 'location',
      label: 'Location fit',
      status: hasLocation ? 'available' : 'unavailable',
      detail: candidate.location ?? 'Not stated',
      score: hasLocation ? 0.8 : 0,
    },
    {
      key: 'role',
      label: 'Job title / role',
      status: 'unavailable',
      detail: 'Requires role analysis',
      score: 0,
    },
    {
      key: 'industry',
      label: 'Industry background',
      status: 'unavailable',
      detail: 'Requires industry data',
      score: 0,
    },
    {
      key: 'education',
      label: 'Education level',
      status: 'unavailable',
      detail: 'Not in candidate response',
      score: 0,
    },
    {
      key: 'salary',
      label: 'Salary alignment',
      status: 'unavailable',
      detail: 'Not in candidate response',
      score: 0,
    },
  ];
}

const STATUS_STYLE: Record<DimensionStatus, { bar: string; text: string }> = {
  available: { bar: 'bg-[#0F6E56]', text: 'text-[#0F6E56]' },
  unavailable: { bar: 'bg-slate-200', text: 'text-slate-400' },
};

interface DimensionBarsProps {
  candidate: CandidateMatch;
  dense?: boolean;
}

export function DimensionBars({ candidate, dense = false }: DimensionBarsProps) {
  const dimensions = deriveDimensions(candidate);

  return (
    <dl className="divide-y divide-slate-100">
      {dimensions.map((dimension) => {
        const style = STATUS_STYLE[dimension.status];
        const unavailable = dimension.status === 'unavailable';

        return (
          <div
            key={dimension.key}
            className={`grid grid-cols-[minmax(0,1fr)_80px_48px] items-center gap-3 ${
              dense ? 'py-1.5' : 'py-2'
            }`}
          >
            <div className="min-w-0">
              <dt className="truncate text-[12px] font-medium text-slate-700">
                {dimension.label}
              </dt>
              <dd
                className={`truncate text-[11px] ${
                  unavailable ? 'text-slate-400 italic' : 'text-slate-500'
                }`}
              >
                {dimension.detail}
              </dd>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${style.bar}`}
                style={{
                  width: `${unavailable ? 100 : Math.max(3, dimension.score * 100)}%`,
                  opacity: unavailable ? 0.4 : 1,
                  transition: 'width 300ms cubic-bezier(0.23, 1, 0.32, 1)',
                }}
              />
            </div>
            <div className="text-right">
              <span className={`font-mono text-[11px] font-medium ${style.text}`}>
                {unavailable ? 'n/a' : `${Math.round(dimension.score * 100)}%`}
              </span>
            </div>
          </div>
        );
      })}
    </dl>
  );
}
