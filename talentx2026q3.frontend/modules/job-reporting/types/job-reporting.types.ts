export type JobReportReason =
  | 'SuspectedScam'
  | 'MisleadingInformation'
  | 'InappropriateContent'
  | 'IncorrectSalaryInformation'
  | 'EmployerImpersonation'
  | 'DuplicateJob'
  | 'DiscriminatoryContent'
  | 'Other';

export interface ReportJobPayload {
  reason: JobReportReason;
  additionalDetails?: string;
}

export interface JobReportConfirmation {
  reportId: string;
  message: string;
}
