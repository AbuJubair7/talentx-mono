import { initializeFormData } from "../utils/initialize-form-data"
import type { ResumeExtractionResult } from "../types/resume.types"

describe("initializeFormData", () => {
  const baseExtraction: ResumeExtractionResult = {
    resumeUploadId: "upload-1",
    fullName: "Ada Lovelace",
    email: "ada@example.com",
    phone: null,
    location: null,
    tagline: null,
    shortBio: null,
    linkedInUrl: null,
    portfolioUrls: [],
    workExperience: [],
    education: [],
    projects: [],
    technicalSkills: [],
    softSkills: [],
    toolsAndPlatforms: [],
    fileStorageKey: "resumes/user-1/file.pdf",
  }

  it("populates default empty arrays and trims fields properly", () => {
    const initializedForm = initializeFormData(baseExtraction)

    expect(initializedForm.portfolioUrls).toEqual([])
    expect(initializedForm.workExperience).toEqual([])
    expect(initializedForm.education).toEqual([])
    expect(initializedForm.projects).toEqual([])
    expect(initializedForm.technicalSkills).toEqual([])
    expect(initializedForm.softSkills).toEqual([])
    expect(initializedForm.toolsAndPlatforms).toEqual([])
    expect(initializedForm.linkedInUrl).toBe("")
  })

  it("extracts LinkedIn URL from portfolioUrls if linkedInUrl is null", () => {
    const inputWithLinkedInInPortfolio: ResumeExtractionResult = {
      ...baseExtraction,
      portfolioUrls: ["https://linkedin.com/in/ada-port", "https://ada.dev"],
    }

    const initializedForm = initializeFormData(inputWithLinkedInInPortfolio)

    expect(initializedForm.linkedInUrl).toBe("https://linkedin.com/in/ada-port")
    expect(initializedForm.portfolioUrls).toEqual([
      "https://linkedin.com/in/ada-port",
      "https://ada.dev",
    ])
  })

  it("prefers explicit linkedInUrl over portfolioUrls match", () => {
    const inputWithBoth: ResumeExtractionResult = {
      ...baseExtraction,
      linkedInUrl: "https://linkedin.com/in/ada-explicit",
      portfolioUrls: ["https://linkedin.com/in/ada-port"],
    }

    const initializedForm = initializeFormData(inputWithBoth)

    expect(initializedForm.linkedInUrl).toBe("https://linkedin.com/in/ada-explicit")
  })
})
