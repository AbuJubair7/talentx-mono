"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, AlertCircle, CheckCircle2, Loader2, RefreshCw, Send } from "lucide-react"

import { useJobDetails } from "@/modules/job-listing/hooks/useJobDetails"
import { ResumeUploadDropzone } from "@/modules/resumes/components/ResumeUploadDropzone"
import { ExtractedProfileReview } from "@/modules/resumes/components/ExtractedProfileReview"
import type { ResumeExtractionResult } from "@/modules/resumes/types/resume.types"
import { FieldWrapper } from "@/modules/jobposting/components/FieldWrapper"
import { fieldInputClass, eyebrowLabelClass } from "@/modules/jobposting/utils/field-styles"

import { useApplyToJob } from "../hooks/useApplyToJob"
import { createApplyFormSchema, type ApplyFormValues } from "../types/apply-form-schema"
import type { ApplyToJobResponse, ExtractedProfilePayload } from "../types/application.types"
import { ApplyLoginWarningDialog } from "./ApplyLoginWarningDialog"
import { NON_ACTIVE_JOB_NOTICES } from "@/modules/job-listing/constants/job-detail.constants"

interface GuestApplyViewProps {
  jobId: string
}

const emptyDefaults: ApplyFormValues = {
  applicantName: "",
  applicantEmail: "",
  location: "",
  coverLetter: "",
  expectedSalary: Number.NaN,
  totalYearsExperience: Number.NaN,
  resumeStorageKey: "",
}

