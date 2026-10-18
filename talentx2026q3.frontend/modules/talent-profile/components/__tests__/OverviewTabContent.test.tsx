import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { TalentProfileDto } from "../../types"
import { OverviewTabContent } from "../OverviewTabContent"

jest.mock("../../hooks/useUpdateTalentProfile", () => ({
  useUpdateTalentProfile: () => ({
    isPending: false,
    mutateAsync: jest.fn().mockResolvedValue(undefined),
  }),
}))

jest.mock("../../hooks/useWorkExperienceMutations", () => ({
  useWorkExperienceMutations: () => ({
    createWorkExperience: { isPending: false, mutateAsync: jest.fn().mockResolvedValue(undefined) },
    updateWorkExperience: { isPending: false, mutateAsync: jest.fn().mockResolvedValue(undefined) },
    deleteWorkExperience: { isPending: false, mutateAsync: jest.fn().mockResolvedValue(undefined) },
  }),
}))

jest.mock("../../hooks/useEducationMutations", () => ({
  useEducationMutations: () => ({
    createEducation: { isPending: false, mutateAsync: jest.fn().mockResolvedValue(undefined) },
    updateEducation: { isPending: false, mutateAsync: jest.fn().mockResolvedValue(undefined) },
    deleteEducation: { isPending: false, mutateAsync: jest.fn().mockResolvedValue(undefined) },
  }),
}))

const mockProfile: TalentProfileDto = {
  id: "profile-1",
  userId: "user-1",
  name: "Jane Developer",
  email: "jane.dev@example.com",
  tagline: "Staff Platform Engineer",
  shortBio: "Building scalable distributed infrastructure.",
  location: "San Francisco, CA",
  phone: "+1 555-0199",
  linkedInUrl: "https://linkedin.com/in/janedev",
  additionalUrls: ["https://janedev.io"],
  totalYearsExperience: 8,
  expectedSalary: 185000,
  skillPropositions: ["Designs cloud-native platforms"],
  technicalSkills: ["TypeScript", "Go", "Kubernetes"],
  softSkills: ["Team Leadership"],
  toolsAndPlatforms: ["Docker", "Terraform"],
  profilePictureUrl: "https://example.com/avatar.jpg",
  videoIntroUrl: "https://example.com/intro.mp4",
  resumeOriginalFileName: "jane_resume.pdf",
  resumeUrl: "https://example.com/jane_resume.pdf",
  resumes: [],
  workExperiences: [
    {
      id: "work-1",
      companyName: "Acme Corp",
      jobTitle: "Lead Infrastructure Engineer",
      startDate: "Jan 2021",
      endDate: null,
      isCurrent: true,
    },
  ],
  educations: [
    {
      id: "edu-1",
      institution: "MIT",
      degree: "B.S. in Computer Science",
      startDate: "2012",
      endDate: "2016",
    },
  ],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: null,
}

