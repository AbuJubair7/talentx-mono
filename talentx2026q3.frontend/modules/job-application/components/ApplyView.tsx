"use client"

import React, { useState } from "react";
import { Loader2 } from "lucide-react";

import { useApplicationPrefill } from "../hooks/useApplicationPrefill";
import { useTalentApplyToJob } from "../hooks/useApplyToJob";
import { useJobDetails } from "@/modules/job-listing/hooks/useJobDetails";
import { Header, type HeaderUser } from "@/components/common/header";
import { PortalPageHeader } from "@/components/layout";
import { ApplyForm } from "./ApplyForm";
import { JobSummaryCard } from "./apply/JobSummaryCard";
import { SubmittedView } from "./apply/SubmittedView";
import { NON_ACTIVE_JOB_NOTICES } from "@/modules/job-listing/constants/job-detail.constants";
import Link from "next/link";

export interface ApplyViewProps {
  jobId: string;
  initialUser?: HeaderUser | null;
}

export function ApplyView({ jobId, initialUser = null }: ApplyViewProps) {
  const { data: prefill, isPending: isPrefillPending, isError: isPrefillError } = useApplicationPrefill();
  const { data: job, isPending: isJobPending, isError: isJobError } = useJobDetails(jobId);
  const applyMutation = useTalentApplyToJob(jobId);
  
  const [completion, setCompletion] = useState(0);

  const submittedResumeName = (() => {
    const variables = applyMutation.variables
    if (variables?.resumeId) {
      return prefill?.resumes?.find((resume) => resume.id === variables.resumeId)?.displayName ?? 'Saved Resume'
    }
    if (variables?.resumeStorageKey && variables.resumeStorageKey === prefill?.resumeStorageKey) {
      return prefill?.resumeOriginalFileName || 'Profile Resume'
    }
    return 'New Resume Upload'
  })()

  if (isPrefillPending || isJobPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-slate-400" aria-hidden="true" />
      </div>
    )
  }

  if (isPrefillError || !prefill || isJobError || !job) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <p className="text-sm text-slate-600">
              {"We couldn't load the application details. Make sure your Talent profile is complete and the job exists, then try again."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (job.status !== 'Published') {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center sm:p-8">
            <h1 className="text-xl font-bold text-slate-900">{NON_ACTIVE_JOB_NOTICES[job.status]?.title ?? 'This job is no longer accepting applications'}</h1>
            <p className="mt-2 text-sm text-slate-500">This role is currently {job.status.toLowerCase()} and is not accepting new applications.</p>
            <Link
              href={`/jobs/${jobId}`}
              className="mt-4 inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Back to job
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <Header initialUser={initialUser} />
      <main className="mx-auto w-full max-w-7xl px-6 py-6 lg:px-8">
        {applyMutation.isSuccess ? (
          <SubmittedView
            job={job}
            prefill={prefill}
            resumeName={submittedResumeName}
          />
        ) : (
          <>
            <PortalPageHeader
              eyebrow={
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Application · {job.companyName}
                </p>
              }
              title="Apply for this role"
              subtitle="Everything below comes from your profile. Change what you need for this job, then submit."
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-8">
              <ApplyForm
                prefill={prefill}
                isSubmitting={applyMutation.isPending}
                onCompletionChange={setCompletion}
                onSubmit={(payload) => applyMutation.mutate(payload)}
              />
              <JobSummaryCard job={job} completion={completion} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
