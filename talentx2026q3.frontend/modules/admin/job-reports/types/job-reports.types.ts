export type JobReportStatus = 'Pending' | 'Resolved' | 'Dismissed';

export type JobReportReason =
  | 'SuspectedScam'
  | 'MisleadingInformation'
  | 'InappropriateContent'
  | 'IncorrectSalaryInformation'
  | 'EmployerImpersonation'
  | 'DuplicateJob'
  | 'DiscriminatoryContent'
  | 'Other';

export interface JobReportListItem {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  reason: JobReportReason;
  reasonLabel: string;
  status: JobReportStatus;
  createdAt: string;
  reporterEmail?: string;
}

export interface JobReportDetails {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  reason: JobReportReason;
  reasonLabel: string;
  status: JobReportStatus;
  additionalDetails?: string;
  adminNotes?: string;
  reporterUserId: string;
  reporterEmail?: string;
  resolvedByUserId?: string;
  resolvedByEmail?: string;
  resolvedAt?: string;
  createdAt: string;
  jobStatus: string;
}

export interface AdminJobReportQueryParams {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  status?: JobReportStatus;
}

export interface ResolveJobReportPayload {
  deactivationReason: string;
  details: string;
  adminNotes?: string;
}

export interface DismissJobReportPayload {
  adminNotes?: string;
}

export interface StatusUpdateResponse {
  message: string;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
