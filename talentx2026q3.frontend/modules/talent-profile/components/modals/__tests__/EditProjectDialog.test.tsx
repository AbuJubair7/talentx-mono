import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { useProjectMutations } from "../../../hooks/useProjectMutations"
import type { ProjectItemDto } from "../../../types/talent-profile.types"
import { EditProjectDialog } from "../EditProjectDialog"

jest.mock("../../../hooks/useProjectMutations")

const mockedUseProjectMutations = useProjectMutations as jest.MockedFunction<
  typeof useProjectMutations
>

const sampleProject: ProjectItemDto = {
  id: "proj-123",
  projectName: "AI Code Assistant",
  role: "Lead Architect",
  projectType: "Professional",
  startDate: "Feb 2023",
  endDate: "Nov 2023",
  isOngoing: false,
  description: "Built local LLM agent assistant.",
  technologiesUsed: ["Rust", "Python", "Triton"],
  projectUrl: "https://example.com/assistant",
}

describe("EditProjectDialog", () => {
  const user = userEvent.setup()
  const createMutateAsync = jest.fn().mockResolvedValue({ id: "new-proj" })
  const updateMutateAsync = jest.fn().mockResolvedValue(undefined)
  const deleteMutateAsync = jest.fn().mockResolvedValue(undefined)
  const onClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseProjectMutations.mockReturnValue({
      createProject: { isPending: false, mutateAsync: createMutateAsync },
      updateProject: { isPending: false, mutateAsync: updateMutateAsync },
      deleteProject: { isPending: false, mutateAsync: deleteMutateAsync },
    } as unknown as ReturnType<typeof useProjectMutations>)
  })

  it("renders Add Project dialog when no projectToEdit is provided", () => {
    render(
      <EditProjectDialog
        isOpen={true}
        onClose={onClose}
        projectToEdit={null}
      />
    )

    expect(screen.getByRole("heading", { name: "Add Project" })).toBeInTheDocument()
    expect(
      screen.getByText("Notable projects from your experience shown on your talent passport.")
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText("e.g., MedNexus")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("e.g., Full-Stack Developer")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("What the project does and what you built")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("e.g., React — press Enter to add")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("e.g., https://github.com/you/project")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Add Project" })).toBeInTheDocument()
  })

  it("renders Edit Project dialog with pre-filled fields when projectToEdit is provided", () => {
    render(
      <EditProjectDialog
        isOpen={true}
        onClose={onClose}
        projectToEdit={sampleProject}
      />
    )

    expect(screen.getByRole("heading", { name: "Edit Project" })).toBeInTheDocument()
    expect(screen.getByLabelText(/project name/i)).toHaveValue("AI Code Assistant")
    expect(screen.getByLabelText(/role \*/i)).toHaveValue("Lead Architect")
    expect(screen.getByLabelText(/project type/i)).toHaveValue("Professional")
    expect(screen.getByLabelText(/start date/i)).toHaveValue("Feb 2023")
    expect(screen.getByLabelText(/end date/i)).toHaveValue("Nov 2023")
    expect(screen.getByLabelText(/description/i)).toHaveValue("Built local LLM agent assistant.")
    expect(screen.getByLabelText(/project url/i)).toHaveValue("https://example.com/assistant")
    expect(screen.getByText("Rust")).toBeInTheDocument()
    expect(screen.getByText("Python")).toBeInTheDocument()
    expect(screen.getByText("Triton")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Remove Rust" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Update Project" })).toBeInTheDocument()
  })

  it("calls onClose when Cancel button is clicked", async () => {
    render(
      <EditProjectDialog
        isOpen={true}
        onClose={onClose}
        projectToEdit={null}
      />
    )

    const cancelButton = screen.getByRole("button", { name: "Cancel" })
    await user.click(cancelButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("toggles ongoing checkbox, clears and disables End Date", async () => {
    render(
      <EditProjectDialog
        isOpen={true}
        onClose={onClose}
        projectToEdit={sampleProject}
      />
    )

    const ongoingCheckbox = screen.getByRole("checkbox", {
      name: /this project is ongoing/i,
    })
    const endDateInput = screen.getByLabelText(/end date/i)

    expect(ongoingCheckbox).not.toBeChecked()
    expect(endDateInput).not.toBeDisabled()
    expect(endDateInput).toHaveValue("Nov 2023")

    await user.click(ongoingCheckbox)

    expect(ongoingCheckbox).toBeChecked()
    expect(endDateInput).toBeDisabled()
    expect(endDateInput).toHaveValue("")
  })

  it("adds and removes technologies via Add button and Enter key while preventing duplicates", async () => {
    render(
      <EditProjectDialog
        isOpen={true}
        onClose={onClose}
        projectToEdit={null}
      />
    )

    const techInput = screen.getByPlaceholderText("e.g., React — press Enter to add")
    const addTechButton = screen.getByRole("button", { name: "Add" })

    // Add via Add button
    await user.type(techInput, "React")
    await user.click(addTechButton)
    expect(screen.getByText("React")).toBeInTheDocument()
    expect(techInput).toHaveValue("")

    // Add via Enter key with whitespace trimming
    await user.type(techInput, " TypeScript {Enter}")
    expect(screen.getByText("TypeScript")).toBeInTheDocument()
    expect(techInput).toHaveValue("")

    // Prevent duplicate
    await user.type(techInput, "React{Enter}")
    expect(screen.getAllByText("React")).toHaveLength(1)

    // Ignore empty or whitespace only
    await user.type(techInput, "   {Enter}")
    expect(techInput).toHaveValue("")

    // Remove a tag
    const removeReactButton = screen.getByRole("button", { name: "Remove React" })
    await user.click(removeReactButton)
    expect(screen.queryByText("React")).not.toBeInTheDocument()
    expect(screen.getByText("TypeScript")).toBeInTheDocument()
  })

  it("validates required fields before submitting", async () => {
    render(
      <EditProjectDialog
        isOpen={true}
        onClose={onClose}
        projectToEdit={null}
      />
    )

    const submitButton = screen.getByRole("button", { name: "Add Project" })
    await user.click(submitButton)

    expect(createMutateAsync).not.toHaveBeenCalled()
  })

  it("validates invalid URL format", async () => {
    render(
      <EditProjectDialog
        isOpen={true}
        onClose={onClose}
        projectToEdit={null}
      />
    )

    await user.type(screen.getByLabelText(/project name/i), "Test Project")
    await user.type(screen.getByLabelText(/role \*/i), "Developer")
    await user.type(screen.getByLabelText(/start date/i), "Jan 2023")
    await user.type(screen.getByLabelText(/description/i), "Project description")
    await user.type(screen.getByLabelText(/project url/i), "ftp://example.com/files")

    const submitButton = screen.getByRole("button", { name: "Add Project" })
    await user.click(submitButton)

    expect(screen.getByRole("alert")).toHaveTextContent("Project URL must start with http:// or https://")
    expect(createMutateAsync).not.toHaveBeenCalled()
  })

  it("submits new project with technologies and calls onClose on successful add", async () => {
    render(
      <EditProjectDialog
        isOpen={true}
        onClose={onClose}
        projectToEdit={null}
      />
    )

    await user.type(screen.getByLabelText(/project name/i), "Search Engine")
    await user.type(screen.getByLabelText(/role \*/i), "Senior Backend Engineer")
    await user.type(screen.getByLabelText(/start date/i), "Jan 2022")
    await user.type(screen.getByLabelText(/description/i), "High-throughput search engine.")
    await user.type(screen.getByLabelText(/project url/i), "https://example.com/search")

    const techInput = screen.getByPlaceholderText("e.g., React — press Enter to add")
    await user.type(techInput, "Go{Enter}")
    await user.type(techInput, "Kubernetes")
    await user.click(screen.getByRole("button", { name: "Add" }))

    const ongoingCheckbox = screen.getByRole("checkbox", {
      name: /this project is ongoing/i,
    })
    await user.click(ongoingCheckbox)

    const submitButton = screen.getByRole("button", { name: "Add Project" })
    await user.click(submitButton)

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith({
        projectName: "Search Engine",
        role: "Senior Backend Engineer",
        projectType: "Professional",
        startDate: "Jan 2022",
        endDate: null,
        isOngoing: true,
        description: "High-throughput search engine.",
        technologiesUsed: ["Go", "Kubernetes"],
        projectUrl: "https://example.com/search",
      })
    })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("submits updated project and calls onClose on successful edit", async () => {
    render(
      <EditProjectDialog
        isOpen={true}
        onClose={onClose}
        projectToEdit={sampleProject}
      />
    )

    const roleInput = screen.getByLabelText(/role \*/i)
    await user.clear(roleInput)
    await user.type(roleInput, "Principal Architect")

    const submitButton = screen.getByRole("button", { name: "Update Project" })
    await user.click(submitButton)

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith({
        id: "proj-123",
        payload: {
          projectName: "AI Code Assistant",
          role: "Principal Architect",
          projectType: "Professional",
          startDate: "Feb 2023",
          endDate: "Nov 2023",
          isOngoing: false,
          description: "Built local LLM agent assistant.",
          technologiesUsed: ["Rust", "Python", "Triton"],
          projectUrl: "https://example.com/assistant",
        },
      })
    })

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
