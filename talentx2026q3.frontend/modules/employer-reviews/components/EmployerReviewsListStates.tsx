import { AlertCircle, MessageSquareDashed, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function EmployerReviewsListSkeleton() {
  return (
    <div className="divide-y divide-slate-100" aria-busy="true" aria-label="Loading reviews">
      {[0, 1, 2].map((row) => (
        <div key={row} className="space-y-3 px-6 py-5">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      ))}
    </div>
  );
}

interface EmployerReviewsEmptyProps {
  filtered: boolean;
  onClearFilters?: () => void;
}

export function EmployerReviewsEmpty({ filtered, onClearFilters }: EmployerReviewsEmptyProps) {
  const Icon = filtered ? SearchX : MessageSquareDashed;

  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-slate-100">
        <Icon className="size-5 text-slate-400" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        {filtered ? 'No reviews match the selected filters' : 'No reviews yet'}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {filtered
          ? 'Try a different filter, or clear them to see every review.'
          : 'Reviews from talent who interviewed with your company will appear here.'}
      </p>
      {filtered && onClearFilters && (
        <Button type="button" variant="outline" size="sm" className="mt-4 cursor-pointer" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );
}

interface EmployerReviewsErrorProps {
  description: string;
  onRetry: () => void;
}

export function EmployerReviewsError({ description, onRetry }: EmployerReviewsErrorProps) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center" role="alert">
      <div className="flex size-11 items-center justify-center rounded-full bg-rose-50">
        <AlertCircle className="size-5 text-rose-600" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900">Couldn&apos;t load reviews</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      <Button type="button" variant="outline" size="sm" className="mt-4 cursor-pointer" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
