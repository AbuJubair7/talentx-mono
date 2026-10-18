import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { useEducationMutations } from "../../../hooks/useEducationMutations"
import type { EducationItemDto } from "../../../types"
import { EditEducationDialog } from "../EditEducationDialog"

jest.mock("../../../hooks/useEducationMutations")

const mockedUseEducationMutations = useEducationMutations as jest.MockedFunction<
  typeof useEducationMutations
>

const sampleEducations: EducationItemDto[] = [
  {
    id: "edu-1",
    degree: "Master of Science in Artificial Intelligence",
    institution: "Carnegie Mellon University",
    startDate: "2020",
    endDate: "2022",
  },
  {
    id: "edu-2",
    degree: "Bachelor of Science in Computer Science",
    institution: "UC Berkeley",
    startDate: "2016",
    endDate: "2020",
  },
]

describe("EditEducationDialog", () => {
  const user = userEvent.setup()
  const createMutateAsync = jest.fn().mockResolvedValue(undefined)
  const updateMutateAsync = jest.fn().mockResolvedValue(undefined)
  const deleteMutateAsync = jest.fn().mockResolvedValue(undefined)
  const onClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseEducationMutations.mockReturnValue({
      createEducation: { isPending: false, mutateAsync: createMutateAsync },
      updateEducation: { isPending: false, mutateAsync: updateMutateAsync },
      deleteEducation: { isPending: false, mutateAsync: deleteMutateAsync },
    } as unknown as ReturnType<typeof useEducationMutations>)
  })

  it("renders list mode with existing education entries and formatted dates", () => {
    render(
      <EditEducationDialog
        isOpen={true}
        onClose={onClose}
        items={sampleEducations}
      />
    )

    expect(screen.getByRole("heading", { name: "Edit Education" })).toBeInTheDocument()
    expect(
      screen.getByText("Degrees and institutions shown on your talent profile.")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Master of Science in Artificial Intelligence")
    ).toBeInTheDocument()
    expect(screen.getByText(/2020 – 2022/)).toBeInTheDocument()
    expect(screen.getByText("Bachelor of Science in Computer Science")).toBeInTheDocument()
    expect(screen.getByText(/2016 – 2020/)).toBeInTheDocument()
  })

  it("calls onClose when Done button is clicked in list mode", async () => {
    render(
      <EditEducationDialog
        isOpen={true}
        onClose={onClose}
        items={sampleEducations}
      />
    )

    const doneButton = screen.getByRole("button", { name: /^done$/i })
    await user.click(doneButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("switches to add form mode when '+ Add Education' is clicked and creates item on save", async () => {
    render(
      <EditEducationDialog
        isOpen={true}
        onClose={onClose}
        items={sampleEducations}
      />
    )

    const addButton = screen.getByRole("button", { name: /\+ add education/i })
    await user.click(addButton)

    const degreeInput = screen.getByRole("textbox", { name: /degree title \*/i })
    const institutionInput = screen.getByRole("textbox", { name: /institution \*/i })
    const startDateInput = screen.getByRole("textbox", { name: /start date \*/i })
    const endDateInput = screen.getByRole("textbox", { name: /end date/i })

    await user.type(degreeInput, "PhD in Machine Learning")
    await user.type(institutionInput, "MIT")
    await user.type(startDateInput, "2022")
    await user.type(endDateInput, "2026")

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await user.click(saveButton)

    expect(createMutateAsync).toHaveBeenCalledWith({
      degree: "PhD in Machine Learning",
      institution: "MIT",
      startDate: "2022",
      endDate: "2026",
    })

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /\+ add education/i })).toBeInTheDocument()
    })
  })

  it("switches to edit form mode with pre-filled inputs and updates item on save", async () => {
    render(
      <EditEducationDialog
        isOpen={true}
        onClose={onClose}
        items={sampleEducations}
      />
    )

    const editButton = screen.getByRole("button", {
      name: "Edit Bachelor of Science in Computer Science at UC Berkeley",
    })
    await user.click(editButton)

    const degreeInput = screen.getByRole("textbox", { name: /degree title \*/i })
    expect(degreeInput).toHaveValue("Bachelor of Science in Computer Science")

    await user.clear(degreeInput)
    await user.type(degreeInput, "BSc with Honors in Computer Science")

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await user.click(saveButton)

    expect(updateMutateAsync).toHaveBeenCalledWith({
      id: "edu-2",
      payload: {
        degree: "BSc with Honors in Computer Science",
        institution: "UC Berkeley",
        startDate: "2016",
        endDate: "2020",
      },
    })
  })

  it("opens delete confirmation and deletes education when confirmed", async () => {
    render(
      <EditEducationDialog
        isOpen={true}
        onClose={onClose}
        items={sampleEducations}
      />
    )

    const deleteButton = screen.getByRole("button", {
      name: "Delete Master of Science in Artificial Intelligence at Carnegie Mellon University",
    })
    await user.click(deleteButton)

    expect(screen.getByText("Delete Education")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Are you sure you want to remove Master of Science in Artificial Intelligence at Carnegie Mellon University?"
      )
    ).toBeInTheDocument()

    const confirmDeleteButton = screen.getByRole("button", { name: /^delete$/i })
    await user.click(confirmDeleteButton)

    expect(deleteMutateAsync).toHaveBeenCalledWith("edu-1")
  })

  it("renders entries with long titles with break-words and action buttons intact", () => {
    const longTitleEducations: EducationItemDto[] = [
      {
        id: "edu-long",
        degree: "Bachelor of Science in Electrical Engineering and Computer Science with Honors and Research Concentration",
        institution: "Massachusetts Institute of Technology - Department of EECS",
        startDate: "2018",
        endDate: "2022",
      },
    ]

    render(
      <EditEducationDialog
        isOpen={true}
        onClose={onClose}
        items={longTitleEducations}
      />
    )

    expect(
      screen.getByText(
        "Bachelor of Science in Electrical Engineering and Computer Science with Honors and Research Concentration"
      )
    ).toHaveClass("break-words")
    expect(
      screen.getByRole("button", {
        name: "Edit Bachelor of Science in Electrical Engineering and Computer Science with Honors and Research Concentration at Massachusetts Institute of Technology - Department of EECS",
      })
    ).toBeInTheDocument()
  })

  it("shows validation error when end date is earlier than start date and prevents save", async () => {
    render(
      <EditEducationDialog
        isOpen={true}
        onClose={onClose}
        items={sampleEducations}
      />
    )

    const addButton = screen.getByRole("button", { name: /\+ add education/i })
    await user.click(addButton)

    const degreeInput = screen.getByRole("textbox", { name: /degree title \*/i })
    const institutionInput = screen.getByRole("textbox", { name: /institution \*/i })
    const startDateInput = screen.getByRole("textbox", { name: /start date \*/i })
    const endDateInput = screen.getByRole("textbox", { name: /end date/i })

    await user.type(degreeInput, "B.S. Mathematics")
    await user.type(institutionInput, "Oxford")
    await user.type(startDateInput, "2024")
    await user.type(endDateInput, "2020")

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await user.click(saveButton)

    expect(screen.getByRole("alert")).toHaveTextContent("End date cannot be earlier than start date.")
    expect(createMutateAsync).not.toHaveBeenCalled()
  })
})
