import { apiClient } from "@/lib/api/axios"
import type { ResumeExtractionResult } from "@/modules/resumes/types/resume.types"

import { talentProfileService } from "../services/talent-profile.service"
import type { ApplyExtractedProfilePayload } from "../types/talent-profile.types"

// Mock the HTTP client so no real network call happens and we can assert
// exactly what the service posts — in particular the multipart field names
// (`file`, `payload`), which are a wire contract shared with the backend and
// must not silently drift.
jest.mock("@/lib/api/axios", () => ({
  apiClient: { post: jest.fn() },
}))

const mockedPost = jest.mocked(apiClient.post)

afterEach(() => {
  jest.clearAllMocks()
})

describe("talentProfileService", () => {
  describe("extractResume", () => {
    it("posts the file as multipart/form-data under the 'file' field to /talents/me/resume/extract", async () => {
      const extractionResult: ResumeExtractionResult = {
        resumeUploadId: "upload-1",
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        phone: null,
        location: null,
        linkedInUrl: null,
        portfolioUrls: [],
        workExperience: [],
        education: [],
        technicalSkills: ["TypeScript"],
        softSkills: [],
        toolsAndPlatforms: [],
        fileStorageKey: "",
      }
      mockedPost.mockResolvedValueOnce({ data: extractionResult })

      const file = new File(["binary"], "resume.pdf", { type: "application/pdf" })
      const result = await talentProfileService.extractResume(file)

      expect(mockedPost).toHaveBeenCalledTimes(1)
      const [url, body, config] = mockedPost.mock.calls[0]
      expect(url).toBe("/talents/me/resume/extract")
      expect(body).toBeInstanceOf(FormData)
      expect((body as FormData).get("file")).toBe(file)
      // No manual Content-Type override — axios/the browser must generate
      // the boundary-included multipart header itself.
      expect(config).toBeUndefined()
      expect(result).toEqual(extractionResult)
    })
  })

  describe("applyExtractedProfile", () => {
    it("posts a FormData with 'file' (the raw File) and 'payload' (JSON-stringified) to /talents/me/profile/apply-extraction", async () => {
      const payload: ApplyExtractedProfilePayload = {
        technicalSkills: ["TypeScript"],
        softSkills: ["Communication"],
        toolsAndPlatforms: ["Docker"],
        workExperiences: [
          { companyName: "Acme", jobTitle: "Engineer", startDate: "Jan 2020", endDate: null, isCurrent: true },
        ],
        educations: [{ institution: "MIT", degree: "B.S.", startDate: "2016", endDate: "2020" }],
      }
      mockedPost.mockResolvedValueOnce({ data: undefined })

      const resumeFile = new File(["binary"], "resume.pdf", { type: "application/pdf" })
      await talentProfileService.applyExtractedProfile(payload, resumeFile)

      expect(mockedPost).toHaveBeenCalledTimes(1)
      const [url, body, config] = mockedPost.mock.calls[0]
      expect(url).toBe("/talents/me/profile/apply-extraction")
      expect(body).toBeInstanceOf(FormData)

      const formData = body as FormData
      expect(formData.get("file")).toBe(resumeFile)

      const payloadField = formData.get("payload")
      expect(typeof payloadField).toBe("string")
      expect(JSON.parse(payloadField as string)).toEqual(payload)

      // No manual Content-Type override — axios/the browser must generate
      // the boundary-included multipart header itself.
      expect(config).toBeUndefined()
    })

    it("does not send the resume-file-metadata fields inside the JSON payload (the file itself is resubmitted as raw bytes instead)", async () => {
      const payload: ApplyExtractedProfilePayload = {
        technicalSkills: [],
        softSkills: [],
        toolsAndPlatforms: [],
        workExperiences: [],
        educations: [],
      }
      mockedPost.mockResolvedValueOnce({ data: undefined })

      const resumeFile = new File(["binary"], "resume.pdf", { type: "application/pdf" })
      await talentProfileService.applyExtractedProfile(payload, resumeFile)

      const [, body] = mockedPost.mock.calls[0]
      const payloadField = JSON.parse((body as FormData).get("payload") as string)

      expect(payloadField).not.toHaveProperty("resumeStorageKey")
      expect(payloadField).not.toHaveProperty("resumeOriginalFileName")
      expect(payloadField).not.toHaveProperty("resumeContentType")
      expect(payloadField).not.toHaveProperty("resumeSizeBytes")
    })
  })
})
