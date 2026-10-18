import type {
  BuildEmployerJobsUrlOptions,
  EmployerJobListItemDto,
  EmployerJobsQueryParams,
  InitialEmployerJobsQueryParamsOptions,
  JobStatus,
  PaginationRange,
} from '../types/employer-job.types';

// Statuses that go straight to the API as ?status=. Active, Published and Expired are excluded
// because they also set isExpired, and All clears the filter instead.
const DIRECT_JOB_STATUS_PARAMS = ['Draft', 'Closed', 'Deactivated', 'PendingReview'] as const;

export function isDirectJobStatusParam(
  value: string | null | undefined
): value is Extract<JobStatus, (typeof DIRECT_JOB_STATUS_PARAMS)[number]> {
  return (
    value !== null &&
    value !== undefined &&
    (DIRECT_JOB_STATUS_PARAMS as readonly string[]).includes(value)
  );
}

export function getInitialEmployerJobsQueryParams({
  urlStatusParam,
  urlIsExpiredParam,
  initialUrlSearchParam,
}: InitialEmployerJobsQueryParamsOptions): EmployerJobsQueryParams {
  const trimmedInitialSearch = (initialUrlSearchParam ?? '').trim();
  const initialSearchTerm =
    trimmedInitialSearch.length > 0 ? trimmedInitialSearch : undefined;

  if (urlIsExpiredParam === 'true' || urlStatusParam === 'Expired') {
    return {
      page: 1,
      pageSize: 10,
      isExpired: true,
      searchTerm: initialSearchTerm,
    };
  }

  if (urlStatusParam === 'Active' || urlStatusParam === 'Published') {
    return {
      page: 1,
      pageSize: 10,
      status: 'Published',
      isExpired: false,
      searchTerm: initialSearchTerm,
    };
  }

  if (isDirectJobStatusParam(urlStatusParam)) {
    return {
      page: 1,
      pageSize: 10,
      status: urlStatusParam,
      searchTerm: initialSearchTerm,
    };
  }

  return {
    page: 1,
    pageSize: 10,
    searchTerm: initialSearchTerm,
  };
}

export function buildEmployerJobsUrl({
  pathname,
  status,
  isExpired,
  search,
}: BuildEmployerJobsUrlOptions): string {
  const resolvedPathname =
    pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  const cleanPathname = resolvedPathname.split('?')[0];

  const searchParameters = new URLSearchParams();

  if (isExpired || status === 'Expired') {
    searchParameters.set('isExpired', 'true');
  } else if (status === 'Active' || (status === 'Published' && isExpired === false)) {
    searchParameters.set('status', 'Active');
  } else if (status && status !== 'All') {
    searchParameters.set('status', status);
  }

  const trimmedSearch = search?.trim() ?? '';
  if (trimmedSearch.length > 0) {
    searchParameters.set('search', trimmedSearch);
  }

  const queryString = searchParameters.toString();
  return queryString.length > 0 ? `${cleanPathname}?${queryString}` : cleanPathname;
}

export function syncEmployerJobsUrl(options: BuildEmployerJobsUrlOptions): void {
  if (typeof window === 'undefined') {
    return;
  }

  const targetUrl = buildEmployerJobsUrl(options);
  window.history.replaceState(window.history.state, '', targetUrl);
}

export function calculatePaginationRange(
  currentPage: number,
  pageSize: number,
  totalCount: number
): PaginationRange {
  if (totalCount <= 0) {
    return { fromItem: 0, toItem: 0 };
  }

  const safePageNumber = Math.max(1, currentPage);
  const safePageSize = Math.max(1, pageSize);
  const fromItem = (safePageNumber - 1) * safePageSize + 1;
  const toItem = Math.min(safePageNumber * safePageSize, totalCount);

  return { fromItem, toItem };
}

export function resolveJobTitle(
  jobId: string,
  jobList: Array<Pick<EmployerJobListItemDto, 'id' | 'title'>>,
  fallbackTitle?: string | null
): string {
  const matchedJob = jobList.find((job) => job.id === jobId);
  if (matchedJob?.title && matchedJob.title.trim().length > 0) {
    return matchedJob.title.trim();
  }

  if (fallbackTitle && fallbackTitle.trim().length > 0) {
    return fallbackTitle.trim();
  }

  return '';
}
