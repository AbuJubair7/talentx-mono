import type { ProjectType } from "../types/talent-profile.types"

export const PROJECT_TYPE_OPTIONS: readonly ProjectType[] = [
  "Professional",
  "Personal",
  "Academic",
] as const

export const PROJECT_LIMITS = {
  MAX_PROJECT_NAME_LENGTH: 200,
  MAX_ROLE_LENGTH: 150,
  MAX_DESCRIPTION_LENGTH: 4000,
  MAX_PROJECT_URL_LENGTH: 500,
  MAX_TECHNOLOGIES_COUNT: 30,
  MAX_TECHNOLOGY_LENGTH: 50,
} as const
