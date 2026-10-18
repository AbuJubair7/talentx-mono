"use client"

export function ResumeSkeletons() {
  const rows = Array.from({ length: 3 }, (_, index) => index)

  return (
    <div role="status">
      <span className="sr-only">Loading resumes…</span>
      <div className="space-y-2" aria-hidden="true">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-4 rounded-lg border border-slate-200 p-3">
            <div className="ml-1.5 h-14 w-11 animate-pulse rounded-[3px] bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 max-w-full animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-64 max-w-full animate-pulse rounded bg-slate-100" />
            </div>
            <div className="hidden h-8 w-20 animate-pulse rounded-md bg-slate-100 sm:block" />
            <div className="h-8 w-8 animate-pulse rounded-md bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
