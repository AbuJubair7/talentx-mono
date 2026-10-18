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
}

const baseValues: JobFormValues = {
  title: baseJob.title,
  companyName: baseJob.companyName,
  description: baseJob.description,
  location: baseJob.location,
  employmentType: baseJob.employmentType,
  experienceLevel: baseJob.experienceLevel,
  workArrangement: baseJob.workArrangement,
  requiredSkills: [...baseJob.requiredSkills],
  vacancies: baseJob.vacancies,
  expireAt: baseJob.expireAt.slice(0, 10),
}

describe("getChangedFields", () => {
  it("returns only publish when nothing changed", () => {
    const result = getChangedFields(baseJob, baseValues, false)
    expect(result).toEqual({ publish: false })
  })

  it("includes a scalar field that changed", () => {
    const result = getChangedFields(baseJob, { ...baseValues, title: "Staff Engineer" }, false)
    expect(result).toEqual({ publish: false, title: "Staff Engineer" })
  })

  it("does not flag skills that were only reordered", () => {
    const result = getChangedFields(
      baseJob,
      { ...baseValues, requiredSkills: ["SQL", "C#"] },
      false
    )
    expect(result).toEqual({ publish: false })
  })

  it("flags skills that were actually added or removed", () => {
    const result = getChangedFields(
      baseJob,
      { ...baseValues, requiredSkills: ["C#", "SQL", "Docker"] },
      false
    )
    expect(result).toEqual({ publish: false, requiredSkills: ["C#", "SQL", "Docker"] })
  })

  it("always includes publish explicitly, based on the action taken", () => {
    const result = getChangedFields(baseJob, baseValues, true)
    expect(result).toEqual({ publish: true })
  })

  it("includes companyName when it changed", () => {
    const result = getChangedFields(baseJob, { ...baseValues, companyName: "Globex" }, false)
    expect(result).toEqual({ publish: false, companyName: "Globex" })
  })

  it("does not flag expireAt when the date is unchanged", () => {
    const result = getChangedFields(baseJob, baseValues, false)
    expect(result.expireAt).toBeUndefined()
  })

  it("flags expireAt as an ISO string when the date changed", () => {
    const result = getChangedFields(baseJob, { ...baseValues, expireAt: "2027-01-15" }, false)
    expect(result.expireAt).toBe(new Date("2027-01-15").toISOString())
  })
})