export function GuestApplyView({ jobId }: GuestApplyViewProps) {
  const { data: job, isPending, isError, error, refetch } = useJobDetails(jobId)
  const applyMutation = useApplyToJob()

  const [extraction, setExtraction] = useState<ResumeExtractionResult | null>(null)
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null)
  const [confirmedResume, setConfirmedResume] = useState<ResumeExtractionResult | null>(null)
  const [resumeSkipped, setResumeSkipped] = useState(false)
  const [submitted, setSubmitted] = useState<ApplyToJobResponse | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const [loginWarningOpen, setLoginWarningOpen] = useState(false)

  const requiresLocation = (job?.workArrangement ?? "Remote") !== "Remote"
  const applySchema = useMemo(
    () => createApplyFormSchema(requiresLocation, !resumeSkipped),
    [requiresLocation, resumeSkipped]
  )

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: emptyDefaults,
  })
  const { register, handleSubmit, reset, watch, setError, formState } = form
  const coverLetterValue = watch("coverLetter")
  const coverLetterCharCount = (coverLetterValue || '').trim().length
  const { errors, isSubmitting } = formState

  // Clear mutation error (e.g. "email already exists") whenever user edits any field
  useEffect(() => {
    if (applyMutation.isError) {
      applyMutation.reset()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("applicantEmail")])

  // Show the "sign in first" warning on every visit to the guest apply page
  useEffect(() => {
    setLoginWarningOpen(true)
  }, [])

  const handleConfirmResume = (extractionResult: ResumeExtractionResult) => {
    setConfirmedResume(extractionResult)
    setExtraction(extractionResult)
    reset({
      applicantName: extractionResult.fullName ?? "",
      applicantEmail: extractionResult.email ?? "",
      location: extractionResult.location ?? "",
      coverLetter: "",
      expectedSalary: Number.NaN,
      totalYearsExperience: Number.NaN,
      resumeStorageKey: extractionResult.resumeUploadId ?? "ready",
    })
  }

  const handleSkipResume = () => {
    setExtraction(null)
    setSelectedResumeFile(null)
    setConfirmedResume(null)
    setResumeSkipped(true)
  }

  const handleUploadAnother = () => {
    setExtraction(null)
    setSelectedResumeFile(null)
    setConfirmedResume(null)
    setResumeSkipped(false)
    reset(emptyDefaults)
  }

  const handleSubmitApplication = (values: ApplyFormValues) => {
    if (!selectedResumeFile && !resumeSkipped) return

    const coverLetterContent = values.coverLetter || ''
    const trimmedCoverLetter = coverLetterContent.trim()
    if (trimmedCoverLetter.length > 4000) {
      setError('coverLetter', { message: 'Cover letter must not exceed 4000 characters.' })
      return
    }
    if (trimmedCoverLetter.length < 2) {
      setError('coverLetter', { message: 'Cover letter must be at least 2 characters.' })
      return
    }
    if (!/[a-zA-Z]/.test(trimmedCoverLetter)) {
      setError('coverLetter', { message: 'Cover letter must contain at least one letter.' })
      return
    }

    const extractedProfile: ExtractedProfilePayload | undefined = confirmedResume
      ? {
          tagline: confirmedResume.tagline ?? null,
          shortBio: confirmedResume.shortBio ?? null,
          phone: confirmedResume.phone ?? null,
          linkedInUrl: confirmedResume.linkedInUrl ?? null,
          portfolioUrls: confirmedResume.portfolioUrls ?? [],
        }
      : undefined

    applyMutation.mutate(
      {
        jobId,
        payload: {
          applicantName: values.applicantName,
          applicantEmail: values.applicantEmail,
          resumeFile: selectedResumeFile ?? undefined,
          coverLetter: coverLetterContent.trimEnd(),
          expectedSalary: values.expectedSalary,
          totalYearsExperience: values.totalYearsExperience,
          location: values.location,
          extractedTechnicalSkills: confirmedResume?.technicalSkills,
          extractedSoftSkills: confirmedResume?.softSkills,
          extractedToolsAndPlatforms: confirmedResume?.toolsAndPlatforms,
          extractedWorkExperience: confirmedResume?.workExperience,
          extractedEducation: confirmedResume?.education,
          extractedProjects: confirmedResume?.projects,
          extractedProfile,
        },
      },
      {
        onSuccess: (response) => {
          setSubmittedEmail(values.applicantEmail)
          setSubmitted(response)
        },
      }
    )
  }

  if (submitted?.accountExists) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16">
          <div className="rounded-2xl border border-amber-100 bg-white p-8 sm:p-10 text-center shadow-sm">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-50">
              <AlertCircle className="size-9 text-amber-600" aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-900">
              Account already exists
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              An account with{' '}
              <span className="font-semibold text-slate-700">{submittedEmail}</span> already
              exists on TalentX. Sign in to apply — your profile and details are already there,
              so there&apos;s no need to create a guest application.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={`/login?redirect=/jobs/${jobId}/apply`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-colors duration-150 hover:bg-blue-500"
              >
                Log in to apply
              </Link>
              <Link
                href={`/jobs/${jobId}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100"
              >
                Back to the job
              </Link>
            </div>
            <div className="mt-5">
              <Link
                href="/jobs"
                className="text-sm font-semibold text-slate-500 transition-colors duration-150 hover:text-emerald-600"
              >
                Browse more roles
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (submitted?.alreadyApplied) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16">
          <div className="rounded-2xl border border-amber-100 bg-white p-8 sm:p-10 text-center shadow-sm">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-50">
              <AlertCircle className="size-9 text-amber-600" aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-900">
              You&apos;ve already applied for this job
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              You have already submitted an application for{' '}
              <span className="font-semibold text-slate-700">{job?.title ?? 'this role'}</span>.
              Check your email for the application status or browse other opportunities.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-colors duration-150 hover:bg-emerald-500"
              >
                Browse more roles
              </Link>
              <Link
                href={`/jobs/${jobId}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100"
              >
                Back to the job
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    const isResend = submitted.verificationEmailResent === true

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16">
          <div className="rounded-2xl border border-emerald-100 bg-white p-8 sm:p-10 text-center shadow-sm">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="size-9 text-emerald-600" aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-900">
              {isResend ? "Verification email resent" : "Check your inbox"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {isResend ? (
                <>
                  A new verification link has been sent to{' '}
                  <span className="font-semibold text-slate-700">{submittedEmail}</span>.
                  Please check your inbox and click the link to activate your application for{' '}
                  <span className="font-semibold text-slate-700">{job?.title ?? 'this role'}</span>.
                </>
              ) : (
                <>
                  We&apos;ve sent a verification link to{' '}
                  <span className="font-semibold text-slate-700">{submittedEmail}</span>.
                  Click the link in the email to verify your address and activate your application for{' '}
                  <span className="font-semibold text-slate-700">{job?.title ?? 'this role'}</span>.
                </>
              )}
            </p>

            <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/50 px-5 py-4 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                {isResend ? "New link sent" : "Verification required"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Your application will remain pending until you verify your email.
                The link expires in 30 minutes.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={`/jobs/${jobId}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100"
              >
                Back to the job
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors duration-150 hover:bg-emerald-500"
              >
                Browse more roles
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <ApplyLoginWarningDialog
        open={loginWarningOpen}
        onOpenChange={setLoginWarningOpen}
        jobId={jobId}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-6">
          <Link
            href={`/jobs/${jobId}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to job
          </Link>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading…
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">Couldn&apos;t load this job</h1>
            <p className="mt-2 text-sm text-slate-500">
              {error && (error as { message?: string }).message
                ? (error as { message?: string }).message
                : 'This job may have been removed or is no longer accepting applications.'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100"
            >
              Retry
            </button>
          </div>
        ) : job.status !== 'Published' ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">{NON_ACTIVE_JOB_NOTICES[job.status]?.title ?? 'This job is no longer accepting applications'}</h1>
            <p className="mt-2 text-sm text-slate-500">This role is currently {job.status.toLowerCase()} and is not accepting new applications.</p>
            <Link
              href={`/jobs/${jobId}`}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100"
            >
              Back to job
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <header className="space-y-3">
              <span className={`${eyebrowLabelClass} text-emerald-600`}>Guest Application</span>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Apply to {job.title}
              </h1>
              <p className="text-sm leading-relaxed text-slate-500">
                No account needed. Upload your resume — or skip it — review what we extract, and
                submit your application in under two minutes.
              </p>
            </header>

            {!confirmedResume && !resumeSkipped ? (
              extraction ? (
                <section aria-label="Review extracted resume" className="space-y-3">
                  <h2 className="text-base font-bold text-slate-900">1 · Your resume</h2>
                  <ExtractedProfileReview
                    data={extraction}
                    onReset={() => {
                      setExtraction(null)
                      setSelectedResumeFile(null)
                    }}
                    onConfirm={handleConfirmResume}
                  />
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Don&apos;t want to use this resume?
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Skip it and fill in your application details manually.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSkipResume}
                        className="shrink-0 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-xs transition-colors duration-150 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900"
                      >
                        Skip for now — continue without a resume
                      </button>
                    </div>
                  </div>
                </section>
              ) : (
                <section
                  aria-label="Upload resume"
                  className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm"
                >
                  <h2 className="text-base font-bold text-slate-900">1 · Your resume</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    We extract your contact details and experience so you don&apos;t have to retype
                    them — you can correct anything before submitting.
                  </p>
                  <div className="mt-5">
                    <ResumeUploadDropzone
                      className="max-w-none border-0 bg-transparent shadow-none rounded-none overflow-visible p-0"
                      onExtractionSuccess={(data, file) => {
                        setExtraction(data)
                        setSelectedResumeFile(file)
                      }}
                    />
                  </div>
                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <button
                      type="button"
                      onClick={handleSkipResume}
                      className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-xs transition-colors duration-150 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900"
                    >
                      Skip for now — continue without a resume
                    </button>
                    <p className="mt-2 text-center text-xs text-slate-400">
                      A resume is optional — you can add one to your profile later.
                    </p>
                  </div>
                </section>
              )
            ) : (
              <form
                onSubmit={handleSubmit(handleSubmitApplication)}
                className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-base font-bold text-slate-900">2 · Your application</h2>
                  <button
                    type="button"
                    onClick={handleUploadAnother}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
                  >
                    <RefreshCw className="size-3.5" />
                    {resumeSkipped ? "Add a resume" : "Upload a different resume"}
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {resumeSkipped
                    ? "Fill in your application details below — attaching a resume is optional."
                    : "Review the details below — they were filled from your resume and can be edited."}
                </p>

                {applyMutation.isError && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden="true" />
                      <div className="flex-1 text-sm">
                        <p className="font-bold">Submission failed</p>
                        <p className="mt-0.5 text-red-700">
                          {applyMutation.error?.message || "Something went wrong. Please try again."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <input type="hidden" {...register("resumeStorageKey")} />

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <FieldWrapper label="Name" htmlFor="applicant-name" required error={errors.applicantName?.message}>
                    <input
                      id="applicant-name"
                      placeholder="e.g. Jane Doe"
                      aria-invalid={!!errors.applicantName}
                      className={fieldInputClass}
                      {...register("applicantName")}
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Email" htmlFor="applicant-email" required error={errors.applicantEmail?.message}>
                    <input
                      id="applicant-email"
                      type="email"
                      placeholder="jane@example.com"
                      aria-invalid={!!errors.applicantEmail}
                      className={fieldInputClass}
                      {...register("applicantEmail")}
                    />
                  </FieldWrapper>

                  {requiresLocation && (
                    <FieldWrapper label="Location" htmlFor="applicant-location" required={requiresLocation} error={errors.location?.message}>
                      <input
                        id="applicant-location"
                        placeholder="e.g. Dhaka, Bangladesh"
                        aria-invalid={!!errors.location}
                        className={fieldInputClass}
                        {...register("location")}
                      />
                    </FieldWrapper>
                  )}

                  <FieldWrapper
                    label="Expected Salary (per month, BDT)"
                    htmlFor="expected-salary"
                    required
                    error={errors.expectedSalary?.message}
                  >
                    <input
                      id="expected-salary"
                      type="number"
                      min={1}
                      placeholder="e.g. 85000 BDT"
                      aria-invalid={!!errors.expectedSalary}
                      className={`${fieldInputClass} font-mono`}
                      {...register("expectedSalary", { valueAsNumber: true })}
                    />
                  </FieldWrapper>

                  <FieldWrapper
                    label="Total Years of Experience"
                    htmlFor="years-experience"
                    required
                    error={errors.totalYearsExperience?.message}
                  >
                    <input
                      id="years-experience"
                      type="number"
                      min={0}
                      max={80}
                      step="0.5"
                      placeholder="e.g. 6"
                      aria-invalid={!!errors.totalYearsExperience}
                      className={`${fieldInputClass} font-mono`}
                      {...register("totalYearsExperience", { valueAsNumber: true })}
                    />
                  </FieldWrapper>
                </div>

                <FieldWrapper
                  label="Cover Letter"
                  htmlFor="cover-letter"
                  required
                  error={errors.coverLetter?.message}
                  hint={`${coverLetterCharCount} / 4000 characters`}
                  hintClassName={coverLetterCharCount > 4000 ? 'font-medium' : ''}
                  hintStyle={coverLetterCharCount > 4000 ? { color: '#ef4444' } : undefined}
                >
                  <textarea
                    id="cover-letter"
                    rows={6}
                    placeholder="Tell the employer why you're a great fit for this role."
                    aria-invalid={!!errors.coverLetter}
                    className={fieldInputClass}
                    {...register("coverLetter")}
                  />
                </FieldWrapper>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || applyMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-xs transition-colors duration-150 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    {isSubmitting || applyMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Send className="size-4" aria-hidden="true" />
                    )}
                    Submit application
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}