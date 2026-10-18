import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"

import { ResumeExtractionPreview } from "../components/ResumeExtractionPreview"
import type { ResumeExtractionResult } from "../types/resume.types"

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

const extraction: ResumeExtractionResult = {
  resumeUploadId: "upload-1",
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: null,
  location: null,
  linkedInUrl: null,
  portfolioUrls: [],
  workExperience: [],
  education: [],
  technicalSkills: [],
  softSkills: [],
  toolsAndPlatforms: [],
  fileStorageKey: "resumes/user-1/upload-1_resume.pdf",
}

describe("ResumeExtractionPreview", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it("only shows a toast when no onSaved prop is passed (standalone /resumes/upload flow, unchanged)", async () => {
    render(<ResumeExtractionPreview data={extraction} onReset={jest.fn()} />)

    await userEvent.click(screen.getByRole("button", { name: /confirm/i }))

    expect(toast.success).toHaveBeenCalled()
  })

  it("calls onSaved with the current (possibly edited) form data instead of only toasting", async () => {
    const onSaved = jest.fn().mockResolvedValue(undefined)

    render(<ResumeExtractionPreview data={extraction} onReset={jest.fn()} onSaved={onSaved} />)

    const fullNameInput = screen.getByPlaceholderText(/candidate full name/i)
    await userEvent.clear(fullNameInput)
    await userEvent.type(fullNameInput, "Grace Hopper")

    await userEvent.click(screen.getByRole("button", { name: /confirm/i }))

    expect(onSaved).toHaveBeenCalledTimes(1)
    expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ fullName: "Grace Hopper" }))
    expect(toast.success).not.toHaveBeenCalled()
  })

  it("calls onConfirm with current form data when onConfirm is provided", async () => {
    const onConfirm = jest.fn()

    render(<ResumeExtractionPreview data={extraction} onReset={jest.fn()} onConfirm={onConfirm} />)

    await userEvent.click(screen.getByRole("button", { name: /confirm/i }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ fullName: "Ada Lovelace" }))
    expect(toast.success).not.toHaveBeenCalled()
  })

  it("renders the dedicated LinkedIn field and preserves linkedInUrl", () => {
    const data: ResumeExtractionResult = {
      ...extraction,
      linkedInUrl: "https://linkedin.com/in/ada",
      portfolioUrls: ["https://ada.dev"],
    }

    render(<ResumeExtractionPreview data={data} onReset={jest.fn()} />)

    expect(screen.getByLabelText("LinkedIn profile")).toHaveValue("https://linkedin.com/in/ada")
    expect(screen.getByLabelText("Portfolio URL 1")).toHaveValue("https://ada.dev")
  })

  it("shows portfolio links and resolves linkedInUrl when present in portfolioUrls", () => {
    const data: ResumeExtractionResult = {
      ...extraction,
      linkedInUrl: null,
      portfolioUrls: ["https://linkedin.com/in/ada-port", "https://ada.dev"],
    }

    render(<ResumeExtractionPreview data={data} onReset={jest.fn()} />)

    expect(screen.getByLabelText("LinkedIn profile")).toHaveValue("https://linkedin.com/in/ada-port")
    expect(screen.getByLabelText("Portfolio URL 1")).toHaveValue("https://linkedin.com/in/ada-port")
    expect(screen.getByLabelText("Portfolio URL 2")).toHaveValue("https://ada.dev")
  })

  it("passes resolved linkedInUrl to onConfirm", async () => {
    const onConfirm = jest.fn()
    const data: ResumeExtractionResult = {
      ...extraction,
      linkedInUrl: "https://linkedin.com/in/ada",
      portfolioUrls: ["https://ada.dev"],
    }

    render(<ResumeExtractionPreview data={data} onReset={jest.fn()} onConfirm={onConfirm} />)

    await userEvent.click(screen.getByRole("button", { name: /confirm/i }))

    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        linkedInUrl: "https://linkedin.com/in/ada",
        portfolioUrls: ["https://ada.dev"],
      })
    )
  })
})
