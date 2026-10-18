import { getChangedFields } from "../utils/get-changed-fields"
import type { JobDto } from "../types/job.types"
import type { JobFormValues } from "../types/job-schema"

const baseJob: JobDto = {
  id: "job-1",
  employerId: "employer-1",
  title: "Backend Engineer",
  companyName: "Acme Corp",
  description: "Build things.",
  employmentType: "FullTime",
  experienceLevel: "MidLevel",
  location: "Dhaka",
  workArrangement: "FullRemote",
  requiredSkills: ["C#", "SQL"],
  status: "Draft",
  vacancies: 2,
  expireAt: "2026-12-31T00:00:00Z",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: null,
  city: "Dhaka",
  country: "Bangladesh",
  minOverlapHours: 4,
}

const baseForm: JobFormValues = {
  title: "Backend Engineer",
  companyName: "Acme Corp",
  description: "Build things.",
  employmentType: "FullTime",
  experienceLevel: "MidLevel",
  location: "Dhaka",
  workArrangement: "FullRemote",
  requiredSkills: ["C#", "SQL"],
  vacancies: 2,
  expireAt: "2026-12-31",
  city: "Dhaka",
  country: "Bangladesh",
  minOverlapHours: 4,
}

describe("getChangedFields - wizard fields", () => {
  it("returns no wizard field changes when nothing changed", () => {
    const result = getChangedFields(baseJob, baseForm, false)
    expect(result.city).toBeUndefined()
    expect(result.country).toBeUndefined()
    expect(result.minOverlapHours).toBeUndefined()
  })

  it("detects city change", () => {
    const result = getChangedFields(baseJob, { ...baseForm, city: "Chattogram" }, false)
    expect(result.city).toBe("Chattogram")
  })

  it("detects country change", () => {
    const result = getChangedFields(baseJob, { ...baseForm, country: "India" }, false)
    expect(result.country).toBe("India")
  })

  it("detects minOverlapHours change", () => {
    const result = getChangedFields(baseJob, { ...baseForm, minOverlapHours: 8 }, false)
    expect(result.minOverlapHours).toBe(8)
  })

  it("trims city whitespace", () => {
    const result = getChangedFields(baseJob, { ...baseForm, city: "  Chattogram  " }, false)
    expect(result.city).toBe("Chattogram")
  })

  it("trims country whitespace", () => {
    const result = getChangedFields(baseJob, { ...baseForm, country: "  India  " }, false)
    expect(result.country).toBe("India")
  })

  it("detects multiple wizard field changes at once", () => {
    const result = getChangedFields(
      baseJob,
      { ...baseForm, city: "Chattogram", country: "India", minOverlapHours: 6 },
      false
    )
    expect(result.city).toBe("Chattogram")
    expect(result.country).toBe("India")
    expect(result.minOverlapHours).toBe(6)
  })

  it("includes publish flag", () => {
    const result = getChangedFields(baseJob, baseForm, true)
    expect(result.publish).toBe(true)
  })

  it("does not include unchanged fields in result", () => {
    const result = getChangedFields(baseJob, baseForm, false)
    expect(result.title).toBeUndefined()
    expect(result.companyName).toBeUndefined()
    expect(result.employmentType).toBeUndefined()
  })

  it("detects work arrangement change alongside wizard fields", () => {
    const result = getChangedFields(
      baseJob,
      { ...baseForm, workArrangement: "Hybrid", city: "Chattogram", country: "India" },
      false
    )
    expect(result.workArrangement).toBe("Hybrid")
    expect(result.city).toBe("Chattogram")
    expect(result.country).toBe("India")
  })
})
