import { z } from "zod"

import {
  CURRENCIES,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  SALARY_PERIODS,
  SALARY_TYPES,
  WORK_ARRANGEMENTS,
} from "./job.types"

// Structural rules only — mirrors the backend's FluentValidation rules, which
// apply identically whether the job is being saved as a draft or published.
export const jobFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must have minimum 5 characters")
    .max(200, "Title must not exceed 200 characters.")
    .regex(/^[^\d]/, "Title cannot start with a number.")
    .regex(/[a-zA-Z]/, "Title must contain at least one letter."),
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must have minimum 2 characters")
    .max(200, "Company name must not exceed 200 characters.")
    .regex(/[a-zA-Z]/, "Company name must contain at least one letter."),
  description: z
    .string()
    .trim()
    .min(20, "Description must have minimum 20 characters")
    .max(10000, "Description must not exceed 10000 characters.")
    .regex(/[a-zA-Z]/, "Description must contain at least one letter."),
  location: z
    .string()
    .trim()
    .min(5, "Location must have minimum 5 characters")
    .max(200, "Location must not exceed 200 characters.")
    .regex(/[a-zA-Z]/, "Location cannot be purely numeric."),
  employmentType: z.enum(EMPLOYMENT_TYPES, { message: "Employment type is required." }),
  experienceLevel: z.enum(EXPERIENCE_LEVELS, { message: "Experience level is required." }),
  workArrangement: z.enum(WORK_ARRANGEMENTS, { message: "Work arrangement is required." }),
  requiredSkills: z.array(
    z
      .string()
      .trim()
      .min(1, "Skill entries cannot be blank.")
      .regex(/[a-zA-Z]/, "Skill entries must contain at least one letter.")
  ),
  vacancies: z
    .number({ message: "Vacancies is required." })
    .int("Vacancies must be a whole number.")
    .min(0, "Vacancies cannot be negative."),
  expireAt: z
    .string()
    .min(1, "Expire date must not be empty")
    .refine((value) => !Number.isNaN(new Date(value).getDate()), "Expire date must be a valid date.")
    .refine((value) => {
      const selected = new Date(value)
      const today = new Date()
      selected.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)
      return selected >= today
    }, "Expire date must be today or in the future."),
  // Wizard fields
  city: z.string().optional(),
  country: z.string().optional(),
  minOverlapHours: z.number().optional(),
  // Salary — optional in a draft, mandatory to publish (see evaluatePublishReadiness).
  salaryType: z.enum(SALARY_TYPES).optional(),
  salaryCurrency: z.enum(CURRENCIES).optional(),
  salaryPeriod: z.enum(SALARY_PERIODS).optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  // Requirements — optional in a draft, mandatory to publish (bullet-point AI-generatable text).
  requirements: z.string().max(5000, "Requirements must not exceed 5000 characters.").optional(),
})
// Conditional validation: City/Country required for OnSite/Hybrid, MinOverlapHours required for FullRemote
.refine(
  (data) => {
    if (data.workArrangement === "OnSite" || data.workArrangement === "Hybrid") {
      return data.city && data.city.trim().length >= 2
    }
    return true
  },
  { message: "City is required for OnSite and Hybrid work arrangements.", path: ["city"] }
)
.refine(
  (data) => {
    if (data.workArrangement === "OnSite" || data.workArrangement === "Hybrid") {
      return data.country && data.country.trim().length >= 2
    }
    return true
  },
  { message: "Country is required for OnSite and Hybrid work arrangements.", path: ["country"] }
)
.refine(
  (data) => {
    if (data.workArrangement === "FullRemote") {
      return data.minOverlapHours !== undefined && data.minOverlapHours > 0
    }
    return true
  },
  { message: "Minimum overlap hours is required for FullRemote work arrangement.", path: ["minOverlapHours"] }
)
// Salary structural consistency — mirrors CreateJobCommandValidator's unconditional
// (draft-or-publish) rules: currency/period required together with Fixed/Range,
// and max must not be less than min when both are present.
.refine(
  (data) => {
    if (data.salaryType === "Fixed" || data.salaryType === "Range") {
      return !!data.salaryCurrency && !!data.salaryPeriod
    }
    return true
  },
  { message: "Salary currency and period are required.", path: ["salaryCurrency"] }
)
.refine(
  (data) => {
    if (data.salaryType === "Range" && data.salaryMin !== undefined && data.salaryMax !== undefined) {
      return data.salaryMax >= data.salaryMin
    }
    return true
  },
  { message: "Maximum salary must be greater than or equal to minimum salary.", path: ["salaryMax"] }
)

export type JobFormValues = z.infer<typeof jobFormSchema>

export interface PublishRequirement {
  label: string
  done: boolean
}

// Mirrors Job.EnsureIsPublishable() in the backend domain entity field-for-field.
// Kept as a plain function (not a second zod schema) so the mapping to that
// method stays obvious and the two can't silently drift out of sync. Both
// getPublishBlockers (submit-time gate) and getPublishRequirements (the
// readiness checklist UI) read off this single list so they can't disagree.
function evaluatePublishReadiness(values: JobFormValues): PublishRequirement[] {
  const title = values.title.trim()
  const companyName = values.companyName.trim()
  const location = values.location.trim()
const expireAtTime = new Date(values.expireAt).getTime()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    return [
      { label: "Title", done: title.length >= 5 && !/^\d/.test(title) && /[a-zA-Z]/.test(title) },
      { label: "Company name", done: companyName.length >= 2 && /[a-zA-Z]/.test(companyName) },
      {
        label: "Description",
        done: values.description.trim().length >= 20 && /[a-zA-Z]/.test(values.description),
      },
      { label: "Location", done: location.length >= 5 && /[a-zA-Z]/.test(location) },
      { label: "Required skills", done: values.requiredSkills.length > 0 },
      { label: "Vacancies (must be greater than 0)", done: values.vacancies > 0 },
      { label: "Expire date (must be today or in the future)", done: !Number.isNaN(expireAtTime) && new Date(expireAtTime) >= todayStart },
    // Conditional wizard field requirements
    ...(values.workArrangement === "OnSite" || values.workArrangement === "Hybrid"
      ? [
          { label: "City", done: !!values.city && values.city.trim().length >= 2 },
          { label: "Country", done: !!values.country && values.country.trim().length >= 2 },
        ]
      : []),
    ...(values.workArrangement === "FullRemote"
      ? [
          { label: "Minimum overlap hours", done: !!values.minOverlapHours && values.minOverlapHours > 0 },
        ]
      : []),
    {
      label: "Salary",
      done:
        values.salaryType === "Negotiable" ||
        (values.salaryType === "Fixed" && !!values.salaryCurrency && !!values.salaryPeriod && values.salaryMin !== undefined) ||
        (values.salaryType === "Range" && !!values.salaryCurrency && !!values.salaryPeriod && values.salaryMin !== undefined && values.salaryMax !== undefined),
    },
    { label: "Requirements", done: (values.requirements ?? "").trim().length > 0 },
  ]
}

export function getPublishBlockers(values: JobFormValues): string[] {
  return evaluatePublishReadiness(values)
    .filter((requirement) => !requirement.done)
    .map((requirement) => requirement.label)
}

export function getPublishRequirements(values: JobFormValues): PublishRequirement[] {
  return evaluatePublishReadiness(values)
}
