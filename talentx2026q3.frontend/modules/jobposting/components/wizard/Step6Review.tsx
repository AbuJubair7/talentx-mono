"use client"

import { useJobWizardStore, WIZARD_STEPS } from "../../store/job-wizard-store"
import { getOptionLabel, WORK_ARRANGEMENT_OPTIONS } from "../../utils/job-options"
import { getPublishRequirements, type JobFormValues } from "../../types/job-schema"
import { formatSalaryRange } from "@/modules/job-listing"

export function Step6Review() {
  const { formData, setStep } = useJobWizardStore()

  const values = formData as JobFormValues
  const requirements = getPublishRequirements(values)
  const readinessDone = requirements.filter((r) => r.done).length

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-6 transition-all duration-200 hover:border-slate-500 hover:shadow-md">
      <h2 className="text-lg font-semibold text-slate-900">Review & Publish</h2>
      <p className="mt-1 text-sm text-slate-500">
        Review your job posting before publishing. Click on any section to edit.
      </p>

      {/* Readiness indicator */}
      <div className="mt-6 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex-1">
          <span className="text-sm font-semibold text-slate-700">Publish Readiness</span>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2.5 flex-1 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(readinessDone / requirements.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold text-slate-700">
              {readinessDone}/{requirements.length}
            </span>
          </div>
        </div>
      </div>

      {/* Job summary */}
      <div className="mt-6 space-y-4">
        <ReviewSection title="Role Basics" step={1}>
          <ReviewItem label="Title" value={formData.title} />
          <ReviewItem label="Company" value={formData.companyName} />
        </ReviewSection>

        <ReviewSection title="Job Details" step={2}>
          <ReviewItem label="Employment Type" value={formData.employmentType} />
          <ReviewItem label="Experience Level" value={formData.experienceLevel} />
          <ReviewItem label="Vacancies" value={formData.vacancies} />
          <ReviewItem
            label="Expire Date"
            value={formData.expireAt ? new Date(formData.expireAt).toLocaleDateString() : undefined}
          />
          <ReviewItem
            label="Salary"
            value={formatSalaryRange(
              formData.salaryType,
              formData.salaryMin,
              formData.salaryMax,
              formData.salaryCurrency,
              formData.salaryPeriod
            )}
          />
        </ReviewSection>

        <ReviewSection title="Location" step={3}>
          <ReviewItem
            label="Work Arrangement"
            value={getOptionLabel(WORK_ARRANGEMENT_OPTIONS, formData.workArrangement || "OnSite")}
          />
          <ReviewItem label="Location" value={formData.location} />
          {(formData.workArrangement === "OnSite" || formData.workArrangement === "Hybrid") && (
            <>
              <ReviewItem label="City" value={formData.city} />
              <ReviewItem label="Country" value={formData.country} />
            </>
          )}
          {formData.workArrangement === "FullRemote" && (
            <ReviewItem
              label="Min Overlap Hours"
              value={formData.minOverlapHours ? `${formData.minOverlapHours} hours` : undefined}
            />
          )}
        </ReviewSection>

        <ReviewSection title="Skills" step={4}>
          <div className="flex flex-wrap gap-2">
            {formData.requiredSkills?.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="Description & Requirements" step={5}>
          <p className="text-sm text-slate-600 line-clamp-3">{formData.description}</p>
          <p className="mt-3 text-xs font-semibold text-slate-500">Requirements</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600 line-clamp-3">
            {formData.requirements || "—"}
          </p>
        </ReviewSection>
      </div>

      {/* Requirements checklist */}
      <div className="mt-6 rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700">Publish Requirements</h3>
        <ul className="mt-3 space-y-2.5">
          {requirements.map((req) => (
            <li key={req.label} className="flex items-center gap-2.5 text-sm">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                  req.done ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                }`}
              >
                {req.done ? "✓" : "○"}
              </span>
              <span className={req.done ? "text-slate-700" : "text-slate-500"}>{req.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function ReviewSection({
  title,
  step,
  children,
}: {
  title: string
  step: number
  children: React.ReactNode
}) {
  return (
    <div
      className="cursor-pointer rounded-xl border border-slate-200 p-4 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-sm"
      onClick={() => useJobWizardStore.getState().setStep(step as 1 | 2 | 3 | 4 | 5 | 6)}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Edit</span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function ReviewItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-center gap-2 text-sm py-0.5">
      <span className="text-slate-500">{label}:</span>
      <span className="font-medium text-slate-700">{value || "—"}</span>
    </div>
  )
}
