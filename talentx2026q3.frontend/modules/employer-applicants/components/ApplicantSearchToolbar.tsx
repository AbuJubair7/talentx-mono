import { Search, X, Filter, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ALL_STATUS_FILTER,
  APPLICATION_STATUS_OPTIONS,
  type ApplicationStatusFilter,
} from '../constants';

interface ApplicantSearchToolbarProps {
  searchInput: string;
  statusFilter: ApplicationStatusFilter;
  isScoring: boolean;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (e?: React.FormEvent) => void;
  onClearSearch: () => void;
  onStatusFilterChange: (value: ApplicationStatusFilter) => void;
  onScoreApplicants: () => void;
}

export function ApplicantSearchToolbar({
  searchInput,
  statusFilter,
  isScoring,
  onSearchInputChange,
  onSearchSubmit,
  onClearSearch,
  onStatusFilterChange,
  onScoreApplicants,
}: ApplicantSearchToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
      <form onSubmit={onSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" aria-hidden="true" />
          <Input
            type="text"
            placeholder="Search candidate by name or email..."
            className="bg-slate-100 rounded-lg border-0 pl-9 pr-8 text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-300 h-9"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            aria-label="Search candidate by name or email"
          />
          {searchInput && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          size="sm"
          className="h-9 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
        >
          <Search className="size-3.5 mr-1.5" />
          Search
        </Button>
      </form>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onScoreApplicants}
          disabled={isScoring}
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-[1.5px] text-[11px] font-medium transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-[-150%] animate-border-beam motion-reduce:hidden [background:conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_270deg,#10b981_310deg,#34d399_340deg,#ffffff_358deg,transparent_360deg)] opacity-70 blur-[2px]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-[-150%] animate-border-beam motion-reduce:hidden [background:conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_270deg,#059669_300deg,#34d399_330deg,#a7f3d0_350deg,#ffffff_358deg,transparent_360deg)] opacity-90 group-hover:opacity-100"
          />
          <span className="relative z-10 inline-flex h-full w-full items-center gap-1 rounded-full bg-[#0F6E56] px-2.5 py-1 text-white transition-colors duration-150 group-hover:bg-[#0D5C48] group-active:bg-[#0B4F3E]">
            {isScoring ? (
              <Loader2 className="size-3 animate-spin shrink-0" aria-hidden="true" />
            ) : (
              <Sparkles className="size-3 shrink-0" aria-hidden="true" />
            )}
            <span>{isScoring ? 'Scoring...' : 'Score with AI'}</span>
          </span>
        </button>

        <div className="relative inline-flex items-center gap-2">
          <Filter className="size-4 text-slate-400 shrink-0 hidden sm:inline-block" />
          <Select
            value={statusFilter}
            onValueChange={(value) => onStatusFilterChange(value as ApplicationStatusFilter)}
          >
            <SelectTrigger className="w-full sm:w-45 h-9 text-xs font-medium bg-slate-100 border-0 rounded-lg focus:ring-1 focus:ring-slate-300 cursor-pointer">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUS_FILTER}>All Statuses</SelectItem>
              {APPLICATION_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

