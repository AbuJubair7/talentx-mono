import type { ReactNode } from "react"
import type { ResumeExtractionResult } from "@/modules/resumes/types/resume.types"
import type { TalentProfileDto, UpdateTalentProfilePayload, WorkExperienceItemDto, EducationItemDto, TalentProfileTab } from "./talent-profile.types"

export type EditingSection = "basic" | "contact" | "experience" | null

export type ActiveOverviewModal =
  | "basic"
  | "career-summary"
  | "experience"
  | "contact"
  | "education"
  | "preferences"
  | "skills"
  | null

export interface OverviewTabContentProps {
  profile: TalentProfileDto
}

export interface TalentProfileHeroHeaderProps {
  profile: TalentProfileDto
  onEditBasicInfo?: () => void
}

export interface TalentProfileFormProps {
  profile: TalentProfileDto
  isSubmitting?: boolean
  onSave?: (payload: UpdateTalentProfilePayload) => void
}

export interface ProfilePictureUploadProps {
  currentPictureUrl: string | null
  nameForInitials?: string
}

export interface VideoIntroUploadProps {
  currentVideoUrl: string | null
}

export interface CurrentResumeCardProps {
  resumeFileName?: string | null
  resumeOriginalFileName?: string | null
  resumeUrl: string | null
  onReplaceResume?: () => void
}

export interface ReplaceResumeDialogProps {
  open?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
}

export interface TalentProfileExtractionPreviewProps {
  data: ResumeExtractionResult
  onReset: () => void
  onSaved?: (result: ResumeExtractionResult) => void | Promise<void>
  onConfirm?: (result: ResumeExtractionResult) => void | Promise<void>
}

export interface WorkExperienceFormValues {
  companyName: string
  jobTitle: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

export interface WorkExperienceEditorProps {
  items?: WorkExperienceItemDto[]
  workExperiences?: WorkExperienceItemDto[]
}

export interface WorkExperienceFormProps {
  formValues: WorkExperienceFormValues
  setFormValues: (updater: (previous: WorkExperienceFormValues) => WorkExperienceFormValues) => void
  error: string | null
  isSaving: boolean
  onSubmit: (event: React.FormEvent) => void
  onCancel: () => void
}

export interface EducationFormValues {
  institution: string
  degree: string
  startDate: string
  endDate: string
}

export interface EducationEditorProps {
  items?: EducationItemDto[]
  educations?: EducationItemDto[]
}

export interface EducationFormProps {
  formValues: EducationFormValues
  setFormValues: (updater: (previous: EducationFormValues) => EducationFormValues) => void
  error: string | null
  isSaving: boolean
  onSubmit: (event: React.FormEvent) => void
  onCancel: () => void
}

export interface TalentProfileViewProps {
  initialTab?: TalentProfileTab
}

export interface SkillsCategoryListProps {
  label: string
  values: string[]
  emptyMessage: string
}
