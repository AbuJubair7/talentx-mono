"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatNumber, formatPercent, share } from "../utils/format";

// One slice of the donut: what it is called, how many it holds and its colour.
export interface DonutSegment {
  key: string;
  label: string;
  value: number;
  color: string;
}

// What the donut needs: the slices, the word shown under the total in the middle, and a description for screen readers.
interface StatusDonutProps {
  segments: DonutSegment[];
  centerLabel: string;
  ariaLabel: string;
}

// The colour of the ring drawn when there is nothing to show, so an empty panel still looks like a chart.
const EMPTY_RING_COLOR = "#E4E7EC";

// A slice as the tooltip receives it: the segment plus its share of the total.
type TooltipSegment = DonutSegment & { percent: number };

// The hover card for one slice: its name, count and share of the total.
function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: TooltipSegment }>;
}) {
  if (!active || !payload?.length) return null;

  const segment = payload[0].payload;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm font-semibold text-zinc-900 dark:text-slate-100">{segment.label}</p>
      <p className="text-xs text-zinc-500 dark:text-slate-400">
        {formatNumber(segment.value)} &middot; {formatPercent(segment.percent, 0)}
      </p>
    </div>
  );
}

// A ring chart of part-to-whole data (verification status, job status) with the total in the middle and a legend
// listing every status with its count and share. The legend always shows every status, even those with zero, so the
// admin can see what is absent; hovering a legend row or a slice highlights the other one. With no data at all it draws
// a plain grey ring instead of nothing.
export function StatusDonut({ segments, centerLabel, ariaLabel }: StatusDonutProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const visibleSegments = segments
    .filter((segment) => segment.value > 0)
    .map((segment) => ({ ...segment, percent: share(segment.value, total) }));
  const chartData =
    total > 0
      ? visibleSegments
      : [{ key: "empty", label: "No data", value: 1, color: EMPTY_RING_COLOR, percent: 0 }];

  return (
    <div className="flex flex-col items-center gap-2 sm:flex-row">
      <div
        role="img"
        aria-label={ariaLabel}
        className="relative aspect-square w-44 min-w-[88px]"
        onMouseLeave={() => setActiveIndex(null)}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius="64%"
              outerRadius="88%"
              paddingAngle={total > 0 ? 3 : 0}
              stroke="none"
              isAnimationActive={false}
              onMouseEnter={(_, index) => setActiveIndex(index)}
            >
              {chartData.map((segment, index) => (
                <Cell
                  key={segment.key}
                  fill={segment.color}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                />
              ))}
            </Pie>
            {total > 0 && <Tooltip content={<DonutTooltip />} wrapperStyle={{ zIndex: 50 }} />}
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[28px] font-extrabold leading-none tabular-nums text-zinc-900 dark:text-slate-100">
            {formatNumber(total)}
          </span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-slate-500">
            {centerLabel}
          </span>
        </div>
      </div>

      <ul className="flex w-full flex-1 flex-col gap-1">
        {segments.map((segment) => {
          const visibleIndex = visibleSegments.findIndex((visible) => visible.key === segment.key);
          return (
            <li
              key={segment.key}
              className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 rounded-md px-2 py-1.5 transition-colors hover:bg-zinc-50 dark:hover:bg-slate-800/60"
              onMouseEnter={() => setActiveIndex(visibleIndex >= 0 ? visibleIndex : null)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-zinc-600 dark:text-slate-300">
                <span
                  className="inline-block size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: segment.color }}
                  aria-hidden="true"
                />
                <span className="truncate">{segment.label}</span>
              </span>
              {/* Wraps onto its own line under a long label instead of colliding with it. */}
              <span className="ml-auto flex shrink-0 items-center gap-1.5">
                <span className="text-sm font-bold tabular-nums text-zinc-900 dark:text-slate-100">
                  {formatNumber(segment.value)}
                </span>
                <span className="min-w-[36px] rounded bg-zinc-100 px-1.5 py-0.5 text-center text-[11px] font-semibold tabular-nums text-zinc-500 dark:bg-slate-800 dark:text-slate-400">
                  {formatPercent(share(segment.value, total), 0)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
