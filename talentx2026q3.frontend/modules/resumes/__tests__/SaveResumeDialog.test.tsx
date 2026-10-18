import { useState } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"

import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper"
import { useApplyExtractedProfile } from "@/modules/talent-profile/hooks/useApplyExtractedProfile"

import { SaveResumeDialog } from "../components/SaveResumeDialog"
import { useSaveResume } from "../hooks/useSaveResume"
import type { ResumeExtractionResult } from "../types/resume.types"

jest.mock("../hooks/useSaveResume")
jest.mock("@/modules/talent-profile/hooks/useApplyExtractedProfile")
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}))

const mockedUseSaveResume = useSaveResume as jest.MockedFunction<typeof useSaveResume>
const mockedUseApplyExtractedProfile = useApplyExtractedProfile as jest.MockedFunction<
  typeof useApplyExtractedProfile
>

const user = userEvent.setup({ applyAccept: false })

function getFileInput() {
  return document.querySelector('input[type="file"]') as HTMLInputElement
}

const mockExtraction: ResumeExtractionResult = {
  resumeUploadId: "upload-1",
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+1 555-0100",
  location: "London, UK",
  tagline: "Software Pioneer",
  shortBio: "Pioneering computer programmer",
  linkedInUrl: "https://linkedin.com/in/adalovelace",
  portfolioUrls: [],
  workExperience: [
    {
      companyName: "Analytical Engine Co",
      jobTitle: "Lead Mathematician",
      startDate: "1843-01",
      endDate: null,
      isCurrent: true,
    },
  ],
  education: [
    {
      institution: "University of London",
      degree: "Mathematics",
      startDate: "1835-01",
      endDate: "1839-01",
    },
  ],
  projects: [],
  technicalSkills: ["Algorithms", "Mathematics"],
  softSkills: ["Leadership"],
  toolsAndPlatforms: ["Punched Cards"],
  fileStorageKey: "resumes/resume-1.pdf",
}

function ControlledDialogWrapper({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(true)
  return (
    <SaveResumeDialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        onOpenChange?.(nextOpen)
      }}
    />
  )
}

