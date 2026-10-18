import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"

import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper"
import { useApplyExtractedProfile } from "@/modules/talent-profile/hooks/useApplyExtractedProfile"

import { ReviewExtractedProfileDialog } from "../components/ReviewExtractedProfileDialog"
import type { ResumeExtractionResult } from "../types/resume.types"

jest.mock("@/modules/talent-profile/hooks/useApplyExtractedProfile")
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const mockedUseApplyExtractedProfile = useApplyExtractedProfile as jest.MockedFunction<
  typeof useApplyExtractedProfile
>

const user = userEvent.setup()

const mockExtraction: ResumeExtractionResult = {
  resumeUploadId: "upload-2",
  fullName: "Grace Hopper",
  email: "grace@example.com",
  phone: "+1 555-0200",
  location: "New York, USA",
  tagline: "Compiler Pioneer",
  shortBio: "Inventor of the compiler",
  linkedInUrl: "https://linkedin.com/in/gracehopper",
  portfolioUrls: [],
  workExperience: [
    {
      companyName: "US Navy",
      jobTitle: "Rear Admiral",
      startDate: "1943-01",
      endDate: null,
      isCurrent: true,
    },
  ],
  education: [
    {
      institution: "Yale University",
      degree: "Ph.D. in Mathematics",
      startDate: "1930-01",
      endDate: "1934-01",
    },
  ],
  projects: [],
  technicalSkills: ["Compilers", "COBOL"],
  softSkills: ["Leadership"],
  toolsAndPlatforms: ["UNIVAC"],
  fileStorageKey: "resumes/grace.pdf",
}

describe("ReviewExtractedProfileDialog", () => {
  const mutateAsync = jest.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    jest.clearAllMocks()
    mutateAsync.mockClear()
    mockedUseApplyExtractedProfile.mockReturnValue({
      isPending: false,
      mutateAsync,
    } as unknown as ReturnType<typeof useApplyExtractedProfile>)
  })

  it("does not render when extractionResult is null", () => {
    render(
      <ReviewExtractedProfileDialog
        open={true}
        extractionResult={null}
        onOpenChange={jest.fn()}
      />,
      { wrapper: createQueryWrapper() }
    )

    expect(screen.queryByText(/review extracted profile details/i)).not.toBeInTheDocument()
  })

  it("renders extraction preview when open and extractionResult is present", () => {
    render(
      <ReviewExtractedProfileDialog
        open={true}
        extractionResult={mockExtraction}
        onOpenChange={jest.fn()}
      />,
      { wrapper: createQueryWrapper() }
    )

    expect(screen.getByText(/review extracted profile details/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue("Grace Hopper")).toBeInTheDocument()
  })

  it("calls apply mutation and closes dialog when confirming", async () => {
    const onOpenChange = jest.fn()
    const onApplied = jest.fn()

    render(
      <ReviewExtractedProfileDialog
        open={true}
        extractionResult={mockExtraction}
        onOpenChange={onOpenChange}
        onApplied={onApplied}
      />,
      { wrapper: createQueryWrapper() }
    )

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    await user.click(confirmButton)

    expect(mutateAsync).toHaveBeenCalledWith({
      payload: expect.objectContaining({
        fullName: "Grace Hopper",
        technicalSkills: ["Compilers", "COBOL"],
      }),
    })
    expect(toast.success).toHaveBeenCalledWith("Profile updated from resume.")
    expect(onApplied).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("calls onOpenChange(false) when cancelled", async () => {
    const onOpenChange = jest.fn()

    render(
      <ReviewExtractedProfileDialog
        open={true}
        extractionResult={mockExtraction}
        onOpenChange={onOpenChange}
      />,
      { wrapper: createQueryWrapper() }
    )

    const cancelButton = screen.getByRole("button", { name: "Cancel" })
    await user.click(cancelButton)

    expect(mutateAsync).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
