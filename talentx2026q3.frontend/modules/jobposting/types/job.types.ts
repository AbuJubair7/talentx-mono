export const EMPLOYMENT_TYPES = [
  "FullTime",
  "PartTime",
  "Contract",
  "Internship",
] as const
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number]

export const EXPERIENCE_LEVELS = [
  "EntryLevel",
  "MidLevel",
  "SeniorLevel",
  "Lead",
  "Executive",
] as const
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]

export const WORK_ARRANGEMENTS = [
  "OnSite",
  "FullRemote",
  "Hybrid",
  "RemoteButAccessible",
] as const
export type WorkArrangement = (typeof WORK_ARRANGEMENTS)[number]

export const JOB_STATUSES = ["Draft", "Published", "Closed", "Expired"] as const
export type JobStatus = (typeof JOB_STATUSES)[number]

export const SALARY_TYPES = ["Negotiable", "Fixed", "Range"] as const
export type SalaryType = (typeof SALARY_TYPES)[number]

export const SALARY_PERIODS = ["PerYear", "PerMonth"] as const
export type SalaryPeriod = (typeof SALARY_PERIODS)[number]

export const CURRENCIES = ["USD", "BDT", "EUR", "GBP", "INR"] as const
export type Currency = (typeof CURRENCIES)[number]

export interface JobDto {
  id: string
  employerId: string
  title: string
  companyName: string
  description: string
  employmentType: EmploymentType
  experienceLevel: ExperienceLevel
  location: string
  workArrangement: WorkArrangement
  requiredSkills: string[]
  status: JobStatus
  vacancies: number
  expireAt: string
  createdAt: string
  updatedAt: string | null
  city?: string | null
  country?: string | null
  minOverlapHours?: number | null
  salaryType?: SalaryType | null
  salaryMin?: number | null
  salaryMax?: number | null
  salaryCurrency?: Currency | null
  salaryPeriod?: SalaryPeriod | null
  requirements?: string | null
}

export interface CreateJobPayload {
  title: string
  companyName: string
  description: string
  employmentType: EmploymentType
  experienceLevel: ExperienceLevel
  location: string
  workArrangement: WorkArrangement
  requiredSkills: string[]
  vacancies: number
  expireAt: string
  publish: boolean
  city?: string | null
  country?: string | null
  minOverlapHours?: number | null
  salaryType?: SalaryType | null
  salaryMin?: number | null
  salaryMax?: number | null
  salaryCurrency?: Currency | null
  salaryPeriod?: SalaryPeriod | null
  requirements?: string | null
}

export interface UpdateJobPayload {
  title?: string
  companyName?: string
  description?: string
  employmentType?: EmploymentType
  experienceLevel?: ExperienceLevel
  location?: string
  workArrangement?: WorkArrangement
  requiredSkills?: string[]
  vacancies?: number
  expireAt?: string
  publish: boolean
  city?: string | null
  country?: string | null
  minOverlapHours?: number | null
  salaryType?: SalaryType | null
  salaryMin?: number | null
  salaryMax?: number | null
  salaryCurrency?: Currency | null
  salaryPeriod?: SalaryPeriod | null
  requirements?: string | null
}
