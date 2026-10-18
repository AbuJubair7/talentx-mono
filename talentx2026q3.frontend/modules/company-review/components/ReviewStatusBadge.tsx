import { cn } from '@/lib/utils';
import { DEFAULT_REVIEW_STATUS_STYLE, REVIEW_STATUS_STYLES } from '../constants/company-review.constants';
import type { CompanyReviewStatus } from '../types/company-review.types';

interface ReviewStatusBadgeProps {
  status: CompanyReviewStatus | string;
  className?: string;
}

export function ReviewStatusBadge({ status, className }: ReviewStatusBadgeProps) {
  const key = status?.toLowerCase() ?? '';
  const config = REVIEW_STATUS_STYLES[key] ?? { ...DEFAULT_REVIEW_STATUS_STYLE, label: status };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap shadow-2xs',
        config.bg,
        className
      )}
    >
      <span className={cn('size-1.5 rounded-full shrink-0', config.dot)} aria-hidden="true" />
      {config.label}
    </span>
  );
}
