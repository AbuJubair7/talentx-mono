/**
 * Company profile DTOs — mirrors backend `CompanyProfileDto` /
 * `PublicCompanyProfileDto` / `PublicCompanyJobDto` (PascalCase on the
 * backend, camelCase over the wire).
 *
 * NOTE: the backend has no `slug`, no `socialLinks` object and no
 * `companyName` field. The company name is `name`, socials are flat
 * `linkedIn` / `twitter` / `facebook`, and public lookup is by company
 * GUID (`GET /companies/{id}`), not by slug.
 */

import type { CompanyReviewSummaryDto } from '@/modules/company-review';

export interface CompanyProfileDto {
  id: string;
  employerId: string;
  /** Backend field is `Name`. */
  name: string;
  logoUrl?: string | null;
  description?: string | null;
  industry?: string | null;
  companySize?: string | null;
  website?: string | null;
  /** Backend stores location as a plain string. */
  location?: string | null;
  linkedIn?: string | null;
  twitter?: string | null;
  facebook?: string | null;
}

/**
 * Payload for `PUT /employers/company` (`UpdateCompanyProfileCommand`).
 * Property casing follows the backend contract (`linkedIn` with capital I).
 */
export interface UpdateCompanyProfilePayload {
  companyName: string;
  description?: string | null;
  industry?: string | null;
  companySize?: string | null;
  website?: string | null;
  location?: string | null;
  linkedIn?: string | null;
  twitter?: string | null;
  facebook?: string | null;
}

/** Mirrors backend `PublicCompanyJobDto`. */
export interface CompanyPublicJobItem {
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
  /** Populated only by the slug fallback path (derived from /jobs search). */
  companyName?: string;
}

/** Mirrors backend `PublicCompanyProfileDto`. */
export interface PublicCompanyProfileDto {
  id: string;
  /** Backend field is `Name`. */
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
  publishedJobs: CompanyPublicJobItem[];
  reviewSummary: CompanyReviewSummaryDto;
}

export const COMPANY_SIZE_VALUES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
] as const;

export type CompanySizeOption = (typeof COMPANY_SIZE_VALUES)[number];

export const COMPANY_SIZE_OPTIONS: { label: string; value: CompanySizeOption }[] = [
  { label: '1 - 10 employees', value: '1-10' },
  { label: '11 - 50 employees', value: '11-50' },
  { label: '51 - 200 employees', value: '51-200' },
  { label: '201 - 500 employees', value: '201-500' },
  { label: '501 - 1000 employees', value: '501-1000' },
  { label: '1000+ employees', value: '1000+' },
];

export const INDUSTRY_OPTIONS = [
  'Technology & Software',
  'Finance & Banking',
  'Healthcare & Life Sciences',
  'E-Commerce & Retail',
  'Education & EdTech',
  'Telecommunications',
  'Manufacturing & Robotics',
  'Media & Entertainment',
  'Consulting',
  'Real Estate & Construction',
  'Energy & CleanTech',
  'Nonprofit & Government',
  'Other',
] as const;

export type IndustryOption = (typeof INDUSTRY_OPTIONS)[number];

/** Narrows unknown stored values to a valid industry (legacy data may hold free text). */
export function isIndustryOption(value: unknown): value is IndustryOption {
  return (
    typeof value === 'string' &&
    (INDUSTRY_OPTIONS as readonly string[]).includes(value)
  );
}

/** Narrows unknown stored values to a valid company size. */
export function isCompanySizeOption(value: unknown): value is CompanySizeOption {
  return (
    typeof value === 'string' &&
    (COMPANY_SIZE_VALUES as readonly string[]).includes(value)
  );
}
