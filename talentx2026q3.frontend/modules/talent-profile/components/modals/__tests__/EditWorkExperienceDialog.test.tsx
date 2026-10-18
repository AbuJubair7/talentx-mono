import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { useWorkExperienceMutations } from "../../../hooks/useWorkExperienceMutations"
import type { WorkExperienceItemDto } from "../../../types"
import { EditWorkExperienceDialog } from "../EditWorkExperienceDialog"

jest.mock("../../../hooks/useWorkExperienceMutations")

const mockedUseWorkExperienceMutations = useWorkExperienceMutations as jest.MockedFunction<
  typeof useWorkExperienceMutations
>

const sampleExperiences: WorkExperienceItemDto[] = [
  {
    id: "work-1",
    jobTitle: "Senior AI Engineer",
    companyName: "Acme Corp",
    startDate: "Jan 2022",
    endDate: null,
    isCurrent: true,
  },
  {
    id: "work-2",
    jobTitle: "Software Developer",
    companyName: "Beta Solutions",
    startDate: "Jun 2019",
    endDate: "Dec 2021",
    isCurrent: false,
  },
]

describe("EditWorkExperienceDialog", () => {
  const user = userEvent.setup()
  const createMutateAsync = jest.fn().mockResolvedValue(undefined)
  const updateMutateAsync = jest.fn().mockResolvedValue(undefined)
  const deleteMutateAsync = jest.fn().mockResolvedValue(undefined)
  const onClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseWorkExperienceMutations.mockReturnValue({
      createWorkExperience: { isPending: false, mutateAsync: createMutateAsync },
      updateWorkExperience: { isPending: false, mutateAsync: updateMutateAsync },
      deleteWorkExperience: { isPending: false, mutateAsync: deleteMutateAsync },
    } as unknown as ReturnType<typeof useWorkExperienceMutations>)
  })

  it("renders list mode with existing work experience items and formatted dates", () => {
    render(
      <EditWorkExperienceDialog
        isOpen={true}
        onClose={onClose}
        items={sampleExperiences}
      />
    )

    expect(screen.getByRole("heading", { name: "Edit Work Experience" })).toBeInTheDocument()
    expect(
      screen.getByText("Roles and responsibilities shown on your talent profile.")
    ).toBeInTheDocument()
    expect(screen.getByText("Senior AI Engineer")).toBeInTheDocument()
    expect(screen.getByText(/Jan 2022 – Present/)).toBeInTheDocument()
    expect(screen.getByText("Software Developer")).toBeInTheDocument()
    expect(screen.getByText(/Jun 2019 – Dec 2021/)).toBeInTheDocument()
  })

  it("calls onClose when Done button is clicked in list mode", async () => {
    render(
      <EditWorkExperienceDialog
        isOpen={true}
        onClose={onClose}
        items={sampleExperiences}
      />
    )

    const doneButton = screen.getByRole("button", { name: /^done$/i })
    await user.click(doneButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("switches to add form mode when '+ Add Experience' is clicked and creates item on save", async () => {
    render(
      <EditWorkExperienceDialog
        isOpen={true}
        onClose={onClose}
        items={sampleExperiences}
      />
    )

    const addButton = screen.getByRole("button", { name: /\+ add experience/i })
    await user.click(addButton)

    const jobTitleInput = screen.getByRole("textbox", { name: /job title \*/i })
    const companyInput = screen.getByRole("textbox", { name: /company \*/i })
    const startDateInput = screen.getByRole("textbox", { name: /start date \*/i })
    const endDateInput = screen.getByRole("textbox", { name: /end date/i })

    await user.type(jobTitleInput, "Staff Architect")
    await user.type(companyInput, "NextGen AI")
    await user.type(startDateInput, "Mar 2024")
    await user.type(endDateInput, "Present")

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await user.click(saveButton)

    expect(createMutateAsync).toHaveBeenCalledWith({
      jobTitle: "Staff Architect",
      companyName: "NextGen AI",
      startDate: "Mar 2024",
      endDate: "Present",
      isCurrent: false,
    })

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /\+ add experience/i })).toBeInTheDocument()
    })
  })

  it("switches to edit form mode with pre-filled inputs and updates item on save", async () => {
    render(
      <EditWorkExperienceDialog
        isOpen={true}
        onClose={onClose}
        items={sampleExperiences}
      />
    )

    const editButton = screen.getByRole("button", {
      name: "Edit Software Developer at Beta Solutions",
    })
    await user.click(editButton)

    const jobTitleInput = screen.getByRole("textbox", { name: /job title \*/i })
    expect(jobTitleInput).toHaveValue("Software Developer")

    await user.clear(jobTitleInput)
    await user.type(jobTitleInput, "Lead Software Developer")

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await user.click(saveButton)

    expect(updateMutateAsync).toHaveBeenCalledWith({
      id: "work-2",
      payload: {
        jobTitle: "Lead Software Developer",
        companyName: "Beta Solutions",
        startDate: "Jun 2019",
        endDate: "Dec 2021",
        isCurrent: false,
      },
    })
  })

  it("disables end date input when 'I currently work here' is checked", async () => {
    render(
      <EditWorkExperienceDialog
        isOpen={true}
        onClose={onClose}
        items={sampleExperiences}
      />
    )

    await user.click(screen.getByRole("button", { name: /\+ add experience/i }))

    const currentCheckbox = screen.getByRole("checkbox", { name: /i currently work here/i })
    const endDateInput = screen.getByRole("textbox", { name: /end date/i })

    expect(currentCheckbox).not.toBeChecked()
    expect(endDateInput).toBeEnabled()

    await user.click(currentCheckbox)

    expect(currentCheckbox).toBeChecked()
    expect(endDateInput).toBeDisabled()
  })

  it("opens delete confirmation and deletes item when confirmed", async () => {
    render(
      <EditWorkExperienceDialog
        isOpen={true}
        onClose={onClose}
        items={sampleExperiences}
      />
    )

    const deleteButton = screen.getByRole("button", {
      name: "Delete Senior AI Engineer at Acme Corp",
    })
    await user.click(deleteButton)

    expect(screen.getByText("Delete Work Experience")).toBeInTheDocument()
    expect(
      screen.getByText("Are you sure you want to remove Senior AI Engineer at Acme Corp?")
    ).toBeInTheDocument()

    const confirmDeleteButton = screen.getByRole("button", { name: /^delete$/i })
    await user.click(confirmDeleteButton)

    expect(deleteMutateAsync).toHaveBeenCalledWith("work-1")
  })

  it("renders entries with long titles with break-words and action buttons intact", () => {
    const longTitleExperiences: WorkExperienceItemDto[] = [
      {
        id: "work-long",
        jobTitle: "Lead Principal Staff Distributed Systems and Machine Learning Infrastructure Architect",
        companyName: "International Enterprise Global Cloud Infrastructure Systems Inc.",
        startDate: "Jan 2020",
        endDate: null,
        isCurrent: true,
      },
    ]

    render(
      <EditWorkExperienceDialog
        isOpen={true}
        onClose={onClose}
        items={longTitleExperiences}
      />
    )

    expect(
      screen.getByText(
        "Lead Principal Staff Distributed Systems and Machine Learning Infrastructure Architect"
      )
    ).toHaveClass("break-words")
    expect(
      screen.getByRole("button", {
        name: "Edit Lead Principal Staff Distributed Systems and Machine Learning Infrastructure Architect at International Enterprise Global Cloud Infrastructure Systems Inc.",
      })
    ).toBeInTheDocument()
  })

  it("shows validation error when end date is earlier than start date and prevents save", async () => {
    render(
      <EditWorkExperienceDialog
        isOpen={true}
        onClose={onClose}
        items={sampleExperiences}
      />
    )

    const addButton = screen.getByRole("button", { name: /\+ add experience/i })
    await user.click(addButton)

    const jobTitleInput = screen.getByRole("textbox", { name: /job title \*/i })
    const companyInput = screen.getByRole("textbox", { name: /company \*/i })
    const startDateInput = screen.getByRole("textbox", { name: /start date \*/i })
    const endDateInput = screen.getByRole("textbox", { name: /end date/i })

    await user.type(jobTitleInput, "Senior Engineer")
    await user.type(companyInput, "Stripe")
    await user.type(startDateInput, "Jan 2024")
    await user.type(endDateInput, "Dec 2022")

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    await user.click(saveButton)

    expect(screen.getByRole("alert")).toHaveTextContent("End date cannot be earlier than start date.")
    expect(createMutateAsync).not.toHaveBeenCalled()
  })
})
