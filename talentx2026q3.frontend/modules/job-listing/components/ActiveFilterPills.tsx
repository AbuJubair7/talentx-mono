'use client'

import { X, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  WORK_ARRANGEMENT_LABELS,
} from '@/types/job'
import type { JobFilterParams } from '@/types/job'

interface ActiveFilterPillsProps {
  filters: JobFilterParams
  onClearFilter: (key: keyof Omit<JobFilterParams, 'page' | 'pageSize'>) => void
  onClearAll: () => void
  className?: string
}

interface Pill {
  key: keyof Omit<JobFilterParams, 'page' | 'pageSize'>
  label: string
}

export function ActiveFilterPills({
  filters,
  onClearFilter,
  onClearAll,
  className = '',
}: ActiveFilterPillsProps) {
  const pills: Pill[] = []

  if (filters.keyword) {
    pills.push({ key: 'keyword', label: `Search: "${filters.keyword}"` })
  }
  if (filters.location) {
    pills.push({ key: 'location', label: `Location: ${filters.location}` })
  }
  if (filters.employmentType) {
    pills.push({
      key: 'employmentType',
      label: EMPLOYMENT_TYPE_LABELS[filters.employmentType] ?? filters.employmentType,
    })
  }
  if (filters.experienceLevel) {
    pills.push({
      key: 'experienceLevel',
      label: EXPERIENCE_LEVEL_LABELS[filters.experienceLevel] ?? filters.experienceLevel,
    })
  }
  if (filters.workArrangement) {
    pills.push({
      key: 'workArrangement',
      label: WORK_ARRANGEMENT_LABELS[filters.workArrangement] ?? filters.workArrangement,
    })
  }

  if (pills.length === 0) return null

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 select-none">
        Active:
      </span>

      {pills.map(({ key, label }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50/90 border border-emerald-200/90 pl-3 pr-2 py-1 text-xs font-semibold text-emerald-900 shadow-2xs transition-all hover:bg-emerald-100/80"
        >
          <span>{label}</span>
          <button
            type="button"
            onClick={() => onClearFilter(key)}
            aria-label={`Remove ${key} filter`}
            className="text-emerald-700 hover:text-emerald-950 p-0.5 rounded-md hover:bg-emerald-200/60 transition-colors cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </span>
      ))}
    </div>
  )
}
