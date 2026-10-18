'use client';

export interface CandidatePipelineTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      stageLabel: string;
      stageCount: number;
      stagePercentage: number;
    };
  }>;
}

export function CandidatePipelineTooltip({
  active,
  payload,
}: CandidatePipelineTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const stageData = payload[0].payload;

  return (
    <div className="rounded-md border border-slate-200/90 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-slate-900">{stageData.stageLabel}</p>
      <p className="text-xs text-slate-500 tabular-nums">
        {stageData.stageCount} {stageData.stageCount === 1 ? 'candidate' : 'candidates'} &middot; {stageData.stagePercentage}%
      </p>
    </div>
  );
}
