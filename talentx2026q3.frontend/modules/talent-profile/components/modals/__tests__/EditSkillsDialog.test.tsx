import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { useUpdateTalentProfile } from "../../../hooks/useUpdateTalentProfile"
import type { TalentProfileDto } from "../../../types"
import { EditSkillsDialog } from "../EditSkillsDialog"

jest.mock("../../../hooks/useUpdateTalentProfile")

const mockedUseUpdateTalentProfile = useUpdateTalentProfile as jest.MockedFunction<
  typeof useUpdateTalentProfile
>

const mockProfile: TalentProfileDto = {
  id: "profile-1",
  userId: "user-1",
  name: "Alex Rivera",
  email: "alex@example.com",
  tagline: "Staff ML Engineer",
  shortBio: "Building AI at scale.",
  location: "Seattle, WA",
  phone: "+1 206-555-0144",
  linkedInUrl: null,
  additionalUrls: [],
  totalYearsExperience: 8,
  expectedSalary: 190000,
  skillPropositions: [],
  technicalSkills: ["Python", "PyTorch"],
  softSkills: ["Mentorship"],
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

describe("EditSkillsDialog", () => {
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

  it("renders title, description and initial skills", () => {
    render(
      <EditSkillsDialog
        isOpen={true}
        onClose={onClose}
        profile={mockProfile}
      />
    )

    expect(screen.getByRole("heading", { name: "Edit Skills" })).toBeInTheDocument()
    expect(
      screen.getByText("Add your technical skills, soft skills, and tools & platforms.")
    ).toBeInTheDocument()

    expect(screen.getByText("Python")).toBeInTheDocument()
    expect(screen.getByText("PyTorch")).toBeInTheDocument()
    expect(screen.getByText("Mentorship")).toBeInTheDocument()
    expect(screen.getByText("Docker")).toBeInTheDocument()
  })

  it("calls onClose when Cancel is clicked", async () => {
    render(
      <EditSkillsDialog
        isOpen={true}
        onClose={onClose}
        profile={mockProfile}
      />
    )

    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    await user.click(cancelButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("submits current skills and closes on Save Changes", async () => {
    render(
      <EditSkillsDialog
        isOpen={true}
        onClose={onClose}
        profile={mockProfile}
      />
    )

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await user.click(saveButton)

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      name: "Alex Rivera",
      technicalSkills: ["Python", "PyTorch"],
      softSkills: ["Mentorship"],
      toolsAndPlatforms: ["Docker"],
      skillPropositions: [],
    })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it("renders Skill propositions field and submits newly added proposition", async () => {
    render(
      <EditSkillsDialog
        isOpen={true}
        onClose={onClose}
        profile={{
          ...mockProfile,
          skillPropositions: ["Designs scalable ML pipelines"],
        }}
      />
    )

    expect(screen.getByText("Designs scalable ML pipelines")).toBeInTheDocument()

    const propInput = screen.getByRole("textbox", { name: /skill propositions/i })
    await user.type(propInput, "Mentors engineering leaders{enter}")

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await user.click(saveButton)

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      name: "Alex Rivera",
      technicalSkills: ["Python", "PyTorch"],
      softSkills: ["Mentorship"],
      toolsAndPlatforms: ["Docker"],
      skillPropositions: ["Designs scalable ML pipelines", "Mentors engineering leaders"],
    })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })
})
