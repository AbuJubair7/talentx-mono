'use client'

import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import type { JobListItem } from '../../types/job.types'
import { formatRelativeTime, isNewPosting } from '../../utils/format'
import { CompanyLogo } from './CompanyLogo'
import { JobBadge } from './JobBadge'
import { BookmarkButton } from './BookmarkButton'
import { NewBadge } from './NewBadge'
import { allBadges } from './jobBadgeConfig'

interface JobCardProps {
  job: JobListItem
  saved: boolean
  onToggleSave: (jobId: string) => void
  /** Talent accounts apply inline; everyone else views the role detail page. */
  isAuthenticatedTalent?: boolean
  /** Show the bookmark control (talent only). */
  showSaveButton?: boolean
  isSavePending?: boolean
  /** Pin the card in its hovered appearance (for state previews). */
  forceHover?: boolean
}

const REST_CLASSES =
  'border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_6px_-2px_rgba(15,23,42,0.05)] hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_24px_-10px_rgba(5,150,105,0.18),0_24px_48px_-20px_rgba(15,23,42,0.16)] focus-within:border-emerald-300'
const FORCED_HOVER_CLASSES =
  '-translate-y-1 border-emerald-300 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_24px_-10px_rgba(5,150,105,0.18),0_24px_48px_-20px_rgba(15,23,42,0.16)]'

export function JobCard({
  job,
  saved,
  onToggleSave,
  isAuthenticatedTalent = false,
  showSaveButton = false,
  isSavePending = false,
  forceHover = false,
}: JobCardProps) {
  const fresh = isNewPosting(job.createdAt)
  const titleId = `job-${job.id}-title`
  const detailHref = `/jobs/${job.id}`
  const applyHref = isAuthenticatedTalent ? `/apply/${job.id}` : detailHref

  const stateClasses = forceHover ? FORCED_HOVER_CLASSES : REST_CLASSES

  return (
    <article
      aria-labelledby={titleId}
      className={`group relative flex h-full flex-col rounded-2xl border bg-white p-5 transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transform-none motion-reduce:transition-none ${stateClasses}`}
    >
      <header className="flex items-center gap-3">
        <CompanyLogo name={job.companyName} logoUrl={job.logoUrl} />
        <p className="flex min-w-0 flex-1 items-center gap-1 text-sm font-medium text-slate-700">
          <span className="truncate">{job.companyName}</span>
        </p>
        <div className="flex items-center gap-2">
          {fresh && <NewBadge />}
          {showSaveButton && (
            <BookmarkButton
              saved={saved}
              disabled={isSavePending}
              onToggle={() => onToggleSave(job.id)}
              label={`${job.title} at ${job.companyName}`}
            />
          )}
        </div>
      </header>

      <h3
        id={titleId}
        className={`mt-4 line-clamp-2 min-h-[3rem] text-lg font-semibold leading-6 tracking-[-0.015em] transition-colors duration-200 ease-out motion-reduce:transition-none ${
          forceHover ? 'text-emerald-700' : 'text-slate-900 group-hover:text-emerald-700'
        }`}
      >
        <Link
          href={detailHref}
          className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-emerald-500 focus-visible:after:ring-offset-2"
        >
          {job.title}
        </Link>
      </h3>

      {job.location && (
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="truncate">{job.location}</span>
        </p>
      )}

      <ul className="mb-5 mt-4 flex flex-wrap gap-1.5" aria-label="Job details">
        {allBadges(job).map((badge) => (
          <li key={badge.key}>
            <JobBadge icon={badge.icon} label={badge.label} emphasis={badge.emphasis} active={forceHover} />
          </li>
        ))}
      </ul>

      <footer className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <time dateTime={job.createdAt} className="text-xs font-medium text-slate-500">
          {job.createdAt ? formatRelativeTime(job.createdAt) : 'Recently'}
        </time>
        <Link
          href={applyHref}
          aria-label={`${isAuthenticatedTalent ? 'Apply now' : 'View role'}: ${job.title} at ${job.companyName}`}
          className={`relative z-10 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 motion-reduce:transition-none ${
            isAuthenticatedTalent
              ? 'bg-emerald-600 text-white shadow-[0_1px_2px_rgba(5,150,105,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-emerald-700'
              : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
          }`}
        >
          {isAuthenticatedTalent ? 'Apply Now' : 'View Role'}
          <ArrowRight
            className={`size-4 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transform-none motion-reduce:transition-none ${
              forceHover ? 'translate-x-1' : 'group-hover:translate-x-1'
            }`}
            aria-hidden="true"
          />
        </Link>
      </footer>
    </article>
  )
}
