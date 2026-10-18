import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { useUpdateTalentProfile } from "../../../hooks/useUpdateTalentProfile"
import type { TalentProfileDto } from "../../../types"
import { EditContactInfoDialog } from "../EditContactInfoDialog"

jest.mock("../../../hooks/useUpdateTalentProfile")

const mockedUseUpdateTalentProfile = useUpdateTalentProfile as jest.MockedFunction<
  typeof useUpdateTalentProfile
>

const mockProfile: TalentProfileDto = {
  id: "profile-1",
  userId: "user-1",
  name: "Jane Smith",
  email: "jane.smith@example.com",
  tagline: "Product Designer",
  shortBio: "Building human-centric software.",
  location: "New York, NY",
  phone: "+1 212-555-0100",
  linkedInUrl: "https://linkedin.com/in/janesmith",
  additionalUrls: [],
  totalYearsExperience: 5,
  expectedSalary: 130000,
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

describe("EditContactInfoDialog", () => {
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

  it("renders title, description and initial contact information", () => {
    render(
      <EditContactInfoDialog
        isOpen={true}
        onClose={onClose}
        profile={mockProfile}
      />
    )

    expect(screen.getByRole("heading", { name: "Edit Contact Information" })).toBeInTheDocument()
    expect(
      screen.getByText("Recruiters use these details to reach you about applications.")
    ).toBeInTheDocument()

    const emailInput = screen.getByRole("textbox", { name: /email address \*/i })
    expect(emailInput).toHaveValue(mockProfile.email)
    expect(emailInput).toBeDisabled()
    expect(
      screen.getByText("Your account email cannot be changed here.")
    ).toBeInTheDocument()

    expect(screen.getByRole("textbox", { name: /phone number/i })).toHaveValue(mockProfile.phone)
    expect(screen.getByRole("textbox", { name: /present address/i })).toHaveValue(
      mockProfile.location
    )
    expect(screen.getByRole("textbox", { name: /linkedin profile/i })).toHaveValue(
      mockProfile.linkedInUrl
    )
  })

  it("calls onClose when Cancel button is clicked", async () => {
    render(
      <EditContactInfoDialog
        isOpen={true}
        onClose={onClose}
        profile={mockProfile}
      />
    )

    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    await user.click(cancelButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("updates fields and submits updated contact info on Save Changes", async () => {
    render(
      <EditContactInfoDialog
        isOpen={true}
        onClose={onClose}
        profile={mockProfile}
      />
    )

    const phoneInput = screen.getByRole("textbox", { name: /phone number/i })
    const locationInput = screen.getByRole("textbox", { name: /present address/i })
    const linkedInInput = screen.getByRole("textbox", { name: /linkedin profile/i })

    await user.clear(phoneInput)
    await user.type(phoneInput, "+1 415-555-9999")

    await user.clear(locationInput)
    await user.type(locationInput, "Austin, TX")

    await user.clear(linkedInInput)
    await user.type(linkedInInput, "https://linkedin.com/in/newprofile")

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await user.click(saveButton)

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      name: "Jane Smith",
      phone: "+1 415-555-9999",
      location: "Austin, TX",
      linkedInUrl: "https://linkedin.com/in/newprofile",
      additionalUrls: [],
    })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it("renders Additional URLs field and submits newly added URLs", async () => {
    render(
      <EditContactInfoDialog
        isOpen={true}
        onClose={onClose}
        profile={{
          ...mockProfile,
          additionalUrls: ["https://github.com/janesmith"],
        }}
      />
    )

    expect(screen.getByText("https://github.com/janesmith")).toBeInTheDocument()

    const additionalUrlInput = screen.getByRole("textbox", { name: /additional urls/i })
    await user.type(additionalUrlInput, "https://portfolio.janesmith.dev{enter}")

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await user.click(saveButton)

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      name: "Jane Smith",
      phone: "+1 212-555-0100",
      location: "New York, NY",
      linkedInUrl: "https://linkedin.com/in/janesmith",
      additionalUrls: ["https://github.com/janesmith", "https://portfolio.janesmith.dev"],
    })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })
})
