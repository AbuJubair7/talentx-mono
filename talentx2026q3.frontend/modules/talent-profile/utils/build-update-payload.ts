import { getChangedFields, stringListsEqual } from "@/lib/get-changed-fields"

import type { TalentProfileDto, UpdateTalentProfilePayload } from "../types/talent-profile.types"
import type { TalentProfileFormValues } from "../types/talent-profile-schema"

function normalizeString(value: unknown): string {
  return String(value ?? "").trim()
}

function normalizeStringOrNull(value: unknown): string | null {
  const trimmed = normalizeString(value)
  return trimmed.length > 0 ? trimmed : null
}

function optionalStringRule(
  getOriginalValue: (original: TalentProfileDto) => string | null,
  getCurrentValue: (current: TalentProfileFormValues) => string
) {
  return {
    getOriginalValue,
    getCurrentValue,
    isEqual: (originalValue: unknown, currentValue: unknown) =>
      normalizeString(originalValue) === normalizeString(currentValue),
    toPayloadValue: normalizeStringOrNull,
  }
}

// Compares the originally-fetched Talent profile against the current form
// values and returns only the fields that actually changed, so the profile
// page can send a minimal partial PUT. `name` is always included because
// UpdateTalentProfileCommand.Name is required and non-nullable on the
// backend validator — sending only "changed" fields would omit it whenever
// the Talent didn't touch their name, and the PUT would then fail validation.
// Built on the generic diff engine in lib/get-changed-fields.ts — this file
// owns only the Talent-specific field mapping, not the diff mechanics.
export function buildTalentProfileUpdatePayload(
  original: TalentProfileDto,
  current: TalentProfileFormValues
): UpdateTalentProfilePayload {
  return getChangedFields<TalentProfileDto, TalentProfileFormValues, UpdateTalentProfilePayload>(
    original,
    current,
    {
      location: optionalStringRule(
        (profile) => profile.location,
        (values) => values.location
      ),
      tagline: optionalStringRule(
        (profile) => profile.tagline,
        (values) => values.tagline
      ),
      shortBio: optionalStringRule(
        (profile) => profile.shortBio,
        (values) => values.shortBio
      ),
      phone: optionalStringRule(
        (profile) => profile.phone,
        (values) => values.phone
      ),
      linkedInUrl: optionalStringRule(
        (profile) => profile.linkedInUrl,
        (values) => values.linkedInUrl
      ),
      additionalUrls: {
        getOriginalValue: (profile) => profile.additionalUrls,
        getCurrentValue: (values) => values.additionalUrls,
        isEqual: (originalValue, currentValue) =>
          stringListsEqual(originalValue as string[], currentValue as string[]),
      },
      totalYearsExperience: {
        getOriginalValue: (profile) => profile.totalYearsExperience ?? null,
        getCurrentValue: (values) => values.totalYearsExperience ?? null,
      },
      expectedSalary: {
        getOriginalValue: (profile) => profile.expectedSalary ?? null,
        getCurrentValue: (values) => values.expectedSalary ?? null,
      },
      skillPropositions: {
        getOriginalValue: (profile) => profile.skillPropositions,
        getCurrentValue: (values) => values.skillPropositions,
        isEqual: (originalValue, currentValue) =>
          stringListsEqual(originalValue as string[], currentValue as string[]),
      },
    },
    { name: current.name.trim() }
  )
}
