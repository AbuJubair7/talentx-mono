import { Search, X } from 'lucide-react';

export function DashboardSearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search by company or role…',
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}) {
  return (
    <div className="flex max-w-sm flex-1 items-center gap-2 rounded-md border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs transition-all focus-within:border-emerald-700 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-700/20">
      <Search className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-slate-900 placeholder-slate-400 outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
