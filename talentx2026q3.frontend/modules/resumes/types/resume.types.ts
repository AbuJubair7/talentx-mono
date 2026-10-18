export interface WorkExperienceDto {
  companyName?: string | null
  jobTitle?: string | null
  startDate?: string | null
  endDate?: string | null
  // Optional and defaulted so the pre-existing anonymous `/resumes/upload` flow
  // (which never sets this) is unaffected — added for the Talent profile's
  // "current role" distinction (TX26-231 AC 11).
  isCurrent?: boolean
}

export interface EducationDto {
  institution?: string | null
  degree?: string | null
  startDate?: string | null
  endDate?: string | null
}

export interface ProjectDto {
  projectName?: string | null
  role?: string | null
  projectType?: string | null
  startDate?: string | null
  endDate?: string | null
  isOngoing?: boolean
  description?: string | null
  technologiesUsed?: string[]
  projectUrl?: string | null
}

export interface ResumeExtractionResult {
  resumeUploadId: string
  fullName?: string | null
  tagline?: string | null
  shortBio?: string | null
  email?: string | null
  phone?: string | null
  location?: string | null
  linkedInUrl?: string | null
  portfolioUrls: string[]
  workExperience: WorkExperienceDto[]
  education: EducationDto[]
  projects?: ProjectDto[]
  technicalSkills: string[]
  softSkills: string[]
  toolsAndPlatforms: string[]
  fileStorageKey: string
}

export const MAX_SAVED_RESUMES = 5

// Mirrors the backend SavedResumeDto.
export interface SavedResume {
  id: string
  displayName: string
  originalFileName: string
  contentType: string
  sizeBytes: number
  isDefault: boolean
  uploadedAt: string
  extractedProfile?: ResumeExtractionResult | null
  aiServiceUnavailable?: boolean
}

// Mirrors the backend GetMyResumesResponse.
export interface SavedResumeListResponse {
  resumes: SavedResume[]
  maxResumes: number
}

// Mirrors the backend GetResumeUrlResponse.
export interface SavedResumeUrlResponse {
  id: string
  originalFileName: string
  displayName: string
  contentType: string
  url: string
}
