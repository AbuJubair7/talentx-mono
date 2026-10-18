import { jobFormSchema, getPublishBlockers, getPublishRequirements } from "../types/job-schema"

const validBase = {
  title: "Backend Engineer",
  companyName: "Acme Corp",
  description: "Build and maintain backend services for our platform.",
  location: "Dhaka",
  employmentType: "FullTime" as const,
  experienceLevel: "MidLevel" as const,
  requiredSkills: ["C#"],
  vacancies: 1,
  expireAt: "2099-01-01",
  salaryType: "Negotiable" as const,
  requirements: "- 3-5 years of relevant experience\n- Bachelor's degree or equivalent",
}

describe("jobFormSchema - wizard field conditional validation", () => {
  describe("OnSite work arrangement", () => {
    it("requires city when workArrangement is OnSite", () => {
      const result = jobFormSchema.safeParse({
        ...validBase,
        workArrangement: "OnSite",
        city: "",
        country: "Bangladesh",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const cityError = result.error.issues.find((i) => i.path.includes("city"))
        expect(cityError).toBeDefined()
      }
    })

    it("requires country when workArrangement is OnSite", () => {
      const result = jobFormSchema.safeParse({
        ...validBase,
        workArrangement: "OnSite",
        city: "Dhaka",
        country: "",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const countryError = result.error.issues.find((i) => i.path.includes("country"))
        expect(countryError).toBeDefined()
      }
    })

    it("accepts valid city and country for OnSite", () => {
      const result = jobFormSchema.safeParse({
        ...validBase,
        workArrangement: "OnSite",
        city: "Dhaka",
        country: "Bangladesh",
      })
      expect(result.success).toBe(true)
    })
  })

  describe("Hybrid work arrangement", () => {
    it("requires city when workArrangement is Hybrid", () => {
      const result = jobFormSchema.safeParse({
        ...validBase,
        workArrangement: "Hybrid",
        city: null,
        country: "Bangladesh",
      })
      expect(result.success).toBe(false)
    })

    it("requires country when workArrangement is Hybrid", () => {
      const result = jobFormSchema.safeParse({
        ...validBase,
        workArrangement: "Hybrid",
        city: "Dhaka",
        country: null,
      })
      expect(result.success).toBe(false)
    })

    it("accepts valid city and country for Hybrid", () => {
      const result = jobFormSchema.safeParse({
        ...validBase,
        workArrangement: "Hybrid",
        city: "Chattogram",
        country: "Bangladesh",
      })
      expect(result.success).toBe(true)
    })
  })

  describe("FullRemote work arrangement", () => {
    it("does not require city for FullRemote", () => {
      const result = jobFormSchema.safeParse({
        ...validBase,
        workArrangement: "FullRemote",
        city: undefined,
        country: undefined,
        minOverlapHours: 4,
      })
      expect(result.success).toBe(true)
    })

    it("requires minOverlapHours for FullRemote", () => {
      const result = jobFormSchema.safeParse({
        ...validBase,
        workArrangement: "FullRemote",
        city: undefined,
        country: undefined,
        minOverlapHours: undefined,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const error = result.error.issues.find((i) => i.path.includes("minOverlapHours"))
        expect(error).toBeDefined()
      }
    })

    it("rejects zero minOverlapHours for FullRemote", () => {
      const result = jobFormSchema.safeParse({
        ...validBase,
        workArrangement: "FullRemote",
        city: undefined,
        country: undefined,
        minOverlapHours: 0,
      })
      expect(result.success).toBe(false)
    })

    it("accepts valid minOverlapHours for FullRemote", () => {
      const result = jobFormSchema.safeParse({
        ...validBase,
        workArrangement: "FullRemote",
        city: undefined,
        country: undefined,
        minOverlapHours: 4,
      })
      expect(result.success).toBe(true)
    })
  })

  describe("RemoteButAccessible work arrangement", () => {
    it("does not require city for RemoteButAccessible", () => {
      const result = jobFormSchema.safeParse({
        ...validBase,
        workArrangement: "RemoteButAccessible",
        city: undefined,
        country: undefined,
      })
      expect(result.success).toBe(true)
    })

    it("does not require minOverlapHours for RemoteButAccessible", () => {
      const result = jobFormSchema.safeParse({
        ...validBase,
        workArrangement: "RemoteButAccessible",
        minOverlapHours: undefined,
      })
      expect(result.success).toBe(true)
    })
  })
})

describe("getPublishBlockers - wizard fields", () => {
  const fullRemoteValid = {
    ...validBase,
    workArrangement: "FullRemote" as const,
    minOverlapHours: 4,
  }

  const onSiteValid = {
    ...validBase,
    workArrangement: "OnSite" as const,
    city: "Dhaka",
    country: "Bangladesh",
  }

  it("returns no blockers for valid FullRemote job", () => {
    expect(getPublishBlockers(fullRemoteValid)).toEqual([])
  })

  it("returns no blockers for valid OnSite job", () => {
    expect(getPublishBlockers(onSiteValid)).toEqual([])
  })

  it("blocks publishing when OnSite has no city", () => {
    expect(getPublishBlockers({ ...onSiteValid, city: "" })).toContain("City")
  })

  it("blocks publishing when OnSite has no country", () => {
    expect(getPublishBlockers({ ...onSiteValid, country: "" })).toContain("Country")
  })

  it("blocks publishing when FullRemote has no minOverlapHours", () => {
    expect(getPublishBlockers({ ...fullRemoteValid, minOverlapHours: undefined })).toContain(
      "Minimum overlap hours"
    )
  })

  it("blocks publishing when FullRemote has zero minOverlapHours", () => {
    expect(getPublishBlockers({ ...fullRemoteValid, minOverlapHours: 0 })).toContain(
      "Minimum overlap hours"
    )
  })

  it("does not block city for FullRemote", () => {
    const blockers = getPublishBlockers(fullRemoteValid)
    expect(blockers).not.toContain("City")
  })

  it("does not block minOverlapHours for OnSite", () => {
    const blockers = getPublishBlockers(onSiteValid)
    expect(blockers).not.toContain("Minimum overlap hours")
  })
})

describe("getPublishRequirements - wizard fields", () => {
  it("includes city/country requirements for OnSite", () => {
    const reqs = getPublishRequirements({
      ...validBase,
      workArrangement: "OnSite",
      city: "Dhaka",
      country: "Bangladesh",
    })
    expect(reqs.find((r) => r.label === "City")).toBeDefined()
    expect(reqs.find((r) => r.label === "Country")).toBeDefined()
  })

  it("includes minOverlapHours requirement for FullRemote", () => {
    const reqs = getPublishRequirements({
      ...validBase,
      workArrangement: "FullRemote",
      minOverlapHours: 4,
    })
    expect(reqs.find((r) => r.label === "Minimum overlap hours")).toBeDefined()
  })

  it("does not include city/country for FullRemote", () => {
    const reqs = getPublishRequirements({
      ...validBase,
      workArrangement: "FullRemote",
      minOverlapHours: 4,
    })
    expect(reqs.find((r) => r.label === "City")).toBeUndefined()
    expect(reqs.find((r) => r.label === "Country")).toBeUndefined()
  })

  it("does not include minOverlapHours for OnSite", () => {
    const reqs = getPublishRequirements({
      ...validBase,
      workArrangement: "OnSite",
      city: "Dhaka",
      country: "Bangladesh",
    })
    expect(reqs.find((r) => r.label === "Minimum overlap hours")).toBeUndefined()
  })

  it("marks city as done when city is provided", () => {
    const reqs = getPublishRequirements({
      ...validBase,
      workArrangement: "OnSite",
      city: "Dhaka",
      country: "Bangladesh",
    })
    expect(reqs.find((r) => r.label === "City")?.done).toBe(true)
  })

  it("marks city as not done when city is empty", () => {
    const reqs = getPublishRequirements({
      ...validBase,
      workArrangement: "OnSite",
      city: "",
      country: "Bangladesh",
    })
    expect(reqs.find((r) => r.label === "City")?.done).toBe(false)
  })
})
