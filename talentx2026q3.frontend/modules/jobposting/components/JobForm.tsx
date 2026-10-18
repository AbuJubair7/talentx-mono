"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeftIcon, Loader2Icon } from "lucide-react"

import { jobFormSchema, getPublishBlockers, getPublishRequirements, type JobFormValues } from "../types/job-schema"
import type { JobStatus } from "../types/job.types"
import { useCurrentEmployer } from "../hooks/useCurrentEmployer"
import {
  EMPLOYMENT_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  WORK_ARRANGEMENT_OPTIONS,
} from "../utils/job-options"
import { fieldInputClass, eyebrowLabelClass } from "../utils/field-styles"
import { FieldWrapper } from "./FieldWrapper"
import { AnimatedHeadline } from "./AnimatedHeadline"
import { JobPreviewSidebar } from "./JobPreviewSidebar"
import { FormSection } from "./FormSection"
import { SelectField } from "./SelectField"
import { SkillsField } from "./SkillsField"
import { ToggleGroupField } from "./ToggleGroupField"

type PendingAction = "draft" | "publish" | null

interface JobFormProps {
  mode: "create" | "edit"
  jobStatus?: JobStatus
  defaultValues?: Partial<JobFormValues>
  isSubmitting: boolean
  onSaveDraft: (values: JobFormValues) => void
  onPublish: (values: JobFormValues) => void
}

const emptyDefaults: JobFormValues = {
  title: "",
  companyName: "",
  description: "",
  location: "",
  employmentType: "FullTime",
  experienceLevel: "EntryLevel",
  workArrangement: "OnSite",
  requiredSkills: [],
  vacancies: 1,
  expireAt: "",
}

const DESCRIPTION_LIMIT = 10000

