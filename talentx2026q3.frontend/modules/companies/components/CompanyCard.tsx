import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Briefcase, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompanyListItem } from '../types/company-list.types';
import { DefaultCompanyLogo, getCompanyProfilePath } from '@/modules/company-profile';

interface CompanyCardProps {
  company: CompanyListItem;
}

/**
 * Derives display tags from company data.
 * Additional signals like remote-friendliness become pill tags.
 */
function companyTags(company: CompanyListItem): string[] {
  const tags: string[] = [];
  const location = (company.location ?? '').toLowerCase();
  if (location.includes('remote')) {
    tags.push('Remote Friendly');
  }
  return tags.slice(0, 3);
}

const DESCRIPTION_MAX_LENGTH = 140;

/** Trims to the limit at a word boundary and adds an ellipsis. */
function truncateDescription(text: string, max = DESCRIPTION_MAX_LENGTH): string {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

function countLabel(count: number, one: string, many: string) {
  return count === 1 ? one : many;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const profileHref = getCompanyProfilePath(company.id);
  const tags = companyTags(company);
  const isVerified = Boolean(company.logoUrl && company.website);

  const openingsLabel = countLabel(company.openingsCount, 'opening', 'openings');
  const vacanciesLabel = countLabel(company.vacanciesCount, 'vacancy', 'vacancies');
  const isHiring = company.openingsCount > 0;

  return (
    <article
      data-testid={`company-card-${company.id}`}
      className="group relative flex flex-col justify-between h-full rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-emerald-500/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 motion-reduce:transform-none motion-reduce:transition-none"
    >
      {/* Stretched overlay makes the entire card clickable */}
      <Link
        href={profileHref}
        aria-label={`View ${company.name} profile`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
      />

      <div className="space-y-3.5">
        {/* Top row: Logo + Status badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="size-13 shrink-0 rounded-xl border border-slate-200/80 bg-white p-1 shadow-2xs group-hover:border-slate-300 transition-colors flex items-center justify-center overflow-hidden">
            {company.logoUrl ? (
              <Image
                src={company.logoUrl}
                alt={`${company.name} logo`}
                width={52}
                height={52}
                sizes="52px"
                className="size-full rounded-lg object-contain"
              />
            ) : (
              <DefaultCompanyLogo
                companyName={company.name}
                size="md"
                className="size-full rounded-lg shadow-none"
              />
            )}
          </div>

          <div className="shrink-0 pt-0.5">
            {isHiring ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Hiring
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200/70 px-2.5 py-0.5 text-[11px] font-medium text-slate-400">
                No active roles
              </span>
            )}
          </div>
        </div>

        {/* Company Identity */}
        <div>
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-base sm:text-[17px] font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
              {company.name}
            </h3>
            {isVerified && (
              <span className="inline-flex shrink-0 items-center text-emerald-600" title="Verified company">
                <BadgeCheck className="size-4 text-emerald-500 fill-emerald-50" aria-hidden="true" />
                <span className="sr-only">Verified company</span>
              </span>
            )}
          </div>

          {/* Meta Details */}
          {(company.industry || company.companySize || company.location) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 text-xs text-slate-500 font-medium">
              {company.industry && (
                <span className="inline-flex items-center gap-1.5 truncate">
                  <Briefcase className="size-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  <span className="truncate">{company.industry}</span>
                </span>
              )}
              {company.location && (
                <span className="inline-flex items-center gap-1.5 truncate">
                  <MapPin className="size-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  <span className="truncate">{company.location}</span>
                </span>
              )}
              {company.companySize && (
                <span className="inline-flex items-center gap-1.5 truncate">
                  <Users className="size-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  <span className="truncate">{company.companySize} employees</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Company Description */}
        {company.description && (
          <p className="text-[13px] leading-relaxed text-slate-600 line-clamp-2 min-h-10 text-pretty">
            {truncateDescription(company.description)}
          </p>
        )}

        {/* Additional Tags (e.g. Remote Friendly) */}
        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Hiring Metrics & View Action */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-4">
        <div className="flex items-center gap-4">
          <div
            className="flex flex-col"
            aria-label={`${company.openingsCount} ${openingsLabel}`}
          >
            <span
              className={cn(
                'text-lg font-extrabold tabular-nums leading-none',
                isHiring ? 'text-emerald-700' : 'text-slate-300',
              )}
            >
              {company.openingsCount}
            </span>
            <span className="text-[11px] font-medium text-slate-500 mt-1">
              {openingsLabel}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-200" aria-hidden="true" />

          <div
            className="flex flex-col"
            aria-label={`${company.vacanciesCount} ${vacanciesLabel}`}
          >
            <span
              className={cn(
                'text-lg font-extrabold tabular-nums leading-none',
                company.vacanciesCount > 0 ? 'text-slate-900' : 'text-slate-300',
              )}
            >
              {company.vacanciesCount}
            </span>
            <span className="text-[11px] font-medium text-slate-500 mt-1">
              {vacanciesLabel}
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
          <span>View Company</span>
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
            aria-hidden="true"
          />
        </div>
      </div>
    </article>
  );
}