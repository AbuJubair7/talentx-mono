import { getChangedFields as diffFields, stringListsEqual } from "@/lib/get-changed-fields"

import type { JobDto, UpdateJobPayload } from "../types/job.types"
import type { JobFormValues } from "../types/job-schema"

// Compares the originally-fetched job against the current form values and
// returns only the fields that actually changed, so the edit page can send a
// minimal partial update. Built on the generic diff engine promoted to
// lib/get-changed-fields.ts — this file owns only the job-specific field
// mapping (which fields exist, the expireAt date-vs-datetime comparison),
// not the diff mechanics themselves.
export function getChangedFields(original: JobDto, current: JobFormValues, publish: boolean): UpdateJobPayload {
  return diffFields<JobDto, JobFormValues, UpdateJobPayload>(
    original,
    current,
    {
      title: {
        getOriginalValue: (job) => job.title,
        getCurrentValue: (values) => values.title.trim(),
      },
      companyName: {
        getOriginalValue: (job) => job.companyName,
        getCurrentValue: (values) => values.companyName.trim(),
      },
      description: {
        getOriginalValue: (job) => job.description,
        getCurrentValue: (values) => values.description.trim(),
      },
      location: {
        getOriginalValue: (job) => job.location,
        getCurrentValue: (values) => values.location.trim(),
      },
      employmentType: {
        getOriginalValue: (job) => job.employmentType,
        getCurrentValue: (values) => values.employmentType,
      },
      experienceLevel: {
        getOriginalValue: (job) => job.experienceLevel,
        getCurrentValue: (values) => values.experienceLevel,
      },
      workArrangement: {
        getOriginalValue: (job) => job.workArrangement,
        getCurrentValue: (values) => values.workArrangement,
      },
      vacancies: {
        getOriginalValue: (job) => job.vacancies,
        getCurrentValue: (values) => values.vacancies,
      },
      requiredSkills: {
        getOriginalValue: (job) => job.requiredSkills,
        getCurrentValue: (values) => values.requiredSkills,
        isEqual: (originalValue, currentValue) =>
          stringListsEqual(originalValue as string[], currentValue as string[]),
      },
      expireAt: {
        getOriginalValue: (job) => job.expireAt.slice(0, 10),
        getCurrentValue: (values) => values.expireAt,
        toPayloadValue: (currentValue) => new Date(currentValue as string).toISOString(),
      },
      city: {
        getOriginalValue: (job) => job.city ?? "",
        getCurrentValue: (values) => values.city?.trim() ?? "",
      },
      country: {
        getOriginalValue: (job) => job.country ?? "",
        getCurrentValue: (values) => values.country?.trim() ?? "",
      },
      minOverlapHours: {
        getOriginalValue: (job) => job.minOverlapHours,
        getCurrentValue: (values) => values.minOverlapHours,
      },
    },
    { publish }
  )
}
