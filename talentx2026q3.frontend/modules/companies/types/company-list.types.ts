/**
 * Company list DTOs — mirrors backend `CompanyListItemDto` /
 * `CompanyQueryParams` (`GET /companies`), camelCase over the wire.
 */

export type CompanySortBy = 'name' | 'openings' | 'vacancies' | 'newest';

export type CompanySortDir = 'asc' | 'desc';

/** Mirrors backend `CompanyListItemDto`. */
export interface CompanyListItem {
  id: string;
  name: string;
  logoUrl?: string | null;
  description?: string | null;
  industry?: string | null;
  companySize?: string | null;
  website?: string | null;
  location?: string | null;
  linkedIn?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  /** Number of active (published, non-expired) job posts. */
  openingsCount: number;
  /** Sum of `vacancies` across active job posts. */
  vacanciesCount: number;
}

export interface CompanyFilterParams {
  keyword?: string;
  industry?: string;
  location?: string;
  companySize?: string;
  /** When true, only show companies with at least one active job opening. */
  hiring?: boolean;
  sortBy?: CompanySortBy;
  sortDir?: CompanySortDir;
  page?: number;
  pageSize?: number;
}

/** Mirrors backend `PaginatedList<CompanyListItemDto>`. */
export interface PagedCompanies {
  items: CompanyListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  /** Active-job aggregates over the whole filtered set (stable across sort/page). */
  totalOpenings: number;
  /** Sum of vacancies over the whole filtered set (stable across sort/page). */
  totalVacancies: number;
}

export const DEFAULT_COMPANY_PAGE_SIZE = 12;

/** Upper bounds for outgoing list queries (mirrors backend page-size limits). */
export const MAX_COMPANY_PAGE_SIZE = 50;

/** Keywords are trimmed and truncated to this length before requesting. */
export const MAX_COMPANY_KEYWORD_LENGTH = 100;

export interface CompanySortOption {
  label: string;
  value: CompanySortBy;
  dir: CompanySortDir;
}

export const COMPANY_SORT_OPTIONS: CompanySortOption[] = [
  { label: 'Most open roles', value: 'openings', dir: 'desc' },
  { label: 'Most vacancies', value: 'vacancies', dir: 'desc' },
  { label: 'Name (A–Z)', value: 'name', dir: 'asc' },
  { label: 'Name (Z–A)', value: 'name', dir: 'desc' },
  { label: 'Newest', value: 'newest', dir: 'desc' },
];

/** Composite key for the sort `<select>` (sort field + direction). */
export function companySortKey(sortBy: CompanySortBy, sortDir: CompanySortDir): string {
  return `${sortBy}:${sortDir}`;
}
