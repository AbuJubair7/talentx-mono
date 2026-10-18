import type { WorkExperienceDto, EducationDto, ProjectDto } from "@/modules/resumes/types/resume.types"

export interface ExtractedProfilePayload {
  tagline?: string | null
  shortBio?: string | null
  phone?: string | null
  linkedInUrl?: string | null
  portfolioUrls?: string[]
  skillPropositions?: string[]
}

export interface ApplyToJobPayload {
  applicantName: string
  applicantEmail: string
  resumeFile?: File | Blob
  coverLetter: string
  expectedSalary: number
  totalYearsExperience: number
  location?: string | null
  extractedTechnicalSkills?: string[]
  extractedSoftSkills?: string[]
  extractedToolsAndPlatforms?: string[]
  extractedWorkExperience?: WorkExperienceDto[]
  extractedEducation?: EducationDto[]
  extractedProjects?: ProjectDto[]
  extractedProfile?: ExtractedProfilePayload | string
}

export interface ApplyToJobResponse {
  applicationId: string
  jobId: string
  verificationEmailResent?: boolean
  alreadyApplied?: boolean
  accountExists?: boolean
}
