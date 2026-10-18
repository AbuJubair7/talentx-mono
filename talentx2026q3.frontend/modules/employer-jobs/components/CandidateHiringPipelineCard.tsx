'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { cn } from '@/lib/utils';
import {
  CANDIDATE_PIPELINE_COLORS,
  CANDIDATE_STAGE_LABELS,
  EMPTY_PIPELINE_CHART_COLOR,
} from '../constants';
import type { CandidatePipelineStageData } from '../types/employer-job.types';
import { CandidatePipelineTooltip } from './CandidatePipelineTooltip';

export interface CandidateHiringPipelineCardProps {
  appliedCount?: number;
  shortlistedCount?: number;
  invitedCount?: number;
  interviewCount?: number;
  rejectedCount?: number;
  hiredCount?: number;
  className?: string;
}

export function CandidateHiringPipelineCard({
  appliedCount = 0,
  shortlistedCount = 0,
  invitedCount = 0,
  interviewCount = 0,
  rejectedCount = 0,
  hiredCount = 0,
  className,
}: CandidateHiringPipelineCardProps) {
  const [activeStageIndex, setActiveStageIndex] = useState<number | null>(null);

  const normalizedAppliedCount = appliedCount ?? 0;
  const normalizedShortlistedCount = shortlistedCount ?? 0;
  const normalizedInvitedCount = invitedCount ?? 0;
  const normalizedInterviewCount = interviewCount ?? 0;
  const normalizedRejectedCount = rejectedCount ?? 0;
  const normalizedHiredCount = hiredCount ?? 0;

  const totalCandidates =
    normalizedAppliedCount +
    normalizedShortlistedCount +
    normalizedInvitedCount +
    normalizedInterviewCount +
    normalizedRejectedCount +
    normalizedHiredCount;

  const calculatePercentage = (stageCount: number): number => {
    if (totalCandidates <= 0) {
      return 0;
    }
    return Math.round((stageCount / totalCandidates) * 100);
  };

  const pipelineStages: CandidatePipelineStageData[] = [
    {
      stageKey: 'shortlisted',
      stageLabel: CANDIDATE_STAGE_LABELS.shortlisted,
      stageCount: normalizedShortlistedCount,
      stagePercentage: calculatePercentage(normalizedShortlistedCount),
      fillColor: CANDIDATE_PIPELINE_COLORS.shortlisted,
    },
    {
      stageKey: 'invited',
      stageLabel: CANDIDATE_STAGE_LABELS.invited,
      stageCount: normalizedInvitedCount,
      stagePercentage: calculatePercentage(normalizedInvitedCount),
      fillColor: CANDIDATE_PIPELINE_COLORS.invited,
    },
    {
      stageKey: 'interview',
      stageLabel: CANDIDATE_STAGE_LABELS.interview,
      stageCount: normalizedInterviewCount,
      stagePercentage: calculatePercentage(normalizedInterviewCount),
      fillColor: CANDIDATE_PIPELINE_COLORS.interview,
    },
    {
      stageKey: 'hired',
      stageLabel: CANDIDATE_STAGE_LABELS.hired,
      stageCount: normalizedHiredCount,
      stagePercentage: calculatePercentage(normalizedHiredCount),
      fillColor: CANDIDATE_PIPELINE_COLORS.hired,
    },
    {
      stageKey: 'rejected',
      stageLabel: CANDIDATE_STAGE_LABELS.rejected,
      stageCount: normalizedRejectedCount,
      stagePercentage: calculatePercentage(normalizedRejectedCount),
      fillColor: CANDIDATE_PIPELINE_COLORS.rejected,
    },
  ];

  const chartSlices = pipelineStages.filter((stage) => stage.stageCount > 0);
  const emptyChartData = [
    {
      stageKey: 'empty',
      stageLabel: 'Empty',
      stageCount: 1,
      stagePercentage: 0,
      fillColor: EMPTY_PIPELINE_CHART_COLOR,
    },
  ];

  return (
    <section
      role="region"
      aria-labelledby="candidate-hiring-pipeline-heading"
      className={cn(
        'rounded-md border border-slate-200/90 bg-white p-6 shadow-xs',
        className
      )}
    >
      <div className="space-y-1">
        <h3
          id="candidate-hiring-pipeline-heading"
          className="text-base font-bold tracking-tight text-slate-900"
        >
          Candidate Hiring Pipeline
        </h3>
        <p className="text-xs text-slate-500">
          Applicant distribution across hiring stages
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div
          className="relative flex size-40 shrink-0 items-center justify-center sm:size-44 cursor-default"
          role="img"
          aria-label={`Candidate hiring pipeline chart showing ${totalCandidates} total candidates`}
          onMouseLeave={() => setActiveStageIndex(null)}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: 176, height: 176 }}
          >
            {totalCandidates === 0 ? (
              <PieChart>
                <Pie
                  data={emptyChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={78}
                  dataKey="stageCount"
                  stroke="none"
                  isAnimationActive={false}
                >
                  <Cell fill={EMPTY_PIPELINE_CHART_COLOR} />
                </Pie>
              </PieChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartSlices}
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={78}
                  dataKey="stageCount"
                  stroke="none"
                  paddingAngle={chartSlices.length > 1 ? 3 : 0}
                  isAnimationActive={process.env.NODE_ENV !== 'test'}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                  onMouseEnter={(_, index) => setActiveStageIndex(index)}
                >
                  {chartSlices.map((slice, index) => (
                    <Cell
                      key={slice.stageKey}
                      fill={slice.fillColor}
                      opacity={activeStageIndex === null || activeStageIndex === index ? 1 : 0.35}
                      style={{ transition: 'opacity 200ms ease' }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CandidatePipelineTooltip />} wrapperStyle={{ zIndex: 50 }} />
              </PieChart>
            )}
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              {totalCandidates}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Candidates
            </span>
          </div>
        </div>

        <ul
          className="w-full divide-y divide-slate-100 sm:divide-y-0 sm:space-y-3"
          aria-label="Candidate pipeline stage breakdown"
        >
          {pipelineStages.map((stage) => (
            <li
              key={stage.stageKey}
              className="flex items-center justify-between py-2 sm:py-0 text-xs sm:text-sm cursor-default rounded-md px-1.5 transition-colors hover:bg-slate-50/80"
              onMouseEnter={() => {
                const sliceIndex = chartSlices.findIndex(
                  (slice) => slice.stageKey === stage.stageKey
                );
                if (sliceIndex >= 0) {
                  setActiveStageIndex(sliceIndex);
                }
              }}
              onMouseLeave={() => setActiveStageIndex(null)}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: stage.fillColor }}
                  aria-hidden="true"
                />
                <span className="font-medium text-slate-700">{stage.stageLabel}</span>
              </div>
              <div className="flex items-center gap-1.5 tabular-nums">
                <span className="font-bold text-slate-900">{stage.stageCount}</span>
                <span className="text-slate-500">({stage.stagePercentage}%)</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {totalCandidates === 0 && (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 flex items-center gap-2.5 rounded-md border border-slate-200/90 bg-slate-50/80 px-3.5 py-2.5 text-xs text-slate-600 sm:text-sm"
        >
          <Users className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
          <span>
            No applicants yet. As candidates apply or receive invitations, their progress across stages will appear here.
          </span>
        </div>
      )}
    </section>
  );
}
