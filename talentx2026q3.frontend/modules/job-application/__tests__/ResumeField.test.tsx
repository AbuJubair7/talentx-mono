import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { SavedResume } from "@/modules/resumes/types/resume.types"

import { ResumeField } from "../components/apply/FormFields"

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

const savedResume = (overrides: Partial<SavedResume> = {}): SavedResume => ({
  id: "resume-1",
  displayName: "Backend Resume",
  originalFileName: "backend.pdf",
  contentType: "application/pdf",
  sizeBytes: 1024,
  isDefault: true,
  uploadedAt: "2026-09-01T12:00:00Z",
  ...overrides,
})

const cvFile = () => new File(["resume"], "cv.pdf", { type: "application/pdf" })

function renderField(overrides: Partial<React.ComponentProps<typeof ResumeField>> = {}) {
  const props = {
    choice: "saved" as const,
    onChoiceChange: jest.fn(),
    resumes: [savedResume()],
    maxResumes: 5,
    selectedResumeId: "resume-1",
    onSelectResume: jest.fn(),
    onPreviewResume: jest.fn(),
    saveToLibrary: false,
    onSaveToLibraryChange: jest.fn(),
    uploadedFile: null,
    onUpload: jest.fn(),
    ...overrides,
  }

  return { ...render(<ResumeField {...props} />), props }
}

describe("ResumeField", () => {
  const user = userEvent.setup()

  it("selects a saved resume", async () => {
    const { props } = renderField({ choice: "new", selectedResumeId: null })

    await user.click(screen.getByRole("button", { name: /^backend resume/i }))

    expect(props.onChoiceChange).toHaveBeenCalledWith("saved")
    expect(props.onSelectResume).toHaveBeenCalledWith("resume-1")
  })

  it("shows one name and a metadata line per resume, not the original filename", () => {
    renderField()

    expect(screen.getByText("Backend Resume")).toBeInTheDocument()
    expect(screen.getByText(/1 KB/)).toBeInTheDocument()
    expect(screen.getByText("Default")).toBeInTheDocument()
    expect(screen.queryByText("backend.pdf")).not.toBeInTheDocument()
    expect(screen.queryByText(/your saved resumes/i)).not.toBeInTheDocument()
  })

  it("opens the preview without changing the selection", async () => {
    const { props } = renderField()

    await user.click(screen.getByRole("button", { name: /preview backend resume/i }))

    expect(props.onPreviewResume).toHaveBeenCalledWith(expect.objectContaining({ id: "resume-1" }))
    expect(props.onSelectResume).not.toHaveBeenCalled()
  })

  it("offers to save a newly selected file to the library", async () => {
    const { container, props, rerender } = renderField({ choice: "new", selectedResumeId: null })
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(fileInput, cvFile())

    expect(props.onChoiceChange).toHaveBeenCalledWith("new")
    expect(props.onUpload).toHaveBeenCalledWith(expect.any(File))

    rerender(<ResumeField {...props} uploadedFile={cvFile()} />)

    expect(screen.getByText("cv.pdf")).toBeInTheDocument()

    const checkbox = screen.getByRole("checkbox", { name: /also save this resume/i })
    await user.click(checkbox)

    expect(props.onSaveToLibraryChange).toHaveBeenCalledWith(true)
  })

  it("disables the save-to-library option at the limit", () => {
    renderField({
      choice: "new",
      selectedResumeId: null,
      uploadedFile: cvFile(),
      resumes: Array.from({ length: 5 }, (_, index) =>
        savedResume({ id: `resume-${index + 1}`, isDefault: index === 0 }),
      ),
    })

    expect(screen.getByRole("checkbox", { name: /also save this resume/i })).toBeDisabled()
    expect(screen.getByText(/already have 5 saved resumes/i)).toBeInTheDocument()
  })

  it("shows the size error for oversized files", async () => {
    const { container, props } = renderField({ resumes: [], choice: "new" })
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.pdf", {
      type: "application/pdf",
    })

    await user.upload(fileInput, oversized)

    expect(screen.getByRole("alert")).toHaveTextContent(/5 MB/i)
    expect(props.onUpload).not.toHaveBeenCalled()
  })

  it("allows the fieldset to shrink so long unbroken resume names cannot stretch the section", () => {
    const { container } = renderField()

    const fieldset = container.querySelector("fieldset")
    expect(fieldset).toHaveClass("min-w-0")
  })
})
