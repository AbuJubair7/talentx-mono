import { RefreshCw, X } from 'lucide-react';

interface ApplicantListErrorProps {
  message: string;
  onRetry: () => void;
}

export function ApplicantListError({ message, onRetry }: ApplicantListErrorProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-4 shadow-xs max-w-md mx-auto my-6">
      <div className="size-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
        <X className="size-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900">Failed to load applicant list</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <RefreshCw className="size-3.5 text-slate-500" />
        Retry
      </button>
    </div>
  );
}
