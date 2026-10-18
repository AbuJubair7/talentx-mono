import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper"

import { EducationEditor } from "../components/EducationEditor"
import { useEducationMutations } from "../hooks/useEducationMutations"
import type { EducationItemDto } from "../types/talent-profile.types"

jest.mock("../hooks/useEducationMutations")

const mockedUseEducationMutations = useEducationMutations as jest.MockedFunction<typeof useEducationMutations>

const educationItem: EducationItemDto = {
  id: "edu-1",
  institution: "Oxford University",
  degree: "M.S. in Computer Science",
  startDate: "2018",
  endDate: "2020",
}

describe("EducationEditor", () => {
  const user = userEvent.setup()
  const deleteMutateMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseEducationMutations.mockReturnValue({
      createEducation: { isPending: false, mutate: jest.fn(), mutateAsync: jest.fn() },
      updateEducation: { isPending: false, mutate: jest.fn(), mutateAsync: jest.fn() },
      deleteEducation: { isPending: false, mutate: deleteMutateMock, mutateAsync: jest.fn() },
    } as unknown as ReturnType<typeof useEducationMutations>)
  })

  it("renders education items", () => {
    render(<EducationEditor items={[educationItem]} />, { wrapper: createQueryWrapper() })

    expect(screen.getByText(/M\.S\. in Computer Science · Oxford University/i)).toBeInTheDocument()
    expect(screen.getByText(/2018 – 2020/i)).toBeInTheDocument()
  })

  it("opens DeleteConfirmationDialog when clicking delete button", async () => {
    render(<EducationEditor items={[educationItem]} />, { wrapper: createQueryWrapper() })

    const deleteButton = screen.getByRole("button", {
      name: `Delete ${educationItem.degree} at ${educationItem.institution}`,
    })
    await user.click(deleteButton)

    expect(screen.getByRole("heading", { name: "Delete education" })).toBeInTheDocument()
    expect(
      screen.getByText(
        `Are you sure you want to delete ${educationItem.degree} at ${educationItem.institution}? This action cannot be undone.`
      )
    ).toBeInTheDocument()

    expect(deleteMutateMock).not.toHaveBeenCalled()

    const confirmButton = screen.getByRole("button", { name: /^delete$/i })
    await user.click(confirmButton)

    expect(deleteMutateMock).toHaveBeenCalledWith(educationItem.id, expect.any(Object))
  })

  it("renders date pickers when opening edit form", async () => {
    render(<EducationEditor items={[educationItem]} />, { wrapper: createQueryWrapper() })

    const editButton = screen.getByRole("button", {
      name: `Edit ${educationItem.degree} at ${educationItem.institution}`,
    })
    await user.click(editButton)

    const startDateButton = screen.getByLabelText(/start date/i)
    expect(startDateButton).toHaveTextContent("2018")

    const endDateButton = screen.getByLabelText(/end date \/ expected/i)
    expect(endDateButton).toHaveTextContent("2020")
  })

  it("renders empty placeholder date pickers when opening add form", async () => {
    render(<EducationEditor items={[]} />, { wrapper: createQueryWrapper() })

    const addButton = screen.getByRole("button", { name: /add/i })
    await user.click(addButton)

    const startDateButton = screen.getByLabelText(/start date/i)
    expect(startDateButton).toHaveTextContent("Select start date")

    const endDateButton = screen.getByLabelText(/end date \/ expected/i)
    expect(endDateButton).toHaveTextContent("Select end date")
  })
})
