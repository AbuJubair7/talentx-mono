"use client";

import { ArrowDown, ArrowRight, CalendarDays, CircleCheck, FileText, type LucideIcon } from "lucide-react";
import type { DashboardMetrics } from "../types/admin-dashboard";
import { formatNumber, formatPercent, share } from "../utils/format";

// Props for the funnel: in-range and all-time counts, plus the selected range in words.
interface RecruitmentFunnelProps {
  metrics: DashboardMetrics;
  totals: DashboardMetrics;
  rangeLabel: string;
}

// Props for one funnel stage.
interface FunnelStageProps {
  icon: LucideIcon;
  label: string;
  value: number;
  subtitle: string;
  barPercent: number;
}

// One stage: icon, label, all-time count, subtitle and a bar sized against all applications.
function FunnelStage({ icon: Icon, label, value, subtitle, barPercent }: FunnelStageProps) {
  // Interviews come from invitations and can, rarely, outnumber applications.
  const width = Math.min(barPercent, 100);

  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-slate-800 dark:text-slate-300">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="text-sm font-medium text-zinc-600 dark:text-slate-300">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-slate-100">
        {formatNumber(value)}
      </p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">{subtitle}</p>
      <div
        role="progressbar"
        aria-label={`${label} compared with all applications`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(width)}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800"
      >
        <div className="h-full rounded-full bg-emerald-600 transition-[width] duration-300" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

// The conversion rate between two stages, with an arrow (right on wide screens, down when stacked).
function FunnelStep({ rate, caption }: { rate: number; caption: string }) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-2 py-1 md:flex-col md:gap-1 md:px-2 md:pt-6">
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
        {formatPercent(rate)}
      </span>
      <ArrowRight className="hidden size-4 text-zinc-400 md:block dark:text-slate-500" aria-hidden="true" />
      <ArrowDown className="size-4 text-zinc-400 md:hidden dark:text-slate-500" aria-hidden="true" />
      <span className="text-xs text-zinc-500 dark:text-slate-400">{caption}</span>
    </div>
  );
}

// The applications → interviews → hires card, with all-time counts and conversion rates.
export function RecruitmentFunnel({ metrics, totals, rangeLabel }: RecruitmentFunnelProps) {
  const { totalApplications: applications, totalInterviews: interviews, totalHires: hires } = totals;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white/95 p-5 shadow-xs backdrop-blur-xs md:flex-row md:items-start dark:border-slate-800 dark:bg-slate-900/95">
      <FunnelStage
        icon={FileText}
        label="Applications"
        value={applications}
        subtitle={`+${formatNumber(metrics.totalApplications)} submitted in the ${rangeLabel}`}
        barPercent={applications > 0 ? 100 : 0}
      />
      <FunnelStep rate={share(interviews, applications)} caption="reach interview" />
      <FunnelStage
        icon={CalendarDays}
        label="Interviews"
        value={interviews}
        subtitle="Invitations sent, excluding cancelled"
        barPercent={share(interviews, applications)}
      />
      <FunnelStep rate={share(hires, interviews)} caption="get hired" />
      <FunnelStage
        icon={CircleCheck}
        label="Hires"
        value={hires}
        subtitle={`${formatPercent(share(hires, applications))} of all applications`}
        barPercent={share(hires, applications)}
      />
    </div>
  );
}
