import { cn } from '@/lib/utils';
import { APPLICATION_STATUS_STYLES, DEFAULT_STATUS_STYLE } from '../constants';
import type { ApplicationStatus } from '../types/applicant.types';

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus | string;
  className?: string;
}

export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
  const key = status?.toLowerCase() ?? '';
  const config = APPLICATION_STATUS_STYLES[key] ?? {
    ...DEFAULT_STATUS_STYLE,
    label: status,
  };

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

