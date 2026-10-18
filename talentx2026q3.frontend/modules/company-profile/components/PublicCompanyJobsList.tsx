'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TruncatedText } from '@/components/common/TruncatedText';
import { formatEmploymentType, formatExperienceLevel, formatWorkArrangement } from '@/modules/job-listing/utils/format';
import { formatPostedAgo, getClosingInfo, isNewJob } from '../utils/company-job-dates';
import type { CompanyPublicJobItem } from '../types/company-profile.types';

interface PublicCompanyJobsListProps {
  jobs: CompanyPublicJobItem[];
  companyName: string;
  /** Jobs shown per page. Defaults to {@link DEFAULT_COMPANY_JOBS_PAGE_SIZE}. */
  pageSize?: number;
}

export const DEFAULT_COMPANY_JOBS_PAGE_SIZE = 5;

function jobLocation(job: CompanyPublicJobItem): string {
  if (job.location) return job.location;
  const parts = [job.city, job.country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Remote';
}

export function PublicCompanyJobsList({ jobs, companyName, pageSize = DEFAULT_COMPANY_JOBS_PAGE_SIZE }: PublicCompanyJobsListProps) {

  const activeJobs = jobs;
  const listTopRef = React.useRef<HTMLDivElement>(null);
  const [page, setPage] = React.useState(1);

  const effectivePageSize = Math.max(1, Math.floor(pageSize));
  const totalCount = activeJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / effectivePageSize));
  // Clamp instead of syncing via effect so navigating between companies
  // with different job counts can never leave the list on a blank page.
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * effectivePageSize;
  const visibleJobs = activeJobs.slice(startIndex, startIndex + effectivePageSize);
  const from = totalCount === 0 ? 0 : startIndex + 1;
  const to = Math.min(startIndex + effectivePageSize, totalCount);

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
    listTopRef.current?.scrollIntoView?.({ block: 'start' });
  };


  if (activeJobs.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
          <Briefcase className="size-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Open Vacancies Right Now</h3>
        <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto">
          {companyName} does not have any active job openings at the moment. Please check back later or explore other opportunities.
        </p>
        <div className="mt-6">
          <Link href="/jobs">
            <Button
              variant="outline"
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white transition-all cursor-pointer"
            >
              Browse All Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" ref={listTopRef}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold tracking-tight text-slate-900">
            Open Positions
          </h3>
          <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 font-semibold px-2 py-0.5 rounded-full text-xs">
            {activeJobs.length} {activeJobs.length === 1 ? 'opening' : 'openings'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {visibleJobs.map((job) => {
          const jobHref = `/jobs/${job.id}`;
          const postedAgo = formatPostedAgo(job.publishedAt);
          const closing = getClosingInfo(job.expireAt);
          const isNew = isNewJob(job.publishedAt);

          return (
            <article
              key={job.id}
              data-testid={`company-job-item-${job.id}`}
              className="group relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md sm:p-6 lg:flex-row lg:items-center lg:gap-5"
            >
              {/* Whole-card link (stretched) */}
              <Link
                href={jobHref}
                aria-label={`View ${job.title} and apply`}
                className="absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              />

              {/* Icon tile */}
              <div
                aria-hidden="true"
                className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-100 sm:flex"
              >
                <Briefcase className="size-5" />
              </div>

              {/* Title + pills + meta */}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="min-w-0 truncate text-base font-bold text-slate-900 transition-colors group-hover:text-emerald-700 sm:text-lg">
                    {job.title}
                  </h4>
                  {isNew && (
                    <Badge className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                      New
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {job.workArrangement && (
                    <Badge className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                      <Building2 className="size-3" />
                      {formatWorkArrangement(job.workArrangement)}
                    </Badge>
                  )}
                  <Badge className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {job.employmentType ? formatEmploymentType(job.employmentType) : 'Full Time'}
                  </Badge>
                  {job.experienceLevel && (
                    <Badge className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {formatExperienceLevel(job.experienceLevel)}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
                  <span className="inline-flex min-w-0 items-center gap-1 font-medium text-slate-700">
                    <MapPin className="size-3.5 shrink-0 text-slate-400" />
                    <TruncatedText text={jobLocation(job)} maxLength={30} />
                  </span>
                  {postedAgo && (
                    <>
                      <span aria-hidden="true" className="text-slate-300">•</span>
                      <span>Posted {postedAgo === 'Today' ? 'today' : postedAgo.toLowerCase()}</span>
                    </>
                  )}
                  {job.vacancies > 0 && (
                    <>
                      <span aria-hidden="true" className="text-slate-300">•</span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5 text-slate-400" />
                        {job.vacancies} {job.vacancies === 1 ? 'vacancy' : 'vacancies'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Deadline + arrow affordance */}
              <div className="flex shrink-0 items-center gap-3 border-t border-slate-100 pt-4 lg:flex-col lg:items-end lg:gap-2 lg:border-t-0 lg:pt-0 lg:pl-5 lg:text-right">
                {closing ? (
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                      <CalendarClock className="size-3.5 text-slate-400" />
                      Apply by {closing.dateLabel}
                    </p>
                    {closing.urgent && (
                      <div className="mt-1">
                        <Badge className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-800 uppercase">
                          {closing.label}
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="hidden text-xs text-slate-400 lg:inline">Open until filled</span>
                )}
                <span
                  aria-hidden="true"
                  className="ml-auto flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-all group-hover:border-emerald-600 group-hover:bg-emerald-600 group-hover:text-white lg:ml-0"
                >
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:flex-row">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-700">{from}–{to}</span> of{' '}
            <span className="font-medium text-slate-700">{totalCount}</span>{' '}
            {totalCount === 1 ? 'opening' : 'openings'}
          </p>
          <nav className="flex items-center gap-2" aria-label="Open positions pagination">
            <span className="mr-2 font-mono text-sm font-medium text-slate-700">
              Page {safePage} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Previous page"
              disabled={safePage <= 1}
              onClick={() => handlePageChange(safePage - 1)}
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Next page"
              disabled={safePage >= totalPages}
              onClick={() => handlePageChange(safePage + 1)}
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="size-4" />
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}
