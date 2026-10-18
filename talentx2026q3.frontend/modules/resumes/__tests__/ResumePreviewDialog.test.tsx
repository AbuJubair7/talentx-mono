import { render, screen } from "@testing-library/react"

import { ResumePreviewDialog } from "../components/ResumePreviewDialog"
import { useResumeUrl } from "../hooks/useResumeUrl"
import type { SavedResume } from "../types/resume.types"

jest.mock("../hooks/useResumeUrl")

const mockedUseResumeUrl = useResumeUrl as jest.MockedFunction<typeof useResumeUrl>

function resume(overrides: Partial<SavedResume> = {}): SavedResume {
  return {
    id: "resume-1",
    displayName: "Backend Resume",
    originalFileName: "backend.pdf",
    contentType: "application/pdf",
    sizeBytes: 1024,
    isDefault: true,
    uploadedAt: "2026-09-01T12:00:00Z",
    ...overrides,
  }
}

describe("ResumePreviewDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseResumeUrl.mockReturnValue({
      data: {
        id: "resume-1",
        originalFileName: "backend.pdf",
        displayName: "Backend Resume",
        contentType: "application/pdf",
        url: "https://signed.example.com/backend.pdf",
      },
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useResumeUrl>)
  })

  it("embeds PDF documents in an iframe with a download action", () => {
    render(<ResumePreviewDialog resume={resume()} open onOpenChange={jest.fn()} />)

    const frame = screen.getByTitle("Preview of Backend Resume")
    expect(frame).toHaveAttribute("src", "https://signed.example.com/backend.pdf")
    expect(screen.getAllByRole("link", { name: /download/i })[0]).toHaveAttribute(
      "href",
      "https://signed.example.com/backend.pdf",
    )
  })

  it("falls back to a download prompt for Word documents", () => {
    mockedUseResumeUrl.mockReturnValue({
      data: {
        id: "resume-2",
        originalFileName: "backend.docx",
        displayName: "Backend Resume",
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        url: "https://signed.example.com/backend.docx",
      },
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useResumeUrl>)

    render(
      <ResumePreviewDialog
        resume={resume({ id: "resume-2", originalFileName: "backend.docx", contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })}
        open
        onOpenChange={jest.fn()}
      />,
    )

    expect(screen.queryByTitle(/preview of/i)).not.toBeInTheDocument()
    expect(screen.getByText(/can't be previewed here/i)).toBeInTheDocument()
    expect(screen.getAllByRole("link", { name: /download/i })[0]).toHaveAttribute(
      "href",
      "https://signed.example.com/backend.docx",
    )
  })

  it("shows an error message when the URL cannot be loaded", () => {
    mockedUseResumeUrl.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
    } as unknown as ReturnType<typeof useResumeUrl>)

    render(<ResumePreviewDialog resume={resume()} open onOpenChange={jest.fn()} />)

    expect(screen.getByText(/couldn't load this resume/i)).toBeInTheDocument()
  })
})
