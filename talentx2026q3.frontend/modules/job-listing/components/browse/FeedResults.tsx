'use client'

import { Bell, Briefcase, RotateCw, SearchX, WifiOff } from 'lucide-react'
import type { JobListItem } from '../../types/job.types'
import { JobCard } from '../jobs/JobCard'
import { JobCardCompact } from '../jobs/JobCardCompact'
import { JobCardSkeleton } from '../jobs/JobCardSkeleton'
import { FeedMessage } from './FeedMessage'
import type { FeedView } from './FeedToolbar'

export type FeedStatus = 'loading' | 'error' | 'ready'
export type EmptyKind = 'none' | 'filtered' | 'catalog'

interface FeedResultsProps {
  status: FeedStatus
  view: FeedView
  items: JobListItem[]
  emptyKind: EmptyKind
  isAuthenticatedTalent: boolean
  showSaveButton: boolean
  isSaved: (id: string) => boolean
  onToggleSave: (id: string) => void
  pendingJobId?: string
  onRetry: () => void
  onClearFilters: () => void
  onCreateAlert: () => void
}

const GRID = 'grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'
const LIST =
  'divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]'
const OUTLINE_BUTTON =
  'inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors duration-150 ease-out hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none'

export function FeedResults({
  status,
  view,
  items,
  emptyKind,
  isAuthenticatedTalent,
  showSaveButton,
  isSaved,
  onToggleSave,
  pendingJobId,
  onRetry,
  onClearFilters,
  onCreateAlert,
}: FeedResultsProps) {
  if (status === 'loading') {
    return view === 'grid' ? (
      <div className={GRID} aria-busy="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    ) : (
      <div className={LIST} role="status" aria-busy="true" aria-label="Loading jobs">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center gap-4 px-5 py-4 motion-reduce:animate-none"
          >
            <div className="size-9 rounded-lg bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-1/2 rounded-full bg-slate-100" />
              <div className="h-3 w-1/3 rounded-full bg-slate-100" />
            </div>
            <div className="size-8 rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <FeedMessage
        role="alert"
        icon={WifiOff}
        title="Couldn't load jobs"
        description="Something went wrong on our end. Check your connection and try again."
        action={
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            <RotateCw className="size-4" aria-hidden="true" />
            Retry
          </button>
        }
      />
    )
  }

  if (emptyKind === 'catalog') {
    return (
      <FeedMessage
        icon={Briefcase}
        title="No open positions yet"
        description="New roles are posted every hour. Check back soon, or set up an alert and we'll let you know first."
        action={
          <button type="button" onClick={onCreateAlert} className={OUTLINE_BUTTON}>
            <Bell className="size-4 text-slate-500" aria-hidden="true" />
            Create Alert
          </button>
        }
      />
    )
  }

  if (emptyKind === 'filtered') {
    return (
      <FeedMessage
        icon={SearchX}
        title="No jobs match your filters"
        description="Try removing a filter or broadening your keywords to see more roles."
        action={
          <button type="button" onClick={onClearFilters} className={OUTLINE_BUTTON}>
            Clear all filters
          </button>
        }
      />
    )
  }

  if (view === 'list') {
    return (
      <ul className={LIST}>
        {items.map((job) => (
          <li key={job.id}>
            <JobCardCompact
              job={job}
              saved={isSaved(job.id)}
              onToggleSave={onToggleSave}
              showSaveButton={showSaveButton}
              isSavePending={pendingJobId === job.id}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className={GRID}>
      {items.map((job) => (
        <li key={job.id}>
          <JobCard
            job={job}
            saved={isSaved(job.id)}
            onToggleSave={onToggleSave}
            isAuthenticatedTalent={isAuthenticatedTalent}
            showSaveButton={showSaveButton}
            isSavePending={pendingJobId === job.id}
          />
        </li>
      ))}
    </ul>
  )
}
