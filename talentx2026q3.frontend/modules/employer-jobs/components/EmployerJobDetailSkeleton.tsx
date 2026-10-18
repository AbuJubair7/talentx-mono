import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface EmployerJobDetailSkeletonProps {
  className?: string;
}

export function EmployerJobDetailSkeleton({ className }: EmployerJobDetailSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading job details"
      className={cn('min-h-screen bg-slate-50', className)}
    >
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <div className="inline-flex items-center text-slate-500">
            <ChevronLeft className="size-4 mr-1 text-slate-400" />
            <span>My Jobs</span>
          </div>
          <ChevronRight className="size-3.5 text-slate-300" />
          <Skeleton className="h-4 w-40 rounded-md bg-slate-200" />
          <div className="h-5 w-16 rounded-full bg-slate-200 animate-pulse shrink-0" />
        </div>

        {/* Toolbar skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-md">
            <div className="h-8 w-28 rounded-sm bg-slate-200 animate-pulse" />
            <div className="h-8 w-28 rounded-sm bg-slate-200 animate-pulse" />
            <div className="h-8 w-28 rounded-sm bg-slate-200 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-24 rounded-md bg-slate-200 animate-pulse" />
            <div className="h-8 w-44 rounded-md bg-slate-200 animate-pulse" />
          </div>
        </div>

        {/* Applicants Content Area Skeleton */}
        <div className="space-y-4 pt-1">
          {/* Search Toolbar Skeleton */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Skeleton className="h-9 w-full rounded-lg bg-slate-200/70" />
              <Skeleton className="h-9 w-20 rounded-lg bg-slate-200/80 shrink-0" />
            </div>
            <Skeleton className="h-9 w-full sm:w-44 rounded-lg bg-slate-200/70 shrink-0" />
          </div>

          {/* Table Container Skeleton */}
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
            {/* Table Header */}
            <div className="grid grid-cols-12 items-center bg-slate-50/80 border-b border-slate-200 px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-1 flex justify-center">
                <Skeleton className="size-4 rounded bg-slate-200" />
              </div>
              <div className="col-span-4">Candidate</div>
              <div className="col-span-2">AI Match</div>
              <div className="col-span-2">Applied Date</div>
              <div className="col-span-1">Resume</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            {/* Table Rows Skeleton */}
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 items-center px-4 py-3.5 gap-2">
                  <div className="col-span-1 flex justify-center">
                    <Skeleton className="size-4 rounded bg-slate-200/70" />
                  </div>
                  <div className="col-span-4 flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full bg-slate-200 shrink-0" />
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <Skeleton className="h-4 w-36 rounded bg-slate-200" />
                      <Skeleton className="h-3 w-48 rounded bg-slate-200/60" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Skeleton className="h-6 w-20 rounded-full bg-slate-200/80" />
                  </div>
                  <div className="col-span-2">
                    <Skeleton className="h-4 w-24 rounded bg-slate-200/70" />
                  </div>
                  <div className="col-span-1">
                    <Skeleton className="h-4 w-12 rounded bg-slate-200/70" />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Skeleton className="h-8 w-28 rounded-md bg-slate-200/80" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Footer Skeleton */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Skeleton className="h-4 w-48 rounded bg-slate-200/70" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-md bg-slate-200/70" />
              <Skeleton className="h-8 w-20 rounded-md bg-slate-200/70" />
            </div>
          </div>
        </div>
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        Loading job details…
      </span>
    </div>
  );
}
