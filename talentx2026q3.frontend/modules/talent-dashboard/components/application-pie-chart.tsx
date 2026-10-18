'use client';

import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface PieChartSegment {
  label: string;
  value: number;
  color: string;
}

interface ApplicationPieChartProps {
  total: number;
  segments: PieChartSegment[];
  className?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PieChartSegment & { pct: number } }>;
}) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{data.label}</p>
      <p className="text-xs text-slate-500">
        {data.value} applications &middot; {data.pct}%
      </p>
    </div>
  );
}

export function ApplicationPieChart({
  total,
  segments,
  className,
  isLoading = false,
  isError = false,
  onRetry,
}: ApplicationPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className={className} aria-busy="true" aria-label="Loading applications overview">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
          <div className="h-44 w-44 shrink-0 animate-pulse rounded-full bg-slate-100" />
          <div className="flex w-full flex-1 flex-col gap-3 sm:w-auto">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded-md bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={className}>
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm text-rose-600">
            Couldn&apos;t load your applications overview.
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="cursor-pointer rounded-md border border-slate-200/80 bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  const chartData = segments.map((s) => ({
    ...s,
    pct: total > 0 ? Math.round((s.value / total) * 100) : 0,
  }));

  const visibleData = chartData.filter((s) => s.value > 0);

  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
        {/* Donut Chart */}
        <div
          className="relative h-44 w-44 shrink-0 cursor-default"
          onMouseLeave={() => setActiveIndex(null)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={visibleData}
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={78}
                dataKey="value"
                stroke="none"
                paddingAngle={3}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
                onMouseEnter={(_, index) => setActiveIndex(index)}
              >
                {visibleData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                    style={{ transition: 'opacity 200ms ease' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} wrapperStyle={{ zIndex: 50 }} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[28px] font-extrabold tabular-nums leading-none text-slate-900">
              {total}
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Total
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex w-full flex-1 flex-col gap-3 sm:w-auto">
          {chartData.map((segment) => (
            <div
              key={segment.label}
              className="group flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-slate-50"
              onMouseEnter={() => {
                const idx = visibleData.findIndex((v) => v.label === segment.label);
                if (idx >= 0) setActiveIndex(idx);
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="inline-block size-3 rounded-full ring-2 ring-white shadow-sm"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-sm font-medium text-slate-600 transition-colors group-hover:text-slate-900">
                  {segment.label}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold tabular-nums text-slate-900">
                  {segment.value}
                </span>
                <span className="min-w-[36px] rounded bg-slate-100 px-1.5 py-0.5 text-center text-[11px] font-semibold tabular-nums text-slate-500">
                  {segment.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
