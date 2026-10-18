import type {
  Currency,
  EmploymentType,
  ExperienceLevel,
  SalaryPeriod,
  SalaryType,
  WorkArrangement,
} from "../types/job.types"

export const EMPLOYMENT_TYPE_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: "FullTime", label: "Full-Time" },
  { value: "PartTime", label: "Part-Time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Internship" },
]

export const EXPERIENCE_LEVEL_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "EntryLevel", label: "Entry Level" },
  { value: "MidLevel", label: "Mid Level" },
  { value: "SeniorLevel", label: "Senior Level" },
  { value: "Lead", label: "Lead" },
  { value: "Executive", label: "Executive" },
]

export const WORK_ARRANGEMENT_OPTIONS: { value: WorkArrangement; label: string }[] = [
  { value: "OnSite", label: "On-Site" },
  { value: "FullRemote", label: "Full Remote" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "RemoteButAccessible", label: "Remote But Accessible" },
]

export const SALARY_TYPE_OPTIONS: { value: SalaryType; label: string }[] = [
  { value: "Negotiable", label: "Negotiable" },
  { value: "Fixed", label: "Fixed Amount" },
  { value: "Range", label: "Range" },
]

export const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "USD", label: "USD" },
  { value: "BDT", label: "BDT" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "INR", label: "INR" },
]

export const SALARY_PERIOD_OPTIONS: { value: SalaryPeriod; label: string }[] = [
  { value: "PerYear", label: "Per Year" },
  { value: "PerMonth", label: "Per Month" },
]

export function getOptionLabel<T extends string>(
  options: { value: T; label: string }[],
  value: T
): string {
  return options.find((option) => option.value === value)?.label ?? value
}
