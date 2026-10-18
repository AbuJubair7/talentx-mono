import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper"

import { TalentProfileView } from "../components/TalentProfileView"
import { useTalentProfile } from "../hooks/useTalentProfile"
import type { TalentProfileDto } from "../types/talent-profile.types"

const mockMutateAsync = jest.fn()

jest.mock("../hooks/useTalentProfile")
jest.mock("../hooks/useUpdateTalentProfile", () => ({
  useUpdateTalentProfile: () => ({
    isPending: false,
    mutate: jest.fn(),
    mutateAsync: mockMutateAsync,
  }),
}))
jest.mock("../hooks/useWorkExperienceMutations", () => ({
  useWorkExperienceMutations: () => ({
    createWorkExperience: { isPending: false, mutate: jest.fn(), mutateAsync: jest.fn() },
    updateWorkExperience: { isPending: false, mutate: jest.fn(), mutateAsync: jest.fn() },
    deleteWorkExperience: { isPending: false, mutate: jest.fn(), mutateAsync: jest.fn() },
  }),
}))
jest.mock("../hooks/useEducationMutations", () => ({
  useEducationMutations: () => ({
    createEducation: { isPending: false, mutate: jest.fn(), mutateAsync: jest.fn() },
    updateEducation: { isPending: false, mutate: jest.fn(), mutateAsync: jest.fn() },
    deleteEducation: { isPending: false, mutate: jest.fn(), mutateAsync: jest.fn() },
  }),
}))
jest.mock("../hooks/useProjectMutations", () => ({
  useProjectMutations: () => ({
    createProject: { isPending: false, mutate: jest.fn(), mutateAsync: jest.fn() },
    updateProject: { isPending: false, mutate: jest.fn(), mutateAsync: jest.fn() },
    deleteProject: { isPending: false, mutate: jest.fn(), mutateAsync: jest.fn() },
  }),
}))
jest.mock("../hooks/usePresignedUpload", () => ({
  usePresignedUpload: () => ({
    status: "idle",
    progress: 0,
    error: null,
    upload: jest.fn(),
    reset: jest.fn(),
  }),
}))
jest.mock("@/modules/resumes", () => ({
  ResumeLibrarySection: () => (
    <section aria-label="Resume library">
      <h2>Resumes</h2>
    </section>
  ),
}))

const mockedUseTalentProfile = useTalentProfile as jest.MockedFunction<typeof useTalentProfile>

