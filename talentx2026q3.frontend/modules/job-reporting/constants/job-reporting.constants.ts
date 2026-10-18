import type { JobReportReason } from '../types/job-reporting.types';

export const REPORT_REASONS: { value: JobReportReason; label: string }[] = [
  { value: 'SuspectedScam', label: 'Suspected scam or fraud' },
  { value: 'MisleadingInformation', label: 'Misleading job information' },
  { value: 'InappropriateContent', label: 'Inappropriate content' },
  { value: 'IncorrectSalaryInformation', label: 'Incorrect salary or compensation' },
  { value: 'EmployerImpersonation', label: 'Employer impersonation' },
  { value: 'DuplicateJob', label: 'Duplicate job posting' },
  { value: 'DiscriminatoryContent', label: 'Discriminatory content' },
  { value: 'Other', label: 'Other issue' },
];

export const MAX_ADDITIONAL_DETAILS_LENGTH = 1000;
export const MIN_ADDITIONAL_DETAILS_LENGTH = 10;