export function JobForm({
  mode,
  jobStatus,
  defaultValues,
  isSubmitting,
  onSaveDraft,
  onPublish,
}: JobFormProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  })
  const { register, handleSubmit, watch, setValue, getValues, control, formState } = form
  const { errors } = formState

  const { data: currentEmployer, isLoading: isLoadingEmployer } = useCurrentEmployer()

  useEffect(() => {
    if (mode !== "create") return
    if (!currentEmployer?.companyName) return
    if (getValues("companyName")) return
    setValue("companyName", currentEmployer.companyName, { shouldValidate: true })
  }, [mode, currentEmployer, getValues, setValue])

  const values = useWatch({ control })
  const currentValues: JobFormValues = { ...emptyDefaults, ...defaultValues, ...values }
  const requirements = getPublishRequirements(currentValues)
  const readinessDone = requirements.filter((requirement) => requirement.done).length

  const canPublish = mode === "create" || jobStatus === "Draft"
  const draftActionLabel = mode === "edit" && jobStatus !== "Draft" ? "Save Changes" : "Save as Draft"

  const copy =
    mode === "create"
      ? {
          breadcrumb: "New posting",
          headlineWords: ["Create", "a", "role", "worth"],
          headlineEmphasis: "applying to",
          intro:
            "Every field below shapes how candidates find and read this posting. Publish once the essentials are complete.",
        }
      : {
          breadcrumb: "Edit posting",
          headlineWords: ["Refine", "the", "role", "you're"],
          headlineEmphasis: "hiring for",
          intro: "Update the details below — only changed fields are sent when you save.",
        }

  function processFormSubmission(submittedValues: JobFormValues, targetAction: PendingAction) {
    if (targetAction === "publish") {
      const blockers = getPublishBlockers(submittedValues)
      if (blockers.length > 0) {
        toast.error("Cannot publish this job yet.", {
          description: `Missing or invalid: ${blockers.join(", ")}.`,
        })
        return
      }
      onPublish(submittedValues)
    } else {
      onSaveDraft(submittedValues)
    }
  }

  const handleActionSubmit = (action: PendingAction) => {
    setPendingAction(action)
    handleSubmit((submittedValues) => processFormSubmission(submittedValues, action))()
  }

  const formActions = (
    <>
      <button
        type="button"
        form="job-form"
        disabled={isSubmitting}
        onClick={() => handleActionSubmit("draft")}
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none cursor-pointer"
      >
        {isSubmitting && pendingAction === "draft" ? (
          <Loader2Icon aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
        ) : null}
        {draftActionLabel}
      </button>
      {canPublish && (
        <button
          type="button"
          form="job-form"
          disabled={isSubmitting}
          onClick={() => handleActionSubmit("publish")}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors duration-150 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 sm:flex-none cursor-pointer"
        >
          {isSubmitting && pendingAction === "publish" ? (
            <Loader2Icon aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
          ) : null}
          Publish Job
        </button>
      )}
    </>
  )

  return (
    <div className="min-h-full w-full bg-slate-50 font-sans text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/job/job-listing"
              aria-label="Back to dashboard"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors duration-150 hover:bg-slate-100"
            >
              <ArrowLeftIcon aria-hidden="true" className="h-4 w-4" />
            </Link>
            <p className="text-sm text-slate-500">
              Employer <span className="mx-1 text-slate-200">/</span> Jobs
              <span className="mx-1 text-slate-200">/</span>
              <span className="font-semibold text-slate-900">{copy.breadcrumb}</span>
            </p>
          </div>

          <div className="hidden items-center gap-2.5 sm:flex">{formActions}</div>
        </div>
      </header>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="max-w-2xl">
            <span className={`${eyebrowLabelClass} text-emerald-600`}>Employer · Job posting</span>
            <div className="mt-3">
              <AnimatedHeadline words={copy.headlineWords} emphasis={copy.headlineEmphasis} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">{copy.intro}</p>
          </div>

          <dl className="flex items-center gap-6 rounded-xl border border-slate-200 bg-white px-5 py-3">
            <div>
              <dt className={`${eyebrowLabelClass} text-slate-500`}>Openings</dt>
              <dd className="mt-0.5 font-mono text-lg font-bold text-slate-900">
                {String(currentValues.vacancies || 0).padStart(2, "0")}
              </dd>
            </div>
            <div className="h-8 w-px bg-slate-200" aria-hidden="true" />
            <div>
              <dt className={`${eyebrowLabelClass} text-slate-500`}>Readiness</dt>
              <dd className="mt-0.5 font-mono text-lg font-bold text-emerald-600">
                {readinessDone}/{requirements.length}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          <form
            id="job-form"
            className="flex flex-col gap-6"
            onSubmit={(event) => {
              event.preventDefault();
              handleActionSubmit("draft");
            }}
          >
            <FormSection
              step={1}
              eyebrow="Role basics"
              title="Title & description"
              description="These two fields do most of the work in candidate search."
            >
              <FieldWrapper label="Title" htmlFor="title" error={errors.title?.message}>
                <input
                  id="title"
                  placeholder="e.g. Senior Backend Engineer"
                  aria-invalid={!!errors.title}
                  className={fieldInputClass}
                  {...register("title")}
                />
              </FieldWrapper>

              {isLoadingEmployer ? (
                <FieldWrapper label="Company Name" htmlFor="company-name">
                  <input
                    id="company-name"
                    disabled
                    placeholder="Loading your company..."
                    className={fieldInputClass}
                  />
                </FieldWrapper>
              ) : currentEmployer?.companyName ? (
                <FieldWrapper label="Company Name" htmlFor="company-name" error={errors.companyName?.message} hint="Auto-filled from your profile">
                  <input
                    id="company-name"
                    disabled
                    className={`${fieldInputClass} cursor-not-allowed bg-slate-50 text-slate-600`}
                    {...register("companyName")}
                  />
                </FieldWrapper>
              ) : (
                <FieldWrapper label="Company Name" htmlFor="company-name" error={errors.companyName?.message}>
                  <input
                    id="company-name"
                    placeholder="e.g. TalentX"
                    aria-invalid={!!errors.companyName}
                    className={fieldInputClass}
                    {...register("companyName")}
                  />
                </FieldWrapper>
              )}

              <FieldWrapper
                label="Description"
                htmlFor="description"
                error={errors.description?.message}
                trailing={
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {(currentValues.description ?? "").length} / {DESCRIPTION_LIMIT}
                  </span>
                }
              >
                <textarea
                  id="description"
                  rows={8}
                  maxLength={DESCRIPTION_LIMIT}
                  placeholder="Describe the role, responsibilities, and requirements."
                  aria-invalid={!!errors.description}
                  className={fieldInputClass}
                  {...register("description")}
                />
              </FieldWrapper>
            </FormSection>

            <FormSection
              step={2}
              eyebrow="Placement"
              title="Where & how"
              description="Drives the filters candidates use to narrow the board."
            >
              <FieldWrapper label="Location" htmlFor="location" error={errors.location?.message}>
                <input
                  id="location"
                  placeholder="e.g. Dhaka, Bangladesh"
                  aria-invalid={!!errors.location}
                  className={fieldInputClass}
                  {...register("location")}
                />
              </FieldWrapper>

              <ToggleGroupField
                label="Work Arrangement"
                value={watch("workArrangement")}
                options={WORK_ARRANGEMENT_OPTIONS}
                onChange={(value) => setValue("workArrangement", value, { shouldValidate: true })}
                error={errors.workArrangement?.message}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  id="employment-type"
                  label="Employment Type"
                  value={watch("employmentType")}
                  options={EMPLOYMENT_TYPE_OPTIONS}
                  onChange={(value) => setValue("employmentType", value, { shouldValidate: true })}
                  error={errors.employmentType?.message}
                />
                <SelectField
                  id="experience-level"
                  label="Experience Level"
                  value={watch("experienceLevel")}
                  options={EXPERIENCE_LEVEL_OPTIONS}
                  onChange={(value) => setValue("experienceLevel", value, { shouldValidate: true })}
                  error={errors.experienceLevel?.message}
                />
              </div>
            </FormSection>

            <FormSection
              step={3}
              eyebrow="Requirements"
              title="Skills, headcount & timing"
              description="Specific skills produce stronger match scores."
            >
              <SkillsField
                value={watch("requiredSkills")}
                onChange={(skills) => setValue("requiredSkills", skills, { shouldValidate: true })}
                error={errors.requiredSkills?.message}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <FieldWrapper label="Vacancies" htmlFor="vacancies" error={errors.vacancies?.message}>
                  <input
                    id="vacancies"
                    type="number"
                    min={0}
                    max={99}
                    aria-invalid={!!errors.vacancies}
                    className={`${fieldInputClass} max-w-[120px] font-mono`}
                    {...register("vacancies", { valueAsNumber: true })}
                    onWheel={(wheelEvent) => wheelEvent.currentTarget.blur()}
                  />
                </FieldWrapper>

                <FieldWrapper label="Expire Date" htmlFor="expire-at" error={errors.expireAt?.message}>
                  <input
                    id="expire-at"
                    type="date"
                    aria-invalid={!!errors.expireAt}
                    className={`${fieldInputClass} font-mono`}
                    {...register("expireAt")}
                  />
                </FieldWrapper>
              </div>
            </FormSection>

            <div className="flex items-center gap-2.5 sm:hidden">{formActions}</div>
          </form>

          <JobPreviewSidebar values={currentValues} requirements={requirements} />
        </div>
      </div>
    </div>
  )
}
