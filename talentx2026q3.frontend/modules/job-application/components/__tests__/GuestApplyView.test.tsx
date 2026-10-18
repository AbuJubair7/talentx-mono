import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useRouter } from "next/navigation"

import { useJobDetails } from "@/modules/job-listing/hooks/useJobDetails"
import type { ResumeExtractionResult } from "@/modules/resumes/types/resume.types"
import { useApplyToJob } from "../../hooks/useApplyToJob"
import { GuestApplyView } from "../GuestApplyView"

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

jest.mock("../ApplyLoginWarningDialog", () => ({
  ApplyLoginWarningDialog: () => null,
}))

jest.mock("@/modules/job-listing/hooks/useJobDetails", () => ({
  useJobDetails: jest.fn(),
}))

jest.mock("../../hooks/useApplyToJob", () => ({
  useApplyToJob: jest.fn(),
}))

jest.mock("@/modules/resumes/components/ResumeUploadDropzone", () => ({
  ResumeUploadDropzone: ({
    onExtractionSuccess,
  }: {
    onExtractionSuccess: (extractionResult: ResumeExtractionResult, file: File) => void
  }) => (
    <button
      type="button"
      data-testid="mock-upload-dropzone"
      onClick={() =>
        onExtractionSuccess(
          mockResumeExtraction,
          new File(["binary content"], "alice-resume.pdf", { type: "application/pdf" })
        )
      }
    >
      Upload Resume
    </button>
  ),
}))

jest.mock("@/modules/resumes/components/ExtractedProfileReview", () => ({
  ExtractedProfileReview: ({
    onConfirm,
  }: {
    onConfirm: (extractionResult: ResumeExtractionResult) => void
  }) => (
    <button
      type="button"
      data-testid="mock-confirm-preview"
      onClick={() => onConfirm(mockResumeExtraction)}
    >
      Confirm Resume
    </button>
  ),
}))

const mockedUseJobDetails = useJobDetails as jest.Mock
const mockedUseApplyToJob = useApplyToJob as jest.Mock
const mockedUseRouter = useRouter as jest.Mock

const mockResumeExtraction: ResumeExtractionResult = {
  resumeUploadId: "upload-abc",
  fullName: "Alice Developer",
  tagline: "Lead Full Stack Engineer",
  shortBio: "Building scalable platforms for 8 years",
  email: "alice@example.com",
  phone: "+1-202-555-0143",
  location: "San Francisco, CA",
  linkedInUrl: "https://linkedin.com/in/alicedev",
  portfolioUrls: ["https://alice.dev"],
  technicalSkills: ["TypeScript", "Python"],
  softSkills: ["Leadership"],
  toolsAndPlatforms: ["AWS", "Docker"],
  workExperience: [
    {
      companyName: "TechCorp",
      jobTitle: "Senior Engineer",
      startDate: "2020-01-01",
      endDate: null,
      isCurrent: true,
    },
  ],
  education: [
    {
      institution: "Stanford",
      degree: "B.S. CS",
      startDate: "2012-09-01",
      endDate: "2016-06-01",
    },
  ],
  projects: [
    {
      projectName: "TalentX Platform",
      role: "Lead Developer",
      projectType: "Full-time",
      startDate: "2023-01-01",
      endDate: null,
      isOngoing: true,
      description: "Recruitment marketplace",
      technologiesUsed: ["Next.js", "C#"],
      projectUrl: "https://talentx.example.com",
    },
  ],
  fileStorageKey: "resumes/alice.pdf",
}

describe("GuestApplyView", () => {
  const mockMutate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseRouter.mockReturnValue({ push: jest.fn() })
    mockedUseJobDetails.mockReturnValue({
      data: {
        id: "job-101",
        title: "Senior Software Engineer",
        status: "Published",
        workArrangement: "Remote",
      },
      isPending: false,
      isError: false,
    })
    mockedUseApplyToJob.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      reset: jest.fn(),
    })
  })

  it("submits application with extractedProfile and extractedProjects when resume is confirmed", async () => {
    render(<GuestApplyView jobId="job-101" />)

    fireEvent.click(screen.getByTestId("mock-upload-dropzone"))
    fireEvent.click(screen.getByTestId("mock-confirm-preview"))

    expect(screen.getByDisplayValue("Alice Developer")).toBeInTheDocument()
    expect(screen.getByDisplayValue("alice@example.com")).toBeInTheDocument()

    const expectedSalaryInput = screen.getByLabelText(/Expected Salary/i)
    fireEvent.change(expectedSalaryInput, { target: { value: "150000" } })

    const experienceInput = screen.getByLabelText(/Total Years of Experience/i)
    fireEvent.change(experienceInput, { target: { value: "8" } })

    const coverLetterInput = screen.getByLabelText(/Cover Letter/i)
    fireEvent.change(coverLetterInput, {
      target: { value: "I am excited to apply for this Senior Software Engineer role." },
    })

    fireEvent.click(screen.getByRole("button", { name: /Submit application/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1)
    })

    const mutationCall = mockMutate.mock.calls[0][0]
    expect(mutationCall.jobId).toBe("job-101")
    expect(mutationCall.payload.applicantName).toBe("Alice Developer")
    expect(mutationCall.payload.applicantEmail).toBe("alice@example.com")
    expect(mutationCall.payload.expectedSalary).toBe(150000)
    expect(mutationCall.payload.totalYearsExperience).toBe(8)
    expect(mutationCall.payload.coverLetter).toBe(
      "I am excited to apply for this Senior Software Engineer role."
    )

    expect(mutationCall.payload.extractedProjects).toEqual(mockResumeExtraction.projects)
    expect(mutationCall.payload.extractedProfile).toEqual({
      tagline: "Lead Full Stack Engineer",
      shortBio: "Building scalable platforms for 8 years",
      phone: "+1-202-555-0143",
      linkedInUrl: "https://linkedin.com/in/alicedev",
      portfolioUrls: ["https://alice.dev"],
    })
  })

  it("submits application without extractedProfile or extractedProjects when resume is skipped", async () => {
    render(<GuestApplyView jobId="job-101" />)

    const skipButton = screen.getByRole("button", { name: /Skip for now — continue without a resume/i })
    fireEvent.click(skipButton)

    fireEvent.change(screen.getByLabelText(/^Name/i), { target: { value: "Bob Candidate" } })
    fireEvent.change(screen.getByLabelText(/^Email/i), { target: { value: "bob@example.com" } })
    fireEvent.change(screen.getByLabelText(/Expected Salary/i), { target: { value: "120000" } })
    fireEvent.change(screen.getByLabelText(/Total Years of Experience/i), { target: { value: "4" } })
    fireEvent.change(screen.getByLabelText(/Cover Letter/i), {
      target: { value: "Hello, I am applying for this role directly." },
    })

    fireEvent.click(screen.getByRole("button", { name: /Submit application/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1)
    })

    const mutationCall = mockMutate.mock.calls[0][0]
    expect(mutationCall.jobId).toBe("job-101")
    expect(mutationCall.payload.applicantName).toBe("Bob Candidate")
    expect(mutationCall.payload.applicantEmail).toBe("bob@example.com")
    expect(mutationCall.payload.extractedProjects).toBeUndefined()
    expect(mutationCall.payload.extractedProfile).toBeUndefined()
  })
})
