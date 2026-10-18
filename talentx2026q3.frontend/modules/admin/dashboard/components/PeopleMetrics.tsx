"use client";

import { ArrowRight, Building2, Clock, ShieldCheck, User, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { DashboardMetrics } from "../types/admin-dashboard";
import { formatNumber, formatPercent, share } from "../utils/format";

// Props for the talent and employer cards: in-range and all-time counts, and the range in words.
interface PeopleMetricsProps {
  metrics: DashboardMetrics;
  totals: DashboardMetrics;
  rangeLabel: string;
}

// Props for one people card.
interface PeopleCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  children: ReactNode;
}

// Shared card shape: icon, label, all-time count and a footer line.
function PeopleCard({ icon: Icon, label, value, children }: PeopleCardProps) {
  return (
    <div className="min-w-0 rounded-2xl border border-zinc-200/80 bg-white/95 p-5 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95">
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-slate-800 dark:text-slate-300">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="text-sm font-medium text-zinc-600 dark:text-slate-300">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-slate-100">
        {formatNumber(value)}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

// Props for the "+N … in the {range}" line.
interface NewInRangeProps {
  count: number;
  rangeLabel: string;
  verb?: string;
}

// The "+N new in the last 30 days" line under a card.
export function NewInRange({ count, rangeLabel, verb = "new" }: NewInRangeProps) {
  return (
    <p className="flex items-center gap-2 text-xs text-zinc-500 dark:text-slate-400">
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold tabular-nums text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
        +{formatNumber(count)}
      </span>
      {verb} in the {rangeLabel}
    </p>
  );
}

// The pending-verification card: amber with a Review queue link while employers are waiting.
function PendingVerificationCard({ count }: { count: number }) {
  if (count === 0) {
    return (
      <PeopleCard icon={Clock} label="Pending verification" value={0}>
        <p className="text-xs text-zinc-500 dark:text-slate-400">Nobody is waiting</p>
      </PeopleCard>
    );
  }

  return (
    <div
      data-testid="pending-verification-card"
      className="min-w-0 rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-xs dark:border-amber-500/40 dark:bg-amber-500/10"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-amber-300 text-amber-700 dark:border-amber-500/40 dark:text-amber-400">
          <Clock className="size-4" aria-hidden="true" />
        </span>
        <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Pending verification</span>
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-amber-700 dark:text-amber-400">
        {formatNumber(count)}
      </p>
      <Link
        href="/admin/employers"
        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:underline dark:text-amber-300"
      >
        Review queue
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

// The four talent and employer cards.
export function PeopleMetrics({ metrics, totals, rangeLabel }: PeopleMetricsProps) {
  const verifiedShare = share(totals.verifiedEmployers, totals.totalEmployers);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <PeopleCard icon={User} label="Talents" value={totals.totalTalents}>
        <NewInRange count={metrics.totalTalents} rangeLabel={rangeLabel} />
      </PeopleCard>
      <PeopleCard icon={Building2} label="Employers" value={totals.totalEmployers}>
        <NewInRange count={metrics.totalEmployers} rangeLabel={rangeLabel} />
      </PeopleCard>
      <PeopleCard icon={ShieldCheck} label="Verified employers" value={totals.verifiedEmployers}>
        <p className="text-xs text-zinc-500 dark:text-slate-400">{formatPercent(verifiedShare, 0)} of all employers</p>
        <div
          role="progressbar"
          aria-label="Verified share of all employers"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(verifiedShare)}
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800"
        >
          <div className="h-full rounded-full bg-emerald-600" style={{ width: `${verifiedShare}%` }} />
        </div>
      </PeopleCard>
      <PendingVerificationCard count={totals.pendingEmployerVerifications} />
    </div>
  );
}
