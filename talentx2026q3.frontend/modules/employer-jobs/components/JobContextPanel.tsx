'use client';

import React from 'react';
import {
  BriefcaseIcon,
  GraduationCapIcon,
  MapPinIcon,
  ClockIcon,
  WalletIcon,
} from 'lucide-react';
import type { EmployerJob } from '../types/employer-job.types';

const WORK_ARRANGEMENT_LABEL: Record<string, string> = {
  Remote: 'Remote',
  Hybrid: 'Hybrid',
  Onsite: 'On-site',
  'On-site': 'On-site',
};

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <span className="mt-0.5 text-slate-400" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">
          {label}
        </div>
        <div className="text-[13px] text-slate-700 font-medium">{value}</div>
      </div>
    </div>
  );
}

interface JobContextPanelProps {
  job: EmployerJob;
}

export function JobContextPanel({ job }: JobContextPanelProps) {
  const workLabel = job.workArrangement
    ? WORK_ARRANGEMENT_LABEL[job.workArrangement] ?? job.workArrangement
    : null;

  const locationParts = [job.city, job.country].filter(Boolean);
  const locationStr =
    locationParts.length > 0
      ? locationParts.join(', ')
      : job.location ?? 'Not specified';

  return (
    <section
      aria-labelledby="job-context-heading"
      className="rounded-md border border-slate-200 bg-white"
    >
      <header className="border-b border-slate-100 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] uppercase tracking-wide font-semibold text-emerald-700 border border-emerald-200">
            {job.status}
          </span>
          <span className="font-mono text-[10px] text-slate-400">{job.id}</span>
        </div>
        <h2
          id="job-context-heading"
          className="mt-2 text-[14px] font-bold leading-snug text-slate-900"
        >
          {job.title}
        </h2>
        <p className="text-xs text-slate-500">
          {job.companyName} · {job.vacancies} {job.vacancies === 1 ? 'opening' : 'openings'}
        </p>
      </header>

      <div className="divide-y divide-slate-100 px-4">
        {job.experienceLevel && (
          <Row
            icon={<ClockIcon size={13} strokeWidth={1.75} />}
            label="Experience"
            value={job.experienceLevel}
          />
        )}
        <Row
          icon={<MapPinIcon size={13} strokeWidth={1.75} />}
          label="Location"
          value={`${locationStr}${workLabel ? ` · ${workLabel}` : ''}`}
        />
        {job.employmentType && (
          <Row
            icon={<BriefcaseIcon size={13} strokeWidth={1.75} />}
            label="Employment"
            value={job.employmentType}
          />
        )}
        <Row
          icon={<GraduationCapIcon size={13} strokeWidth={1.75} />}
          label="Work arrangement"
          value={workLabel ?? 'Not specified'}
        />
        {job.expireAt && (
          <Row
            icon={<WalletIcon size={13} strokeWidth={1.75} />}
            label="Expires"
            value={new Date(job.expireAt).toLocaleDateString()}
          />
        )}
      </div>

      {job.requiredSkills && job.requiredSkills.length > 0 && (
        <div className="border-t border-slate-100 px-4 py-3.5">
          <div className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">
            Required skills
          </div>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {job.requiredSkills.map((skill) => (
              <li
                key={skill}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600"
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
