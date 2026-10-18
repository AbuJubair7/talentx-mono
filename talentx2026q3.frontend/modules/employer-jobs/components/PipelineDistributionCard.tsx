'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { cn } from '@/lib/utils';
import {
  ALWAYS_VISIBLE_SEGMENT_COUNT,
  EMPTY_CHART_STROKE_COLOR,
  PIPELINE_DISTRIBUTION_COLORS,
} from '../constants';
import type { PipelineSegmentData } from '../types/employer-job.types';
import { PipelineDistributionTooltip } from './PipelineDistributionTooltip';

export interface PipelineDistributionCardProps {
  totalPostedJobs: number;
  activeJobsCount: number;
  draftJobsCount: number;
  closedJobsCount: number;
  expiredJobsCount: number;
  deactivatedJobsCount?: number;
  pendingReviewJobsCount?: number;
  className?: string;
}

export function PipelineDistributionCard({
  totalPostedJobs,
  activeJobsCount,
  draftJobsCount,
  closedJobsCount,
  expiredJobsCount,
  deactivatedJobsCount = 0,
  pendingReviewJobsCount = 0,
  className,
}: PipelineDistributionCardProps) {
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);

  const calculatePercentage = (segmentCount: number): number => {
    if (totalPostedJobs <= 0) {
      return 0;
    }
    return Math.round((segmentCount / totalPostedJobs) * 100);
  };

  const allSegments: PipelineSegmentData[] = [
    {
      segmentKey: 'active',
      segmentLabel: 'Live roles',
      segmentCount: activeJobsCount,
      segmentPercentage: calculatePercentage(activeJobsCount),
      strokeColor: PIPELINE_DISTRIBUTION_COLORS.active,
    },
    {
      segmentKey: 'draft',
      segmentLabel: 'In preparation',
      segmentCount: draftJobsCount,
      segmentPercentage: calculatePercentage(draftJobsCount),
      strokeColor: PIPELINE_DISTRIBUTION_COLORS.draft,
    },
    {
      segmentKey: 'closed',
      segmentLabel: 'Archived',
      segmentCount: closedJobsCount,
      segmentPercentage: calculatePercentage(closedJobsCount),
      strokeColor: PIPELINE_DISTRIBUTION_COLORS.closed,
    },
    {
      segmentKey: 'expired',
      segmentLabel: 'Past deadline',
      segmentCount: expiredJobsCount,
      segmentPercentage: calculatePercentage(expiredJobsCount),
      strokeColor: PIPELINE_DISTRIBUTION_COLORS.expired,
    },
    {
      segmentKey: 'deactivated',
      segmentLabel: 'Deactivated by admin',
      segmentCount: deactivatedJobsCount,
      segmentPercentage: calculatePercentage(deactivatedJobsCount),
      strokeColor: PIPELINE_DISTRIBUTION_COLORS.deactivated,
    },
    {
      segmentKey: 'pendingReview',
      segmentLabel: 'Under review',
      segmentCount: pendingReviewJobsCount,
      segmentPercentage: calculatePercentage(pendingReviewJobsCount),
      strokeColor: PIPELINE_DISTRIBUTION_COLORS.pendingReview,
    },
  ];

  const legendSegments = allSegments.filter(
    (segment, index) => index < ALWAYS_VISIBLE_SEGMENT_COUNT || segment.segmentCount > 0
  );

  const chartSlices = allSegments.filter((segment) => segment.segmentCount > 0);
  const emptyChartData = [
    {
      segmentKey: 'empty',
      segmentLabel: 'Empty',
      segmentCount: 1,
      segmentPercentage: 0,
      strokeColor: EMPTY_CHART_STROKE_COLOR,
    },
  ];

  const expiredPluralSuffix = expiredJobsCount === 1 ? 'listing is' : 'listings are';
  const deactivatedPluralSuffix = deactivatedJobsCount === 1 ? 'listing was' : 'listings were';

  return (
    <section
      role="region"
      aria-label="Job Status Overview"
      aria-labelledby="job-status-overview-heading"
      className={cn(
        'rounded-md border border-slate-200/90 bg-white p-6 shadow-xs',
        className
      )}
    >
      <div className="space-y-1">
        <h3
          id="job-status-overview-heading"
          className="text-base font-bold tracking-tight text-slate-900"
        >
          Job Status Overview
        </h3>
        <p className="text-xs text-slate-500">
          Breakdown of jobs by current status
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div
          className="relative flex size-40 shrink-0 items-center justify-center sm:size-44 cursor-default"
          role="img"
          aria-label={`Job status overview chart showing ${totalPostedJobs} total jobs`}
          onMouseLeave={() => setActiveSegmentIndex(null)}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: 176, height: 176 }}
          >
            {totalPostedJobs === 0 ? (
              <PieChart>
                <Pie
                  data={emptyChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={78}
                  dataKey="segmentCount"
                  stroke="none"
                  isAnimationActive={false}
                >
                  <Cell fill={EMPTY_CHART_STROKE_COLOR} />
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
                  dataKey="segmentCount"
                  stroke="none"
                  paddingAngle={chartSlices.length > 1 ? 3 : 0}
                  isAnimationActive={process.env.NODE_ENV !== 'test'}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                  onMouseEnter={(_, index) => setActiveSegmentIndex(index)}
                >
                  {chartSlices.map((slice, index) => (
                    <Cell
                      key={slice.segmentKey}
                      fill={slice.strokeColor}
                      opacity={activeSegmentIndex === null || activeSegmentIndex === index ? 1 : 0.35}
                      style={{ transition: 'opacity 200ms ease' }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PipelineDistributionTooltip />} wrapperStyle={{ zIndex: 50 }} />
              </PieChart>
            )}
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              {totalPostedJobs}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Jobs
            </span>
          </div>
        </div>

        <ul
          className="w-full divide-y divide-slate-100 sm:divide-y-0 sm:space-y-3"
          aria-label="Pipeline segment breakdown"
        >
          {legendSegments.map((segment) => (
            <li
              key={segment.segmentKey}
              className="flex items-center justify-between py-2 sm:py-0 text-xs sm:text-sm cursor-default rounded-md px-1.5 transition-colors hover:bg-slate-50/80"
              onMouseEnter={() => {
                const sliceIndex = chartSlices.findIndex(
                  (slice) => slice.segmentKey === segment.segmentKey
                );
                if (sliceIndex >= 0) {
                  setActiveSegmentIndex(sliceIndex);
                }
              }}
              onMouseLeave={() => setActiveSegmentIndex(null)}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: segment.strokeColor }}
                  aria-hidden="true"
                />
                <span className="font-medium text-slate-700">{segment.segmentLabel}</span>
              </div>
              <div className="flex items-center gap-1.5 tabular-nums">
                <span className="font-bold text-slate-900">{segment.segmentCount}</span>
                <span className="text-slate-400">({segment.segmentPercentage}%)</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {expiredJobsCount > 0 && (
        <div className="mt-6 flex items-center justify-between gap-3 rounded-md border border-rose-200 bg-rose-50/80 px-3.5 py-2.5 text-xs sm:text-sm">
          <div className="flex min-w-0 items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-rose-600" aria-hidden="true" />
            <span className="truncate font-medium text-rose-900">
              {expiredJobsCount} {expiredPluralSuffix} past deadline
            </span>
          </div>
          <Link
            href="/job/job-listing?status=Expired"
            className="inline-flex shrink-0 items-center gap-1 font-semibold text-rose-700 transition-colors hover:text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 rounded-sm"
          >
            <span>Review</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {deactivatedJobsCount > 0 && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-rose-300 bg-rose-50 px-3.5 py-2.5 text-xs sm:text-sm">
          <div className="flex min-w-0 items-center gap-2">
            <ShieldAlert className="size-4 shrink-0 text-rose-700" aria-hidden="true" />
            <span className="truncate font-medium text-rose-900">
              {deactivatedJobsCount} {deactivatedPluralSuffix} deactivated by an admin
            </span>
          </div>
          <Link
            href="/job/job-listing?status=Deactivated"
            className="inline-flex shrink-0 items-center gap-1 font-semibold text-rose-700 transition-colors hover:text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 rounded-sm"
          >
            <span>Fix</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
}
