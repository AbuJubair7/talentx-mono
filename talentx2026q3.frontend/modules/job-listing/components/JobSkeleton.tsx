'use client'

export function JobCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200/90 rounded-md p-4.5 sm:p-5 shadow-2xs animate-pulse flex flex-col justify-between h-[215px]">
      <div className="space-y-3">
        {/* Top: Avatar + Badge */}
        <div className="flex items-center justify-between">
          <div className="size-10.5 rounded-md bg-slate-200" />
          <div className="size-7.5 rounded-md bg-slate-100" />
        </div>

        {/* Company & Title */}
        <div className="space-y-1.5 pt-0.5">
          <div className="h-3 bg-slate-100 rounded w-28" />
          <div className="h-4.5 bg-slate-200 rounded w-4/5" />
          <div className="h-3 bg-slate-100 rounded w-24" />
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          <div className="h-4.5 bg-slate-100 rounded w-16" />
          <div className="h-4.5 bg-slate-100 rounded w-16" />
          <div className="h-4.5 bg-slate-100 rounded w-14" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="h-3 bg-slate-100 rounded w-16" />
        <div className="h-6 bg-slate-200 rounded-md w-20" />
      </div>
    </div>
  )
}

export function JobListViewSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4" aria-label="Loading job opportunities" role="status">
      {Array.from({ length: count }).map((_, index) => (
        <JobCardSkeleton key={index} />
      ))}
      <span className="sr-only">Loading opportunities...</span>
    </div>
  )
}
