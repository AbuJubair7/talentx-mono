import { buildTalentProfileUpdatePayload } from "../utils/build-update-payload"
import type { TalentProfileDto } from "../types/talent-profile.types"
import type { TalentProfileFormValues } from "../types/talent-profile-schema"

const baseProfile: TalentProfileDto = {
  id: "talent-1",
  userId: "user-1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  tagline: "Backend engineer",
  shortBio: "Building distributed systems.",
  location: "Dhaka",
  phone: "+880123456",
  linkedInUrl: "https://linkedin.com/in/ada",
  additionalUrls: ["https://github.com/ada"],
  totalYearsExperience: 5,
  expectedSalary: 2000,
  skillPropositions: ["Systems thinker"],
  technicalSkills: ["C#"],
  softSkills: ["Communication"],
  toolsAndPlatforms: ["Docker"],
  profilePictureUrl: null,
  videoIntroUrl: null,
  resumeOriginalFileName: null,
  resumeUrl: null,
  resumes: [],
  workExperiences: [],
  educations: [],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: null,
}

const baseValues: TalentProfileFormValues = {
  name: baseProfile.name,
  location: baseProfile.location ?? "",
  tagline: baseProfile.tagline ?? "",
  shortBio: baseProfile.shortBio ?? "",
  phone: baseProfile.phone ?? "",
  linkedInUrl: baseProfile.linkedInUrl ?? "",
  additionalUrls: [...baseProfile.additionalUrls],
  totalYearsExperience: baseProfile.totalYearsExperience,
  expectedSalary: baseProfile.expectedSalary,
  skillPropositions: [...baseProfile.skillPropositions],
}

describe("buildTalentProfileUpdatePayload", () => {
  it("always includes name even when nothing changed", () => {
    const result = buildTalentProfileUpdatePayload(baseProfile, baseValues)
    expect(result).toEqual({ name: baseProfile.name })
  })

  it("includes a scalar field that changed", () => {
    const result = buildTalentProfileUpdatePayload(baseProfile, { ...baseValues, location: "Chattogram" })
    expect(result).toEqual({ name: baseProfile.name, location: "Chattogram" })
  })

  it("does not flag arrays that were only reordered", () => {
    const result = buildTalentProfileUpdatePayload(baseProfile, {
      ...baseValues,
      additionalUrls: ["https://github.com/ada"],
    })
    expect(result).toEqual({ name: baseProfile.name })
  })

  it("flags arrays that were actually added or removed", () => {
    const result = buildTalentProfileUpdatePayload(baseProfile, {
      ...baseValues,
      skillPropositions: ["Systems thinker", "Fast learner"],
    })
    expect(result).toEqual({
      name: baseProfile.name,
      skillPropositions: ["Systems thinker", "Fast learner"],
    })
  })

  it("sends null when an optional string field is cleared", () => {
    const result = buildTalentProfileUpdatePayload(baseProfile, { ...baseValues, tagline: "" })
    expect(result).toEqual({ name: baseProfile.name, tagline: null })
  })

  it("flags numeric fields that changed, including to null", () => {
    const result = buildTalentProfileUpdatePayload(baseProfile, {
      ...baseValues,
      totalYearsExperience: null,
    })
    expect(result).toEqual({ name: baseProfile.name, totalYearsExperience: null })
  })

  it("always sends the trimmed name, even when it changed", () => {
    const result = buildTalentProfileUpdatePayload(baseProfile, { ...baseValues, name: "  Grace Hopper  " })
    expect(result).toEqual({ name: "Grace Hopper" })
  })

  it("does not flag numeric fields when unchanged", () => {
    const result = buildTalentProfileUpdatePayload(baseProfile, baseValues)
    expect(result.totalYearsExperience).toBeUndefined()
    expect(result.expectedSalary).toBeUndefined()
  })
})
