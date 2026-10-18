import type { JobReportStatus } from '../types/job-reports.types';

export const PAGE_SIZE = 10;

export const REPORT_STATUS_TABS: { label: string; status: JobReportStatus | undefined }[] = [
  { label: 'All', status: undefined },
  { label: 'Pending', status: 'Pending' },
  { label: 'Resolved', status: 'Resolved' },
  { label: 'Dismissed', status: 'Dismissed' },
];

export const DEACTIVATION_REASON_OPTIONS = [
  { value: 'Spam', label: 'Spam or scam posting' },
  { value: 'InappropriateContent', label: 'Inappropriate content' },
  { value: 'MisleadingInformation', label: 'Misleading or invalid information' },
  { value: 'Discriminatory', label: 'Discriminatory content' },
  { value: 'DuplicatePosting', label: 'Duplicate posting' },
  { value: 'Outdated', label: 'Outdated job' },
  { value: 'Other', label: 'Other' },
] as const;
