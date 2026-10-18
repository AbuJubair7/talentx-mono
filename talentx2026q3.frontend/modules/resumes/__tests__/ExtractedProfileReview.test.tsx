import { render, screen, fireEvent, act } from "@testing-library/react"
import { toast } from "sonner"

import { ExtractedProfileReview } from "../components/ExtractedProfileReview"
import type { ResumeExtractionResult } from "../types/resume.types"

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

const sampleExtraction: ResumeExtractionResult = {
  resumeUploadId: "upload-abc-123",
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+1-555-0199",
  location: "London, UK",
  tagline: "First Computer Programmer",
  shortBio: "Pioneered mechanical general-purpose computing algorithms.",
  linkedInUrl: "https://linkedin.com/in/ada-lovelace",
  portfolioUrls: ["https://ada.dev"],
  workExperience: [
    {
      companyName: "Babbage Engines",
      jobTitle: "Senior Analyst",
      startDate: "1842-01-01",
      endDate: null,
      isCurrent: true,
    },
  ],
  education: [
    {
      institution: "University of London",
      degree: "Mathematics",
      startDate: "1832-01-01",
      endDate: "1836-01-01",
    },
  ],
  projects: [
    {
      projectName: "Bernoulli Numbers Algorithm",
      role: "Lead Creator",
      startDate: "1843-01-01",
      endDate: null,
      isOngoing: false,
      description: "First published computer program",
    },
  ],
  technicalSkills: ["Mathematics", "Logic Design"],
  softSkills: ["Visionary Thinking"],
  toolsAndPlatforms: ["Analytical Engine"],
  fileStorageKey: "resumes/user-1/upload-1_resume.pdf",
}

describe("ExtractedProfileReview", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it("renders all profile creation sections and fields", () => {
    render(<ExtractedProfileReview data={sampleExtraction} onReset={jest.fn()} />)

    expect(screen.getByLabelText("Full name")).toHaveValue("Ada Lovelace")
    expect(screen.getByLabelText("Email address")).toHaveValue("ada@example.com")
    expect(screen.getByLabelText("Phone number")).toHaveValue("+1-555-0199")
    expect(screen.getByLabelText("Location")).toHaveValue("London, UK")
    expect(screen.getByLabelText("LinkedIn profile")).toHaveValue("https://linkedin.com/in/ada-lovelace")
    expect(screen.getByLabelText("Tagline")).toHaveValue("First Computer Programmer")
    expect(screen.getByLabelText("Short bio")).toHaveValue("Pioneered mechanical general-purpose computing algorithms.")
    expect(screen.getByDisplayValue("Babbage Engines")).toBeInTheDocument()
    expect(screen.getByDisplayValue("University of London")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Bernoulli Numbers Algorithm")).toBeInTheDocument()
    expect(screen.getByText("Mathematics")).toBeInTheDocument()
    expect(screen.getByText("Visionary Thinking")).toBeInTheDocument()
    expect(screen.getByText("Analytical Engine")).toBeInTheDocument()
  })

  it("preserves initial linkedInUrl and renders dedicated editable field", () => {
    render(<ExtractedProfileReview data={sampleExtraction} onReset={jest.fn()} />)

    const linkedInInput = screen.getByLabelText("LinkedIn profile")
    expect(linkedInInput).toBeInTheDocument()
    expect(linkedInInput).toHaveValue("https://linkedin.com/in/ada-lovelace")
  })

  it("resolves linkedInUrl from portfolioUrls when initial linkedInUrl is null", () => {
    const extractionWithLinkedInInPortfolio: ResumeExtractionResult = {
      ...sampleExtraction,
      linkedInUrl: null,
      portfolioUrls: ["https://linkedin.com/in/ada-from-links", "https://ada.dev"],
    }

    render(<ExtractedProfileReview data={extractionWithLinkedInInPortfolio} onReset={jest.fn()} />)

    expect(screen.getByLabelText("LinkedIn profile")).toHaveValue("https://linkedin.com/in/ada-from-links")
  })

  it("calls onSaved with updated data including edited LinkedIn URL", async () => {
    const onSaved = jest.fn().mockResolvedValue(undefined)
    render(<ExtractedProfileReview data={sampleExtraction} onReset={jest.fn()} onSaved={onSaved} />)

    const linkedInInput = screen.getByLabelText("LinkedIn profile")
    fireEvent.change(linkedInInput, { target: { value: "https://linkedin.com/in/ada-updated" } })

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    await act(async () => {
      fireEvent.click(confirmButton)
    })

    expect(onSaved).toHaveBeenCalledTimes(1)
    expect(onSaved).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "Ada Lovelace",
        linkedInUrl: "https://linkedin.com/in/ada-updated",
      })
    )
    expect(toast.success).not.toHaveBeenCalled()
  })

  it("calls onConfirm with current data when onConfirm is provided", async () => {
    const onConfirm = jest.fn()
    render(<ExtractedProfileReview data={sampleExtraction} onReset={jest.fn()} onConfirm={onConfirm} />)

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    await act(async () => {
      fireEvent.click(confirmButton)
    })

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "Ada Lovelace",
        linkedInUrl: "https://linkedin.com/in/ada-lovelace",
      })
    )
    expect(toast.success).not.toHaveBeenCalled()
  })

  it("falls back to portfolioUrls match if linkedInUrl field is cleared", async () => {
    const onConfirm = jest.fn()
    const extractionWithBoth: ResumeExtractionResult = {
      ...sampleExtraction,
      linkedInUrl: "https://linkedin.com/in/ada-manual",
      portfolioUrls: ["https://linkedin.com/in/ada-fallback", "https://ada.dev"],
    }

    render(<ExtractedProfileReview data={extractionWithBoth} onReset={jest.fn()} onConfirm={onConfirm} />)

    const linkedInInput = screen.getByLabelText("LinkedIn profile")
    fireEvent.change(linkedInInput, { target: { value: "" } })

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    await act(async () => {
      fireEvent.click(confirmButton)
    })

    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        linkedInUrl: "https://linkedin.com/in/ada-fallback",
      })
    )
  })

  it("shows success toast when neither onSaved nor onConfirm is provided", async () => {
    render(<ExtractedProfileReview data={sampleExtraction} onReset={jest.fn()} />)

    const confirmButton = screen.getByRole("button", { name: /confirm/i })
    await act(async () => {
      fireEvent.click(confirmButton)
    })

    expect(toast.success).toHaveBeenCalledWith(
      "Extracted profile data confirmed!",
      expect.objectContaining({
        description: "Your parsed resume details are ready for application.",
      })
    )
  })

  it("triggers onReset when cancel or upload new button is clicked", () => {
    const onReset = jest.fn()
    render(<ExtractedProfileReview data={sampleExtraction} onReset={onReset} />)

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }))
    expect(onReset).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole("button", { name: /upload new/i }))
    expect(onReset).toHaveBeenCalledTimes(2)
  })
})