describe("SaveResumeDialog", () => {
  const saveMutateAsync = jest.fn()
  const applyMutateAsync = jest.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    jest.clearAllMocks()
    saveMutateAsync.mockClear()
    applyMutateAsync.mockClear()

    mockedUseSaveResume.mockReturnValue({
      isPending: false,
      mutateAsync: saveMutateAsync,
    } as unknown as ReturnType<typeof useSaveResume>)

    mockedUseApplyExtractedProfile.mockReturnValue({
      isPending: false,
      mutateAsync: applyMutateAsync,
    } as unknown as ReturnType<typeof useApplyExtractedProfile>)
  })

  it("calls save mutation and closes when saving with updateProfile unchecked", async () => {
    const onOpenChange = jest.fn()
    saveMutateAsync.mockResolvedValueOnce({
      id: "resume-1",
      displayName: "Backend Resume",
      originalFileName: "resume.pdf",
      contentType: "application/pdf",
      sizeBytes: 1024,
      isDefault: false,
      uploadedAt: "2026-10-12T00:00:00Z",
    })

    render(<ControlledDialogWrapper onOpenChange={onOpenChange} />, {
      wrapper: createQueryWrapper(),
    })

    const file = new File(["binary"], "resume.pdf", { type: "application/pdf" })
    await user.upload(getFileInput(), file)

    const saveButton = screen.getByRole("button", { name: "Save resume" })
    await user.click(saveButton)

    expect(saveMutateAsync).toHaveBeenCalledWith({
      file,
      displayName: undefined,
      updateProfile: false,
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("displays warning toast when saving with updateProfile checked and AI service is unavailable", async () => {
    const onOpenChange = jest.fn()
    saveMutateAsync.mockResolvedValueOnce({
      id: "resume-1",
      displayName: "resume.pdf",
      originalFileName: "resume.pdf",
      contentType: "application/pdf",
      sizeBytes: 1024,
      isDefault: false,
      uploadedAt: "2026-10-12T00:00:00Z",
      aiServiceUnavailable: true,
    })

    render(<ControlledDialogWrapper onOpenChange={onOpenChange} />, {
      wrapper: createQueryWrapper(),
    })

    const file = new File(["binary"], "resume.pdf", { type: "application/pdf" })
    await user.upload(getFileInput(), file)

    const checkbox = screen.getByRole("checkbox", {
      name: /also update my profile from this resume/i,
    })
    await user.click(checkbox)

    const saveButton = screen.getByRole("button", { name: "Save resume" })
    await user.click(saveButton)

    expect(saveMutateAsync).toHaveBeenCalledWith({
      file,
      displayName: undefined,
      updateProfile: true,
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(toast.warning).toHaveBeenCalledWith(
      "Resume saved to your library.",
      expect.objectContaining({
        description: expect.stringContaining("temporarily unavailable"),
      })
    )
  })

  it("opens review dialog when saving with updateProfile checked and extraction succeeds", async () => {
    const onOpenChange = jest.fn()
    saveMutateAsync.mockResolvedValueOnce({
      id: "resume-1",
      displayName: "resume.pdf",
      originalFileName: "resume.pdf",
      contentType: "application/pdf",
      sizeBytes: 1024,
      isDefault: false,
      uploadedAt: "2026-10-12T00:00:00Z",
      extractedProfile: mockExtraction,
    })

    render(<ControlledDialogWrapper onOpenChange={onOpenChange} />, {
      wrapper: createQueryWrapper(),
    })

    const file = new File(["binary"], "resume.pdf", { type: "application/pdf" })
    await user.upload(getFileInput(), file)

    const checkbox = screen.getByRole("checkbox", {
      name: /also update my profile from this resume/i,
    })
    await user.click(checkbox)

    const saveButton = screen.getByRole("button", { name: "Save resume" })
    await user.click(saveButton)

    expect(onOpenChange).toHaveBeenCalledWith(false)

    expect(
      await screen.findByText(/review extracted profile details/i)
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue("Ada Lovelace")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /confirm/i })).toBeInTheDocument()
  })

  it("applies extracted profile and displays success toast when confirming in review dialog", async () => {
    saveMutateAsync.mockResolvedValueOnce({
      id: "resume-1",
      displayName: "resume.pdf",
      originalFileName: "resume.pdf",
      contentType: "application/pdf",
      sizeBytes: 1024,
      isDefault: false,
      uploadedAt: "2026-10-12T00:00:00Z",
      extractedProfile: mockExtraction,
    })

    render(<ControlledDialogWrapper />, {
      wrapper: createQueryWrapper(),
    })

    const file = new File(["binary"], "resume.pdf", { type: "application/pdf" })
    await user.upload(getFileInput(), file)

    const checkbox = screen.getByRole("checkbox", {
      name: /also update my profile from this resume/i,
    })
    await user.click(checkbox)

    const saveButton = screen.getByRole("button", { name: "Save resume" })
    await user.click(saveButton)

    const confirmButton = await screen.findByRole("button", { name: /confirm/i })
    await user.click(confirmButton)

    expect(applyMutateAsync).toHaveBeenCalledTimes(1)
    expect(applyMutateAsync).toHaveBeenCalledWith({
      payload: expect.objectContaining({
        fullName: "Ada Lovelace",
        technicalSkills: ["Algorithms", "Mathematics"],
      }),
    })
    expect(toast.success).toHaveBeenCalledWith("Profile updated from resume.")
  })

  it("cancels review dialog without updating profile when cancel is clicked", async () => {
    saveMutateAsync.mockResolvedValueOnce({
      id: "resume-1",
      displayName: "resume.pdf",
      originalFileName: "resume.pdf",
      contentType: "application/pdf",
      sizeBytes: 1024,
      isDefault: false,
      uploadedAt: "2026-10-12T00:00:00Z",
      extractedProfile: mockExtraction,
    })

    render(<ControlledDialogWrapper />, {
      wrapper: createQueryWrapper(),
    })

    const file = new File(["binary"], "resume.pdf", { type: "application/pdf" })
    await user.upload(getFileInput(), file)

    const checkbox = screen.getByRole("checkbox", {
      name: /also update my profile from this resume/i,
    })
    await user.click(checkbox)

    const saveButton = screen.getByRole("button", { name: "Save resume" })
    await user.click(saveButton)

    const cancelButton = await screen.findByRole("button", { name: "Cancel" })
    await user.click(cancelButton)

    expect(applyMutateAsync).not.toHaveBeenCalled()
  })
})
