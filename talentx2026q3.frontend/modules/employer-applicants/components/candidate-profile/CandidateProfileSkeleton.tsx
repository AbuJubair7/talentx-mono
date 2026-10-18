function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-line ${className}`} aria-hidden="true" />;
}

export function CandidateProfileSkeleton() {
  return (
    <div className="w-full px-4 pb-32 pt-5 sm:px-6 lg:px-8 md:pt-6" aria-busy="true" aria-label="Loading candidate profile">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-5 w-36" />
        <SkeletonBlock className="h-5 w-44" />
      </div>

      <div className="mt-4 rounded-xl border border-line bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <SkeletonBlock className="size-20 shrink-0 rounded-full" />
            <div className="space-y-3">
              <SkeletonBlock className="h-7 w-52" />
              <SkeletonBlock className="h-4 w-40" />
              <div className="flex gap-2 pt-2">
                <SkeletonBlock className="h-8 w-52 rounded-full" />
                <SkeletonBlock className="h-8 w-32 rounded-full" />
                <SkeletonBlock className="h-8 w-36 rounded-full" />
              </div>
            </div>
          </div>
          <SkeletonBlock className="size-[104px] shrink-0 rounded-full" />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {[1, 2, 3].map((index) => (
            <div key={index} className="rounded-xl border border-line bg-surface p-6 shadow-card">
              <SkeletonBlock className="mb-4 h-5 w-40" />
              <div className="space-y-2.5">
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-5/6" />
                <SkeletonBlock className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-5">
          {[1, 2, 3].map((index) => (
            <div key={index} className="rounded-xl border border-line bg-surface p-6 shadow-card">
              <SkeletonBlock className="mb-4 h-5 w-32" />
              <div className="space-y-2.5">
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