const mockProfile: TalentProfileDto = {
  id: "talent-profile-1",
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

describe("TalentProfileView", () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    mockMutateAsync.mockResolvedValue(undefined)
  })

  it("renders loading skeleton while fetching profile", () => {
    mockedUseTalentProfile.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useTalentProfile>)

    render(<TalentProfileView />, { wrapper: createQueryWrapper() })

    expect(screen.getByRole("status", { name: /loading your profile/i })).toBeInTheDocument()
  })

  it("renders 404 message when profile does not exist", () => {
    mockedUseTalentProfile.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: { status: 404, message: "Not found" },
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useTalentProfile>)

    render(<TalentProfileView />, { wrapper: createQueryWrapper() })

    expect(screen.getByText(/no profile yet/i)).toBeInTheDocument()
  })

  it("renders error state with retry button on unexpected error", async () => {
    const refetchMock = jest.fn()
    mockedUseTalentProfile.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: { status: 500, message: "Internal server error" },
      refetch: refetchMock,
    } as unknown as ReturnType<typeof useTalentProfile>)

    render(<TalentProfileView />, { wrapper: createQueryWrapper() })

    expect(screen.getByText(/couldn't load your profile/i)).toBeInTheDocument()
    const retryButton = screen.getByRole("button", { name: /retry/i })
    await user.click(retryButton)
    expect(refetchMock).toHaveBeenCalledTimes(1)
  })

  it("renders candidate hero header with identity, badges, and photo action", () => {
    mockedUseTalentProfile.mockReturnValue({
      data: mockProfile,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useTalentProfile>)

    render(<TalentProfileView />, { wrapper: createQueryWrapper() })

    expect(screen.getByRole("heading", { name: "Jane Developer", level: 2 })).toBeInTheDocument()
    expect(screen.getByText("Staff Platform Engineer")).toBeInTheDocument()
    expect(screen.getAllByText("jane.dev@example.com")[0]).toBeInTheDocument()
    expect(screen.getAllByText("+1 555-0199")[0]).toBeInTheDocument()
    expect(screen.getAllByText("San Francisco, CA")[0]).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /change profile photo/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /edit basic information/i })).toBeInTheDocument()
  })

  it("renders exactly 3 tabs and verifies Experience & Education tab no longer exists", () => {
    mockedUseTalentProfile.mockReturnValue({
      data: mockProfile,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useTalentProfile>)

    render(<TalentProfileView />, { wrapper: createQueryWrapper() })

    const tabs = screen.getAllByRole("tab")
    expect(tabs).toHaveLength(3)

    expect(tabs[0]).toHaveAccessibleName(/^resume & media$/i)
    expect(tabs[1]).toHaveAccessibleName(/^projects$/i)
    expect(tabs[2]).toHaveAccessibleName(/^overview$/i)
    expect(screen.getByRole("tab", { name: /^resume & media$/i })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /^overview$/i })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /^projects$/i })).toBeInTheDocument()
    expect(screen.queryByRole("tab", { name: /experience & education/i })).not.toBeInTheDocument()
  })

  it("renders Overview tab containing all 6 candidate sections", () => {
    mockedUseTalentProfile.mockReturnValue({
      data: mockProfile,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useTalentProfile>)

    render(<TalentProfileView initialTab="overview" />, { wrapper: createQueryWrapper() })

    expect(screen.getByRole("heading", { name: "Career Summary", level: 3 })).toBeInTheDocument()
    expect(screen.getByText("Building scalable distributed infrastructure.")).toBeInTheDocument()

    expect(screen.getByRole("heading", { name: "Work Experience", level: 3 })).toBeInTheDocument()
    expect(screen.getByText("Lead Infrastructure Engineer")).toBeInTheDocument()
    expect(screen.getByText("Acme Corp")).toBeInTheDocument()
    expect(screen.getByText("Jan 2021 – Present")).toBeInTheDocument()

    expect(screen.getByRole("heading", { name: "Contact Information", level: 3 })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Education", level: 3 })).toBeInTheDocument()
    expect(screen.getByText("B.S. in Computer Science")).toBeInTheDocument()
    expect(screen.getByText("MIT")).toBeInTheDocument()
    expect(screen.getByText("2012 – 2016")).toBeInTheDocument()

    expect(screen.getByRole("heading", { name: "Career Preferences", level: 3 })).toBeInTheDocument()
    expect(screen.getByText("8 years")).toBeInTheDocument()
    expect(screen.getByText("$185,000")).toBeInTheDocument()

    expect(screen.getByRole("heading", { name: "Skill Tags", level: 3 })).toBeInTheDocument()
    expect(screen.getByText("TypeScript")).toBeInTheDocument()
    expect(screen.getByText("Go")).toBeInTheDocument()
    expect(screen.getByText("Kubernetes")).toBeInTheDocument()
  })

  it("opens modal dialogs when clicking Edit on Overview sections", async () => {
    mockedUseTalentProfile.mockReturnValue({
      data: mockProfile,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useTalentProfile>)

    render(<TalentProfileView initialTab="overview" />, { wrapper: createQueryWrapper() })

    const editSummaryButton = screen.getByRole("button", { name: "Edit Career Summary" })
    await user.click(editSummaryButton)
    expect(screen.getByRole("heading", { name: "Edit Career Summary" })).toBeInTheDocument()
  })

  it("opens EditBasicInfoDialog when clicking edit profile in hero header", async () => {
    mockedUseTalentProfile.mockReturnValue({
      data: mockProfile,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useTalentProfile>)

    render(<TalentProfileView />, { wrapper: createQueryWrapper() })

    const editProfileButton = screen.getByRole("button", { name: /edit basic information/i })
    await user.click(editProfileButton)
    expect(screen.getByRole("heading", { name: "Edit Basic Information" })).toBeInTheDocument()
  })

  it("renders Resume & Media tab by default and allows switching between tabs", async () => {
    mockedUseTalentProfile.mockReturnValue({
      data: mockProfile,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useTalentProfile>)

    render(<TalentProfileView />, { wrapper: createQueryWrapper() })

    expect(screen.getByRole("tab", { name: /^resume & media$/i })).toHaveAttribute(
      "aria-selected",
      "true",
    )
    expect(screen.getByRole("heading", { name: /video introduction/i })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: /^resumes$/i })).toBeInTheDocument()
    expect(screen.getByLabelText("Resume library")).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: /profile picture/i })).not.toBeInTheDocument()

    const overviewTab = screen.getByRole("tab", { name: /^overview$/i })
    await user.click(overviewTab)
    expect(screen.getByRole("heading", { name: "Career Summary", level: 3 })).toBeInTheDocument()

    const resumeTab = screen.getByRole("tab", { name: /^resume & media$/i })
    await user.click(resumeTab)
    expect(screen.getByRole("heading", { name: /video introduction/i })).toBeInTheDocument()
  })

  it("opens Media & Resume tab when initialTab is media-resume without photo upload section", () => {
    mockedUseTalentProfile.mockReturnValue({
      data: mockProfile,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useTalentProfile>)

    render(<TalentProfileView initialTab="media-resume" />, { wrapper: createQueryWrapper() })

    expect(screen.getByRole("tab", { name: /^resume & media$/i })).toHaveAttribute(
      "aria-selected",
      "true",
    )
    expect(screen.getByRole("heading", { name: /video introduction/i })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: /^resumes$/i })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: /profile picture/i })).not.toBeInTheDocument()
  })
})
