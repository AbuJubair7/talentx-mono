import {
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  WORK_ARRANGEMENTS,
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  WORK_ARRANGEMENT_LABELS,
} from '@/types/job'
import type { EmploymentType, ExperienceLevel, WorkArrangement } from '@/types/job'

/** The facet filters shown as radio groups (keyword + location are free-text). */
export type FacetFilterKey = 'workArrangement' | 'employmentType' | 'experienceLevel'

/** Sentinel used by the radio groups for "no constraint". */
export const ALL = 'all' as const

export interface FilterOption {
  value: string
  label: string
}

export interface FilterSectionConfig {
  key: FacetFilterKey
  title: string
  options: FilterOption[]
}

export const FILTER_SECTIONS: FilterSectionConfig[] = [
  {
    key: 'workArrangement',
    title: 'Work Mode',
    options: [
      { value: ALL, label: 'All Modes' },
      ...WORK_ARRANGEMENTS.map((value) => ({ value, label: WORK_ARRANGEMENT_LABELS[value] })),
    ],
  },
  {
    key: 'employmentType',
    title: 'Employment Type',
    options: [
      { value: ALL, label: 'All Types' },
      ...EMPLOYMENT_TYPES.map((value) => ({ value, label: EMPLOYMENT_TYPE_LABELS[value] })),
    ],
  },
  {
    key: 'experienceLevel',
    title: 'Experience Level',
    options: [
      { value: ALL, label: 'All Levels' },
      ...EXPERIENCE_LEVELS.map((value) => ({ value, label: EXPERIENCE_LEVEL_LABELS[value] })),
    ],
  },
]

export interface TrendingPatch {
  keyword?: string
  workArrangement?: WorkArrangement
  employmentType?: EmploymentType
  experienceLevel?: ExperienceLevel
}

export interface TrendingChip {
  label: string
  patch: TrendingPatch
}

export const TRENDING_CHIPS: TrendingChip[] = [
  { label: 'Full Remote', patch: { workArrangement: 'FullRemote' } },
  { label: 'Full Time', patch: { employmentType: 'FullTime' } },
  { label: 'React', patch: { keyword: 'React' } },
  { label: '.NET / C#', patch: { keyword: '.NET' } },
  { label: 'Senior', patch: { experienceLevel: 'SeniorLevel' } },
  { label: 'Entry Level', patch: { experienceLevel: 'EntryLevel' } },
]

export interface ActivePill {
  key: 'keyword' | 'location' | 'workArrangement' | 'employmentType' | 'experienceLevel'
  label: string
  value: string
}
