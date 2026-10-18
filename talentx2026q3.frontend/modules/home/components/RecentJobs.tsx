'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHeaderSession } from '@/components/common/use-header-session'
import { useSavedJobIds, useSaveJob, useRemoveSavedJob } from '@/modules/saved-jobs'
import { JobCard } from '@/modules/job-listing/components/jobs/JobCard'
import type { JobListItem } from '@/modules/job-listing/types/job.types'

interface RecentJobsProps {
  jobs: JobListItem[]
}

export function RecentJobs({ jobs }: RecentJobsProps) {
  const router = useRouter()
  const { isAuthenticated, isTalent, isEmployer } = useHeaderSession()
  const { data: savedIds } = useSavedJobIds({ enabled: isAuthenticated && !isEmployer })
  const saveMutation = useSaveJob()
  const removeMutation = useRemoveSavedJob()

  const showSaveButton = isTalent
  const isAuthenticatedTalent = isAuthenticated && isTalent

  const isSaved = (jobId: string) => {
    if (!showSaveButton) return false
    if (savedIds instanceof Set) return savedIds.has(jobId)
    if (Array.isArray(savedIds)) return (savedIds as string[]).includes(jobId)
    return false
  }

  const handleToggleSave = (jobId: string) => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (isSaved(jobId)) {
      removeMutation.mutate(jobId)
    } else {
      saveMutation.mutate(jobId)
    }
  }

  const pendingJobId = saveMutation.isPending
    ? saveMutation.variables
    : removeMutation.isPending
      ? removeMutation.variables
      : undefined

  return (
    <section className="py-16 sm:py-20 bg-slate-50/60 border-b border-slate-200/80">
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Recently Published Roles</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Explore the latest job opportunities from companies hiring now.
            </h2>
          </div>

        </div>

        {/* Render cards from the passed 'jobs' prop */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              saved={isSaved(job.id)}
              onToggleSave={handleToggleSave}
              isAuthenticatedTalent={isAuthenticatedTalent}
              showSaveButton={showSaveButton}
              isSavePending={pendingJobId === job.id}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <Link href="/jobs">
            <Button className="h-11 rounded-xl bg-slate-900 px-7 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 gap-2 cursor-pointer">
              <span>View All Verified Roles</span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
