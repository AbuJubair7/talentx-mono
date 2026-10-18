import { cn } from '@/lib/utils';
import { DEFAULT_INTERVIEW_STATUS_STYLE, INTERVIEW_STATUS_STYLES } from '../constants/interview.constants';
import type { InterviewStatus } from '../types/interview.types';

interface InterviewStatusBadgeProps {
  status: InterviewStatus | string;
  className?: string;
}

export function InterviewStatusBadge({ status, className }: InterviewStatusBadgeProps) {
  const key = status?.toLowerCase() ?? '';
  const config = INTERVIEW_STATUS_STYLES[key] ?? { ...DEFAULT_INTERVIEW_STATUS_STYLE, label: status };

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
