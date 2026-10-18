import React from 'react';  
import { Building2, Clock, MapPin, ShieldCheck, Users } from 'lucide-react';
import type { JobDetails } from '@/modules/job-listing/types/job.types';
import {
  formatEmploymentType,
  formatLocation,
  formatRelativeTime
} from '@/modules/job-listing/utils/format';

interface JobSummaryCardProps {
  job: JobDetails
  completion: number
}

function getInitials(name: string) {
  if (!name) return '?'
  return name.slice(0, 2).toUpperCase()
}

export function JobSummaryCard({ job, completion }: JobSummaryCardProps) {
  const postedAgo = formatRelativeTime(job.createdAt)
  
  const meta = [
    { icon: MapPin, label: formatLocation(job.location) || 'Remote' },
    { icon: Building2, label: formatEmploymentType(job.employmentType) || 'Full-time' },
    { icon: Clock, label: `Posted ${postedAgo}` },
    { icon: Users, label: `${job.vacancies} vacancies` },
  ]

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white"
            aria-hidden="true"
          >
            {getInitials(job.companyName)}
          </span>
          <div className="min-w-0">
            <h2 className="font-sans text-lg font-bold tracking-tight text-slate-900 break-words [overflow-wrap:anywhere]" title={job.title}>
              {job.title}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 break-words" title={job.companyName}>{job.companyName}</p>
          </div>
        </div>

        <ul className="mt-5 space-y-2.5">
          {meta.map((item) => (
            <li key={item.label} className="flex items-center gap-2.5 text-sm text-slate-500">
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>

        <hr className="my-5 border-slate-200" />

        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-900">Application progress</span>
            <span className="font-mono text-xs text-slate-500">{completion}%</span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="mt-2.5 text-xs text-slate-500">
            Most of this is filled in from your profile — review it and submit.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-slate-500">
          Edits here apply to this application only. Your TalentX profile stays unchanged.
        </p>
      </div>

      <div className="mt-4 hidden lg:block">
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-normal text-slate-500">
          Takes about 2 minutes
        </span>
      </div>
    </aside>
  )
}
