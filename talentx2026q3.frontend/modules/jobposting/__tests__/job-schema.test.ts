import { jobFormSchema, getPublishBlockers } from "../types/job-schema"

const validValues = {
  title: "Backend Engineer",
  companyName: "Acme Corp",
  description: "Build and maintain backend services for our platform.",
  location: "Dhaka",
  employmentType: "FullTime" as const,
  experienceLevel: "MidLevel" as const,
  workArrangement: "FullRemote" as const,
  requiredSkills: ["C#"],
  vacancies: 1,
  expireAt: "2099-01-01",
  city: "Dhaka",
  country: "Bangladesh",
  minOverlapHours: 4,
  salaryType: "Negotiable" as const,
  requirements: "- 3-5 years of relevant experience\n- Bachelor's degree or equivalent",
}

describe("jobFormSchema", () => {
  it("accepts a minimal valid draft with zero vacancies and no skills", () => {
    const result = jobFormSchema.safeParse({ ...validValues, vacancies: 0, requiredSkills: [] })
    expect(result.success).toBe(true)
  })

  it("rejects a missing title", () => {
    const result = jobFormSchema.safeParse({ ...validValues, title: "" })
    expect(result.success).toBe(false)
  })

  it("rejects a title over 200 characters", () => {
    const result = jobFormSchema.safeParse({ ...validValues, title: "a".repeat(201) })
    expect(result.success).toBe(false)
  })

  it("rejects a title under 5 characters", () => {
    const result = jobFormSchema.safeParse({ ...validValues, title: "QA" })
    expect(result.success).toBe(false)
  })

  it("rejects a title that starts with a digit", () => {
    const result = jobFormSchema.safeParse({ ...validValues, title: "1 QA Engineer" })
    expect(result.success).toBe(false)
  })

  it("accepts a title that contains digits but doesn't start with one", () => {
    const result = jobFormSchema.safeParse({ ...validValues, title: "Software Engineer L1" })
    expect(result.success).toBe(true)
  })

  it("rejects a negative vacancies count", () => {
    const result = jobFormSchema.safeParse({ ...validValues, vacancies: -1 })
    expect(result.success).toBe(false)
  })

  it("rejects a location under 5 characters", () => {
    const result = jobFormSchema.safeParse({ ...validValues, location: "NY" })
    expect(result.success).toBe(false)
  })

  it("rejects a purely numeric location", () => {
    const result = jobFormSchema.safeParse({ ...validValues, location: "12345" })
    expect(result.success).toBe(false)
  })

  it("accepts a location that mixes letters and digits", () => {
    const result = jobFormSchema.safeParse({ ...validValues, location: "Dhaka-1205" })
    expect(result.success).toBe(true)
  })

  it("rejects a description under 20 characters", () => {
    const result = jobFormSchema.safeParse({ ...validValues, description: "Too short." })
    expect(result.success).toBe(false)
  })

  it("rejects a description that is all whitespace", () => {
    const result = jobFormSchema.safeParse({ ...validValues, description: "                    " })
    expect(result.success).toBe(false)
  })

  it("rejects a description that is a single number", () => {
    const result = jobFormSchema.safeParse({ ...validValues, description: "1" })
    expect(result.success).toBe(false)
  })

  it("rejects a title made entirely of punctuation", () => {
    const result = jobFormSchema.safeParse({ ...validValues, title: '""""""""' })
    expect(result.success).toBe(false)
  })

  it("rejects a description made entirely of punctuation and spaces", () => {
    const result = jobFormSchema.safeParse({
      ...validValues,
      description: "''''''''            ''''''''''''''''''''",
    })
    expect(result.success).toBe(false)
  })

  it("rejects a company name under 2 characters", () => {
    const result = jobFormSchema.safeParse({ ...validValues, companyName: "A" })
    expect(result.success).toBe(false)
  })

  it("rejects a company name made entirely of punctuation", () => {
    const result = jobFormSchema.safeParse({ ...validValues, companyName: "----" })
    expect(result.success).toBe(false)
  })

  it("accepts a short real-world company name", () => {
    const result = jobFormSchema.safeParse({ ...validValues, companyName: "IBM" })
    expect(result.success).toBe(true)
  })

  it("rejects an empty expire date", () => {
    const result = jobFormSchema.safeParse({ ...validValues, expireAt: "" })
    expect(result.success).toBe(false)
  })

  it("rejects an expire date in the past", () => {
    const result = jobFormSchema.safeParse({ ...validValues, expireAt: "2020-01-01" })
    expect(result.success).toBe(false)
  })

  it("accepts an expire date in the future", () => {
    const result = jobFormSchema.safeParse({ ...validValues, expireAt: "2099-06-15" })
    expect(result.success).toBe(true)
  })

  it("rejects a skill that is a single digit", () => {
    const result = jobFormSchema.safeParse({ ...validValues, requiredSkills: ["1"] })
    expect(result.success).toBe(false)
  })

  it("rejects a skill made entirely of punctuation", () => {
    const result = jobFormSchema.safeParse({ ...validValues, requiredSkills: ['""""'] })
    expect(result.success).toBe(false)
  })

  it("accepts a single-letter skill", () => {
    const result = jobFormSchema.safeParse({ ...validValues, requiredSkills: ["R"] })
    expect(result.success).toBe(true)
  })
})

describe("getPublishBlockers", () => {
  it("returns no blockers for a fully valid, publishable job", () => {
    expect(getPublishBlockers(validValues)).toEqual([])
  })

  it("blocks publishing when vacancies is zero", () => {
    expect(getPublishBlockers({ ...validValues, vacancies: 0 })).toContain(
      "Vacancies (must be greater than 0)"
    )
  })

  it("blocks publishing when there are no required skills", () => {
    expect(getPublishBlockers({ ...validValues, requiredSkills: [] })).toContain(
      "Required skills"
    )
  })

  it("blocks publishing when title is blank/whitespace", () => {
    expect(getPublishBlockers({ ...validValues, title: "   " })).toContain("Title")
  })

  it("blocks publishing when company name is blank", () => {
    expect(getPublishBlockers({ ...validValues, companyName: "" })).toContain("Company name")
  })

  it("blocks publishing when expire date is in the past", () => {
    expect(getPublishBlockers({ ...validValues, expireAt: "2020-01-01" })).toContain(
      "Expire date (must be today or in the future)"
    )
  })
})
