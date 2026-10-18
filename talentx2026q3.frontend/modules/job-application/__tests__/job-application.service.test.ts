import { apiClient } from "@/lib/api/axios"
import type { ProjectDto } from "@/modules/resumes/types/resume.types"
import { applyToJob, createApplyFormData, jobApplicationService } from "../services/job-application.service"
import type { ApplyToJobPayload, ExtractedProfilePayload } from "../types/application.types"
import type { ApplyPayload } from "../types/job-application.types"

jest.mock("@/lib/api/axios", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}))

const mockedPost = jest.mocked(apiClient.post)
const mockedGet = jest.mocked(apiClient.get)

afterEach(() => {
  jest.clearAllMocks()
})

describe("job-application.service", () => {
  describe("createApplyFormData", () => {
    it("formats FormData with ExtractedProjects and ExtractedProfile", () => {
      const extractedProjects: ProjectDto[] = [
        {
          projectName: "TalentX Platform",
          role: "Frontend Lead",
          projectType: "Professional",
          startDate: "2024-01-01",
          endDate: "2024-12-31",
          isOngoing: false,
          description: "Built candidate application flows",
          technologiesUsed: ["Next.js", "TypeScript"],
          projectUrl: "https://talentx.example.com",
        },
      ]

      const extractedProfile: ExtractedProfilePayload = {
        tagline: "Senior Full Stack Engineer",
        shortBio: "Passionate about building scalable systems",
        phone: "+1-555-0199",
        linkedInUrl: "https://linkedin.com/in/johndoe",
        portfolioUrls: ["https://johndoe.dev"],
        skillPropositions: ["React", "Node.js"],
      }

      const payload: ApplyToJobPayload = {
        applicantName: "John Doe",
        applicantEmail: "john@example.com",
        coverLetter: "I am interested in this role.",
        expectedSalary: 120000,
        totalYearsExperience: 5,
        location: "New York, USA",
        extractedProjects,
        extractedProfile,
      }

      const formData = createApplyFormData(payload)

      expect(formData.get("ApplicantName")).toBe("John Doe")
      expect(formData.get("ApplicantEmail")).toBe("john@example.com")
      expect(formData.get("CoverLetter")).toBe("I am interested in this role.")
      expect(formData.get("ExpectedSalary")).toBe("120000")
      expect(formData.get("TotalYearsExperience")).toBe("5")
      expect(formData.get("Location")).toBe("New York, USA")
      expect(formData.get("ExtractedProjects")).toBe(JSON.stringify(extractedProjects))
      expect(formData.get("ExtractedProfile")).toBe(JSON.stringify(extractedProfile))
    })

    it("appends raw string for ExtractedProfile when provided as a string", () => {
      const stringifiedProfile = JSON.stringify({ tagline: "Software Engineer" })
      const payload: ApplyToJobPayload = {
        applicantName: "Jane Smith",
        applicantEmail: "jane@example.com",
        coverLetter: "Cover letter text.",
        expectedSalary: 95000,
        totalYearsExperience: 3,
        extractedProfile: stringifiedProfile,
      }

      const formData = createApplyFormData(payload)

      expect(formData.get("ExtractedProfile")).toBe(stringifiedProfile)
    })

    it("omits ExtractedProjects and ExtractedProfile when not provided", () => {
      const payload: ApplyToJobPayload = {
        applicantName: "Jane Smith",
        applicantEmail: "jane@example.com",
        coverLetter: "Cover letter text.",
        expectedSalary: 95000,
        totalYearsExperience: 3,
      }

      const formData = createApplyFormData(payload)

      expect(formData.get("ExtractedProjects")).toBeNull()
      expect(formData.get("ExtractedProfile")).toBeNull()
    })
  })

  describe("applyToJob", () => {
    it("posts FormData with ExtractedProjects and ExtractedProfile to /Jobs/:jobId/apply", async () => {
      const mockResponse = {
        applicationId: "app-456",
        jobId: "job-123",
      }
      mockedPost.mockResolvedValueOnce({ data: mockResponse })

      const extractedProjects: ProjectDto[] = [
        {
          projectName: "AI Resume Scanner",
          role: "Developer",
        },
      ]

      const extractedProfile: ExtractedProfilePayload = {
        tagline: "AI Enthusiast",
        phone: "+8801700000000",
      }

      const payload: ApplyToJobPayload = {
        applicantName: "Rahim Ali",
        applicantEmail: "rahim@example.com",
        coverLetter: "Excited to apply.",
        expectedSalary: 80000,
        totalYearsExperience: 2,
        extractedProjects,
        extractedProfile,
      }

      const result = await applyToJob("job-123", payload)

      expect(mockedPost).toHaveBeenCalledTimes(1)
      const [url, body] = mockedPost.mock.calls[0]
      expect(url).toBe("/Jobs/job-123/apply")
      expect(body).toBeInstanceOf(FormData)

      const formData = body as FormData
      expect(formData.get("ApplicantName")).toBe("Rahim Ali")
      expect(formData.get("ApplicantEmail")).toBe("rahim@example.com")
      expect(formData.get("ExtractedProjects")).toBe(JSON.stringify(extractedProjects))
      expect(formData.get("ExtractedProfile")).toBe(JSON.stringify(extractedProfile))
      expect(result).toEqual(mockResponse)
    })

    it("passes through existing FormData directly without re-wrapping", async () => {
      const existingFormData = new FormData()
      existingFormData.append("ApplicantName", "Existing User")

      mockedPost.mockResolvedValueOnce({ data: { applicationId: "app-1", jobId: "job-1" } })

      await applyToJob("job-1", existingFormData)

      expect(mockedPost).toHaveBeenCalledTimes(1)
      const [url, body] = mockedPost.mock.calls[0]
      expect(url).toBe("/Jobs/job-1/apply")
      expect(body).toBe(existingFormData)
    })
  })

  describe("jobApplicationService", () => {
    it("getPrefill calls GET /talents/me/application-prefill", async () => {
      const mockPrefill = {
        fullName: "Test Talent",
        email: "talent@example.com",
        phone: null,
        location: "Dhaka",
        currentJobTitle: "Dev",
        yearsOfExperience: 3,
        primarySkill: "C#",
        secondarySkills: [],
        resumes: [],
      }
      mockedGet.mockResolvedValueOnce({ data: mockPrefill })

      const result = await jobApplicationService.getPrefill()

      expect(mockedGet).toHaveBeenCalledWith("/talents/me/application-prefill", { signal: undefined })
      expect(result).toEqual(mockPrefill)
    })

    it("uploadApplicationResume posts FormData with file to /jobs/application-resumes", async () => {
      const mockUploadResponse = {
        storageKey: "resumes/test.pdf",
        originalFileName: "test.pdf",
        fileSizeBytes: 1024,
      }
      mockedPost.mockResolvedValueOnce({ data: mockUploadResponse })

      const file = new File(["dummy content"], "test.pdf", { type: "application/pdf" })
      const result = await jobApplicationService.uploadApplicationResume(file)

      expect(mockedPost).toHaveBeenCalledTimes(1)
      const [url, body, config] = mockedPost.mock.calls[0]
      expect(url).toBe("/jobs/application-resumes")
      expect(body).toBeInstanceOf(FormData)
      expect((body as FormData).get("file")).toBe(file)
      expect(config).toEqual({ headers: { "Content-Type": "multipart/form-data" } })
      expect(result).toEqual(mockUploadResponse)
    })

    it("submitApplication calls POST /jobs/:jobId/applications with payload", async () => {
      const mockSubmitted = {
        id: "app-789",
        jobId: "job-123",
        status: "Applied",
        appliedAt: "2026-10-12T00:00:00Z",
      }
      mockedPost.mockResolvedValueOnce({ data: mockSubmitted })

      const payload: ApplyPayload = {
        applicantName: "Candidate",
        applicantEmail: "candidate@example.com",
        resumeStorageKey: "resumes/resume.pdf",
      }

      const result = await jobApplicationService.submitApplication("job-123", payload)

      expect(mockedPost).toHaveBeenCalledWith("/jobs/job-123/applications", payload)
      expect(result).toEqual(mockSubmitted)
    })
  })
})
