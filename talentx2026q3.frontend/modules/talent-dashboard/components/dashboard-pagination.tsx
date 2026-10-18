import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DashboardPaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function DashboardPagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
}: DashboardPaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1) {
    return null;
  }

  const getPages = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    pages.push(1);

    if (page > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);
    return pages;
  };

  const pages = getPages();
  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">
        Showing <span className="font-medium text-slate-700">{firstItem}</span> to{' '}
        <span className="font-medium text-slate-700">{lastItem}</span> of{' '}
        <span className="font-medium text-slate-700">{totalCount}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(
            'inline-flex size-8 items-center justify-center rounded-md border text-slate-500 transition-colors',
            'border-slate-200/80 bg-white hover:bg-slate-50 hover:text-emerald-700 hover:border-emerald-200',
            'disabled:pointer-events-none disabled:opacity-40',
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>

        {pages.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="flex size-8 items-center justify-center text-xs text-slate-400"
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-md text-xs font-semibold transition-colors cursor-pointer',
                item === page
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-700',
              )}
              aria-current={item === page ? 'page' : undefined}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className={cn(
            'inline-flex size-8 items-center justify-center rounded-md border text-slate-500 transition-colors',
            'border-slate-200/80 bg-white hover:bg-slate-50 hover:text-emerald-700 hover:border-emerald-200',
            'disabled:pointer-events-none disabled:opacity-40',
          )}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
