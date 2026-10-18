"use client"

import React from "react";
import { Loader2, Send } from "lucide-react";

import type { ApplicationPrefill, ApplyPayload } from "../types/job-application.types";
import { useTalentApplyForm } from "../hooks/useTalentApplyForm";
import { MAX_SAVED_RESUMES, ResumePreviewDialog, type SavedResume } from "@/modules/resumes";
import { Section } from "./apply/Section";
import { FormField, ResumeField } from "./apply/FormFields";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-slate-900 focus:ring-1 focus:ring-slate-900 disabled:opacity-50"

interface ApplyFormProps {
  prefill: ApplicationPrefill
  isSubmitting: boolean
  onSubmit: (payload: ApplyPayload) => void
  onCompletionChange?: (completion: number) => void
}

export function ApplyForm({ prefill, isSubmitting, onSubmit, onCompletionChange }: ApplyFormProps) {
  const {
    form,
    resumeOption,
    selectedResumeId,
    resumeFile,
    saveToLibrary,
    completion,
    isWorking,
    isUploading,
    errors,
    dirtyFields,
    handleSubmitForm,
  } = useTalentApplyForm(prefill, onSubmit, isSubmitting);

  const [previewResume, setPreviewResume] = React.useState<SavedResume | null>(null)

  const { register, setValue, watch } = form;
  const coverLetterValue = watch("coverLetter");
  const resumeError = (errors.selectedResumeId?.message ?? errors.resumeFile?.message) as string | undefined

  // Notify parent of progress completion update
  React.useEffect(() => {
    onCompletionChange?.(completion);
  }, [completion, onCompletionChange]);

  return (
    <>
    <form
      noValidate
      onSubmit={handleSubmitForm}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <Section step={1} title="Personal details" description="Pre-filled from your TalentX profile.">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="applicantName"
            label="Full name"
            error={errors.applicantName?.message}
            edited={!!dirtyFields.applicantName}
          >
            <input
              id="applicantName"
              className={inputClass}
              aria-invalid={Boolean(errors.applicantName)}
              {...register("applicantName")}
            />
          </FormField>

          <FormField
            id="applicantEmail"
            label="Email"
            error={errors.applicantEmail?.message}
            edited={!!dirtyFields.applicantEmail}
          >
            <input
              id="applicantEmail"
              type="email"
              className={inputClass}
              aria-invalid={Boolean(errors.applicantEmail)}
              {...register("applicantEmail")}
            />
          </FormField>

          <FormField
            id="location"
            label="Location"
            error={errors.location?.message}
            edited={!!dirtyFields.location}
          >
            <input
              id="location"
              className={inputClass}
              aria-invalid={Boolean(errors.location)}
              {...register("location")}
            />
          </FormField>
        </div>
      </Section>

      <Section
        step={2}
        title="Resume"
        required
        description="Choose a saved resume or upload one for this role — your default is pre-selected."
      >
        <ResumeField
          choice={resumeOption}
          onChoiceChange={(choice) => setValue("resumeOption", choice, { shouldValidate: true, shouldDirty: true })}
          resumes={prefill.resumes ?? []}
          maxResumes={MAX_SAVED_RESUMES}
          selectedResumeId={selectedResumeId ?? null}
          onSelectResume={(id) => setValue("selectedResumeId", id, { shouldValidate: true, shouldDirty: true })}
          onPreviewResume={setPreviewResume}
          saveToLibrary={Boolean(saveToLibrary)}
          onSaveToLibraryChange={(value) => setValue("saveToLibrary", value, { shouldDirty: true })}
          uploadedFile={(resumeFile as File | undefined) ?? null}
          onUpload={(file) => setValue("resumeFile", file, { shouldValidate: true, shouldDirty: true })}
          error={resumeError}
        />
      </Section>

      <Section
        step={3}
        title="A few extras"
        description="Optional, but they help you stand out to the hiring team."
      >
        <div className="space-y-5">
          <FormField
            id="coverLetter"
            label="Cover letter"
            optional
            hint={`${coverLetterValue?.length || 0} characters · a short paragraph on why this role is worth your move.`}
            edited={!!dirtyFields.coverLetter}
            error={errors.coverLetter?.message}
          >
            <textarea
              id="coverLetter"
              rows={6}
              className={`${inputClass} resize-none`}
              placeholder="I'm drawn to this role because…"
              {...register("coverLetter")}
            />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="expectedSalary"
              label="Expected salary (per month)"
              error={errors.expectedSalary?.message}
              hint="Monthly amount."
              edited={!!dirtyFields.expectedSalary}
            >
              <div className="relative">
                <input
                  id="expectedSalary"
                  inputMode="decimal"
                  placeholder="e.g. 85000"
                  className={`${inputClass} font-mono pr-16`}
                  aria-invalid={Boolean(errors.expectedSalary)}
                  {...register("expectedSalary")}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                  / month
                </span>
              </div>
            </FormField>

            <FormField
              id="totalYearsExperience"
              label="Years of experience"
              error={errors.totalYearsExperience?.message}
              edited={!!dirtyFields.totalYearsExperience}
            >
              <div className="relative">
                <input
                  id="totalYearsExperience"
                  inputMode="decimal"
                  className={`${inputClass} pr-16`}
                  aria-invalid={Boolean(errors.totalYearsExperience)}
                  {...register("totalYearsExperience")}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                  years
                </span>
              </div>
            </FormField>
          </div>
        </div>
      </Section>

      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-xs text-slate-500">
          By submitting, you share your profile and resume with the hiring team.
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="submit"
            disabled={isWorking}
            className="inline-flex min-w-42 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Uploading…
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden="true" />
                Submit application
              </>
            )}
          </button>
        </div>
      </div>
    </form>

    <ResumePreviewDialog
      resume={previewResume}
      open={previewResume !== null}
      onOpenChange={(open) => {
        if (!open) setPreviewResume(null)
      }}
    />
    </>
  )
}
