import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"

import { usePresignedUpload } from "../../hooks/usePresignedUpload"
import type { TalentProfileDto } from "../../types"
import { TalentProfileHeroHeader } from "../TalentProfileHeroHeader"

jest.mock("../../hooks/usePresignedUpload")
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const mockedUsePresignedUpload = usePresignedUpload as jest.MockedFunction<typeof usePresignedUpload>

const user = userEvent.setup({ applyAccept: false })

const mockProfile: TalentProfileDto = {
  id: "profile-1",
  userId: "user-1",
  name: "John Doe",
  email: "john.doe@example.com",
  tagline: "Senior AI Engineer",
  shortBio: "Passionate about LLMs and distributed systems.",
  location: "San Francisco, CA",
  phone: "+1 555-0199",
  linkedInUrl: "https://linkedin.com/in/johndoe",
  additionalUrls: ["https://github.com/johndoe"],
  totalYearsExperience: 6,
  expectedSalary: 150000,
  skillPropositions: [],
  technicalSkills: ["TypeScript", "Python"],
  softSkills: ["Leadership"],
  toolsAndPlatforms: ["Docker", "Kubernetes"],
  profilePictureUrl: null,
  videoIntroUrl: null,
  resumeOriginalFileName: null,
  resumeUrl: null,
  resumes: [],
  workExperiences: [],
  educations: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: null,
}

describe("TalentProfileHeroHeader", () => {
  const upload = jest.fn().mockResolvedValue(undefined)
  const reset = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUsePresignedUpload.mockReturnValue({
      status: "idle",
      progress: 0,
      error: null,
      upload,
      reset,
    })
  })

  it("renders name, tagline, email, phone, location", () => {
    render(<TalentProfileHeroHeader profile={mockProfile} />)

    expect(screen.getByText("John Doe")).toBeInTheDocument()
    expect(screen.getByText("Senior AI Engineer")).toBeInTheDocument()
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument()
    expect(screen.getByText("+1 555-0199")).toBeInTheDocument()
    expect(screen.getByText("San Francisco, CA")).toBeInTheDocument()
  })

  it("renders fallback initials when photo is missing", () => {
    render(<TalentProfileHeroHeader profile={mockProfile} />)

    expect(screen.getByText("JD")).toBeInTheDocument()
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("renders photo when URL exists", () => {
    const profileWithPhoto: TalentProfileDto = {
      ...mockProfile,
      profilePictureUrl: "https://example.com/avatar.jpg",
    }

    render(<TalentProfileHeroHeader profile={profileWithPhoto} />)

    const avatarImage = screen.getByRole("img", { name: "John Doe" })
    expect(avatarImage).toBeInTheDocument()
    expect(avatarImage).toHaveAttribute("src", "https://example.com/avatar.jpg")
    expect(screen.queryByText("JD")).not.toBeInTheDocument()
  })

  it("clicking camera button triggers file input click", async () => {
    const clickSpy = jest.spyOn(HTMLInputElement.prototype, "click")
    render(<TalentProfileHeroHeader profile={mockProfile} />)

    const cameraButton = screen.getByRole("button", { name: /change profile photo/i })
    await user.click(cameraButton)

    expect(clickSpy).toHaveBeenCalled()
    clickSpy.mockRestore()
  })

  it("selecting file calls upload on usePresignedUpload", async () => {
    render(<TalentProfileHeroHeader profile={mockProfile} />)

    const validFile = new File(["binary-content"], "avatar.png", { type: "image/png" })
    const fileInput = screen.getByLabelText(/upload profile photo/i) as HTMLInputElement

    await user.upload(fileInput, validFile)

    expect(upload).toHaveBeenCalledWith(validFile)
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Profile photo updated successfully.")
    })
  })

  it("calls onEditBasicInfo when edit button clicked", async () => {
    const onEditBasicInfo = jest.fn()
    render(<TalentProfileHeroHeader profile={mockProfile} onEditBasicInfo={onEditBasicInfo} />)

    const editButton = screen.getByRole("button", { name: /edit basic information/i })
    await user.click(editButton)

    expect(onEditBasicInfo).toHaveBeenCalledTimes(1)
  })

  it("does not render edit button when onEditBasicInfo is not provided", () => {
    render(<TalentProfileHeroHeader profile={mockProfile} />)

    expect(screen.queryByRole("button", { name: /edit basic information/i })).not.toBeInTheDocument()
  })

  it("hides phone and location badges when they are absent", () => {
    const minimalProfile: TalentProfileDto = {
      ...mockProfile,
      phone: null,
      location: null,
      tagline: null,
    }

    render(<TalentProfileHeroHeader profile={minimalProfile} />)

    expect(screen.queryByText("+1 555-0199")).not.toBeInTheDocument()
    expect(screen.queryByText("San Francisco, CA")).not.toBeInTheDocument()
    expect(screen.queryByText("Senior AI Engineer")).not.toBeInTheDocument()
  })

  it("disables camera button and shows spinner overlay while uploading", () => {
    mockedUsePresignedUpload.mockReturnValue({
      status: "uploading",
      progress: 40,
      error: null,
      upload,
      reset,
    })

    render(<TalentProfileHeroHeader profile={mockProfile} />)

    const cameraButton = screen.getByRole("button", { name: /change profile photo/i })
    expect(cameraButton).toBeDisabled()
    expect(screen.getByRole("status", { name: /uploading profile photo/i })).toBeInTheDocument()
  })

  it("rejects an invalid file type and displays toast error", async () => {
    render(<TalentProfileHeroHeader profile={mockProfile} />)

    const invalidFile = new File(["text"], "document.pdf", { type: "application/pdf" })
    const fileInput = screen.getByLabelText(/upload profile photo/i) as HTMLInputElement

    await user.upload(fileInput, invalidFile)

    expect(upload).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith("Please choose a JPEG, PNG, or WEBP image.")
  })

  it("rejects an oversized file and displays toast error", async () => {
    render(<TalentProfileHeroHeader profile={mockProfile} />)

    const oversizedFile = new File([new Uint8Array(6 * 1024 * 1024)], "huge.jpg", {
      type: "image/jpeg",
    })
    const fileInput = screen.getByLabelText(/upload profile photo/i) as HTMLInputElement

    await user.upload(fileInput, oversizedFile)

    expect(upload).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith("Image must be 5 MB or smaller.")
  })

  it("displays toast error when upload rejects", async () => {
    upload.mockRejectedValueOnce(new Error("Storage upload failed"))
    render(<TalentProfileHeroHeader profile={mockProfile} />)

    const validFile = new File(["image-bytes"], "photo.webp", { type: "image/webp" })
    const fileInput = screen.getByLabelText(/upload profile photo/i) as HTMLInputElement

    await user.upload(fileInput, validFile)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Storage upload failed")
    })
  })
})
