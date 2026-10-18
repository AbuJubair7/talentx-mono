import { render, screen } from "@testing-library/react"

import { ResumeFileThumbnail } from "../components/ResumeFileThumbnail"

describe("ResumeFileThumbnail", () => {
  it("shows a PDF chip for PDF resumes", () => {
    render(<ResumeFileThumbnail kind="PDF" />)

    expect(screen.getByText("PDF")).toBeInTheDocument()
  })

  it("shows a DOCX chip for Word resumes", () => {
    render(<ResumeFileThumbnail kind="DOCX" />)

    expect(screen.getByText("DOCX")).toBeInTheDocument()
  })
})
