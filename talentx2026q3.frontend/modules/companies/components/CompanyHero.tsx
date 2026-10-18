'use client';

import { Briefcase, Building2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanyHeroProps {
  totalCount: number;
  totalOpenings: number;
  totalVacancies: number;
  isPending: boolean;
}

function StatCard({
  icon,
  iconClassName,
  value,
  label,
  isPending,
}: {
  icon: React.ReactNode;
  iconClassName: string;
  value: number;
  label: string;
  isPending: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 sm:gap-2.5 sm:px-3.5 sm:py-3 shadow-xs">
      <span
        aria-hidden="true"
        className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-9', iconClassName)}
      >
        {icon}
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block text-sm font-extrabold text-slate-900 sm:text-base">
          {isPending ? '–' : value}
        </span>
        <span className="block truncate text-[10px] font-medium text-slate-500 sm:text-[11px]">{label}</span>
      </span>
    </div>
  );
}

export function CompanyHero({ totalCount, totalOpenings, totalVacancies, isPending }: CompanyHeroProps) {
  return (
    <div className="grid grid-cols-1 items-center gap-4 sm:gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Explore Top Companies
          <span className="block text-teal-700">Actively Hiring</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 sm:mt-3 sm:text-[15px]">
          {isPending ? (
            'Loading verified companies…'
          ) : (
            <>
              Discover {totalCount} {totalCount === 1 ? 'verified company' : 'verified companies'}{' '}
              with {totalVacancies} {totalVacancies === 1 ? 'open vacancy' : 'open vacancies'}{' '}
              across {totalOpenings} {totalOpenings === 1 ? 'active role' : 'active roles'}. Find
              the team for your next step.
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Hiring summary">
        <StatCard
          icon={<Building2 className="size-4 text-teal-700 sm:size-4.5" />}
          iconClassName="bg-teal-50"
          value={totalCount}
          label="Companies"
          isPending={isPending}
        />
        <StatCard
          icon={<Briefcase className="size-4 text-indigo-600 sm:size-4.5" />}
          iconClassName="bg-indigo-50"
          value={totalOpenings}
          label="Open roles"
          isPending={isPending}
        />
        <StatCard
          icon={<Users className="size-4 text-emerald-700 sm:size-4.5" />}
          iconClassName="bg-emerald-50"
          value={totalVacancies}
          label="Vacancies"
          isPending={isPending}
        />
      </div>
    </div>
  );
}
