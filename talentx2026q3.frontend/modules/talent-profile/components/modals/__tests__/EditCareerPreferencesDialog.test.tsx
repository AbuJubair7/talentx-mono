import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { useUpdateTalentProfile } from "../../../hooks/useUpdateTalentProfile"
import type { TalentProfileDto } from "../../../types"
import { EditCareerPreferencesDialog } from "../EditCareerPreferencesDialog"

jest.mock("../../../hooks/useUpdateTalentProfile")

const mockedUseUpdateTalentProfile = useUpdateTalentProfile as jest.MockedFunction<
  typeof useUpdateTalentProfile
>

const mockProfile: TalentProfileDto = {
  id: "profile-1",
  userId: "user-1",
  name: "Morgan Lee",
  email: "morgan@example.com",
  tagline: "Data Scientist",
  shortBio: "Data modeling and statistical inference.",
  location: "Boston, MA",
  phone: null,
  linkedInUrl: null,
  additionalUrls: [],
  totalYearsExperience: 7,
  expectedSalary: 140000,
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

describe("EditCareerPreferencesDialog", () => {
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

  it("renders title, description and initial preferences", () => {
    render(
      <EditCareerPreferencesDialog
        isOpen={true}
        onClose={onClose}
        profile={mockProfile}
      />
    )

    expect(screen.getByRole("heading", { name: "Edit Career Preferences" })).toBeInTheDocument()
    expect(
      screen.getByText("Salary expectations and experience level shown on your profile.")
    ).toBeInTheDocument()

    expect(
      screen.getByRole("spinbutton", { name: /total years of experience/i })
    ).toHaveValue(7)
    expect(screen.getByRole("spinbutton", { name: /expected salary/i })).toHaveValue(
      140000
    )
  })

  it("calls onClose when Cancel is clicked", async () => {
    render(
      <EditCareerPreferencesDialog
        isOpen={true}
        onClose={onClose}
        profile={mockProfile}
      />
    )

    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    await user.click(cancelButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("updates preferences and submits on Save Changes", async () => {
    render(
      <EditCareerPreferencesDialog
        isOpen={true}
        onClose={onClose}
        profile={mockProfile}
      />
    )

    const yearsInput = screen.getByRole("spinbutton", { name: /total years of experience/i })
    const salaryInput = screen.getByRole("spinbutton", { name: /expected salary/i })

    await user.clear(yearsInput)
    await user.type(yearsInput, "10")

    await user.clear(salaryInput)
    await user.type(salaryInput, "175000")

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await user.click(saveButton)

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      name: "Morgan Lee",
      totalYearsExperience: 10,
      expectedSalary: 175000,
    })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it("prevents entering negative values", async () => {
    render(
      <EditCareerPreferencesDialog
        isOpen={true}
        onClose={onClose}
        profile={mockProfile}
      />
    )

    const yearsInput = screen.getByRole("spinbutton", { name: /total years of experience/i })
    await user.clear(yearsInput)
    await user.type(yearsInput, "-5")

    expect(yearsInput).toHaveValue(5)
  })
})
