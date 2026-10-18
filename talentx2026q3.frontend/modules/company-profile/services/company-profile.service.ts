import { apiClient, parseApiError } from '@/lib/api/axios';
import { EMPTY_COMPANY_REVIEW_SUMMARY } from '@/modules/company-review';
import type { CompanyReviewSummaryDto } from '@/modules/company-review';
import type {
  CompanyProfileDto,
  CompanyPublicJobItem,
  PublicCompanyProfileDto,
  UpdateCompanyProfilePayload,
} from '../types/company-profile.types';
import { slugifyCompanyName } from '../utils/company-slug';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isCompanyId(value: string): boolean {
  return UUID_RE.test(value.trim());
}

interface BackendPublicJobDto {
  id: string;
  title: string;
  location: string;
  city?: string | null;
  country?: string | null;
  employmentType: string;
  workArrangement: string;
  experienceLevel: string;
  vacancies: number;
  expireAt: string;
  publishedAt?: string | null;
}

interface BackendPublicProfileDto {
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
  activeJobsCount: number;
  publishedJobs: BackendPublicJobDto[];
  reviewSummary?: CompanyReviewSummaryDto | null;
}

interface BackendCompanySearchItemDto {
  id: string;
  name: string;
}

function mapPublicJob(
  job: BackendPublicJobDto,
  companyName?: string,
): CompanyPublicJobItem {
  return {
    id: job.id,
    title: job.title,
    location: job.location,
    city: job.city ?? null,
    country: job.country ?? null,
    employmentType: job.employmentType,
    workArrangement: job.workArrangement,
    experienceLevel: job.experienceLevel,
    vacancies: job.vacancies,
    expireAt: job.expireAt,
    publishedAt: job.publishedAt ?? null,
    ...(companyName ? { companyName } : {}),
  };
}

function mapPublicProfile(data: BackendPublicProfileDto): PublicCompanyProfileDto {
  return {
    id: data.id,
    name: data.name,
    logoUrl: data.logoUrl ?? null,
    description: data.description ?? null,
    industry: data.industry ?? null,
    companySize: data.companySize ?? null,
    website: data.website ?? null,
    location: data.location ?? null,
    linkedIn: data.linkedIn ?? null,
    twitter: data.twitter ?? null,
    facebook: data.facebook ?? null,
    activeJobsCount: data.activeJobsCount,
    publishedJobs: (data.publishedJobs ?? []).map((j) =>
      mapPublicJob(j, data.name),
    ),
    reviewSummary: data.reviewSummary ?? EMPTY_COMPANY_REVIEW_SUMMARY,
  };
}

function toApiError(error: unknown): Error {
  if (error && typeof error === 'object' && 'message' in error) {
    return new Error(String((error as { message: unknown }).message));
  }
  return new Error('Company request failed. Please try again.');
}

export const companyProfileService = {
  async getMyCompanyProfile(abortSignal?: AbortSignal): Promise<CompanyProfileDto> {
    try {
      const response = await apiClient.get<CompanyProfileDto>('/employers/company', {
        signal: abortSignal,
      });
      return response.data;
    } catch (error) {
      throw toApiError(parseApiError(error as never) ?? error);
    }
  },

  async updateMyCompanyProfile(
    payload: UpdateCompanyProfilePayload,
    abortSignal?: AbortSignal,
  ): Promise<CompanyProfileDto> {
    const body = {
      companyName: payload.companyName.trim(),
      description: payload.description?.trim() || null,
      industry: payload.industry?.trim() || null,
      companySize: payload.companySize || null,
      website: payload.website?.trim() || null,
      location: payload.location?.trim() || null,
      linkedIn: payload.linkedIn?.trim() || null,
      twitter: payload.twitter?.trim() || null,
      facebook: payload.facebook?.trim() || null,
    };
    try {
      const response = await apiClient.put<CompanyProfileDto>('/employers/company', body, {
        signal: abortSignal,
      });
      return response.data;
    } catch (error) {
      throw toApiError(parseApiError(error as never) ?? error);
    }
  },

  async uploadCompanyLogo(
    file: File,
    abortSignal?: AbortSignal,
  ): Promise<{ logoUrl: string; storageKey?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await apiClient.post<{ logoUrl: string; storageKey?: string }>(
        '/employers/company/logo',
        formData,
        { signal: abortSignal },
      );
      if (!response.data?.logoUrl) {
        throw new Error('Logo upload did not return a URL.');
      }
      return response.data;
    } catch (error) {
      throw toApiError(parseApiError(error as never) ?? error);
    }
  },

  async deleteCompanyLogo(
    abortSignal?: AbortSignal,
  ): Promise<void> {
    try {
      await apiClient.delete('/employers/company/logo', {
        signal: abortSignal,
      });
    } catch (error) {
      throw toApiError(parseApiError(error as never) ?? error);
    }
  },
  async getPublicCompanyProfile(
    idOrSlug: string,
    abortSignal?: AbortSignal,
  ): Promise<PublicCompanyProfileDto> {
    const key = decodeURIComponent(idOrSlug).trim();
    if (!key) throw new Error('Company identifier is required.');

    if (isCompanyId(key)) {
      try {
        const response = await apiClient.get<BackendPublicProfileDto>(
          `/companies/${key}`,
          { signal: abortSignal },
        );
        return mapPublicProfile(response.data);
      } catch (error) {
        throw toApiError(parseApiError(error as never) ?? error);
      }
    }

    // Name slugs (e.g. "acme-technologies") have no dedicated backend
    // endpoint, so resolve via the public company search and then load the
    // full profile by id. This returns the real profile — logo, description,
    // industry, socials, published jobs — instead of a synthesized stub.
    const normalizedSlug = key.toLowerCase();
    const searchKeyword = normalizedSlug.replace(/-/g, ' ').trim();
    try {
      const searchResponse = await apiClient.get<{ items: BackendCompanySearchItemDto[] }>(
        '/companies',
        { params: { keyword: searchKeyword || normalizedSlug, page: 1, pageSize: 10 }, signal: abortSignal },
      );
      const match = (searchResponse.data?.items ?? []).find(
        (item) => slugifyCompanyName(item.name || '') === normalizedSlug,
      );
      if (!match) {
        throw new Error(`Company '${key}' was not found.`);
      }
      const profileResponse = await apiClient.get<BackendPublicProfileDto>(
        `/companies/${match.id}`,
        { signal: abortSignal },
      );
      return mapPublicProfile(profileResponse.data);
    } catch (error) {
      throw toApiError(parseApiError(error as never) ?? error);
    }
  },
};
