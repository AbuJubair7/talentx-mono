import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { useProjectMutations } from "../../../hooks/useProjectMutations"
import type { ProjectItemDto } from "../../../types/talent-profile.types"
import { ProjectsTabContent } from "../ProjectsTabContent"

jest.mock("../../../hooks/useProjectMutations")

const mockedUseProjectMutations = useProjectMutations as jest.MockedFunction<
  typeof useProjectMutations
>

const sampleProjects: ProjectItemDto[] = [
  {
    id: "proj-1",
    projectName: "Next.js Recruitment Portal",
    role: "Staff Frontend Architect",
    projectType: "Professional",
    startDate: "Jan 2024",
    endDate: null,
    isOngoing: true,
    description: "Built high-performance B2B marketplace.",
    technologiesUsed: ["Next.js", "TypeScript", "Tailwind CSS"],
    projectUrl: "https://example.com/portal",
  },
  {
    id: "proj-2",
    projectName: "Neural Search Engine",
    role: "ML Engineer",
    projectType: "Personal",
    startDate: "May 2023",
    endDate: "Nov 2023",
    isOngoing: false,
    description: "Vector embedding search using pgvector.",
    technologiesUsed: ["Python", "FastAPI", "PostgreSQL"],
    projectUrl: null,
  },
]

describe("ProjectsTabContent", () => {
  const user = userEvent.setup()
  const createMutate = jest.fn()
  const updateMutate = jest.fn()
  const deleteMutate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseProjectMutations.mockReturnValue({
      createProject: { isPending: false, mutate: createMutate, mutateAsync: jest.fn() },
      updateProject: { isPending: false, mutate: updateMutate, mutateAsync: jest.fn() },
      deleteProject: { isPending: false, mutate: deleteMutate, mutateAsync: jest.fn() },
    } as unknown as ReturnType<typeof useProjectMutations>)
  })

  it("renders empty state when projects array is empty", () => {
    render(<ProjectsTabContent projects={[]} />)

    expect(screen.getByRole("heading", { name: "Projects", level: 2 })).toBeInTheDocument()
    expect(screen.getByText("0")).toBeInTheDocument()
    expect(screen.getByText("No projects added yet.")).toBeInTheDocument()
    expect(screen.getByText("Showcase your best work by adding notable projects to your profile.")).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "+ Add Project" })).toHaveLength(2)
  })

  it("renders list of project cards when projects are provided", () => {
    render(<ProjectsTabContent projects={sampleProjects} />)

    expect(screen.getByRole("heading", { name: "Projects", level: 2 })).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument()
    expect(screen.getByText("Next.js Recruitment Portal")).toBeInTheDocument()
    expect(screen.getByText("Staff Frontend Architect · Professional")).toBeInTheDocument()
    expect(screen.getByText("Jan 2024 – Present")).toBeInTheDocument()

    expect(screen.getByText("Neural Search Engine")).toBeInTheDocument()
    expect(screen.getByText("ML Engineer · Personal")).toBeInTheDocument()
    expect(screen.getByText("May 2023 – Nov 2023")).toBeInTheDocument()
  })

  it("opens Add Project dialog when clicking + Add Project button", async () => {
    render(<ProjectsTabContent projects={sampleProjects} />)

    const addButton = screen.getByRole("button", { name: "+ Add Project" })
    await user.click(addButton)

    expect(screen.getByRole("heading", { name: "Add Project" })).toBeInTheDocument()
  })

  it("opens Edit Project dialog when clicking Edit on a project card", async () => {
    render(<ProjectsTabContent projects={sampleProjects} />)

    const editButton = screen.getByRole("button", {
      name: "Edit Next.js Recruitment Portal",
    })
    await user.click(editButton)

    expect(screen.getByRole("heading", { name: "Edit Project" })).toBeInTheDocument()
    expect(screen.getByDisplayValue("Next.js Recruitment Portal")).toBeInTheDocument()
  })

  it("opens DeleteConfirmationDialog and calls deleteProject mutation", async () => {
    render(<ProjectsTabContent projects={sampleProjects} />)

    const deleteButton = screen.getByRole("button", {
      name: "Delete Next.js Recruitment Portal",
    })
    await user.click(deleteButton)

    expect(screen.getByRole("heading", { name: "Delete Project" })).toBeInTheDocument()
    expect(
      screen.getByText(/Are you sure you want to delete "Next.js Recruitment Portal"\?/)
    ).toBeInTheDocument()

    const confirmButton = screen.getByRole("button", { name: "Delete" })
    await user.click(confirmButton)

    expect(deleteMutate).toHaveBeenCalledTimes(1)
    expect(deleteMutate).toHaveBeenCalledWith("proj-1", expect.any(Object))
  })
})
