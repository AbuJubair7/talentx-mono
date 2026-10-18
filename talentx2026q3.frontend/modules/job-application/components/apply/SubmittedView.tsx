import React from 'react';  
import { ArrowRight, Check, FileText, Mail } from 'lucide-react';
import Link from 'next/link'
import type { JobDetails } from '@/modules/job-listing/types/job.types';
import type { ApplicationPrefill } from '../../types/job-application.types';

interface SubmittedViewProps {
  job: JobDetails
  prefill: ApplicationPrefill
  resumeName: string
}

export function SubmittedView({ job, prefill, resumeName }: SubmittedViewProps) {
  return (
    <section
      className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
      aria-live="polite"
    >
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500">
        <Check className="h-6 w-6 text-white" aria-hidden="true" />
      </span>
      <h1 className="mt-5 font-sans text-2xl font-bold tracking-tight text-slate-900">
        Application sent
      </h1>
      <p className="mt-2 text-sm text-slate-500 break-words [overflow-wrap:anywhere]">
        Your application for <span className="font-medium text-slate-900">{job.title}</span> at{' '}
        {job.companyName} is with the hiring team.
      </p>

      <hr className="my-6 border-slate-200" />

      <div className="space-y-3 text-left">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
          <FileText className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          <span className="min-w-0 truncate font-mono text-xs text-slate-500" title={resumeName}>
            {resumeName || 'Resume Profile'}
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
          <Mail className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          <span className="truncate text-sm text-slate-500" title={prefill.email}>
            Updates go to {prefill.email}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          Track your applications
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link 
          href={`/jobs/${job.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          Back to the job
        </Link>
      </div>
    </section>
  )
}
