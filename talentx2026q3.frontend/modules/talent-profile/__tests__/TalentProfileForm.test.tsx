import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper"

import { TalentProfileForm } from "../components/TalentProfileForm"
import type { TalentProfileDto } from "../types/talent-profile.types"

const baseProfile: TalentProfileDto = {
  id: "talent-1",
  userId: "user-1",
  name: "Grace Hopper",
  email: "grace@example.com",
  tagline: "Computer Scientist",
  shortBio: "Pioneering compiler development.",
  location: "New York, NY",
  phone: "+1 555-0100",
  linkedInUrl: "https://linkedin.com/in/gracehopper",
  additionalUrls: ["https://navy.mil"],
  totalYearsExperience: 15,
  expectedSalary: 200000,
  skillPropositions: ["Designs machine-independent languages"],
  technicalSkills: ["COBOL", "Assembly"],
  softSkills: ["Leadership"],
  toolsAndPlatforms: ["UNIVAC"],
  profilePictureUrl: null,
  videoIntroUrl: null,
  resumeOriginalFileName: null,
  resumeUrl: null,
  resumes: [],
  workExperiences: [],
  educations: [],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: null,
}

describe("TalentProfileForm", () => {
  const user = userEvent.setup()

  it("renders read-only card displays by default with profile values and edit triggers", () => {
    render(<TalentProfileForm profile={baseProfile} />, { wrapper: createQueryWrapper() })

    expect(screen.getByText("Grace Hopper")).toBeInTheDocument()
    expect(screen.getByText("Computer Scientist")).toBeInTheDocument()
    expect(screen.getByText("Pioneering compiler development.")).toBeInTheDocument()
    expect(screen.getByText("New York, NY")).toBeInTheDocument()
    expect(screen.getByText("+1 555-0100")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "https://linkedin.com/in/gracehopper" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "https://navy.mil" })).toBeInTheDocument()
    expect(screen.getByText("$200,000")).toBeInTheDocument()
    expect(screen.getByText("15 years")).toBeInTheDocument()
    expect(screen.getByText("Designs machine-independent languages")).toBeInTheDocument()

    expect(screen.getByRole("button", { name: /edit basic information/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /edit contact information/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /edit experience and compensation/i })).toBeInTheDocument()

    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Phone")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Expected salary")).not.toBeInTheDocument()
  })

  it("renders fallback placeholders when optional profile fields are empty", () => {
    const emptyProfile: TalentProfileDto = {
      ...baseProfile,
      tagline: null,
      shortBio: null,
      location: null,
      phone: null,
      linkedInUrl: null,
      additionalUrls: [],
      totalYearsExperience: null,
      expectedSalary: null,
      skillPropositions: [],
    }

    render(<TalentProfileForm profile={emptyProfile} />, { wrapper: createQueryWrapper() })

    expect(screen.getByText("No tagline added yet.")).toBeInTheDocument()
    expect(screen.getByText("No bio added yet.")).toBeInTheDocument()
    expect(screen.getByText("No location added yet.")).toBeInTheDocument()
    expect(screen.getByText("No phone number added.")).toBeInTheDocument()
    expect(screen.getByText("No LinkedIn URL added.")).toBeInTheDocument()
    expect(screen.getByText("No additional links added.")).toBeInTheDocument()
    expect(screen.getAllByText("Not specified")).toHaveLength(2)
    expect(screen.getByText("No skill propositions added yet.")).toBeInTheDocument()
  })

  it("re-hydrates read-only display when profile prop updates", () => {
    const { rerender } = render(<TalentProfileForm profile={baseProfile} />, { wrapper: createQueryWrapper() })

    expect(screen.getByText("Grace Hopper")).toBeInTheDocument()

    const updatedProfile: TalentProfileDto = {
      ...baseProfile,
      name: "Admiral Grace Hopper",
      tagline: "Senior Computing Pioneer",
    }

    rerender(<TalentProfileForm profile={updatedProfile} />)

    expect(screen.getByText("Admiral Grace Hopper")).toBeInTheDocument()
    expect(screen.getByText("Senior Computing Pioneer")).toBeInTheDocument()
  })

  it("toggles basic information section into edit mode on pencil click, allows editing, and saves changes", async () => {
    const onSaveMock = jest.fn()
    render(<TalentProfileForm profile={baseProfile} onSave={onSaveMock} />, {
      wrapper: createQueryWrapper(),
    })

    const editBasicInfoButton = screen.getByRole("button", { name: /edit basic information/i })
    await user.click(editBasicInfoButton)

    const nameInput = screen.getByLabelText("Name")
    expect(nameInput).toHaveValue("Grace Hopper")

    await user.clear(nameInput)
    await user.type(nameInput, "Grace Brewster Hopper")

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    expect(onSaveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Grace Brewster Hopper",
      })
    )

    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument()
  })

  it("cancels basic information editing and restores read-only display without calling onSave", async () => {
    const onSaveMock = jest.fn()
    render(<TalentProfileForm profile={baseProfile} onSave={onSaveMock} />, {
      wrapper: createQueryWrapper(),
    })

    await user.click(screen.getByRole("button", { name: /edit basic information/i }))

    const nameInput = screen.getByLabelText("Name")
    await user.clear(nameInput)
    await user.type(nameInput, "Different Name")

    await user.click(screen.getByRole("button", { name: /cancel/i }))

    expect(onSaveMock).not.toHaveBeenCalled()
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument()
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument()
  })

  it("toggles contact information section into edit mode on pencil click, allows editing, and saves changes", async () => {
    const onSaveMock = jest.fn()
    render(<TalentProfileForm profile={baseProfile} onSave={onSaveMock} />, {
      wrapper: createQueryWrapper(),
    })

    await user.click(screen.getByRole("button", { name: /edit contact information/i }))

    const phoneInput = screen.getByLabelText("Phone")
    expect(phoneInput).toHaveValue("+1 555-0100")

    await user.clear(phoneInput)
    await user.type(phoneInput, "+1 555-9999")

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    expect(onSaveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        phone: "+1 555-9999",
      })
    )

    expect(screen.queryByLabelText("Phone")).not.toBeInTheDocument()
  })

  it("cancels contact information editing without persisting changes", async () => {
    const onSaveMock = jest.fn()
    render(<TalentProfileForm profile={baseProfile} onSave={onSaveMock} />, {
      wrapper: createQueryWrapper(),
    })

    await user.click(screen.getByRole("button", { name: /edit contact information/i }))

    const phoneInput = screen.getByLabelText("Phone")
    await user.clear(phoneInput)
    await user.type(phoneInput, "+1 555-9999")

    await user.click(screen.getByRole("button", { name: /cancel/i }))

    expect(onSaveMock).not.toHaveBeenCalled()
    expect(screen.queryByLabelText("Phone")).not.toBeInTheDocument()
    expect(screen.getByText("+1 555-0100")).toBeInTheDocument()
  })

  it("toggles compensation and experience section into edit mode on pencil click, allows editing, and saves changes", async () => {
    const onSaveMock = jest.fn()
    render(<TalentProfileForm profile={baseProfile} onSave={onSaveMock} />, {
      wrapper: createQueryWrapper(),
    })

    await user.click(screen.getByRole("button", { name: /edit experience and compensation/i }))

    const salaryInput = screen.getByLabelText("Expected salary")
    expect(salaryInput).toHaveValue(200000)

    await user.clear(salaryInput)
    await user.type(salaryInput, "250000")

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    expect(onSaveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedSalary: 250000,
      })
    )

    expect(screen.queryByLabelText("Expected salary")).not.toBeInTheDocument()
  })

  it("cancels compensation and experience editing without persisting changes", async () => {
    const onSaveMock = jest.fn()
    render(<TalentProfileForm profile={baseProfile} onSave={onSaveMock} />, {
      wrapper: createQueryWrapper(),
    })

    await user.click(screen.getByRole("button", { name: /edit experience and compensation/i }))

    const salaryInput = screen.getByLabelText("Expected salary")
    await user.clear(salaryInput)
    await user.type(salaryInput, "300000")

    await user.click(screen.getByRole("button", { name: /cancel/i }))

    expect(onSaveMock).not.toHaveBeenCalled()
    expect(screen.queryByLabelText("Expected salary")).not.toBeInTheDocument()
    expect(screen.getByText("$200,000")).toBeInTheDocument()
  })
})
