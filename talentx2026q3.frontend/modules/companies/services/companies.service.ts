import { apiClient, parseApiError } from '@/lib/api/axios';
import type {
  CompanyFilterParams,
  CompanyListItem,
  CompanySortBy,
  CompanySortDir,
  PagedCompanies,
} from '../types/company-list.types';
import {
  DEFAULT_COMPANY_PAGE_SIZE,
  MAX_COMPANY_KEYWORD_LENGTH,
  MAX_COMPANY_PAGE_SIZE,
} from '../types/company-list.types';

interface BackendCompanyListItemDto {
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
  openingsCount: number;
  vacanciesCount: number;
}

interface BackendPagedCompaniesDto {
  items: BackendCompanyListItemDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  totalOpenings?: number;
  totalVacancies?: number;
}

function mapCompanyListItem(item: BackendCompanyListItemDto): CompanyListItem {
  return {
    id: item.id,
    name: item.name,
    logoUrl: item.logoUrl ?? null,
    description: item.description ?? null,
    industry: item.industry ?? null,
    companySize: item.companySize ?? null,
    website: item.website ?? null,
    location: item.location ?? null,
    linkedIn: item.linkedIn ?? null,
    twitter: item.twitter ?? null,
    facebook: item.facebook ?? null,
    openingsCount: item.openingsCount ?? 0,
    vacanciesCount: item.vacanciesCount ?? 0,
  };
}

function toApiError(error: unknown): Error {
  if (error && typeof error === 'object' && 'message' in error) {
    return new Error(String((error as { message: unknown }).message));
  }
  return new Error('Company request failed. Please try again.');
}

const VALID_SORT_BYS: readonly CompanySortBy[] = ['name', 'openings', 'vacancies', 'newest'];

function sanitizeSortBy(sortBy: CompanySortBy | undefined): CompanySortBy {
  return VALID_SORT_BYS.includes(sortBy as CompanySortBy) ? (sortBy as CompanySortBy) : 'name';
}

function sanitizeSortDir(sortDir: CompanySortDir | undefined): CompanySortDir {
  return sortDir === 'desc' ? 'desc' : 'asc';
}

function sanitizePage(page: number | undefined): number {
  return Number.isInteger(page) && (page as number) >= 1 ? (page as number) : 1;
}

function sanitizePageSize(pageSize: number | undefined): number {
  return Number.isInteger(pageSize) &&
    (pageSize as number) >= 1 &&
    (pageSize as number) <= MAX_COMPANY_PAGE_SIZE
    ? (pageSize as number)
    : DEFAULT_COMPANY_PAGE_SIZE;
}

export const companiesService = {
  /**
   * GET /companies — public paginated company list with available
   * vacancy aggregates. Defaults to 10 per page sorted by name A-Z.
   * No mock / localStorage fallback: errors propagate to the caller.
   */
  async getPublicCompanies(
    filters: CompanyFilterParams = {},
    abortSignal?: AbortSignal,
  ): Promise<PagedCompanies> {
    const params: Record<string, string | number | boolean> = {};
    const keyword = filters.keyword?.trim().slice(0, MAX_COMPANY_KEYWORD_LENGTH);
    if (keyword) params.keyword = keyword;
    if (filters.industry?.trim()) params.industry = filters.industry.trim();
    if (filters.location?.trim()) params.location = filters.location.trim();
    if (filters.companySize?.trim()) params.companySize = filters.companySize.trim();
    if (filters.hiring === true) params.hiring = true;
    params.sortBy = sanitizeSortBy(filters.sortBy);
    params.sortDir = sanitizeSortDir(filters.sortDir);
    params.page = sanitizePage(filters.page);
    params.pageSize = sanitizePageSize(filters.pageSize);
    try {
      const response = await apiClient.get<BackendPagedCompaniesDto>('/companies', {
        params,
        signal: abortSignal,
      });
      const data = response.data;
      const items = (data.items ?? []).map(mapCompanyListItem);
      // Older API responses may omit filtered-set totals; fall back to the page sum.
      const pageOpenings = items.reduce((sum, item) => sum + (item.openingsCount ?? 0), 0);
      const pageVacancies = items.reduce((sum, item) => sum + (item.vacanciesCount ?? 0), 0);
      return {
        items,
        page: data.page,
        pageSize: data.pageSize,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        totalOpenings: data.totalOpenings ?? pageOpenings,
        totalVacancies: data.totalVacancies ?? pageVacancies,
      };
    } catch (error) {
      throw toApiError(parseApiError(error as never) ?? error);
    }
  },
};
