'use client';

import Link from 'next/link';
import { User } from 'lucide-react';

import { useHeaderSession } from '@/components/common/use-header-session';
import {
  formatEmploymentType,
  formatExperienceLevel,
  formatLocation,
  formatRelativeTime,
  formatWorkArrangement,
} from '@/modules/job-listing';

import type {
  EmployerJobsCardViewProps,
  EmployerJobsCardViewSkeletonProps,
  JobStatus,
} from '../types/employer-job.types';
import { JobActionDropdown } from './JobActionDropdown';
import { JobStatusBadge } from './JobStatusBadge';
import { EmployerJobSalaryBadge } from './EmployerJobSalaryBadge';

export function EmployerJobsCardViewSkeleton({
  cardCount = 6,
}: EmployerJobsCardViewSkeletonProps) {
  return (
    <div
      data-testid="employer-jobs-cards-skeleton"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      role="status"
      aria-label="Loading jobs cards"
    >
      {Array.from({ length: cardCount }).map((_, cardIndex) => (
        <div
          key={cardIndex}
          className="bg-white border border-slate-200 rounded-md p-5 sm:p-6 flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-24 bg-slate-100 rounded animate-pulse" />
                <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="h-6 w-16 bg-slate-100 rounded-full animate-pulse" />
                <div className="size-8 bg-slate-100 rounded-lg animate-pulse" />
              </div>
            </div>

            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mt-3" />

            <div className="h-3.5 w-full max-w-xs bg-slate-100 rounded animate-pulse mt-2.5" />
          </div>

          <div>
            <div className="border-t border-slate-100 my-4" />
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="h-4 w-36 bg-slate-100 rounded animate-pulse" />
              <div className="h-8 w-24 bg-slate-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Card-grid view of the employer's jobs list.
export function EmployerJobsCardView({
  jobs,
  onCloseJob,
  onDeleteJob,
  onReopenJob,
  onPublishJob,
  onSelectJob,
}: EmployerJobsCardViewProps) {
  const { user: sessionUser } = useHeaderSession();

  if (jobs.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-12 text-center shadow-xs">
        <h3 className="text-base font-semibold text-slate-900">No jobs found.</h3>
        <p className="mt-1 text-sm text-slate-500">
          Get started by creating your first position.
        </p>
        <div className="mt-6">
          <Link
            href="/job/jobpost"
            className="inline-flex items-center justify-center rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-emerald-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 cursor-pointer"
          >
            Post a Job
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="employer-jobs-cards-grid"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {jobs.map((job) => {
        const displayLocation = formatLocation(job.location);
        const displayArrangement = formatWorkArrangement(job.workArrangement);
        const authorName =
          sessionUser?.name?.trim() || job.companyName || 'Hiring Team';

        return (
          <div
            key={job.id}
            data-testid={`job-card-${job.id}`}
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-label={`View applicant pipeline summary for ${job.title}`}
            onClick={() => onSelectJob?.(job)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                if (event.target !== event.currentTarget) return;
                if (event.key === ' ') event.preventDefault();
                onSelectJob?.(job);
              }
            }}
            className="bg-white border border-slate-200/90 hover:border-emerald-500/40 rounded-md p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500 line-clamp-1">
                    {job.companyName}
                  </p>
                  <h3
                    className="text-base font-semibold text-emerald-800 group-hover:text-emerald-700 tracking-tight line-clamp-1 transition-colors rounded-sm mt-0.5 break-words [overflow-wrap:anywhere]"
                    title={job.title}
                  >
                    {job.title}
                  </h3>
                </div>

                <div
                  className="flex items-center gap-2 shrink-0"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <JobStatusBadge status={job.status as JobStatus} />
                  <JobActionDropdown
                    jobId={job.id}
                    jobTitle={job.title}
                    jobStatus={job.status as JobStatus}
                    isExpired={job.status === 'Expired'}
                    expireAt={job.expireAt}
                    onClose={() => onCloseJob(job.id, job.title)}
                    onDelete={() => onDeleteJob(job.id, job.title)}
                    onReopen={onReopenJob ? () => onReopenJob(job.id) : undefined}
                    onPublish={onPublishJob ? () => onPublishJob(job.id) : undefined}
                  />
                </div>
              </div>

              {/* The reason sits right under the badge so the employer sees why without
                  opening the job. */}
              {job.status === 'Deactivated' && job.deactivationReasonLabel && (
                <p className="mt-2 text-xs font-medium text-rose-700">
                  Deactivated: {job.deactivationReasonLabel}
                </p>
              )}

              <div className="mt-2.5">
                <EmployerJobSalaryBadge
                  salaryType={job.salaryType}
                  salaryMin={job.salaryMin}
                  salaryMax={job.salaryMax}
                  salaryCurrency={job.salaryCurrency}
                  salaryPeriod={job.salaryPeriod}
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-2 font-normal">
                <span>{formatEmploymentType(job.employmentType) || 'Full Time'}</span>
                <span aria-hidden="true" className="text-slate-300">•</span>
                <span>Experience: {formatExperienceLevel(job.experienceLevel) || '5-8 years'}</span>
                <span aria-hidden="true" className="text-slate-300">•</span>
                <span>{displayLocation || displayArrangement || 'Remote'}</span>
                <span aria-hidden="true" className="text-slate-300">•</span>
                <span className="font-medium text-slate-700">
                  {job.applicantCount} {job.applicantCount === 1 ? 'Applicant' : 'Applicants'}
                </span>
              </div>
            </div>

            <div>
              <div className="border-t border-slate-100 my-4" />

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
                  <User className="size-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  <span
                    className="font-medium text-slate-700 truncate"
                    title={authorName || job.companyName}
                  >
                    {authorName || job.companyName}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">•</span>
                  <span className="text-slate-400 shrink-0">
                    {formatRelativeTime(job.createdAt)}
                  </span>
                </div>

                <Link
                  href={`/job/job-listing/${job.id}`}
                  className="inline-flex items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-emerald-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 shrink-0"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
