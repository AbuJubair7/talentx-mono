import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { useUpdateTalentProfile } from "../../../hooks/useUpdateTalentProfile"
import type { TalentProfileDto } from "../../../types"
import { EditCareerSummaryDialog } from "../EditCareerSummaryDialog"

jest.mock("../../../hooks/useUpdateTalentProfile")

const mockedUseUpdateTalentProfile = useUpdateTalentProfile as jest.MockedFunction<
  typeof useUpdateTalentProfile
>

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
  additionalUrls: [],
  totalYearsExperience: 6,
  expectedSalary: 150000,
  skillPropositions: [],
  technicalSkills: ["TypeScript"],
  softSkills: ["Leadership"],
  toolsAndPlatforms: ["Docker"],
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

describe("EditCareerSummaryDialog", () => {
  const user = userEvent.setup()
  const mutateAsyncMock = jest.fn()
  const onClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mutateAsyncMock.mockResolvedValue(undefined)
    mockedUseUpdateTalentProfile.mockReturnValue({
      isPending: false,
      mutateAsync: mutateAsyncMock,
    } as unknown as ReturnType<typeof useUpdateTalentProfile>)
  })

  it("renders title, description and initial career summary text", () => {
    render(
      <EditCareerSummaryDialog
        isOpen={true}
        onClose={onClose}
        profile={mockProfile}
      />
    )

    expect(screen.getByRole("heading", { name: "Edit Career Summary" })).toBeInTheDocument()
    expect(
      screen.getByText("A short professional summary shown at the top of your talent profile.")
    ).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: /career summary \*/i })).toHaveValue(
      mockProfile.shortBio
    )
  })

  it("updates character counter as user types", async () => {
    render(
      <EditCareerSummaryDialog
        isOpen={true}
        onClose={onClose}
        profile={mockProfile}
      />
    )

    const textarea = screen.getByRole("textbox", { name: /career summary \*/i })
    await user.clear(textarea)
    await user.type(textarea, "New bio content")

    expect(textarea).toHaveValue("New bio content")
    expect(screen.getByText("15 / 1000 characters")).toBeInTheDocument()
  })

  it("calls onClose when Cancel button is clicked", async () => {
    render(
      <EditCareerSummaryDialog
        isOpen={true}
        onClose={onClose}
        profile={mockProfile}
      />
    )

    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    await user.click(cancelButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("submits trimmed summary and closes dialog on Save Changes", async () => {
    render(
      <EditCareerSummaryDialog
        isOpen={true}
        onClose={onClose}
        profile={mockProfile}
      />
    )

    const textarea = screen.getByRole("textbox", { name: /career summary \*/i })
    await user.clear(textarea)
    await user.type(textarea, "  Updated summary text  ")

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await user.click(saveButton)

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      name: "John Doe",
      shortBio: "Updated summary text",
    })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it("does not render dialog content when isOpen is false", () => {
    render(
      <EditCareerSummaryDialog
        isOpen={false}
        onClose={onClose}
        profile={mockProfile}
      />
    )

    expect(screen.queryByRole("heading", { name: "Edit Career Summary" })).not.toBeInTheDocument()
  })
})
