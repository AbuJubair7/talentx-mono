'use client';

export interface PipelineDistributionTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      segmentLabel: string;
      segmentCount: number;
      segmentPercentage: number;
    };
  }>;
}

export function PipelineDistributionTooltip({
  active,
  payload,
}: PipelineDistributionTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const segmentData = payload[0].payload;

  return (
    <div className="rounded-md border border-slate-200/90 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-slate-900">{segmentData.segmentLabel}</p>
      <p className="text-xs text-slate-500 tabular-nums">
        {segmentData.segmentCount} {segmentData.segmentCount === 1 ? 'job' : 'jobs'} &middot; {segmentData.segmentPercentage}%
      </p>
    </div>
  );
}
