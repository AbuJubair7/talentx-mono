import { formatShortDate } from "@/lib/date";
import {
  formatEmploymentType,
  formatExperienceLevel,
  formatSalaryRange,
  formatWorkArrangement,
} from "@/modules/job-listing/utils/format";
import type { AdminJobDetails } from "../types/job-moderation";
import { isRelisted, postedDate } from "../utils/publish-dates";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-zinc-800 dark:text-slate-200">{value || "—"}</dd>
    </div>
  );
}

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-slate-100">{title}</h3>
      {/* pre-line keeps the employer's paragraphs and bullet lines as they typed them. */}
      <p className="whitespace-pre-line break-words text-sm leading-relaxed text-zinc-700 dark:text-slate-300">
        {text}
      </p>
    </section>
  );
}

// Read-only view of a job's full posting inside the admin detail dialog.
export function JobModerationContent({ job }: { job: AdminJobDetails }) {
  // Deduplicated because some employers type the city into the location field too.
  const location = [...new Set([job.location, job.city, job.country].filter(Boolean))].join(", ");

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Fact label="Employment type" value={formatEmploymentType(job.employmentType)} />
        <Fact label="Experience" value={formatExperienceLevel(job.experienceLevel)} />
        <Fact label="Work arrangement" value={formatWorkArrangement(job.workArrangement)} />
        <Fact label="Location" value={location} />
        <Fact label="Vacancies" value={String(job.vacancies)} />
        <Fact
          label="Salary"
          value={formatSalaryRange(job.salaryType, job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)}
        />
        {job.minOverlapHours !== null && <Fact label="Min. overlap" value={`${job.minOverlapHours} hours`} />}
        <Fact label="First posted" value={formatShortDate(postedDate(job), "—")} />
        <Fact
          label="Last published"
          value={`${formatShortDate(job.publishedAt, "—")}${isRelisted(job) ? " (relisted)" : ""}`}
        />
        <Fact label="Expires" value={formatShortDate(job.expireAt, "—")} />
      </dl>

      <TextBlock title="Description" text={job.description} />
      {job.requirements && <TextBlock title="Requirements" text={job.requirements} />}

      {job.requiredSkills.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-slate-100">Skills</h3>
          <ul className="flex flex-wrap gap-1.5">
            {job.requiredSkills.map((skill) => (
              <li
                key={skill}
                className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {skill}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
