export default function JobDetailLoading() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        <div className="h-4 w-28 bg-slate-200 animate-pulse rounded"></div>
        {/* Header card skeleton */}
        <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 space-y-5">
          <div className="space-y-3">
            <div className="h-3 w-24 bg-slate-200 animate-pulse rounded"></div>
            <div className="h-9 w-3/5 bg-slate-200 animate-pulse rounded-md"></div>
            <div className="h-5 w-1/4 bg-slate-200 animate-pulse rounded"></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-24 bg-slate-100 animate-pulse rounded-full"></div>
            <div className="h-6 w-20 bg-slate-100 animate-pulse rounded-full"></div>
            <div className="h-6 w-16 bg-slate-100 animate-pulse rounded-full"></div>
          </div>
          <div className="h-3 w-36 bg-slate-100 animate-pulse rounded"></div>
        </div>
        {/* Content skeletons */}
        <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 space-y-4">
          <div className="h-3 w-28 bg-slate-200 animate-pulse rounded"></div>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-4 bg-slate-100 animate-pulse rounded" style={{width: `${95 - (i % 3) * 12}%`}}></div>
          ))}
        </div>
      </div>
    </div>
  );
}