import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmployerReviewsPaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

export function EmployerReviewsPagination({
  page,
  totalPages,
  pageSize,
  totalCount,
  isFetching,
  onPageChange,
}: EmployerReviewsPaginationProps) {
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{from}–{to}</span> of{' '}
        <span className="font-medium text-slate-700">{totalCount}</span> {totalCount === 1 ? 'review' : 'reviews'}
      </p>
      <nav className="flex items-center gap-2" aria-label="Pagination">
        <span className="mr-2 font-mono text-sm font-medium text-slate-700">
          Page {page} of {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Previous page"
          disabled={page <= 1 || isFetching}
          onClick={() => onPageChange(page - 1)}
          className="cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Next page"
          disabled={page >= totalPages || isFetching}
          onClick={() => onPageChange(page + 1)}
          className="cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronRight className="size-4" />
        </Button>
      </nav>
    </div>
  );
}
