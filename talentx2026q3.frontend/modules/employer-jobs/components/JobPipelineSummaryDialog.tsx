'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, RotateCcw, Users } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  CANDIDATE_PIPELINE_COLORS,
  CANDIDATE_STAGE_LABELS,
  EMPTY_PIPELINE_CHART_COLOR,
} from '../constants';
import { useJobPipelineSummary } from '../hooks/useJobPipelineSummary';
import type {
  CandidatePipelineStageData,
  EmployerJobListItemDto,
  JobStatus,
} from '../types/employer-job.types';
import { formatDisplayDate } from '../utils/employer-jobs.utils';
import { CandidatePipelineTooltip } from './CandidatePipelineTooltip';
import { JobStatusBadge } from './JobStatusBadge';

export interface JobPipelineSummaryDialogProps {
  job: EmployerJobListItemDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JobPipelineSummaryDialog({
  job,
  isOpen,
  onClose,
}: JobPipelineSummaryDialogProps) {
  const { data, isLoading, isError, refetch } = useJobPipelineSummary(
    isOpen && job ? job.id : null
  );

  const [activeStageIndex, setActiveStageIndex] = useState<number | null>(null);

  const appliedCount = data?.pipelineStats?.appliedCount ?? 0;
  const shortlistedCount = data?.pipelineStats?.shortlistedCount ?? 0;
  const invitedCount = data?.pipelineStats?.invitedCount ?? 0;
  const interviewCount = data?.pipelineStats?.interviewCount ?? 0;
  const rejectedCount = data?.pipelineStats?.rejectedCount ?? 0;
  const hiredCount = data?.pipelineStats?.hiredCount ?? 0;

  const totalCandidates =
    data?.totalApplicants ??
    job?.applicantCount ??
    (appliedCount +
      shortlistedCount +
      invitedCount +
      interviewCount +
      rejectedCount +
      hiredCount);

  const pipelineStages: CandidatePipelineStageData[] = useMemo(() => {
    const calculatePercentage = (stageCount: number): number => {
      if (totalCandidates <= 0) {
        return 0;
      }
      return Math.round((stageCount / totalCandidates) * 100);
    };

    return [
      {
        stageKey: 'shortlisted',
        stageLabel: CANDIDATE_STAGE_LABELS.shortlisted,
        stageCount: shortlistedCount,
        stagePercentage: calculatePercentage(shortlistedCount),
        fillColor: CANDIDATE_PIPELINE_COLORS.shortlisted,
      },
      {
        stageKey: 'invited',
        stageLabel: CANDIDATE_STAGE_LABELS.invited,
        stageCount: invitedCount,
        stagePercentage: calculatePercentage(invitedCount),
        fillColor: CANDIDATE_PIPELINE_COLORS.invited,
      },
      {
        stageKey: 'interview',
        stageLabel: CANDIDATE_STAGE_LABELS.interview,
        stageCount: interviewCount,
        stagePercentage: calculatePercentage(interviewCount),
        fillColor: CANDIDATE_PIPELINE_COLORS.interview,
      },
      {
        stageKey: 'hired',
        stageLabel: CANDIDATE_STAGE_LABELS.hired,
        stageCount: hiredCount,
        stagePercentage: calculatePercentage(hiredCount),
        fillColor: CANDIDATE_PIPELINE_COLORS.hired,
      },
      {
        stageKey: 'rejected',
        stageLabel: CANDIDATE_STAGE_LABELS.rejected,
        stageCount: rejectedCount,
        stagePercentage: calculatePercentage(rejectedCount),
        fillColor: CANDIDATE_PIPELINE_COLORS.rejected,
      },
    ];
  }, [shortlistedCount, invitedCount, interviewCount, hiredCount, rejectedCount, totalCandidates]);

  const chartSlices = useMemo(
    () => pipelineStages.filter((stage) => stage.stageCount > 0),
    [pipelineStages]
  );

  const emptyChartData = useMemo(
    () => [
      {
        stageKey: 'empty',
        stageLabel: 'Empty',
        stageCount: 1,
        stagePercentage: 0,
        fillColor: EMPTY_PIPELINE_CHART_COLOR,
      },
    ],
    []
  );

  if (!job) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent className="sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="space-y-1.5 border-b border-slate-100 pb-4">
          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            {job.companyName}
          </p>
          <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            {job.title}
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600 sm:text-sm">
            <JobStatusBadge status={job.status as JobStatus} />
            <span className="text-slate-300" aria-hidden="true">&middot;</span>
            <span>
              {job.vacancies} {job.vacancies === 1 ? 'Vacancy' : 'Vacancies'}
            </span>
            <span className="text-slate-300" aria-hidden="true">&middot;</span>
            <span>Posted {formatDisplayDate(job.createdAt)}</span>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div
            role="status"
            aria-label="Loading candidate pipeline summary"
            className="space-y-6 py-6"
          >
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              <div className="flex size-40 shrink-0 items-center justify-center rounded-full border-8 border-slate-100 bg-slate-50 animate-pulse sm:size-44">
                <div className="size-20 rounded-full bg-slate-100" />
              </div>
              <div className="w-full space-y-3">
                {Array.from({ length: 5 }).map((_, skeletonIndex) => (
                  <div
                    key={skeletonIndex}
                    className="flex items-center justify-between py-1 animate-pulse"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="size-2.5 rounded-full bg-slate-200" />
                      <div className="h-4 w-24 rounded bg-slate-200" />
                    </div>
                    <div className="h-4 w-12 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : isError ? (
          <div
            role="alert"
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertCircle className="size-6" aria-hidden="true" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-900">
              Failed to load pipeline summary
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              There was an issue fetching the candidate pipeline data for this job. Please try again.
            </p>
            <Button
              type="button"
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Retry
            </Button>
          </div>
        ) : (
          <div className="py-4">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              <div
                className="relative flex size-40 shrink-0 cursor-default items-center justify-center outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 sm:size-44 [&_*]:outline-none [&_*]:focus:outline-none [&_*]:focus:ring-0 [&_*]:focus-visible:outline-none [&_*]:focus-visible:ring-0 [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none [&_svg]:outline-none [&_path]:outline-none"
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
                    <PieChart className="outline-none focus:outline-none" style={{ outline: 'none' }}>
                      <Pie
                        data={emptyChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={56}
                        outerRadius={78}
                        dataKey="stageCount"
                        stroke="none"
                        isAnimationActive={false}
                        tabIndex={-1}
                      >
                        <Cell fill={EMPTY_PIPELINE_CHART_COLOR} />
                      </Pie>
                    </PieChart>
                  ) : (
                    <PieChart className="outline-none focus:outline-none" style={{ outline: 'none' }}>
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
                        tabIndex={-1}
                      >
                        {chartSlices.map((slice, index) => (
                          <Cell
                            key={slice.stageKey}
                            fill={slice.fillColor}
                            opacity={
                              activeStageIndex === null || activeStageIndex === index
                                ? 1
                                : 0.35
                            }
                            style={{ transition: 'opacity 200ms ease', outline: 'none' }}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={<CandidatePipelineTooltip />}
                        wrapperStyle={{ zIndex: 50 }}
                      />
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
                    className="flex cursor-default items-center justify-between rounded-md px-1.5 py-2 text-xs transition-colors hover:bg-slate-50/80 sm:py-0 sm:text-sm"
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
                      <span className="font-medium text-slate-700">
                        {stage.stageLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 tabular-nums">
                      <span className="font-bold text-slate-900">
                        {stage.stageCount}
                      </span>
                      <span className="text-slate-500">
                        ({stage.stagePercentage}%)
                      </span>
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
