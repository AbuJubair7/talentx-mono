'use client';

import {
  Briefcase,
  Building,
  Building2,
  Cpu,
  HeartPulse,
  Landmark,
  TrendingUp,
  Wifi,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompanyFilterParams } from '../types/company-list.types';

export type CompanyQuickChipId =
  | 'all'
  | 'hiring'
  | 'vacancies'
  | 'openings'
  | 'remote'
  | 'software'
  | 'finance'
  | 'health'
  | 'enterprise';

interface QuickChip {
  id: CompanyQuickChipId;
  label: string;
  icon: React.ReactNode;
}

interface CompanyQuickFiltersProps {
  totalCount: number;
  /** Preferred multi-select active state. */
  activeChips?: CompanyQuickChipId[];
  /** Legacy single-select prop (kept for backwards compat). */
  activeChip?: CompanyQuickChipId | null;
  onSelect: (id: CompanyQuickChipId) => void;
}

/**
 * Resolves every quick chip reflecting the current filter state, so
 * multiple buttons can appear active at the same time (e.g. Remote +
 * Software + Hiring Now). Sort chips (`vacancies` / `openings`) are
 * independent of attribute filters.
 */
export function resolveActiveChips(filters: CompanyFilterParams): CompanyQuickChipId[] {
  const industry = (filters.industry ?? '').toLowerCase();
  const location = (filters.location ?? '').toLowerCase();
  const hasAttributeFilters =
    Boolean(filters.keyword) ||
    Boolean(filters.industry) ||
    Boolean(filters.location) ||
    Boolean(filters.companySize) ||
    Boolean(filters.hiring);
  if (!hasAttributeFilters) {
    if (filters.sortBy === 'vacancies') return ['vacancies'];
    if (filters.sortBy === 'openings') return ['openings'];
    return ['all'];
  }
  const chips: CompanyQuickChipId[] = [];
  if (filters.hiring) chips.push('hiring');
  if (location.includes('remote')) chips.push('remote');
  if (industry.includes('software')) chips.push('software');
  if (industry.includes('financ')) chips.push('finance');
  if (industry.includes('health')) chips.push('health');
  if ((filters.companySize ?? '') === '1000+') chips.push('enterprise');
  if (filters.sortBy === 'vacancies') chips.push('vacancies');
  if (filters.sortBy === 'openings') chips.push('openings');
  return chips;
}

/**
 * Legacy single-select resolver. Returns the first matching chip.
 * Prefer `resolveActiveChips` for rendering.
 */
export function resolveActiveChip(filters: CompanyFilterParams): CompanyQuickChipId | null {
  return resolveActiveChips(filters)[0] ?? null;
}

export function CompanyQuickFilters({
  totalCount,
  activeChips,
  activeChip,
  onSelect,
}: CompanyQuickFiltersProps) {
  const activeSet = new Set<CompanyQuickChipId>(
    activeChips ?? (activeChip ? [activeChip] : []),
  );

  const chips: QuickChip[] = [
    { id: 'all', label: `Companies (${totalCount})`, icon: <Building2 className="size-3.5" /> },
    { id: 'hiring', label: 'Hiring Now', icon: <Zap className="size-3.5" /> },
    { id: 'vacancies', label: 'Most Vacancies', icon: <TrendingUp className="size-3.5" /> },
    { id: 'openings', label: 'Most Open Roles', icon: <Briefcase className="size-3.5" /> },
    { id: 'remote', label: 'Remote', icon: <Wifi className="size-3.5" /> },
    { id: 'software', label: 'Software', icon: <Cpu className="size-3.5" /> },
    { id: 'finance', label: 'Finance', icon: <Landmark className="size-3.5" /> },
    { id: 'health', label: 'Healthtech', icon: <HeartPulse className="size-3.5" /> },
    { id: 'enterprise', label: 'Enterprise', icon: <Building className="size-3.5" /> },
  ];

  return (
    <div
      role="group"
      aria-label="Quick filters"
      className="flex items-center gap-2 overflow-x-auto pb-1"
    >
      {chips.map((chip) => {
        const active = activeSet.has(chip.id);
        const isHiringChip = chip.id === 'hiring';
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onSelect(chip.id)}
            aria-pressed={active}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 sm:px-3 sm:text-xs',
              isHiringChip && !active
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300'
                : '',
              active && isHiringChip
                ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                : '',
              active && !isHiringChip
                ? 'border-teal-700 bg-teal-700 text-white shadow-xs'
                : '',
              !active && !isHiringChip
                ? 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                : '',
            )}
          >
            {chip.icon}
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
