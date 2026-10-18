import { Banknote } from 'lucide-react';

import { formatSalaryRange } from '@/modules/job-listing';
import { cn } from '@/lib/utils';
import type { EmployerJobSalaryBadgeProps } from '../types/employer-job.types';

export function EmployerJobSalaryBadge({
  salaryType,
  salaryMin,
  salaryMax,
  salaryCurrency,
  salaryPeriod,
  className: customClassName,
}: EmployerJobSalaryBadgeProps) {
  const salaryLabel = formatSalaryRange(salaryType, salaryMin, salaryMax, salaryCurrency, salaryPeriod);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800',
        customClassName
      )}
    >
      <Banknote className="size-3.5 shrink-0 text-amber-600" aria-hidden="true" />
      {salaryLabel}
    </span>
  );
}
