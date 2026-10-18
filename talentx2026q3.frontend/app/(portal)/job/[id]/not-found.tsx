import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function JobNotFound() {
  return (
    <div className="min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-5 text-center px-4">
        <div className="flex items-center justify-center size-12 rounded-full bg-slate-100 border border-slate-200">
          <SearchX className="size-5 text-slate-500" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Job Not Found</h2>
          <p className="text-sm text-slate-500 max-w-sm">
            The position you&apos;re looking for doesn&apos;t exist or is no longer available.
          </p>
        </div>
        <Link href="/jobs" className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2">
          View all open roles
        </Link>
      </div>
    </div>
  );
}