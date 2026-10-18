'use client';

import Link from 'next/link';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  formatEmploymentType,
  formatLocation,
  formatWorkArrangement,
} from '@/modules/job-listing';

import { formatDisplayDate } from '../utils';
import type {
  EmployerJobsTableProps,
  EmployerJobsTableSkeletonProps,
  JobStatus,
} from '../types/employer-job.types';
import { JobActionDropdown } from './JobActionDropdown';
import { JobStatusBadge } from './JobStatusBadge';
import { EmployerJobSalaryBadge } from './EmployerJobSalaryBadge';

export function EmployerJobsTableSkeleton({
  rowCount = 5,
}: EmployerJobsTableSkeletonProps) {
  return (
    <div
      data-testid="employer-jobs-skeleton"
      className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-xs"
      role="status"
      aria-label="Loading jobs"
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Role
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Status
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Type
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Salary
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Location
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Vacancies
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Applicants
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Posted
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3 text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <TableRow
              key={rowIndex}
              className="border-b border-slate-100 hover:bg-transparent"
            >
              <TableCell className="px-4 py-3.5">
                <div className="h-4 w-44 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-28 bg-slate-100 rounded animate-pulse mt-1.5" />
              </TableCell>
              <TableCell className="px-4 py-3.5">
                <div className="h-5 w-20 bg-slate-200 rounded-full animate-pulse" />
              </TableCell>
              <TableCell className="px-4 py-3.5">
                <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4 py-3.5">
                <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4 py-3.5">
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4 py-3.5">
                <div className="h-4 w-8 bg-slate-200 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4 py-3.5">
                <div className="h-4 w-8 bg-slate-200 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4 py-3.5">
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
              </TableCell>
              <TableCell className="px-4 py-3.5 text-right">
                <div className="h-8 w-8 bg-slate-100 rounded-md inline-block animate-pulse" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Table view of the employer's jobs list.
export function EmployerJobsTable({
  jobs,
  onCloseJob,
  onDeleteJob,
  onReopenJob,
  onPublishJob,
}: EmployerJobsTableProps) {
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
            className="inline-flex items-center justify-center rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-emerald-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
          >
            Post a Job
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Role
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Status
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Type
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Salary
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Location
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Vacancies
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Applicants
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Posted
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3 text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => {
            const displayLocation = formatLocation(job.location);
            const displayArrangement = formatWorkArrangement(job.workArrangement);
            const postedDate = formatDisplayDate(job.createdAt);

            return (
              <TableRow
                key={job.id}
                className="hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-0"
              >
                <TableCell className="px-4 py-3.5 max-w-[280px] min-w-0">
                  <Link
                    href={`/job/job-listing/${job.id}`}
                    className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors tracking-tight cursor-pointer line-clamp-2 break-words [overflow-wrap:anywhere]"
                    title={job.title}
                  >
                    {job.title}
                  </Link>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 truncate" title={job.companyName}>
                    {job.companyName}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <JobStatusBadge status={job.status as JobStatus} />
                  {/* The reason sits right under the badge so the employer sees why without
                      opening the job. */}
                  {job.status === 'Deactivated' && job.deactivationReasonLabel && (
                    <p className="mt-1 max-w-[160px] text-xs font-medium text-rose-700">
                      {job.deactivationReasonLabel}
                    </p>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3.5 text-sm text-slate-600">
                  {job.employmentType
                    ? formatEmploymentType(job.employmentType)
                    : '\u2014'}
                </TableCell>
                <TableCell className="px-4 py-3.5 whitespace-nowrap">
                  <EmployerJobSalaryBadge
                    salaryType={job.salaryType}
                    salaryMin={job.salaryMin}
                    salaryMax={job.salaryMax}
                    salaryCurrency={job.salaryCurrency}
                    salaryPeriod={job.salaryPeriod}
                  />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <div className="text-sm text-slate-700">
                    {displayLocation || displayArrangement || '\u2014'}
                  </div>
                  {displayLocation && displayArrangement && (
                    <div className="text-xs text-slate-400">
                      {displayArrangement}
                    </div>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3.5 font-mono text-sm text-slate-700">
                  {job.vacancies}
                </TableCell>
                <TableCell
                  className={cn(
                    'px-4 py-3.5 font-mono text-sm',
                    job.applicantCount > 0
                      ? 'font-semibold text-emerald-600'
                      : 'text-slate-400'
                  )}
                >
                  {job.applicantCount}
                </TableCell>
                <TableCell className="px-4 py-3.5 text-sm text-slate-500">
                  {postedDate}
                </TableCell>
                <TableCell className="px-4 py-3.5 text-right">
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
