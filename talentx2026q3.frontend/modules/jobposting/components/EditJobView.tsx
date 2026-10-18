"use client"

import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"

import { useJob } from "../hooks/useJob"
import { useUpdateJob } from "../hooks/useUpdateJob"
import { getChangedFields } from "../utils/get-changed-fields"
import type { JobFormValues } from "../types/job-schema"
import { JobForm } from "./JobForm"

interface EditJobViewProps {
  jobId: string
}

export function EditJobView({ jobId }: EditJobViewProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: job, isPending, isError, error, refetch } = useJob(jobId)
  const updateJob = useUpdateJob()

  function handleSaveDraft(values: JobFormValues) {
    if (!job) return
    const payload = getChangedFields(job, values, false)
    updateJob.mutate(
      { id: jobId, payload },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["jobs", jobId] })
        },
      }
    )
  }

  function handlePublish(values: JobFormValues) {
    if (!job) return
    const payload = getChangedFields(job, values, true)
    updateJob.mutate(
      { id: jobId, payload },
      {
        onSuccess: () => {
          router.push("/job/job-listing")
        },
      }
    )
  }

  if (isPending) {
    return (
      <div className="flex min-h-full w-full items-center justify-center bg-slate-50">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 py-10">
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-40 w-full animate-pulse rounded-xl bg-slate-200" />
          <div className="h-8 w-full animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>
    )
  }

  if (isError) {
    const status = (error as { status?: number | null })?.status
    const message = (error as { message?: string })?.message

    if (status === 404) {
      return (
        <div className="flex min-h-full w-full items-center justify-center bg-slate-50">
          <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 px-6 py-20 text-center">
            <h1 className="text-xl font-bold text-slate-900">Job not found</h1>
            <p className="text-sm text-slate-500">
              This job may have been deleted, or the link is incorrect.
            </p>
            <button
              type="button"
              onClick={() => router.push("/job/job-listing")}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex min-h-full w-full items-center justify-center bg-slate-50">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 px-6 py-20 text-center">
          <h1 className="text-xl font-bold text-slate-900">Couldn&apos;t load this job</h1>
          <p className="text-sm text-slate-500">{message ?? "Something went wrong."}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <JobForm
      mode="edit"
      jobStatus={job.status}
      defaultValues={{
        title: job.title,
        companyName: job.companyName,
        description: job.description,
        location: job.location,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel,
        workArrangement: job.workArrangement,
        requiredSkills: job.requiredSkills,
        vacancies: job.vacancies,
        // The date <input> needs a plain yyyy-MM-dd value; job.expireAt is a
        // full ISO datetime from the backend, so just take the date portion.
        expireAt: job.expireAt.slice(0, 10),
        // Wizard fields
        city: job.city ?? undefined,
        country: job.country ?? undefined,
        minOverlapHours: job.minOverlapHours ?? undefined,
      }}
      isSubmitting={updateJob.isPending}
      onSaveDraft={handleSaveDraft}
      onPublish={handlePublish}
    />
  )
}
