import type { ResumeExtractionResult } from "@/modules/resumes/types/resume.types"

import { buildApplyExtractionPayload } from "../utils/build-apply-extraction-payload"

const baseExtraction: ResumeExtractionResult = {
  resumeUploadId: "upload-1",
  fullName: "Ada Lovelace",
  tagline: "First Computer Programmer",
  shortBio: "Pioneering mathematician and writer.",
  email: "ada@example.com",
  phone: "+1000000000",
  location: "London",
  linkedInUrl: "https://linkedin.com/in/ada",
  portfolioUrls: ["https://ada.dev"],
  workExperience: [
    { companyName: "Acme", jobTitle: "Engineer", startDate: "Jan 2020", endDate: "Present", isCurrent: true },
  ],
  education: [{ institution: "MIT", degree: "B.S.", startDate: "2016", endDate: "2020" }],
  technicalSkills: ["TypeScript"],
  softSkills: ["Communication"],
  toolsAndPlatforms: ["Docker"],
  fileStorageKey: "resumes/user-1/upload-1_resume.pdf",
}

describe("buildApplyExtractionPayload", () => {
  it("maps profile fields, skills, work experience, and education", () => {
    const payload = buildApplyExtractionPayload(baseExtraction)

    expect(payload).toEqual({
      fullName: "Ada Lovelace",
      tagline: "First Computer Programmer",
      shortBio: "Pioneering mathematician and writer.",
      location: "London",
      phone: "+1000000000",
      linkedInUrl: "https://linkedin.com/in/ada",
      additionalUrls: ["https://ada.dev"],
      technicalSkills: ["TypeScript"],
      softSkills: ["Communication"],
      toolsAndPlatforms: ["Docker"],
      workExperiences: [
        { companyName: "Acme", jobTitle: "Engineer", startDate: "Jan 2020", endDate: null, isCurrent: true },
      ],
      educations: [{ institution: "MIT", degree: "B.S.", startDate: "2016", endDate: "2020" }],
    })
  })

  it("excludes email and resume-file-metadata fields present on the extraction result", () => {
    const payload = buildApplyExtractionPayload(baseExtraction)

    expect(payload).not.toHaveProperty("email")
    expect(payload).not.toHaveProperty("fileStorageKey")
    expect(payload).not.toHaveProperty("resumeUploadId")
    expect(payload).not.toHaveProperty("resumeStorageKey")
    expect(payload).not.toHaveProperty("resumeOriginalFileName")
    expect(payload).not.toHaveProperty("resumeContentType")
    expect(payload).not.toHaveProperty("resumeSizeBytes")
  })

  it("handles whitespace and null optional profile fields properly", () => {
    const extractionWithEmptyFields: ResumeExtractionResult = {
      ...baseExtraction,
      fullName: "   ",
      tagline: "   ",
      shortBio: "",
      location: null,
      phone: "   ",
      linkedInUrl: "  ",
      portfolioUrls: ["  ", "https://valid.com", ""],
    }

    const payload = buildApplyExtractionPayload(extractionWithEmptyFields)

    expect(payload.fullName).toBeNull()
    expect(payload.tagline).toBeNull()
    expect(payload.shortBio).toBeNull()
    expect(payload.location).toBeNull()
    expect(payload.phone).toBeNull()
    expect(payload.linkedInUrl).toBeNull()
    expect(payload.additionalUrls).toEqual(["https://valid.com"])
  })

  it("drops work experience rows missing a required field", () => {
    const extraction: ResumeExtractionResult = {
      ...baseExtraction,
      workExperience: [
        { companyName: "", jobTitle: "Engineer", startDate: null, endDate: null, isCurrent: false },
        { companyName: "Acme", jobTitle: "", startDate: null, endDate: null, isCurrent: false },
        { companyName: "Acme", jobTitle: "Engineer", startDate: null, endDate: null, isCurrent: false },
      ],
    }

    const payload = buildApplyExtractionPayload(extraction)

    expect(payload.workExperiences).toEqual([
      { companyName: "Acme", jobTitle: "Engineer", startDate: null, endDate: null, isCurrent: false },
    ])
  })

  it("drops education rows missing a required field", () => {
    const extraction: ResumeExtractionResult = {
      ...baseExtraction,
      education: [
        { institution: "", degree: "B.S.", startDate: null, endDate: null },
        { institution: "MIT", degree: "", startDate: null, endDate: null },
      ],
    }

    const payload = buildApplyExtractionPayload(extraction)

    expect(payload.educations).toEqual([])
  })

  it("clears endDate for a current work experience even if the model returned one", () => {
    const extraction: ResumeExtractionResult = {
      ...baseExtraction,
      workExperience: [
        { companyName: "Acme", jobTitle: "Engineer", startDate: "Jan 2020", endDate: "Dec 2022", isCurrent: true },
      ],
    }

    const payload = buildApplyExtractionPayload(extraction)

    expect(payload.workExperiences[0].endDate).toBeNull()
  })

  it("resolves linkedInUrl from portfolioUrls when linkedInUrl is empty and excludes it from additionalUrls", () => {
    const extractionWithLinkedInInPortfolio: ResumeExtractionResult = {
      ...baseExtraction,
      linkedInUrl: "",
      portfolioUrls: ["https://linkedin.com/in/johndoe", "https://johndoe.dev"],
    }

    const payload = buildApplyExtractionPayload(extractionWithLinkedInInPortfolio)

    expect(payload.linkedInUrl).toBe("https://linkedin.com/in/johndoe")
    expect(payload.additionalUrls).toEqual(["https://johndoe.dev"])
  })

  it("maps and filters projects array properly in payload", () => {
    const extractionWithProjects: ResumeExtractionResult = {
      ...baseExtraction,
      projects: [
        {
          projectName: "Distributed KV Store",
          role: "Backend Architect",
          projectType: "Personal",
          startDate: "Jan 2023",
          endDate: "Dec 2023",
          isOngoing: false,
          description: "Raft consensus implementation.",
          technologiesUsed: ["Rust", "Raft"],
          projectUrl: "https://github.com/example/raft",
        },
        {
          projectName: "AI Resume Parser",
          role: "Lead Engineer",
          projectType: "UnknownCustomType",
          startDate: "Mar 2024",
          endDate: "Aug 2024",
          isOngoing: true,
          description: "LLM extraction pipeline.",
          technologiesUsed: ["Python"],
          projectUrl: null,
        },
        // Incomplete rows that must be dropped:
        { projectName: "", role: "Dev", startDate: "2023", description: "Desc" },
        { projectName: "Proj", role: "", startDate: "2023", description: "Desc" },
        { projectName: "Proj", role: "Dev", startDate: "", description: "Desc" },
        { projectName: "Proj", role: "Dev", startDate: "2023", description: "" },
      ],
    }

    const payload = buildApplyExtractionPayload(extractionWithProjects)

    expect(payload.projects).toEqual([
      {
        projectName: "Distributed KV Store",
        role: "Backend Architect",
        projectType: "Personal",
        startDate: "Jan 2023",
        endDate: "Dec 2023",
        isOngoing: false,
        description: "Raft consensus implementation.",
        technologiesUsed: ["Rust", "Raft"],
        projectUrl: "https://github.com/example/raft",
      },
      {
        projectName: "AI Resume Parser",
        role: "Lead Engineer",
        projectType: "Professional", // Fallback to Professional for unknown type
        startDate: "Mar 2024",
        endDate: null, // Cleared because isOngoing is true
        isOngoing: true,
        description: "LLM extraction pipeline.",
        technologiesUsed: ["Python"],
        projectUrl: null,
      },
    ])
  })
})
