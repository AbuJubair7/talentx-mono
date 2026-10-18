import { Button } from '@/components/ui/button';

interface ApplicantPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  fromItem: number;
  toItem: number;
  isPending: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function ApplicantPagination({
  currentPage,
  totalPages,
  totalCount,
  fromItem,
  toItem,
  isPending,
  onPrevious,
  onNext,
}: ApplicantPaginationProps) {
  if (totalCount === 0) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row pt-2 text-sm text-slate-500">
      <p>
        Showing <span className="font-medium text-slate-700">{fromItem}</span>–<span className="font-medium text-slate-700">{toItem}</span> of{' '}
        <span className="font-medium text-slate-700">{totalCount}</span> applicants
      </p>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1 || isPending}
          onClick={onPrevious}
          className="cursor-pointer disabled:cursor-not-allowed"
        >
          Previous
        </Button>
        <span className="text-sm font-medium text-slate-700 font-mono">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages || isPending}
          onClick={onNext}
          className="cursor-pointer disabled:cursor-not-allowed"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
