import { Loader2 } from 'lucide-react';

export default function CompanyLoadingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Skeleton */}
      <div className="h-44 sm:h-56 bg-slate-900 animate-pulse" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-10 w-full space-y-8 pb-20">
        {/* Card Skeleton */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="size-24 sm:size-28 rounded-2xl bg-slate-200 animate-pulse shrink-0" />
            <div className="space-y-3 flex-1 w-full text-center sm:text-left">
              <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg mx-auto sm:mx-0" />
              <div className="h-4 w-72 bg-slate-100 animate-pulse rounded-md mx-auto sm:mx-0" />
              <div className="h-4 w-56 bg-slate-100 animate-pulse rounded-md mx-auto sm:mx-0" />
            </div>
          </div>
        </div>

        {/* Description Skeleton */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-3">
          <div className="h-6 w-36 bg-slate-200 animate-pulse rounded-md" />
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full bg-slate-100 animate-pulse rounded-md" />
            <div className="h-4 w-5/6 bg-slate-100 animate-pulse rounded-md" />
            <div className="h-4 w-4/6 bg-slate-100 animate-pulse rounded-md" />
          </div>
        </div>

        {/* Jobs Skeleton */}
        <div className="space-y-4 pt-2">
          <div className="h-6 w-32 bg-slate-200 animate-pulse rounded-md" />
          <div className="space-y-3">
            <div className="h-28 rounded-2xl border border-slate-200 bg-white p-6 animate-pulse" />
            <div className="h-28 rounded-2xl border border-slate-200 bg-white p-6 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
