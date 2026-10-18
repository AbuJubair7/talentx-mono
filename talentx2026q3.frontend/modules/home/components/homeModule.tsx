'use client'

import { RecentJobs } from './RecentJobs'
import { useRecentJobs } from '../hooks/useRecentJobs'
import { StateBoundary } from '@/components/common/states'

export default function HomeModule() {
  const { data: jobs, isLoading, isError, refetch } = useRecentJobs()

  const hasFallbackState = isLoading || isError || !jobs || jobs.length === 0

  if (hasFallbackState) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <StateBoundary
          isLoading={isLoading}
          isError={isError}
          isEmpty={!jobs || jobs.length === 0}
          onRetry={() => refetch()}
          emptyTitle="No recent roles available"
          emptyDescription="New startup roles are published daily. Check back soon!"
          errorTitle="Couldn't load recent jobs"
          errorDescription="Something went wrong fetching roles. Please try again."
        >
          <RecentJobs jobs={jobs ?? []} />
        </StateBoundary>
      </div>
    )
  }

  return (
    <StateBoundary
      isLoading={isLoading}
      isError={isError}
      isEmpty={!jobs || jobs.length === 0}
      onRetry={() => refetch()}
      emptyTitle="No recent roles available"
      emptyDescription="New startup roles are published daily. Check back soon!"
      errorTitle="Couldn't load recent jobs"
      errorDescription="Something went wrong fetching roles. Please try again."
    >
      <RecentJobs jobs={jobs ?? []} />
    </StateBoundary>
  )
}