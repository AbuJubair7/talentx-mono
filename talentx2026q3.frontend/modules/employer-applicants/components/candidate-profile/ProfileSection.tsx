import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ProfileSectionProps {
  title: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function ProfileSection({ title, action, className, children }: ProfileSectionProps) {
  const id = `profile-section-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <section
      aria-labelledby={id}
      className={cn('rounded-xl border border-line bg-surface p-4 shadow-card md:p-6', className)}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id={id} className="text-base font-semibold text-ink">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
