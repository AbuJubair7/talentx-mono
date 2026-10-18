// Canonical enum value arrays — mirror backend C# enum names exactly (PascalCase).
// These are the string values the API serializes to / deserializes from.

export const EMPLOYMENT_TYPES = [
  'FullTime',
  'PartTime',
  'Contract',
  'Internship',
] as const
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number]

export const EXPERIENCE_LEVELS = [
  'EntryLevel',
  'MidLevel',
  'SeniorLevel',
  'Lead',
  'Executive',
] as const
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]

export const WORK_ARRANGEMENTS = ['OnSite', 'FullRemote', 'Hybrid', 'RemoteButAccessible'] as const
export type WorkArrangement = (typeof WORK_ARRANGEMENTS)[number]

export const JOB_STATUSES = ['Draft', 'Published', 'Closed', 'Expired'] as const
export type JobStatus = (typeof JOB_STATUSES)[number]

// Human-readable display labels for UI dropdowns / pills
export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FullTime: 'Full Time',
  PartTime: 'Part Time',
  Contract: 'Contract',
  Internship: 'Internship',
}

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  EntryLevel: 'Entry Level',
  MidLevel: 'Mid Level',
  SeniorLevel: 'Senior Level',
  Lead: 'Lead',
  Executive: 'Executive',
}

export const WORK_ARRANGEMENT_LABELS: Record<WorkArrangement, string> = {
  OnSite: 'On-Site',
  FullRemote: 'Full Remote',
  Hybrid: 'Hybrid',
  RemoteButAccessible: 'Remote But Accessible',
}

// Minimal shape used by the homepage JobCard (from /api/v1/jobs list endpoint)
export interface JobDto {
  id: string
  title: string
  companyName: string
  location: string
  employmentType: EmploymentType
  experienceLevel: ExperienceLevel
  workArrangement: WorkArrangement
  requiredSkills: string[]
  createdAt: string
  expireAt: string
  city?: string | null
  country?: string | null
}

// Filter params sent as query-string to /api/v1/jobs
export interface JobFilterParams {
  keyword?: string
  location?: string
  employmentType?: EmploymentType | ''
  experienceLevel?: ExperienceLevel | ''
  workArrangement?: WorkArrangement | ''
  page?: number
  pageSize?: number
}