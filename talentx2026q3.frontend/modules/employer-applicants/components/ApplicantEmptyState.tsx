import { Users } from 'lucide-react';

interface ApplicantEmptyStateProps {
  isFiltered: boolean;
  onResetFilters: () => void;
}

export function ApplicantEmptyState({ isFiltered, onResetFilters }: ApplicantEmptyStateProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4 shadow-xs">
      <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
        <Users className="size-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900">
          {isFiltered ? 'No matching applicants' : 'No applications yet'}
        </h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
          {isFiltered
            ? 'No candidate profiles matched your search term or status filter.'
            : 'No job candidates have submitted applications for this job posting yet.'}
        </p>
      </div>
      {isFiltered && (
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
