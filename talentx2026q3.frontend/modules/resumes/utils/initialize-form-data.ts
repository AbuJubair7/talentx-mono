import type { ResumeExtractionResult } from "../types/resume.types"

export function initializeFormData(extractionResult: ResumeExtractionResult): ResumeExtractionResult {
  const linkedInFromExtraction = extractionResult.linkedInUrl?.trim()
  const linkedInFromLinks = extractionResult.portfolioUrls?.find((portfolioUrl) => /linkedin\.com/i.test(portfolioUrl))?.trim()
  const resolvedLinkedIn = linkedInFromExtraction || linkedInFromLinks || ""

  return {
    ...extractionResult,
    linkedInUrl: resolvedLinkedIn,
    portfolioUrls: extractionResult.portfolioUrls ? [...extractionResult.portfolioUrls] : [],
    workExperience: extractionResult.workExperience ? [...extractionResult.workExperience] : [],
    education: extractionResult.education ? [...extractionResult.education] : [],
    projects: extractionResult.projects ? [...extractionResult.projects] : [],
    technicalSkills: extractionResult.technicalSkills ? [...extractionResult.technicalSkills] : [],
    softSkills: extractionResult.softSkills ? [...extractionResult.softSkills] : [],
    toolsAndPlatforms: extractionResult.toolsAndPlatforms ? [...extractionResult.toolsAndPlatforms] : [],
  }
}
