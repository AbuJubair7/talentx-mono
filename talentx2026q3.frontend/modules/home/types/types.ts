// This module previously defined the Job type locally. The type now lives in
// the shared root at @/types/job (it's used across home, jobs listing and job
// details — not home-specific). This file re-exports it so existing imports
// like `../types/types` keep working. Prefer importing from @/types/job in new code.

export {
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  WORK_ARRANGEMENTS,
  JOB_STATUSES,
} from '@/types/job'

export type {
  EmploymentType,
  ExperienceLevel,
  WorkArrangement,
  JobStatus,
  JobDto,
} from '@/types/job'

export type { PortalViewsShowcaseProps } from './portalViewsShowcaseProps'
export type { ShowcaseSlide } from './showcaseSlide'
export type { PopularQuickSearchTag } from './popularQuickSearchTag'