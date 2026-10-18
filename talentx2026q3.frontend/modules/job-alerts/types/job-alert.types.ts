import type { EmploymentType, ExperienceLevel, WorkArrangement } from '@/modules/job-listing';

export interface JobAlert {
  id: string;
  name: string;
  title: string;
  location: string | null;
  employmentType: EmploymentType | null;
  experienceLevel: ExperienceLevel | null;
  workArrangement: WorkArrangement | null;
  isEnabled: boolean;
  createdAt: string;
}

export interface CreateJobAlertInput {
  name: string;
  title: string;
  location?: string | null;
  employmentType?: EmploymentType | null;
  experienceLevel?: ExperienceLevel | null;
  workArrangement?: WorkArrangement | null;
}

export interface UpdateJobAlertInput {
  name: string;
  title: string;
  location?: string | null;
  employmentType?: EmploymentType | null;
  experienceLevel?: ExperienceLevel | null;
  workArrangement?: WorkArrangement | null;
}

export interface ToggleJobAlertInput {
  id: string;
  isEnabled: boolean;
}

export interface TalentNotificationPreference {
  jobAlertsEmailEnabled: boolean;
}

export interface UpdateTalentNotificationPreferenceInput {
  jobAlertsEmailEnabled: boolean;
}
