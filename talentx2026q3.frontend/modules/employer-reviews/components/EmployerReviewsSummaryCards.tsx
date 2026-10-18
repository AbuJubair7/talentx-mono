import type { ComponentType, ReactNode } from 'react';
import { Clock, MessageSquareText, Star, ThumbsUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { RatingStars } from '@/modules/company-review';
import type { EmployerCompanyReviewSummaryDto } from '../types/employer-reviews.types';
import { formatScore, overallSummaryAverage } from '../utils/employer-reviews.utils';

interface EmployerReviewsSummaryCardsProps {
  data: EmployerCompanyReviewSummaryDto;
  totalSubmitted: number;
}

/** The four KPI cards at the top of the Reviews tab. */
export function EmployerReviewsSummaryCards({ data, totalSubmitted }: EmployerReviewsSummaryCardsProps) {
  const { summary, countsByStatus } = data;
  const overall = overallSummaryAverage(summary);
  const hasData = summary.totalCount > 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryStat icon={Star} label="Overall rating">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tabular-nums text-slate-900">
            {hasData ? formatScore(overall) : '—'}
          </span>
          <span className="text-sm text-slate-400">/ 5</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <RatingStars value={hasData ? overall : null} size="sm" />
          <span className="text-xs text-slate-400">Avg. of 4 categories</span>
        </div>
      </SummaryStat>

      <SummaryStat icon={MessageSquareText} label="Published reviews">
        <span className="text-3xl font-bold tabular-nums text-slate-900">{summary.totalCount}</span>
        <p className="mt-2 text-xs text-slate-400">of {totalSubmitted} submitted · visible to candidates</p>
      </SummaryStat>

      <SummaryStat icon={ThumbsUp} label="Positive sentiment">
        <span className="text-3xl font-bold tabular-nums text-slate-900">
          {hasData ? `${Math.round(summary.positivePercent)}%` : '—'}
        </span>
        <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="bg-emerald-500" style={{ width: `${summary.positivePercent}%` }} />
          {summary.negativeCount > 0 && <div className="flex-1 bg-rose-400" />}
        </div>
        <p className="mt-1.5 text-xs text-slate-400">
          {summary.positiveCount} positive · {summary.negativeCount} negative
        </p>
      </SummaryStat>

      <SummaryStat icon={Clock} label="Awaiting moderation">
        <span className="text-3xl font-bold tabular-nums text-slate-900">{countsByStatus.Pending}</span>
        <p className="mt-2 text-xs text-slate-400">
          {countsByStatus.Pending > 0 ? 'Being reviewed by TalentX' : 'Nothing in the queue'}
        </p>
      </SummaryStat>
    </div>
  );
}

interface SummaryStatProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  children: ReactNode;
}

function SummaryStat({ icon: Icon, label, children }: SummaryStatProps) {
  return (
    <Card className="gap-0 rounded-2xl border-slate-200 p-5 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <Icon className="size-4 text-slate-400" />
      </div>
      {children}
    </Card>
  );
}
