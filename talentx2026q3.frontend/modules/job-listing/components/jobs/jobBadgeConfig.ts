import {
  Briefcase,
  Building2,
  Globe,
  Laptop,
  MapPinned,
  Signal,
  Banknote,
  Handshake,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { JobListItem } from '../../types/job.types'
import {
  formatEmploymentType,
  formatExperienceLevel,
  formatWorkArrangement,
} from '../../utils/format'

export interface BadgeSpec {
  key: string
  icon: LucideIcon
  label: string
  emphasis?: boolean
}

const ARRANGEMENT_ICONS: Record<string, LucideIcon> = {
  OnSite: Building2,
  FullRemote: Globe,
  Hybrid: Laptop,
  RemoteButAccessible: MapPinned,
}

const SALARY_PERIOD_LABELS: Record<string, string> = {
  PerMonth: 'month',
  PerYear: 'year',
}

const CURRENCY_FORMATTER = (currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 })
const NUMBER_FORMATTER = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

export function formatSalaryDisplay(job: JobListItem): string {
  const { salaryType, salaryMin, salaryMax, salaryCurrency, salaryPeriod } = job

  if (
    !salaryType ||
    salaryType === 'Negotiable' ||
    !salaryCurrency ||
    salaryMin === null ||
    salaryMin === undefined
  ) {
    return 'Negotiable'
  }

  const periodLabel = salaryPeriod ? (SALARY_PERIOD_LABELS[salaryPeriod] ?? '') : ''
  const periodSuffix = periodLabel ? ` / ${periodLabel}` : ''
  const min = CURRENCY_FORMATTER(salaryCurrency).format(salaryMin)

  if (salaryMax === null || salaryMax === undefined || salaryMax === salaryMin) {
    return `${min}${periodSuffix}`
  }

  return `${min}–${NUMBER_FORMATTER.format(salaryMax)}${periodSuffix}`
}

export function isSalaryNegotiable(job: JobListItem): boolean {
  return formatSalaryDisplay(job) === 'Negotiable'
}

export function employmentBadge(job: JobListItem): BadgeSpec {
  return { key: 'type', icon: Briefcase, label: formatEmploymentType(job.employmentType) }
}

export function arrangementBadge(job: JobListItem): BadgeSpec {
  return {
    key: 'arrangement',
    icon: ARRANGEMENT_ICONS[job.workArrangement] ?? Globe,
    label: formatWorkArrangement(job.workArrangement),
  }
}

export function experienceBadge(job: JobListItem): BadgeSpec {
  return { key: 'experience', icon: Signal, label: formatExperienceLevel(job.experienceLevel) }
}

export function salaryBadge(job: JobListItem): BadgeSpec {
  const negotiable = isSalaryNegotiable(job)
  return {
    key: 'salary',
    icon: negotiable ? Handshake : Banknote,
    label: negotiable ? 'Negotiable' : formatSalaryDisplay(job),
    emphasis: true,
  }
}

export function allBadges(job: JobListItem): BadgeSpec[] {
  return [employmentBadge(job), arrangementBadge(job), experienceBadge(job), salaryBadge(job)]
}
