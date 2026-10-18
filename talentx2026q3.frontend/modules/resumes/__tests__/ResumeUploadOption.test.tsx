import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ResumeUploadOption } from "../components/ResumeUploadOption"

const cvFile = () => new File(["resume"], "cv.pdf", { type: "application/pdf" })

function renderOption(overrides: Partial<React.ComponentProps<typeof ResumeUploadOption>> = {}) {
  const props = {
    selected: true,
    file: null,
    hasSavedResumes: false,
    onSelect: jest.fn(),
    onFileSelected: jest.fn(),
    onRemoveFile: jest.fn(),
    ...overrides,
  }

  return { ...render(<ResumeUploadOption {...props} />), props }
}

describe("ResumeUploadOption", () => {
  const user = userEvent.setup()

  it("invites a first upload when there are no saved resumes", () => {
    renderOption()

    expect(screen.getByText("Upload a resume")).toBeInTheDocument()
    expect(screen.getByText("PDF or DOCX, up to 5 MB")).toBeInTheDocument()
  })

  it("offers a tailored upload when saved resumes exist", () => {
    renderOption({ hasSavedResumes: true, selected: false })

    expect(screen.getByText("Upload a tailored resume")).toBeInTheDocument()
  })

  it("marks the option as selected", () => {
    renderOption({ hasSavedResumes: true })

    expect(screen.getByRole("button", { name: /^upload a tailored resume/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    )
  })

  it("selects the option when the card is clicked", async () => {
    const { props } = renderOption({ hasSavedResumes: true, selected: false })

    await user.click(screen.getByRole("button", { name: /^upload a tailored resume/i }))

    expect(props.onSelect).toHaveBeenCalled()
  })

  it("hands the chosen file back and shows its details", async () => {
    const { container, props, rerender } = renderOption({ hasSavedResumes: true })
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(fileInput, cvFile())

    expect(props.onFileSelected).toHaveBeenCalledWith(expect.any(File))

    rerender(<ResumeUploadOption {...props} file={cvFile()} />)

    expect(screen.getByText("cv.pdf")).toBeInTheDocument()
    expect(screen.getByText(/PDF · .+ · Ready to upload/)).toBeInTheDocument()
  })

  it("removes the file without changing the selection", async () => {
    const file = cvFile()
    const { props } = renderOption({ hasSavedResumes: true, file })

    await user.click(screen.getByRole("button", { name: /remove cv.pdf/i }))

    expect(props.onRemoveFile).toHaveBeenCalled()
    expect(props.onSelect).not.toHaveBeenCalled()
  })
})
