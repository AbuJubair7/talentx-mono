export type ApplicationStatus =
  | 'PendingVerification'
  | 'Applied'
  | 'Reviewed'
  | 'Interview'
  | 'Hired'
  | 'Rejected'
  | 'Invited'
  | 'Shortlisted';

export const ALL_STATUS_FILTER_VALUE = 'All' as const;
export type ApplicationStatusFilter = ApplicationStatus | typeof ALL_STATUS_FILTER_VALUE;

export interface StatusOption {
  value: ApplicationStatus;
  label: string;
}

export interface StatusStyleConfig {
  label: string;
  bg: string;
  dot: string;
}

export interface JobApplicant {
  id: string;
  jobId: string;
  talentUserId: string;
  applicantName: string;
  applicantEmail: string;
  resumeDownloadUrl: string | null;
  status: ApplicationStatus;
  aiMatchScore: number | null;
  expectedSalary: number | null;
  totalYearsExperience: number | null;
  location: string | null;
  appliedAt: string;
}

export interface PaginatedApplicantList<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface GetJobApplicantsQueryParams {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
}

export interface ScoreApplicantsResponse {
  jobId: string;
  scoredCount: number;
  reusedCount?: number;
}

export interface WorkExperienceItem {
  id: string;
  companyName: string;
  jobTitle: string;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  startDate: string | null;
  endDate: string | null;
}

export interface CandidateProjectItem {
  id: string;
  projectName: string;
  role: string;
  projectType: string;
  startDate: string;
  endDate: string | null;
  isOngoing: boolean;
  description: string;
  technologiesUsed: string[];
  projectUrl: string | null;
}

export interface StatusUpdateResponse {
  message?: string;
}

export interface CandidateProfile {
  applicationId: string;
  jobId: string;
  talentUserId: string;
  name: string;
  email: string;
  tagline: string | null;
  shortBio: string | null;
  location: string | null;
  linkedInUrl: string | null;
  additionalUrls: string[];
  totalYearsExperience: number | null;
  expectedSalary: number | null;
  skillPropositions: string[];
  technicalSkills: string[];
  softSkills: string[];
  toolsAndPlatforms: string[];
  profilePictureUrl: string | null;
  videoIntroUrl: string | null;
  resumeOriginalFileName: string | null;
  resumeUrl: string | null;
  resumeKind: 'PDF' | 'DOCX' | null;
  applicationStatus: ApplicationStatus;
  aiMatchScore: number | null;
  coverLetter: string | null;
  appliedAt: string;
  workExperiences: WorkExperienceItem[];
  educations: EducationItem[];
  projects?: CandidateProjectItem[];
}