describe("OverviewTabContent", () => {
  const user = userEvent.setup()

  it("renders all 6 overview sections with content", () => {
    render(<OverviewTabContent profile={mockProfile} />)

    expect(screen.getByRole("heading", { name: "Career Summary", level: 3 })).toBeInTheDocument()
    expect(screen.getByText("Building scalable distributed infrastructure.")).toBeInTheDocument()

    expect(screen.getByRole("heading", { name: "Work Experience", level: 3 })).toBeInTheDocument()
    expect(screen.getByText("Lead Infrastructure Engineer")).toBeInTheDocument()
    expect(screen.getByText("Acme Corp")).toBeInTheDocument()
    expect(screen.getByText("Jan 2021 – Present")).toBeInTheDocument()

    expect(screen.getByRole("heading", { name: "Contact Information", level: 3 })).toBeInTheDocument()
    expect(screen.getByText("jane.dev@example.com")).toBeInTheDocument()
    expect(screen.getByText("+1 555-0199")).toBeInTheDocument()
    expect(screen.getByText("San Francisco, CA")).toBeInTheDocument()
    expect(screen.getByText("https://linkedin.com/in/janedev")).toBeInTheDocument()
    expect(screen.getByText("https://janedev.io")).toBeInTheDocument()

    expect(screen.getByRole("heading", { name: "Education", level: 3 })).toBeInTheDocument()
    expect(screen.getByText("B.S. in Computer Science")).toBeInTheDocument()
    expect(screen.getByText("MIT")).toBeInTheDocument()
    expect(screen.getByText("2012 – 2016")).toBeInTheDocument()

    expect(screen.getByRole("heading", { name: "Career Preferences", level: 3 })).toBeInTheDocument()
    expect(screen.getByText("8 years")).toBeInTheDocument()
    expect(screen.getByText("$185,000")).toBeInTheDocument()

    expect(screen.getByRole("heading", { name: "Skill Tags", level: 3 })).toBeInTheDocument()
    expect(screen.getByText("Designs cloud-native platforms")).toBeInTheDocument()
    expect(screen.getByText("TypeScript")).toBeInTheDocument()
    expect(screen.getByText("Go")).toBeInTheDocument()
    expect(screen.getByText("Kubernetes")).toBeInTheDocument()
    expect(screen.getByText("Team Leadership")).toBeInTheDocument()
    expect(screen.getByText("Docker")).toBeInTheDocument()
    expect(screen.getByText("Terraform")).toBeInTheDocument()
  })

  it("renders empty states when profile sections are empty", () => {
    const emptyProfile: TalentProfileDto = {
      ...mockProfile,
      shortBio: null,
      email: "",
      phone: null,
      location: null,
      linkedInUrl: null,
      additionalUrls: [],
      totalYearsExperience: null,
      expectedSalary: null,
      skillPropositions: [],
      workExperiences: [],
      educations: [],
      technicalSkills: [],
      softSkills: [],
      toolsAndPlatforms: [],
    }

    render(<OverviewTabContent profile={emptyProfile} />)

    expect(screen.getByText("No career summary added yet")).toBeInTheDocument()
    expect(
      screen.getByText("A short professional summary will appear here once added.")
    ).toBeInTheDocument()
    expect(screen.getByText("No work experience added yet")).toBeInTheDocument()
    expect(screen.getByText("No contact information added yet")).toBeInTheDocument()
    expect(screen.getByText("No education added yet")).toBeInTheDocument()
    expect(screen.getByText("No career preferences specified yet")).toBeInTheDocument()
    expect(screen.getByText("No skill tags added yet")).toBeInTheDocument()
  })

  it("opens EditCareerSummaryDialog when clicking Edit on Career Summary", async () => {
    render(<OverviewTabContent profile={mockProfile} />)

    const editButton = screen.getByRole("button", { name: "Edit Career Summary" })
    await user.click(editButton)

    expect(screen.getByRole("heading", { name: "Edit Career Summary" })).toBeInTheDocument()
  })

  it("opens EditWorkExperienceDialog when clicking Edit on Work Experience", async () => {
    render(<OverviewTabContent profile={mockProfile} />)

    const editButton = screen.getByRole("button", { name: "Edit Work Experience" })
    await user.click(editButton)

    expect(screen.getByRole("heading", { name: "Edit Work Experience" })).toBeInTheDocument()
  })

  it("opens EditContactInfoDialog when clicking Edit on Contact Information", async () => {
    render(<OverviewTabContent profile={mockProfile} />)

    const editButton = screen.getByRole("button", { name: "Edit Contact Information" })
    await user.click(editButton)

    expect(screen.getByRole("heading", { name: "Edit Contact Information" })).toBeInTheDocument()
  })

  it("opens EditEducationDialog when clicking Edit on Education", async () => {
    render(<OverviewTabContent profile={mockProfile} />)

    const editButton = screen.getByRole("button", { name: "Edit Education" })
    await user.click(editButton)

    expect(screen.getByRole("heading", { name: "Edit Education" })).toBeInTheDocument()
  })

  it("opens EditCareerPreferencesDialog when clicking Edit on Career Preferences", async () => {
    render(<OverviewTabContent profile={mockProfile} />)

    const editButton = screen.getByRole("button", { name: "Edit Career Preferences" })
    await user.click(editButton)

    expect(screen.getByRole("heading", { name: "Edit Career Preferences" })).toBeInTheDocument()
  })

  it("opens EditSkillsDialog when clicking Edit on Skill Tags", async () => {
    render(<OverviewTabContent profile={mockProfile} />)

    const editButton = screen.getByRole("button", { name: /Edit Skill Tags/i })
    await user.click(editButton)

    expect(screen.getByRole("heading", { name: "Edit Skills" })).toBeInTheDocument()
  })
})
