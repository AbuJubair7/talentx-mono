import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ResumeSelectCard } from "../components/ResumeSelectCard"
import type { SavedResume } from "../types/resume.types"

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

function renderCard(overrides: Partial<React.ComponentProps<typeof ResumeSelectCard>> = {}) {
  const props = {
    resume: savedResume(),
    selected: true,
    onSelect: jest.fn(),
    onPreview: jest.fn(),
    ...overrides,
  }

  return { ...render(<ResumeSelectCard {...props} />), props }
}

describe("ResumeSelectCard", () => {
  const user = userEvent.setup()

  it("renders the display name, default badge and metadata without the original filename", () => {
    renderCard()

    expect(screen.getByText("Backend Resume")).toBeInTheDocument()
    expect(screen.getByText("Default")).toBeInTheDocument()
    expect(screen.getByText(/1 KB/)).toBeInTheDocument()
    expect(screen.getByText("Sep 1, 2026")).toBeInTheDocument()
    expect(screen.queryByText("backend.pdf")).not.toBeInTheDocument()
  })

  it("marks the select control as pressed when selected", () => {
    renderCard()

    expect(screen.getByRole("button", { name: /^backend resume/i })).toHaveAttribute("aria-pressed", "true")
  })

  it("selects the resume when the card is clicked", async () => {
    const { props } = renderCard({ selected: false })

    await user.click(screen.getByRole("button", { name: /^backend resume/i }))

    expect(props.onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "resume-1" }))
  })

  it("previews without changing the selection", async () => {
    const { props } = renderCard()

    await user.click(screen.getByRole("button", { name: /preview backend resume/i }))

    expect(props.onPreview).toHaveBeenCalledWith(expect.objectContaining({ id: "resume-1" }))
    expect(props.onSelect).not.toHaveBeenCalled()
  })

  it("truncates a long unbroken display name instead of overflowing", () => {
    const longName = "Md_Mehedi_Hasan_Rafi_Senior_Software_Engineer_Full_Stack_DotNet_NextJS_React_TypeScript_JavaScript_P"
    renderCard({ resume: savedResume({ displayName: longName }) })

    expect(screen.getByText(longName)).toHaveClass("truncate")
    expect(screen.getByText(longName)).toHaveAttribute("title", longName)
  })
})
