import { ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { COMPANY_REVIEW_STATUS_VALUES, REVIEW_STATUS_STYLES } from '@/modules/company-review';
import type { CompanyReviewStatus } from '@/modules/company-review';
import { EMPLOYER_REVIEW_STATUS_DESCRIPTIONS } from '../constants/employer-reviews.constants';

interface EmployerReviewStatusCountsProps {
  counts: Record<CompanyReviewStatus, number>;
}

/** Per-status counts so the employer can see what's still awaiting moderation. */
export function EmployerReviewStatusCounts({ counts }: EmployerReviewStatusCountsProps) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-xs" data-testid="employer-review-status-counts">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-slate-900">Moderation status</CardTitle>
        <CardDescription>All reviews submitted about your company.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="divide-y divide-slate-100">
          {COMPANY_REVIEW_STATUS_VALUES.map((status) => {
            const style = REVIEW_STATUS_STYLES[status.toLowerCase()];

            return (
              <li key={status} className="flex items-center justify-between py-2.5 first:pt-0">
                <div className="flex items-center gap-3">
                  <span className={`size-2 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{style.label}</p>
                    <p className="text-xs text-slate-400">{EMPLOYER_REVIEW_STATUS_DESCRIPTIONS[status]}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold tabular-nums text-slate-900">{counts[status]}</span>
              </li>
            );
          })}
        </ul>

        <div className="flex items-start gap-2.5 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <p>
            Reviewers are anonymous. Reviews are moderated by TalentX and can&apos;t be edited or removed by
            employers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
