import type { SavedResume } from "@/modules/resumes/types/resume.types"

export interface WorkExperienceItemDto {
  id: string
  companyName: string
  jobTitle: string
  startDate: string | null
  endDate: string | null
  isCurrent: boolean
}

export interface EducationItemDto {
  id: string
  institution: string
  degree: string
  startDate: string | null
  endDate: string | null
}

export type ProjectType = "Professional" | "Personal" | "Academic"

export interface ProjectItemDto {
  id: string
  projectName: string
  role: string
  projectType: ProjectType
  startDate: string
  endDate: string | null
  isOngoing: boolean
  description: string
  technologiesUsed: string[]
  projectUrl: string | null
}

export interface ProjectUpsertPayload {
  projectName: string
  role: string
  projectType: ProjectType
  startDate: string
  endDate?: string | null
  isOngoing: boolean
  description: string
  technologiesUsed?: string[]
  projectUrl?: string | null
}

export interface TalentProfileDto {
  id: string
  userId: string
  name: string
  email: string
  tagline: string | null
  shortBio: string | null
  location: string | null
  phone: string | null
  linkedInUrl: string | null
  additionalUrls: string[]
  totalYearsExperience: number | null
  expectedSalary: number | null
  skillPropositions: string[]
  technicalSkills: string[]
  softSkills: string[]
  toolsAndPlatforms: string[]
  profilePictureUrl: string | null
  videoIntroUrl: string | null
  resumeOriginalFileName: string | null
  resumeUrl: string | null
  resumes: SavedResume[]
  workExperiences: WorkExperienceItemDto[]
  educations: EducationItemDto[]
  projects?: ProjectItemDto[]
  createdAt: string
  updatedAt: string | null
}

// Mirrors UpdateTalentProfileCommand. `name` is the one required field on the
// backend command — every other field is sent only when it actually changed.
export interface UpdateTalentProfilePayload {
  name: string
  location?: string | null
  tagline?: string | null
  shortBio?: string | null
  phone?: string | null
  linkedInUrl?: string | null
  additionalUrls?: string[]
  totalYearsExperience?: number | null
  expectedSalary?: number | null
  skillPropositions?: string[]
  technicalSkills?: string[]
  softSkills?: string[]
  toolsAndPlatforms?: string[]
}

// Mirrors UpsertWorkExperienceCommand / UpsertEducationCommand minus the `Id`
// (the id is passed separately to updateWorkExperience/updateEducation).
export interface WorkExperienceUpsertPayload {
  companyName: string
  jobTitle: string
  startDate?: string | null
  endDate?: string | null
  isCurrent: boolean
}

export interface EducationUpsertPayload {
  institution: string
  degree: string
  startDate?: string | null
  endDate?: string | null
}

// Mirrors ApplyExtractedProfileCommand. Basic profile fields are now included
// so candidates can review and confirm their extracted profile data alongside
// skills, work experiences, and educations.
export interface ApplyExtractedProfilePayload {
  fullName?: string | null
  tagline?: string | null
  shortBio?: string | null
  location?: string | null
  phone?: string | null
  linkedInUrl?: string | null
  additionalUrls?: string[]
  totalYearsExperience?: number | null
  expectedSalary?: number | null
  skillPropositions?: string[]
  technicalSkills: string[]
  softSkills: string[]
  toolsAndPlatforms: string[]
  workExperiences: Array<{
    companyName: string
    jobTitle: string
    startDate?: string | null
    endDate?: string | null
    isCurrent: boolean
  }>
  educations: Array<{
    institution: string
    degree: string
    startDate?: string | null
    endDate?: string | null
  }>
  projects?: Array<{
    projectName: string
    role: string
    projectType: ProjectType
    startDate: string
    endDate?: string | null
    isOngoing: boolean
    description: string
    technologiesUsed?: string[]
    projectUrl?: string | null
  }>
}

export interface ApplyExtractedProfileInput {
  payload: ApplyExtractedProfilePayload
  resumeFile?: File
}

export type TalentProfileTab = "overview" | "media-resume" | "projects"
