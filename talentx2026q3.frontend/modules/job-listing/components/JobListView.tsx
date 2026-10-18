'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Briefcase,
  GraduationCap,
  Globe,
  CheckCircle2,
  Clock,
  ArrowRight,
  SearchX,
  Sparkles,
  Banknote,
} from 'lucide-react'
import type { JobListItem, PagedResult } from '../types/job.types'
import {
  formatEmploymentType,
  formatExperienceLevel,
  formatWorkArrangement,
  formatRelativeTime,
  formatSalaryRange,
} from '../utils/format'
import { Button } from '@/components/ui/button'
import { SaveJobButton } from '@/modules/saved-jobs/components/SaveJobButton'

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-slate-900',
  'bg-purple-600',
  'bg-emerald-600',
  'bg-indigo-600',
  'bg-rose-600',
  'bg-cyan-700',
  'bg-amber-600',
] as const

function avatarColorFor(companyName?: string): string {
  let hash = 0
  const normalizedName = companyName || ''
  for (let index = 0; index < normalizedName.length; index++) {
    hash = normalizedName.charCodeAt(index) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function isRecentlyPosted(dateString?: string): boolean {
  if (!dateString) return false
  const differenceInMilliseconds = Date.now() - new Date(dateString).getTime()
  const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24)
  return differenceInDays <= 3
}

interface JobCardProps {
  job: JobListItem
  savedJobIds?: Set<string>
  onSaveToggle?: (jobId: string, saved: boolean) => void
  pendingJobId?: string
  showSaveButton?: boolean
  showApplyButton?: boolean
  isAuthenticatedTalent?: boolean
}

function JobCard({
  job,
  savedJobIds,
  onSaveToggle,
  pendingJobId,
  showSaveButton,
  showApplyButton,
  isAuthenticatedTalent,
}: JobCardProps) {
  const applyHref = isAuthenticatedTalent ? `/apply/${job.id}` : `/jobs/${job.id}/apply`
  const isSaved = savedJobIds?.has(job.id) ?? false
  const isSavePending = pendingJobId === job.id
  const avatarColor = avatarColorFor(job.companyName)
  const displayLocation =
    job.city && job.country
      ? `${job.city}, ${job.country}`
      : job.city || job.country || job.location || null

  const isRecent = isRecentlyPosted(job.createdAt)

  return (
    <article className="group relative bg-white border border-slate-200/90 hover:border-emerald-500/50 rounded-md p-4.5 sm:p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-full motion-reduce:transform-none motion-reduce:transition-none">
      <div className="space-y-3">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-2">
          {/* Company Avatar */}
          {job.logoUrl ? (
            <Image
              src={job.logoUrl}
              alt={`${job.companyName} logo`}
              width={42}
              height={42}
              unoptimized
              className="size-10.5 shrink-0 rounded-md border border-slate-200 bg-white object-contain"
            />
          ) : (
            <div
              className={`flex size-10.5 shrink-0 items-center justify-center rounded-md text-white font-extrabold text-xs shadow-2xs ${avatarColor}`}
              aria-hidden="true"
            >
              {(job.companyName || 'CO').slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            {isRecent && (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80">
                <Sparkles className="size-2.5 text-emerald-600" />
                NEW
              </span>
            )}
            {showSaveButton && onSaveToggle && (
              <SaveJobButton
                jobId={job.id}
                isSaved={isSaved}
                onToggle={onSaveToggle}
                disabled={isSavePending}
                showLabel={false}
              />
            )}
          </div>
        </div>

        {/* Company & Role Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="font-semibold text-slate-800 truncate" title={job.companyName}>{job.companyName}</span>
            <CheckCircle2
              className="size-3.5 text-emerald-500 shrink-0"
              aria-label="Verified company"
            />
          </div>

          <h2 className="text-[15px] font-bold tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug line-clamp-2 min-h-10 break-words [overflow-wrap:anywhere]">
            <Link
              href={`/jobs/${job.id}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 rounded-sm"
              title={job.title}
            >
              <span className="absolute inset-0" aria-hidden="true" />
              {job.title}
            </Link>
          </h2>

          {displayLocation && (
            <div className="flex items-center gap-1 text-xs text-slate-500 pt-0.5 truncate">
              <MapPin className="size-3 text-slate-400 shrink-0" />
              <span className="truncate">{displayLocation}</span>
            </div>
          )}
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {job.employmentType && (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-100/90 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              <Briefcase className="size-3 text-emerald-600" />
              {formatEmploymentType(job.employmentType)}
            </span>
          )}
          {job.workArrangement && (
            <span className="inline-flex items-center gap-1 rounded bg-indigo-50 border border-indigo-100/90 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
              <Globe className="size-3 text-indigo-600" />
              {formatWorkArrangement(job.workArrangement)}
            </span>
          )}
          {job.experienceLevel && (
            <span className="inline-flex items-center gap-1 rounded bg-sky-50 border border-sky-100/90 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
              <GraduationCap className="size-3 text-sky-600" />
              {formatExperienceLevel(job.experienceLevel)}
            </span>
          )}
          {job.salaryType && (
            <span className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-100/90 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              <Banknote className="size-3 text-amber-600" />
              {formatSalaryRange(job.salaryType, job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)}
            </span>
          )}
        </div>

        {/* Required Skills Chips */}
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {job.requiredSkills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded bg-slate-100/80 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600 border border-slate-200/60 truncate max-w-[120px]"
              >
                {skill}
              </span>
            ))}
            {job.requiredSkills.length > 3 && (
              <span className="text-[10px] font-mono text-slate-400 self-center pl-0.5">
                +{job.requiredSkills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3.5">
        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          <Clock className="size-3" />
          {job.createdAt ? formatRelativeTime(job.createdAt) : 'Recently'}
        </span>

        {showApplyButton ? (
          <Link
            href={applyHref}
            className="relative z-10 inline-flex items-center gap-1 rounded-md text-slate-900 hover:text-emerald-700 hover:bg-emerald-50 font-bold text-xs h-7.5 px-3 transition-colors"
          >
            <span>Apply Now</span>
            <ArrowRight className="size-3" />
          </Link>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="group-hover:text-emerald-700 group-hover:bg-emerald-50 text-slate-700 font-bold text-xs h-7.5 px-2 rounded-md transition-colors pointer-events-none gap-1"
          >
            <span>View Role</span>
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" />
          </Button>
        )}
      </div>
    </article>
  )
}

interface EmptyStateProps {
  hasFilters: boolean
  onClearAll: () => void
}

function NoResults({ hasFilters, onClearAll }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-2xs">
      <div className="size-16 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
        <SearchX className="size-8" />
      </div>
      <div className="space-y-1.5 max-w-md">
        <h3 className="text-lg font-bold text-slate-900">
          {hasFilters ? 'No jobs match your filters' : 'No open positions'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {hasFilters
            ? 'We could not find any listings matching all of your filter criteria. Try adjusting keywords, changing work arrangement, or resetting filters.'
            : 'New opportunities are posted regularly by verified employers. Please check back soon!'}
        </p>
      </div>
      {hasFilters && (
        <Button
          type="button"
          onClick={onClearAll}
          className="mt-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 cursor-pointer shadow-xs"
        >
          Clear all filters
        </Button>
      )}
    </div>
  )
}

// --- Main List View ---
interface JobListViewProps {
  result: PagedResult<JobListItem>
  hasFilters: boolean
  onPageChange: (page: number) => void
  onClearAll: () => void
  savedJobIds?: Set<string>
  onSaveToggle?: (jobId: string, saved: boolean) => void
  pendingJobId?: string
  showSaveButton?: boolean
  showApplyButton?: boolean
  isAuthenticatedTalent?: boolean
}

export function JobListView({
  result,
  hasFilters,
  onPageChange,
  onClearAll,
  savedJobIds,
  onSaveToggle,
  pendingJobId,
  showSaveButton,
  showApplyButton,
  isAuthenticatedTalent,
}: JobListViewProps) {
  const { items, page, totalPages } = result
  const hasPrev = page > 1
  const hasNext = page < totalPages

  if (items.length === 0) {
    return <NoResults hasFilters={hasFilters} onClearAll={onClearAll} />
  }

  return (
    <div className="space-y-5">
      {/* 3-Column Responsive Square-ish Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
        {items.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            savedJobIds={savedJobIds}
            onSaveToggle={onSaveToggle}
            pendingJobId={pendingJobId}
            showSaveButton={showSaveButton}
            showApplyButton={showApplyButton}
            isAuthenticatedTalent={isAuthenticatedTalent}
          />
        ))}
      </div>

      {/* Pagination Bar */}
      {(hasPrev || hasNext) && (
        <div className="flex items-center justify-between pt-5 border-t border-slate-200">
          <Button
            variant="outline"
            className="gap-1.5 text-xs sm:text-sm font-semibold border-slate-200 hover:bg-slate-50 rounded-md"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrev}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>

          <span className="text-xs text-slate-500 font-medium">
            Page{' '}
            <span className="font-mono font-bold text-slate-900">{page}</span> of{' '}
            <span className="font-mono font-bold text-slate-900">{totalPages}</span>
          </span>

          <Button
            variant="outline"
            className="gap-1.5 text-xs sm:text-sm font-semibold border-slate-200 hover:bg-slate-50 rounded-md"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNext}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
