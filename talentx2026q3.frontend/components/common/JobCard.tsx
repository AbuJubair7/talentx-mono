'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Bookmark,
  CheckCircle2,
  MapPin,
  Briefcase,
  Globe,
  GraduationCap,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  formatEmploymentType,
  formatExperienceLevel,
  formatWorkArrangement,
  formatRelativeTime,
} from '@/modules/job-listing/utils/format'
import type { JobDto } from '@/types/job'
import type { JobListItem } from '@/modules/job-listing/types/job.types'

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

export interface JobCardProps {
  job: JobListItem | JobDto
}

export function JobCard({ job }: JobCardProps) {
  const [isSaved, setIsSaved] = useState(false)
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
          <div
            className={`flex size-10.5 shrink-0 items-center justify-center rounded-md text-white font-extrabold text-xs shadow-2xs ${avatarColor}`}
            aria-hidden="true"
          >
            {(job.companyName || 'CO').slice(0, 2).toUpperCase()}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 relative z-10">
            {isRecent && (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80">
                <Sparkles className="size-2.5 text-emerald-600" />
                NEW
              </span>
            )}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                event.preventDefault()
                setIsSaved(!isSaved)
              }}
              title={isSaved ? 'Remove from saved' : 'Save job'}
              aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}
              className={`size-7.5 flex items-center justify-center rounded-md border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${
                isSaved
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'bg-slate-50 border-slate-200/80 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`size-3.5 ${isSaved ? 'fill-amber-500' : ''}`} />
            </button>
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

        <Button
          variant="ghost"
          size="sm"
          className="group-hover:text-emerald-700 group-hover:bg-emerald-50 text-slate-700 font-bold text-xs h-7.5 px-2 rounded-md transition-colors pointer-events-none gap-1"
        >
          <span>View Role</span>
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" />
        </Button>
      </div>
    </article>
  )
}