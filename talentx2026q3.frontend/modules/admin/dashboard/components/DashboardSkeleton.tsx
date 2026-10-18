import { Skeleton } from "@/components/ui/skeleton";

// Card classes shared by every placeholder block.
const CARD = "rounded-2xl border border-zinc-200/80 bg-white/95 p-5 dark:border-slate-800 dark:bg-slate-900/95";

// One placeholder metric: label, number and footer line.
function MetricPlaceholder() {
  return (
    <div className="flex-1 space-y-3">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}

// Loading placeholder shaped like the key metrics: funnel, four people cards, jobs card.
export function DashboardSkeleton() {
  return (
    <div aria-hidden="true" data-testid="dashboard-skeleton" className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <div className={`${CARD} flex flex-col gap-6 md:flex-row`}>
          <MetricPlaceholder />
          <MetricPlaceholder />
          <MetricPlaceholder />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-36" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className={CARD}>
              <MetricPlaceholder />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <div className={`${CARD} space-y-4`}>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  );
}
