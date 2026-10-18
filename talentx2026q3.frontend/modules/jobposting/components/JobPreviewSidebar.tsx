import { BriefcaseIcon, CalendarIcon, MapPinIcon, SignalIcon } from "lucide-react"

import type { JobFormValues } from "../types/job-schema"
import type { PublishRequirement } from "../types/job-schema"
import {
  EMPLOYMENT_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  WORK_ARRANGEMENT_OPTIONS,
  getOptionLabel,
} from "../utils/job-options"

interface JobPreviewSidebarProps {
  values: JobFormValues
  requirements: PublishRequirement[]
}

function formatExpireAt(value: string): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return `Expires ${date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}`
}

export function JobPreviewSidebar({ values, requirements }: JobPreviewSidebarProps) {
  const expireLabel = formatExpireAt(values.expireAt)

  const meta = [
    { icon: MapPinIcon, value: values.location.trim() || "Location not set" },
    { icon: BriefcaseIcon, value: getOptionLabel(EMPLOYMENT_TYPE_OPTIONS, values.employmentType) },
    { icon: SignalIcon, value: getOptionLabel(WORK_ARRANGEMENT_OPTIONS, values.workArrangement) },
    ...(expireLabel ? [{ icon: CalendarIcon, value: expireLabel }] : []),
  ]

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">
            Candidate view
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-xs font-bold text-emerald-600">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </div>

        <div className="p-4">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-600">
            {getOptionLabel(EXPERIENCE_LEVEL_OPTIONS, values.experienceLevel)}
          </span>
          <h3
            className={[
              "mt-2 text-lg font-bold tracking-tight",
              values.title.trim() ? "text-slate-900" : "text-slate-500",
            ].join(" ")}
          >
            {values.title.trim() || "Untitled role"}
          </h3>
          <p className="text-sm font-medium text-slate-500">
            {values.companyName.trim() || "Company not set"}
          </p>

          <ul className="mt-3 flex flex-col gap-1.5">
            {meta.map(({ icon: Icon, value }) => (
              <li key={value} className="flex items-center gap-2 text-sm text-slate-500">
                <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                {value}
              </li>
            ))}
          </ul>

          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-700">
            {values.description.trim() || "Your description preview appears here as you write."}
          </p>

          {values.requiredSkills.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {values.requiredSkills.slice(0, 3).map((skill) => (
                <li
                  key={skill}
                  className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600"
                >
                  {skill}
                </li>
              ))}
              {values.requiredSkills.length > 3 ? (
                <li className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-500">
                  +{values.requiredSkills.length - 3}
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400">
          Before publishing
        </span>
        <ul className="mt-3 flex flex-col gap-2">
          {requirements.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm text-slate-400">
              <span
                aria-hidden="true"
                className={[
                  "h-1.5 w-1.5 rounded-full transition-colors duration-150",
                  item.done ? "bg-emerald-400" : "bg-slate-700",
                ].join(" ")}
              />
              <span className={item.done ? "font-semibold text-slate-100" : undefined}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
