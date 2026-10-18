import type { ResumeExtractionResult } from "@/modules/resumes/types/resume.types"

import type { ApplyExtractedProfilePayload, ProjectType } from "../types/talent-profile.types"

// ApplyExtractedProfileCommand requires CompanyName/JobTitle/Institution/Degree
// non-empty, even though the AI extraction result marks them nullable (the
// model sometimes can't find a value). Rows missing a required field are
// dropped rather than sent and rejected by the server's validator — the
// Talent already reviewed the editable preview before confirming, so a blank
// row here means they chose not to fill it in.
//
// Resume-file metadata (storage key, filename, content type, size) is no
// longer part of this payload — the resume's raw bytes are resubmitted
// alongside this JSON payload as a separate multipart form part, and the
// backend derives filename/content-type/size from that file directly.
export function buildApplyExtractionPayload(formData: ResumeExtractionResult): ApplyExtractedProfilePayload {
  const linkedInCandidate =
    formData.linkedInUrl?.trim() ||
    (formData.portfolioUrls ?? []).find((portfolioUrl) => /linkedin\.com/i.test(portfolioUrl))?.trim() ||
    null

  const additionalUrls = (formData.portfolioUrls ?? [])
    .map((portfolioUrl) => portfolioUrl?.trim())
    .filter((portfolioUrl): portfolioUrl is string => Boolean(portfolioUrl))
    .filter((portfolioUrl) => portfolioUrl !== linkedInCandidate)

  const projects = formData.projects
    ?.filter(
      (projectItem) =>
        Boolean(projectItem.projectName?.trim()) &&
        Boolean(projectItem.role?.trim()) &&
        Boolean(projectItem.startDate?.trim()) &&
        Boolean(projectItem.description?.trim())
    )
    .map((projectItem) => {
      const rawType = projectItem.projectType?.trim()
      const projectType: ProjectType =
        rawType === "Personal" || rawType === "Academic" ? rawType : "Professional"

      return {
        projectName: projectItem.projectName!.trim(),
        role: projectItem.role!.trim(),
        projectType,
        startDate: projectItem.startDate!.trim(),
        endDate: projectItem.isOngoing ? null : projectItem.endDate?.trim() || null,
        isOngoing: Boolean(projectItem.isOngoing),
        description: projectItem.description!.trim(),
        technologiesUsed: projectItem.technologiesUsed ?? [],
        projectUrl: projectItem.projectUrl?.trim() || null,
      }
    })

  return {
    fullName: formData.fullName?.trim() || null,
    tagline: formData.tagline?.trim() || null,
    shortBio: formData.shortBio?.trim() || null,
    location: formData.location?.trim() || null,
    phone: formData.phone?.trim() || null,
    linkedInUrl: linkedInCandidate,
    additionalUrls,
    technicalSkills: formData.technicalSkills ?? [],
    softSkills: formData.softSkills ?? [],
    toolsAndPlatforms: formData.toolsAndPlatforms ?? [],
    workExperiences: (formData.workExperience ?? [])
      .filter((experienceItem) => experienceItem.companyName?.trim() && experienceItem.jobTitle?.trim())
      .map((experienceItem) => ({
        companyName: experienceItem.companyName!.trim(),
        jobTitle: experienceItem.jobTitle!.trim(),
        startDate: experienceItem.startDate?.trim() || null,
        endDate: experienceItem.isCurrent ? null : experienceItem.endDate?.trim() || null,
        isCurrent: experienceItem.isCurrent ?? false,
      })),
    educations: (formData.education ?? [])
      .filter((educationItem) => educationItem.institution?.trim() && educationItem.degree?.trim())
      .map((educationItem) => ({
        institution: educationItem.institution!.trim(),
        degree: educationItem.degree!.trim(),
        startDate: educationItem.startDate?.trim() || null,
        endDate: educationItem.endDate?.trim() || null,
      })),
    ...(projects !== undefined ? { projects } : {}),
  }
}
