import { cn } from '@/lib/utils';
import { PortalPageContainer } from '@/components/layout';
import type { EmployerDashboardSkeletonProps } from '../types/employer-job.types';

export function EmployerDashboardSkeleton({ className }: EmployerDashboardSkeletonProps) {
  return (
    <PortalPageContainer containerClassName={cn("space-y-6", className)}>
      <div
        aria-busy="true"
        data-testid="employer-dashboard-skeleton"
        className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
      >
        <header aria-hidden="true" className="space-y-2 max-w-xl">
          <div className="flex items-center gap-3">
            <div className="size-6 shrink-0 rounded-full bg-slate-200/80 motion-safe:animate-pulse" />
            <div className="h-8 sm:h-9 w-64 sm:w-80 rounded-md bg-slate-200/80 motion-safe:animate-pulse" />
          </div>
          <div className="h-4 w-full max-w-xl rounded-md bg-slate-200/60 motion-safe:animate-pulse" />
        </header>

        <section aria-hidden="true" className="shrink-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, skeletonCardIndex) => (
              <div
                key={skeletonCardIndex}
                className="flex items-center gap-4 rounded-md border border-slate-200/90 bg-white p-4 shadow-xs motion-safe:animate-pulse"
              >
                <div className="size-11 shrink-0 rounded-md bg-slate-100 border border-slate-200/60" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-7 w-16 rounded bg-slate-200" />
                  <div className="h-3 w-24 rounded bg-slate-200" />
                  <div className="h-2.5 w-20 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section aria-hidden="true" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, actionIndex) => (
          <div
            key={actionIndex}
            className="flex items-center justify-between gap-4 rounded-md border border-slate-200/90 bg-white p-5 shadow-xs motion-safe:animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="size-11 shrink-0 rounded-md bg-slate-100 border border-slate-200/60" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="h-3 w-36 rounded bg-slate-100" />
              </div>
            </div>
            <div className="size-4 shrink-0 rounded bg-slate-200" />
          </div>
        ))}
      </section>

      <div aria-hidden="true" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, chartIndex) => (
          <div
            key={chartIndex}
            className="flex flex-col justify-between gap-6 rounded-md border border-slate-200/90 bg-white p-6 shadow-xs motion-safe:animate-pulse"
          >
            <div className="space-y-2">
              <div className="h-5 w-44 rounded bg-slate-200" />
              <div className="h-3 w-56 rounded bg-slate-100" />
            </div>

            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              <div className="flex size-40 shrink-0 items-center justify-center rounded-full border-[18px] border-slate-100 sm:size-44">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-7 w-12 rounded bg-slate-200" />
                  <div className="h-3 w-16 rounded bg-slate-100" />
                </div>
              </div>

              <div className="w-full space-y-3">
                {Array.from({ length: 4 }).map((_, segmentIndex) => (
                  <div key={segmentIndex} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-2.5 rounded-full bg-slate-200" />
                      <div className="h-3.5 w-24 rounded bg-slate-200" />
                    </div>
                    <div className="h-3.5 w-12 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        aria-hidden="true"
        className="flex w-full flex-col rounded-md border border-slate-200/90 bg-white p-5 shadow-xs motion-safe:animate-pulse"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-5 w-32 rounded bg-slate-200" />
            <div className="h-4 w-16 rounded-full bg-slate-100" />
          </div>
          <div className="h-4 w-14 rounded bg-slate-200" />
        </div>

        <div className="hidden md:grid md:grid-cols-12 items-center gap-3 px-3 py-2 border-b border-slate-100">
          <div className="h-3 w-16 rounded bg-slate-200 md:col-span-4" />
          <div className="h-3 w-16 rounded bg-slate-200 md:col-span-3" />
          <div className="h-3 w-14 rounded bg-slate-200 md:col-span-2" />
          <div className="h-3 w-20 rounded bg-slate-200 md:col-span-2" />
          <div className="h-3 w-12 rounded bg-slate-200 md:col-span-1 ml-auto" />
        </div>

        <div className="divide-y divide-slate-100">
          {Array.from({ length: 4 }).map((_, itemIndex) => (
            <div
              key={itemIndex}
              className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 py-3.5 px-3"
            >
              <div className="flex min-w-0 items-center gap-3 md:col-span-4">
                <div className="size-9 shrink-0 rounded-md bg-slate-100" />
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="h-4 w-32 rounded bg-slate-200" />
                  <div className="h-4 w-12 rounded-full bg-slate-100" />
                </div>
              </div>

              <div className="flex items-center md:col-span-3">
                <div className="h-5 w-24 rounded-full bg-slate-100" />
              </div>

              <div className="flex items-center gap-1.5 md:col-span-2">
                <div className="size-3.5 rounded bg-slate-100" />
                <div className="h-3.5 w-16 rounded bg-slate-200" />
              </div>

              <div className="flex items-center gap-1.5 md:col-span-2">
                <div className="size-3.5 rounded bg-slate-100" />
                <div className="h-3.5 w-20 rounded bg-slate-200" />
              </div>

              <div className="flex items-center justify-end md:col-span-1">
                <div className="size-7 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <span role="status" aria-label="Loading employer dashboard" aria-live="polite" className="sr-only">
        Loading employer dashboard data…
      </span>
    </PortalPageContainer>
  );
}
