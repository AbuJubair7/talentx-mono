import { Skeleton } from '@/components/ui/skeleton';

export function ApplicantListSkeleton() {
  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Skeleton className="h-10 w-full sm:w-72 rounded-xl" />
        <Skeleton className="h-10 w-full sm:w-60 rounded-xl" />
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-3 w-28 rounded" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-8 w-28 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
