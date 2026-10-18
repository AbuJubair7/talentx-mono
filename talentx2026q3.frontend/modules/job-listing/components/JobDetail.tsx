import type { JobDetails } from '../types/job.types';
import {
  formatEmploymentType,
  formatExperienceLevel,
  formatWorkArrangement,
  formatDate,
  formatLocation,
  formatSalaryRange,
} from '../utils/format';
import { MapPin, Briefcase, GraduationCap, Clock, Calendar, Globe, Send, DollarSign, ExternalLink } from 'lucide-react';
import { Banknote } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { DefaultCompanyLogo } from '@/modules/company-profile';
import { ShareJobButtons } from './ShareJobButtons';
import { ReportJobButton } from '@/modules/job-reporting';
import { cn } from '@/lib/utils';
import {
  JOB_DETAIL_STATUS_CONFIG,
  DEFAULT_JOB_STATUS_CONFIG,
  NON_ACTIVE_JOB_NOTICES,
} from '../constants/job-detail.constants';

interface JobDetailProps {
  job: JobDetails;
  showApply?: boolean;
  applyUrl?: string; // <-- NEW PROP
  /**
   * Application state for the current viewer. Left undefined for anonymous
   * visitors and non-Talent roles → the default apply button is shown and no
   * backend check is performed.
   */
  applyStatus?: {
    isChecking: boolean;
    hasApplied: boolean;
  };
  headerAction?: React.ReactNode;
  viewerIsTalent?: boolean;
}

function JobCompanyLogo({ logoUrl, companyName }: { logoUrl?: string | null; companyName: string }) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={`${companyName} logo`}
        width={28}
        height={28}
        unoptimized
        className="size-7 shrink-0 rounded-lg border border-slate-200 bg-white object-contain"
      />
    );
  }
  return (
    <DefaultCompanyLogo
      companyName={companyName}
      size="sm"
      className="size-7 rounded-lg text-[9px]"
    />
  );
}

