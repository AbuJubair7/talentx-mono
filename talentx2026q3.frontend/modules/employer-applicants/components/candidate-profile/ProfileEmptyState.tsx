import { cn } from '@/lib/utils';

interface ProfileEmptyStateProps {
  message: string;
  className?: string;
}

export function ProfileEmptyState({ message, className }: ProfileEmptyStateProps) {
  return <p className={cn('text-sm leading-relaxed text-ink-subtle', className)}>{message}</p>;
}
