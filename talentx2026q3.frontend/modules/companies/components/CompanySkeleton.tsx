export function CompanyListViewSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div
      aria-label="Loading companies"
      aria-busy="true"
      className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs animate-pulse"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="size-13 rounded-xl bg-slate-100 shrink-0" />
              <div className="h-5 w-16 rounded-full bg-slate-100" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-2/3 rounded-md bg-slate-100" />
              <div className="flex flex-wrap gap-2">
                <div className="h-4 w-24 rounded bg-slate-100" />
                <div className="h-4 w-20 rounded bg-slate-100" />
              </div>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="h-3.5 w-full rounded bg-slate-100" />
              <div className="h-3.5 w-4/5 rounded bg-slate-100" />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-4">
            <div className="flex gap-4">
              <div className="h-7 w-12 rounded bg-slate-100" />
              <div className="h-7 w-12 rounded bg-slate-100" />
            </div>
            <div className="h-4 w-16 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