export function JobDetail({ job, showApply = true, applyUrl, applyStatus, headerAction, viewerIsTalent }: JobDetailProps) {
  const location = formatLocation(job.location);
  const finalApplyUrl = applyUrl || `/jobs/${job.id}/apply`;

  const isExpired = job.status === 'Expired';
  // Prefer the canonical company id for the public company page link,
  // falling back to the employer id (the backend still resolves those).
  const companyLinkId = job.companyId ?? job.employerId;
  const statusLabel = isExpired ? 'Expired' : 'Active Opening';
  const statusClassName = isExpired
    ? 'bg-rose-50 border border-rose-200 text-rose-700'
    : 'bg-emerald-50 border border-emerald-100 text-emerald-700'; // Fallback just in case
  const statusConfig = JOB_DETAIL_STATUS_CONFIG[job.status] ?? DEFAULT_JOB_STATUS_CONFIG;
  const isPublished = job.status === 'Published';
  const nonActiveNotice = NON_ACTIVE_JOB_NOTICES[job.status];

  const keyFacts = [
    ...(job.employmentType
      ? [{ icon: Briefcase, label: 'Job Type', value: formatEmploymentType(job.employmentType) }]
      : []),
    ...(job.experienceLevel
      ? [{ icon: GraduationCap, label: 'Experience', value: formatExperienceLevel(job.experienceLevel) }]
      : []),
    ...(location
      ? [{ icon: MapPin, label: 'Location', value: location }]
      : []),
    ...(job.workArrangement
      ? [{ icon: Globe, label: 'Work Mode', value: formatWorkArrangement(job.workArrangement) }]
      : []),
    ...(job.vacancies > 0
      ? [{ icon: Clock, label: 'Vacancies', value: `${job.vacancies}` }]
      : []),
    ...(job.salaryType
      ? [{
          icon: Banknote,
          label: 'Salary',
          value: formatSalaryRange(job.salaryType, job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod),
        }]
      : []),
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px] items-start">
      {/* Left Column: Job Description and Info */}
      <div className="space-y-6 min-w-0">
        {/* Main Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col gap-y-3 sm:flex-row sm:items-start sm:justify-between min-w-0">
            <div className="min-w-0">
              <span className={cn('inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold tracking-wide', statusConfig.className)}>
                {statusConfig.label}
              </span>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl break-words [overflow-wrap:anywhere]">
                {job.title}
              </h1>
              
              <div className="mt-2 flex items-center min-w-0">
                {companyLinkId ? (
                  <Link
                    href={`/companies/${companyLinkId}`}
                    className="group inline-flex items-center gap-1.5 text-lg font-semibold text-emerald-600 transition-colors duration-150 hover:text-emerald-700 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded min-w-0"
                  >
                    <JobCompanyLogo logoUrl={job.logoUrl} companyName={job.companyName} />
                    <span className="leading-tight break-words">{job.companyName}</span>
                    <ExternalLink className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-lg font-semibold text-slate-600 min-w-0">
                    <JobCompanyLogo logoUrl={job.logoUrl} companyName={job.companyName} />
                    <span className="leading-tight break-words">{job.companyName}</span>
                  </span>
                )}
              </div>
            </div>
            {headerAction && <div className="shrink-0">{headerAction}</div>}
          </div>

          <div className="flex flex-wrap gap-2 pt-2 sm:hidden">
            {keyFacts.map((fact) => {
              const Icon = fact.icon;
              return (
                <span
                  key={fact.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  <Icon className="size-3 text-slate-400" />
                  {fact.value}
                </span>
              );
            })}
          </div>
        </div>

        {/* About the Role */}
        {job.description && (
          <section
            aria-labelledby="description-heading"
            className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm"
          >
            <h2
              id="description-heading"
              className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-mono"
            >
              About the Role
            </h2>
            <p className="leading-relaxed whitespace-pre-wrap text-sm text-slate-700 font-normal">
              {job.description}
            </p>
          </section>
        )}

        {/* Requirements */}
        {job.requirements && (
          <section
            aria-labelledby="requirements-heading"
            className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm"
          >
            <h2
              id="requirements-heading"
              className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-mono"
            >
              Requirements
            </h2>
            <p className="leading-relaxed whitespace-pre-wrap text-sm text-slate-700 font-normal">
              {job.requirements}
            </p>
          </section>
        )}
      </div>

      {/* Right Column: Sticky Sidebar with Details & CTA */}
      <aside className="lg:sticky lg:top-24 space-y-6 w-full lg:w-[320px] shrink-0">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Sidebar Header */}
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
              Role Overview
            </span>
          </div>

          {/* Key Facts */}
          <div className="p-5 space-y-5">
            {keyFacts.length > 0 && (
              <ul className="space-y-4">
                {keyFacts.map((fact) => {
                  const Icon = fact.icon;
                  return (
                    <li key={fact.label} className="flex items-start gap-3">
                      <div className="rounded-lg bg-slate-100 p-1.5 text-slate-500 shrink-0">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          {fact.label}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          {fact.value}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Date Details */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="size-3.5 text-slate-400" />
                <span>Posted {formatDate(job.createdAt)}</span>
              </div>
              {job.expireAt && (
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
                  <Calendar className="size-3.5" />
                  <span>Closes {formatDate(job.expireAt)}</span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            {showApply && (
              <div className="border-t border-slate-100 pt-4">
                {isPublished ? (
                  applyStatus?.hasApplied ? (
                    <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-center text-sm font-semibold text-emerald-700">
                      You have already applied to this job
                    </p>
                  ) : applyStatus?.isChecking ? (
                    <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600/60 px-4 py-2.5 text-sm font-bold text-white">
                      <Send className="size-4" />
                      Checking…
                    </div>
                  ) : (
                    <Link
                      href={finalApplyUrl}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-emerald-500"
                    >
                      <Send className="size-4" />
                      Apply for this role
                    </Link>
                  )
                ) : (
                  nonActiveNotice && (
                    <p role="status" className={cn('rounded-xl border px-4 py-2.5 text-center text-sm font-semibold', nonActiveNotice.className)}>
                      {nonActiveNotice.title}
                    </p>
                  )
                )}
              </div>
            )}

            {/* Share Buttons */}
            <div className="border-t border-slate-100 pt-4">
              <ShareJobButtons
                jobTitle={job.title}
                companyName={job.companyName}
                jobId={job.id}
              />
            </div>

            {viewerIsTalent && (
              <div className="border-t border-slate-100 pt-4">
                <ReportJobButton
                  jobId={job.id}
                  jobTitle={job.title}
                  viewerIsTalent={viewerIsTalent}
                />
              </div>
            )}
          </div>
        </div>

        {/* Required Skills Card */}
        {job.requiredSkills?.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <span className="block font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
              Required Skills
            </span>
            <ul className="flex flex-wrap gap-1.5">
              {job.requiredSkills?.map((skill) => (
                <li
                  key={skill}
                  className="rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
