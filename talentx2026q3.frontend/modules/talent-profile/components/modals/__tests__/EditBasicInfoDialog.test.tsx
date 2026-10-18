import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { useUpdateTalentProfile } from "../../../hooks/useUpdateTalentProfile"
import type { TalentProfileDto } from "../../../types"
import { EditBasicInfoDialog } from "../EditBasicInfoDialog"

jest.mock("../../../hooks/useUpdateTalentProfile")

const mockedUseUpdateTalentProfile = useUpdateTalentProfile as jest.MockedFunction<
  typeof useUpdateTalentProfile
>

const mockProfile: TalentProfileDto = {
  id: "profile-1",
  userId: "user-1",
  name: "Taylor Swift",
  email: "taylor@example.com",
  tagline: "Lead Solutions Architect",
  shortBio: "Passionate about enterprise architecture.",
  location: "Nashville, TN",
  phone: null,
  linkedInUrl: null,
  additionalUrls: [],
  totalYearsExperience: 10,
  expectedSalary: 200000,
  skillPropositions: [],
  technicalSkills: [],
  softSkills: [],
  toolsAndPlatforms: [],
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

describe("EditBasicInfoDialog", () => {
  const user = userEvent.setup()
  const mutateAsyncMock = jest.fn().mockResolvedValue(undefined)
  const onClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseUpdateTalentProfile.mockReturnValue({
      isPending: false,
      mutateAsync: mutateAsyncMock,
    } as unknown as ReturnType<typeof useUpdateTalentProfile>)
  })

  it("renders title, description and pre-fills name and tagline", () => {
    render(
      <EditBasicInfoDialog
        isOpen={true}
        onClose={onClose}
        profile={mockProfile}
      />
    )

    expect(screen.getByRole("heading", { name: "Edit Basic Information" })).toBeInTheDocument()
    expect(
      screen.getByText("Update your full name and professional headline.")
    ).toBeInTheDocument()

    expect(screen.getByRole("textbox", { name: /full name \*/i })).toHaveValue(mockProfile.name)
    expect(screen.getByRole("textbox", { name: /tagline \/ headline/i })).toHaveValue(
      mockProfile.tagline
    )
  })

  it("calls onClose when Cancel is clicked", async () => {
    render(
      <EditBasicInfoDialog
        isOpen={true}
        onClose={onClose}
        profile={mockProfile}
      />
    )

    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    await user.click(cancelButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("updates name and tagline and submits on Save Changes", async () => {
    render(
      <EditBasicInfoDialog
        isOpen={true}
        onClose={onClose}
        profile={mockProfile}
      />
    )

    const nameInput = screen.getByRole("textbox", { name: /full name \*/i })
    const taglineInput = screen.getByRole("textbox", { name: /tagline \/ headline/i })

    await user.clear(nameInput)
    await user.type(nameInput, "Taylor Allison Swift")

    await user.clear(taglineInput)
    await user.type(taglineInput, "Principal Cloud Architect")

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await user.click(saveButton)

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      name: "Taylor Allison Swift",
      tagline: "Principal Cloud Architect",
    })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })
})
