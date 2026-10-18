export default function JobsLoading() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        <div className="space-y-3">
          <div className="h-3 w-28 bg-slate-200 animate-pulse rounded"></div>
          <div className="h-9 w-56 bg-slate-200 animate-pulse rounded-md"></div>
          <div className="h-4 w-36 bg-slate-200 animate-pulse rounded"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-md p-5 sm:p-6 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-2/5 bg-slate-100 animate-pulse rounded"></div>
                  <div className="h-4 w-1/4 bg-slate-100 animate-pulse rounded"></div>
                  <div className="flex gap-3 pt-1">
                    <div className="h-3 w-20 bg-slate-100 animate-pulse rounded"></div>
                    <div className="h-3 w-16 bg-slate-100 animate-pulse rounded"></div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="h-5 w-14 bg-slate-100 animate-pulse rounded-full"></div>
                  <div className="h-5 w-16 bg-slate-100 animate-pulse rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}