export type {
  EmploymentType,
  ExperienceLevel,
  WorkArrangement,
  JobStatus,
  JobFilterParams,
} from '@/types/job'

export {
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  WORK_ARRANGEMENTS,
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  WORK_ARRANGEMENT_LABELS,
} from '@/types/job'

export interface JobListItem {
  id: string
  employerId?: string
  companyId?: string | null
  logoUrl?: string | null
  title: string
  companyName: string
  location: string
  city?: string | null
  country?: string | null
  employmentType: string
  experienceLevel: string
  workArrangement: string
  requiredSkills: string[]
  createdAt: string
  expireAt: string
  salaryType?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  salaryCurrency?: string | null
  salaryPeriod?: string | null
}

export interface JobDetails {
  id: string
  employerId?: string
  companyId?: string | null
  logoUrl?: string | null
  title: string
  companyName: string
  description: string | null
  location: string | null
  employmentType: string | null
  experienceLevel: string | null
  workArrangement: string | null
  requiredSkills: string[]
  vacancies: number
  createdAt: string
  expireAt: string
  status: string
  salaryType?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  salaryCurrency?: string | null
  salaryPeriod?: string | null
  requirements?: string | null
}

// Result of GET /jobs/{id}/applications/me (Talent-only; the caller is taken from the JWT).
export interface ApplicationStatusResult {
  hasApplied: boolean;
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}
