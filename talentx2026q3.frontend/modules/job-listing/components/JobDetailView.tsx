'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QueryClientContext } from '@tanstack/react-query';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useHeaderSession } from '@/components/common/use-header-session';
import { useJobDetails } from '../hooks/useJobDetails';
import { useApplicationStatus } from '../hooks/useApplicationStatus';
import { InvitationBanner } from './InvitationBanner';
import { JobDetail } from './JobDetail';
import { useSavedJobIds, useSaveJob, useRemoveSavedJob, SaveJobButton } from '@/modules/saved-jobs';

interface JobDetailViewProps {
  jobId: string;
  /** Resolved server-side from the auth cookie. */
  viewerIsAuthenticated?: boolean;
  viewerIsTalent?: boolean;
  viewerIsGuest?: boolean;
  viewerIsEmployer?: boolean;
  viewerIsAdmin?: boolean;
}

export function JobDetailView({
  jobId,
  viewerIsAuthenticated = false,
  viewerIsTalent = false,
  viewerIsGuest = false,
  viewerIsEmployer = false,
  viewerIsAdmin = false,
}: JobDetailViewProps) {
  const { data: job, isPending, isError, error, refetch } = useJobDetails(jobId);
  const router = useRouter();
  const queryClient = useContext(QueryClientContext);
  const {
    isEmployer: clientIsEmployer,
    isAdmin: clientIsAdmin,
    isTalent: clientIsTalent,
    isAuthenticated: clientIsAuthenticated,
  } = useHeaderSession({ enabled: Boolean(queryClient) });

  const resolvedIsEmployer = Boolean(viewerIsEmployer || clientIsEmployer);
  const resolvedIsAdmin = Boolean(viewerIsAdmin || clientIsAdmin);
  const resolvedIsTalent = Boolean(viewerIsTalent || clientIsTalent);
  const resolvedIsAuthenticated = Boolean(viewerIsAuthenticated || clientIsAuthenticated);

  const isEmployerOrAdmin = resolvedIsEmployer || resolvedIsAdmin;
  const showApply = !isEmployerOrAdmin;

  const shouldCheckSaved = resolvedIsAuthenticated && resolvedIsTalent;
  const { data: savedIds } = useSavedJobIds({ enabled: shouldCheckSaved });
  const saveMutation = useSaveJob();
  const removeMutation = useRemoveSavedJob();
  const isSaved = savedIds?.has(jobId) ?? false;
  const showSaveButton = resolvedIsTalent;
  const isSavePending =
    (saveMutation.isPending && saveMutation.variables === jobId) ||
    (removeMutation.isPending && removeMutation.variables === jobId);

  const handleSaveToggle = (jid: string, saved: boolean) => {
    if (!resolvedIsAuthenticated) {
      router.push('/login');
      return;
    }
    if (saved) {
      saveMutation.mutate(jid);
    } else {
      removeMutation.mutate(jid);
    }
  };

  const shouldCheckApplication = resolvedIsAuthenticated && resolvedIsTalent;
  console.log(
    '[apply-check] authenticated:', viewerIsAuthenticated,
    '| isTalent:', viewerIsTalent,
    '| will call API:', shouldCheckApplication,
  );

  const appStatus = useApplicationStatus(jobId, { enabled: shouldCheckApplication });

  if (!shouldCheckApplication) {
    console.log('[apply-check] skipped — not an authenticated Talent, no backend call');
  } else if (appStatus.isSuccess) {
    console.log('[apply-check] hasApplied:', appStatus.data.hasApplied);
  } else if (appStatus.isError) {
    console.log('[apply-check] status check failed:', appStatus.error);
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-slate-400" aria-hidden="true" />
      </div>
    );
  }

  if (isError) {
    const status = (error as { status?: number | null })?.status;
    const message = (error as { message?: string })?.message;

    if (status === 404) {
      return (
        <div className="min-h-screen bg-slate-50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
            <Link href="/jobs" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
              <ChevronLeft className="size-4" aria-hidden="true" />
              All open roles
            </Link>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <h1 className="text-xl font-bold text-slate-900">Job not found</h1>
              <p className="mt-2 text-sm text-slate-500">This job may have been deleted, or the link is incorrect.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
          <Link href="/jobs" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
            <ChevronLeft className="size-4" aria-hidden="true" />
            All open roles
          </Link>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h1 className="text-xl font-bold text-slate-900">Couldn&apos;t load this job</h1>
            <p className="mt-2 text-sm text-slate-500">{message ?? 'Something went wrong.'}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  let applyUrl = `/jobs/${jobId}/apply`;
  if (viewerIsAuthenticated) {
    if (viewerIsGuest) applyUrl = `/change-password?source=verification`;
    else if (viewerIsTalent) applyUrl = `/apply/${jobId}`;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-6">
          <Link href="/jobs" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
            <ChevronLeft className="size-4" aria-hidden="true" />
            All open roles
          </Link>
        </div>
        <InvitationBanner />
        <JobDetail
          job={job}
          showApply={showApply}
          applyUrl={applyUrl}
          viewerIsTalent={resolvedIsTalent}
          applyStatus={
            shouldCheckApplication
              ? {
                  isChecking: appStatus.isLoading,
                  hasApplied: appStatus.data?.hasApplied ?? false,
                }
              : undefined
          }
          headerAction={
            showSaveButton && (
              <SaveJobButton
                jobId={jobId}
                isSaved={isSaved}
                onToggle={handleSaveToggle}
                disabled={isSavePending}
                size="md"
              />
            )
          }
        />
      </div>
    </div>
  );
}
