import type { ResumeExtractionResult } from "@/modules/resumes/types/resume.types"

export function unifyExtractionLinks(data: ResumeExtractionResult): ResumeExtractionResult {
  const links = [...(data.portfolioUrls ?? [])]
  const linkedIn = data.linkedInUrl?.trim()

  if (linkedIn && !links.some((link) => link.trim().toLowerCase() === linkedIn.toLowerCase())) {
    links.unshift(linkedIn)
  }

  return {
    ...data,
    portfolioUrls: links,
    linkedInUrl: "",
  }
}
