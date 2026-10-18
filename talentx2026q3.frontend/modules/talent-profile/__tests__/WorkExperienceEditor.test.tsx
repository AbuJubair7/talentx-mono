import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper"

import { WorkExperienceEditor } from "../components/WorkExperienceEditor"
import { useWorkExperienceMutations } from "../hooks/useWorkExperienceMutations"
import type { WorkExperienceItemDto } from "../types/talent-profile.types"

jest.mock("../hooks/useWorkExperienceMutations")

const mockedUseWorkExperienceMutations = useWorkExperienceMutations as jest.MockedFunction<
  typeof useWorkExperienceMutations
>

const workItem: WorkExperienceItemDto = {
  id: "work-1",
  companyName: "Acme Inc",
  jobTitle: "Software Engineer",
  startDate: "Jan 2020",
  endDate: "Dec 2022",
  isCurrent: false,
}

describe("WorkExperienceEditor", () => {
  const user = userEvent.setup()
  const deleteMutateMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseWorkExperienceMutations.mockReturnValue({
      createWorkExperience: { isPending: false, mutate: jest.fn(), mutateAsync: jest.fn() },
      updateWorkExperience: { isPending: false, mutate: jest.fn(), mutateAsync: jest.fn() },
      deleteWorkExperience: { isPending: false, mutate: deleteMutateMock, mutateAsync: jest.fn() },
    } as unknown as ReturnType<typeof useWorkExperienceMutations>)
  })

  it("renders work experience items", () => {
    render(<WorkExperienceEditor items={[workItem]} />, { wrapper: createQueryWrapper() })

    expect(screen.getByText(/Software Engineer · Acme Inc/i)).toBeInTheDocument()
    expect(screen.getByText(/Jan 2020 – Dec 2022/i)).toBeInTheDocument()
  })

  it("opens DeleteConfirmationDialog when clicking delete button", async () => {
    render(<WorkExperienceEditor items={[workItem]} />, { wrapper: createQueryWrapper() })

    const deleteButton = screen.getByRole("button", {
      name: `Delete ${workItem.jobTitle} at ${workItem.companyName}`,
    })
    await user.click(deleteButton)

    expect(screen.getByRole("heading", { name: "Delete work experience" })).toBeInTheDocument()
    expect(
      screen.getByText(
        `Are you sure you want to delete ${workItem.jobTitle} at ${workItem.companyName}? This action cannot be undone.`
      )
    ).toBeInTheDocument()

    expect(deleteMutateMock).not.toHaveBeenCalled()

    const confirmButton = screen.getByRole("button", { name: /^delete$/i })
    await user.click(confirmButton)

    expect(deleteMutateMock).toHaveBeenCalledWith(workItem.id, expect.any(Object))
  })

  it("renders date pickers when opening edit form", async () => {
    render(<WorkExperienceEditor items={[workItem]} />, { wrapper: createQueryWrapper() })

    const editButton = screen.getByRole("button", {
      name: `Edit ${workItem.jobTitle} at ${workItem.companyName}`,
    })
    await user.click(editButton)

    const startDateButton = screen.getByLabelText(/start date/i)
    expect(startDateButton).toHaveTextContent("Jan 2020")

    const endDateButton = screen.getByLabelText(/end date/i)
    expect(endDateButton).toHaveTextContent("Dec 2022")
  })

  it("disables end date picker when marking job as current", async () => {
    render(<WorkExperienceEditor items={[workItem]} />, { wrapper: createQueryWrapper() })

    const editButton = screen.getByRole("button", {
      name: `Edit ${workItem.jobTitle} at ${workItem.companyName}`,
    })
    await user.click(editButton)

    const currentCheckbox = screen.getByRole("checkbox", { name: /i currently work here/i })
    expect(currentCheckbox).not.toBeChecked()

    await user.click(currentCheckbox)
    expect(currentCheckbox).toBeChecked()

    const endDateButton = screen.getByLabelText(/end date/i)
    expect(endDateButton).toHaveTextContent("Present")
    expect(endDateButton).toBeDisabled()
  })
})
