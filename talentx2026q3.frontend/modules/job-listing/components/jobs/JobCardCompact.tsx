'use client'

import Link from 'next/link'
import type { JobListItem } from '../../types/job.types'
import { formatRelativeTime, isNewPosting } from '../../utils/format'
import { CompanyLogo } from './CompanyLogo'
import { JobBadge } from './JobBadge'
import { BookmarkButton } from './BookmarkButton'
import { NewBadge } from './NewBadge'
import { arrangementBadge, salaryBadge } from './jobBadgeConfig'

interface JobCardCompactProps {
  job: JobListItem
  saved: boolean
  onToggleSave: (jobId: string) => void
  showSaveButton?: boolean
  isSavePending?: boolean
}

export function JobCardCompact({
  job,
  saved,
  onToggleSave,
  showSaveButton = false,
  isSavePending = false,
}: JobCardCompactProps) {
  const fresh = isNewPosting(job.createdAt)
  const badges = [arrangementBadge(job), salaryBadge(job)]

  return (
    <article className="group relative flex items-center gap-4 px-4 py-3.5 transition-colors duration-150 ease-out hover:bg-emerald-50/40 motion-reduce:transition-none sm:px-5">
      <CompanyLogo name={job.companyName} logoUrl={job.logoUrl} size="sm" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-slate-900 transition-colors duration-150 ease-out group-hover:text-emerald-700 motion-reduce:transition-none">
            <Link
              href={`/jobs/${job.id}`}
              className="outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-emerald-500"
            >
              {job.title}
            </Link>
          </h3>
          {fresh && <NewBadge />}
        </div>
        <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-slate-500">
          <span className="truncate">{job.companyName}</span>
          {job.location && (
            <>
              <span aria-hidden="true" className="mx-0.5">
                ·
              </span>
              <span className="truncate">{job.location}</span>
            </>
          )}
        </p>
      </div>

      <ul className="hidden items-center gap-1.5 lg:flex" aria-label="Job details">
        {badges.map((badge) => (
          <li key={badge.key}>
            <JobBadge icon={badge.icon} label={badge.label} emphasis={badge.emphasis} />
          </li>
        ))}
      </ul>

      <time
        dateTime={job.createdAt}
        className="hidden w-20 shrink-0 text-right text-xs font-medium text-slate-500 sm:block"
      >
        {job.createdAt ? formatRelativeTime(job.createdAt) : 'Recently'}
      </time>

      {showSaveButton && (
        <BookmarkButton
          saved={saved}
          disabled={isSavePending}
          onToggle={() => onToggleSave(job.id)}
          label={`${job.title} at ${job.companyName}`}
          size="sm"
        />
      )}
    </article>
  )
}
