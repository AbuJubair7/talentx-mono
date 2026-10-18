import { act, fireEvent, render, screen } from "@testing-library/react"
import { toast } from "sonner"

import type { ResumeExtractionResult } from "@/modules/resumes/types/resume.types"

import { TalentProfileExtractionPreview } from "../components/TalentProfileExtractionPreview"

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

const baseExtractionResult: ResumeExtractionResult = {
  resumeUploadId: "upload-test-1",
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+1 (555) 000-0000",
  location: "London, UK",
  tagline: "Senior AI Engineer",
  shortBio: "Specialist in NLP and LLM deployments.",
  linkedInUrl: null,
  portfolioUrls: ["https://ada.dev"],
  workExperience: [],
  education: [],
  technicalSkills: ["Python", "PyTorch"],
  softSkills: ["Leadership"],
  toolsAndPlatforms: ["Docker"],
  fileStorageKey: "resumes/user-1/upload-1_resume.pdf",
}

describe("TalentProfileExtractionPreview", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it("renders initial profile fields correctly", () => {
    render(<TalentProfileExtractionPreview data={baseExtractionResult} onReset={jest.fn()} />)

    expect(screen.getByLabelText("Tagline")).toHaveValue("Senior AI Engineer")
    expect(screen.getByLabelText("Short bio")).toHaveValue("Specialist in NLP and LLM deployments.")
  })

  it("handles updates to profile fields and calls onConfirm with updated data", async () => {
    const handleConfirm = jest.fn()
    render(
      <TalentProfileExtractionPreview
        data={baseExtractionResult}
        onReset={jest.fn()}
        onConfirm={handleConfirm}
      />
    )

    const taglineInput = screen.getByLabelText("Tagline")
    fireEvent.change(taglineInput, { target: { value: "Lead AI Architect" } })

    const bioInput = screen.getByLabelText("Short bio")
    fireEvent.change(bioInput, { target: { value: "Experienced in large-scale machine learning systems." } })

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    await act(async () => {
      fireEvent.click(confirmButton)
    })

    expect(handleConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        tagline: "Lead AI Architect",
        shortBio: "Experienced in large-scale machine learning systems.",
      })
    )
  })

  it("resolves linkedInUrl from portfolioUrls on confirm when initial linkedInUrl was absent", async () => {
    const handleConfirm = jest.fn()
    const dataWithLinkedInInPortfolio: ResumeExtractionResult = {
      ...baseExtractionResult,
      linkedInUrl: null,
      portfolioUrls: ["https://linkedin.com/in/ada", "https://ada.dev"],
    }

    render(
      <TalentProfileExtractionPreview
        data={dataWithLinkedInInPortfolio}
        onReset={jest.fn()}
        onConfirm={handleConfirm}
      />
    )

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    await act(async () => {
      fireEvent.click(confirmButton)
    })

    expect(handleConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        linkedInUrl: "https://linkedin.com/in/ada",
        portfolioUrls: ["https://linkedin.com/in/ada", "https://ada.dev"],
      })
    )
  })

  it("calls onSaved callback when provided", async () => {
    const handleSaved = jest.fn()
    render(
      <TalentProfileExtractionPreview
        data={baseExtractionResult}
        onReset={jest.fn()}
        onSaved={handleSaved}
      />
    )

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    await act(async () => {
      fireEvent.click(confirmButton)
    })

    expect(handleSaved).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "Ada Lovelace",
        tagline: "Senior AI Engineer",
      })
    )
    expect(toast.success).not.toHaveBeenCalled()
  })

  it("displays success toast when neither onSaved nor onConfirm is provided", () => {
    render(<TalentProfileExtractionPreview data={baseExtractionResult} onReset={jest.fn()} />)

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    fireEvent.click(confirmButton)

    expect(toast.success).toHaveBeenCalledWith(
      "Extracted profile data confirmed!",
      expect.objectContaining({
        description: "Your parsed resume details are ready for application.",
      })
    )
  })

  it("calls onReset when cancel or upload new button is clicked", () => {
    const handleReset = jest.fn()
    render(<TalentProfileExtractionPreview data={baseExtractionResult} onReset={handleReset} />)

    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    fireEvent.click(cancelButton)
    expect(handleReset).toHaveBeenCalledTimes(1)

    const uploadNewButton = screen.getByRole("button", { name: /upload new/i })
    fireEvent.click(uploadNewButton)
    expect(handleReset).toHaveBeenCalledTimes(2)
  })
})
