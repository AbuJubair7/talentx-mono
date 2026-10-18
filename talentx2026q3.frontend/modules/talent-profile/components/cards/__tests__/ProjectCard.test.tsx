import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { ProjectItemDto } from "../../../types/talent-profile.types"
import { ProjectCard } from "../ProjectCard"

const mockProject: ProjectItemDto = {
  id: "proj-1",
  projectName: "E-Commerce Microservices",
  role: "Lead Full-Stack Engineer",
  projectType: "Professional",
  startDate: "Jan 2023",
  endDate: "Dec 2023",
  isOngoing: false,
  description: "Designed distributed checkout and inventory services handling 10k requests/min.",
  technologiesUsed: ["Go", "Kubernetes", "PostgreSQL", "Redis"],
  projectUrl: "https://github.com/example/ecommerce",
}

describe("ProjectCard", () => {
  const user = userEvent.setup()
  const onEdit = jest.fn()
  const onDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders project name, role, type, date span, description, tech pills, and external link", () => {
    render(
      <ProjectCard
        project={mockProject}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    expect(screen.getByText("E-Commerce Microservices")).toBeInTheDocument()
    expect(screen.getByText("Lead Full-Stack Engineer · Professional")).toBeInTheDocument()
    expect(screen.getByText("Jan 2023 – Dec 2023")).toBeInTheDocument()
    expect(
      screen.getByText("Designed distributed checkout and inventory services handling 10k requests/min.")
    ).toBeInTheDocument()
    expect(screen.getByText("Go")).toBeInTheDocument()
    expect(screen.getByText("Kubernetes")).toBeInTheDocument()
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument()
    expect(screen.getByText("Redis")).toBeInTheDocument()

    const link = screen.getByRole("link", { name: /view project/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "https://github.com/example/ecommerce")
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("renders ongoing date span correctly", () => {
    const ongoingProject: ProjectItemDto = {
      ...mockProject,
      isOngoing: true,
      endDate: null,
    }

    render(
      <ProjectCard
        project={ongoingProject}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    expect(screen.getByText("Jan 2023 – Present")).toBeInTheDocument()
  })

  it("calls onEdit when Edit button is clicked", async () => {
    render(
      <ProjectCard
        project={mockProject}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    const editButton = screen.getByRole("button", { name: "Edit E-Commerce Microservices" })
    await user.click(editButton)

    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledWith(mockProject)
  })

  it("calls onDelete when Delete button is clicked", async () => {
    render(
      <ProjectCard
        project={mockProject}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    const deleteButton = screen.getByRole("button", { name: "Delete E-Commerce Microservices" })
    await user.click(deleteButton)

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith(mockProject)
  })

  it("handles projects without optional URL and tech pills cleanly", () => {
    const minimalProject: ProjectItemDto = {
      id: "proj-min",
      projectName: "Personal Blog",
      role: "Creator",
      projectType: "Personal",
      startDate: "2024",
      endDate: null,
      isOngoing: true,
      description: "Simple static site generator.",
      technologiesUsed: [],
      projectUrl: null,
    }

    render(
      <ProjectCard
        project={minimalProject}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    expect(screen.getByText("Personal Blog")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /view project/i })).not.toBeInTheDocument()
  })

  it("gracefully renders long strings with break-words classes", () => {
    const longProject: ProjectItemDto = {
      id: "proj-long",
      projectName: "SuperLongProjectNameWithoutAnySpacesAtAllThatCouldCauseOverflowIfWrappingIsNotConfiguredProperlyInCardHeader",
      role: "VeryLongRoleTitleDescribingComplexCrossFunctionalResponsibilitiesWithoutSpaces",
      projectType: "Academic",
      startDate: "Jan 2020",
      endDate: "Dec 2024",
      isOngoing: false,
      description: "A".repeat(500),
      technologiesUsed: ["ExtremelyLongTechnologyNameThatMightOverflowTheContainerWithoutPillWrap"],
      projectUrl: "https://example.com/very/long/deeply/nested/url/path/that/spans/multiple/lines/if/rendered/without/break/words",
    }

    render(
      <ProjectCard
        project={longProject}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    expect(screen.getByText(longProject.projectName)).toHaveClass("break-words")
    expect(screen.getByText(new RegExp(longProject.role))).toHaveClass("break-words")
    expect(screen.getByText(longProject.description)).toHaveClass("break-words")
    expect(screen.getByText(longProject.technologiesUsed[0])).toHaveClass("break-all")
    expect(screen.getByRole("link", { name: /view project/i })).toHaveClass("break-all")
  })
})
