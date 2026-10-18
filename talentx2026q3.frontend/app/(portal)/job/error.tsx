'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function JobsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-5 text-center px-4">
        <div className="flex items-center justify-center size-12 rounded-full bg-rose-50 border border-rose-200">
          <AlertCircle className="size-5 text-rose-600" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Something went wrong</h2>
          <p className="text-sm text-slate-500 max-w-sm">Failed to load jobs. Please try again.</p>
        </div>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Try again
        </button>
      </div>
    </div>
  );
}