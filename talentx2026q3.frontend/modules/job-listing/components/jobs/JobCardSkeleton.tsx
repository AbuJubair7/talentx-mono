export function JobCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading job"
      className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
    >
      <div className="flex h-full animate-pulse flex-col motion-reduce:animate-none">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-slate-100" />
          <div className="flex-1">
            <div className="h-3.5 w-28 rounded-full bg-slate-100" />
          </div>
          <div className="size-9 rounded-full bg-slate-100" />
        </div>
        <div className="mt-4 min-h-[3rem] space-y-2.5 pt-1">
          <div className="h-4 w-11/12 rounded-full bg-slate-100" />
          <div className="h-4 w-2/3 rounded-full bg-slate-100" />
        </div>
        <div className="mt-2.5 h-3.5 w-32 rounded-full bg-slate-100" />
        <div className="mb-5 mt-4 flex flex-wrap gap-1.5">
          <div className="h-6 w-20 rounded-full bg-slate-100" />
          <div className="h-6 w-24 rounded-full bg-slate-100" />
          <div className="h-6 w-24 rounded-full bg-slate-100" />
          <div className="h-6 w-40 rounded-full bg-slate-100" />
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="h-3 w-16 rounded-full bg-slate-100" />
          <div className="h-9 w-28 rounded-full bg-slate-100" />
        </div>
      </div>
      <span className="sr-only">Loading job listing…</span>
    </div>
  )
}
