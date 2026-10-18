"use client";

import type { ReactNode } from "react";
import type { DashboardMetrics } from "../types/admin-dashboard";
import { JobMetrics } from "./JobMetrics";
import { PeopleMetrics } from "./PeopleMetrics";
import { RecruitmentFunnel } from "./RecruitmentFunnel";

// Props for the key metrics: in-range counts, all-time counts, and the selected range in words (e.g. "last 30 days").
interface KeyMetricsProps {
  metrics: DashboardMetrics;
  totals: DashboardMetrics;
  rangeLabel: string;
}

// A titled group of metrics, labelled for screen readers.
function MetricSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`metric-group-${id}`} className="print:break-inside-avoid">
      <h2
        id={`metric-group-${id}`}
        className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

// The 12 headline numbers: recruitment funnel, talents and employers, and jobs.
export function KeyMetrics({ metrics, totals, rangeLabel }: KeyMetricsProps) {
  return (
    <div className="space-y-5">
      <MetricSection id="recruitment" title="Recruitment funnel">
        <RecruitmentFunnel metrics={metrics} totals={totals} rangeLabel={rangeLabel} />
      </MetricSection>
      <MetricSection id="people" title="Talents & employers">
        <PeopleMetrics metrics={metrics} totals={totals} rangeLabel={rangeLabel} />
      </MetricSection>
      <MetricSection id="jobs" title="Jobs">
        <JobMetrics metrics={metrics} totals={totals} rangeLabel={rangeLabel} />
      </MetricSection>
    </div>
  );
}
