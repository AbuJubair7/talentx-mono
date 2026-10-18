import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/common/brand-logo';
import Link from 'next/link';
import type { ApplicationPrefill } from '../../types/job-application.types';

interface ApplyHeaderProps {
  prefill: ApplicationPrefill;
  jobId: string;
}

function getInitials(name: string) {
  if (!name) return '??'
  const parts = name.split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function ApplyHeader({ prefill, jobId }: ApplyHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <BrandLogo className="h-8.5 w-auto text-emerald-700" />
          </Link>
          <span className="hidden h-5 w-px bg-slate-200 sm:block" aria-hidden="true" />
          <Link
            href={`/jobs/${jobId}`}
            className="hidden text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors sm:inline-flex items-center"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Back to the job
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight text-slate-900 max-w-[160px] truncate" title={prefill.name}>{prefill.name}</p>
            <p className="text-xs leading-tight text-slate-500">Applicant</p>
          </div>
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-900"
            aria-hidden="true"
          >
            {getInitials(prefill.name)}
          </span>
        </div>
      </div>
    </header>
  )
}
