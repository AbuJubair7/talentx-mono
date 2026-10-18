// API response DTO

export type ApplicationStatus =
  | 'PendingVerification'
  | 'Applied'
  | 'Interview'
  | 'Hired'
  | 'Rejected'
  | 'Invited'
  | 'Shortlisted';

export interface ApplicationStats {
  applied: number;
  interviews: number;
  hired: number;
  rejected: number;
}

export interface TalentApplicationCounts {
  total: number;
  applied: number;
  interviews: number;
  offers: number;
  rejected: number;
}

export interface TalentApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: ApplicationStatus;
}

export interface ApplicationStatusHistoryEvent {
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  changedAt: string;
}

export interface TalentInvitation {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  invitedDate: string;
  expiresAt: string;
  message: string;
  workArrangement: string;
  employmentType: string;
}

export interface TalentMatch {
  jobId: string;
  jobTitle: string;
  company: string;
  matchScore: number;
  workArrangement: string;
  employmentType: string;
  expireAt: string;
}

// Pagination envelope

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface ApplicationsPaginatedResult
  extends PaginatedResult<TalentApplication> {
  stats?: ApplicationStats;
}

// Query params sent to each endpoint

export interface GetApplicationsParams {
  status?: ApplicationStatus | 'All';
  search?: string; // Added optional search query parameter
  page?: number;
  pageSize?: number;
}

export interface GetInvitationsParams {
  page?: number;
  pageSize?: number;
}

export interface GetMatchesParams {
  page?: number;
  pageSize?: number;
  minScore?: number;
}

// Convenient return type aliases for hooks & components
export type TalentApplicationsResponse = ApplicationsPaginatedResult;
export type TalentInvitationsResponse = PaginatedResult<TalentInvitation>;
export type TalentMatchesResponse = PaginatedResult<TalentMatch>;