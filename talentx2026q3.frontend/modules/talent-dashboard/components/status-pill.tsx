import { cn } from '@/lib/utils';
import type { ApplicationStatus } from '../types';
import { STATUS_CONFIG, DEFAULT_STATUS_CONFIG } from '../constants';

export interface StatusPillProps {
  status: ApplicationStatus | string;
}

export function StatusPill({ status }: StatusPillProps) {
  const config = STATUS_CONFIG[status as ApplicationStatus] ?? {
    ...DEFAULT_STATUS_CONFIG,
    label: status || DEFAULT_STATUS_CONFIG.label,
  };
  const { label, dot, text } = config;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[13px] font-semibold',
        text,
      )}
    >
      <span className={cn('size-1.5 rounded-full shrink-0', dot)} />
      {label}
    </span>
  );
}
