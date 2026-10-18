'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PortalPageContainer } from '@/components/layout';
import { JobDetail } from '@/modules/job-listing';
import { ApplicantListView } from '@/modules/employer-applicants';
import { EmployerInterviewListView } from '@/modules/employer-interviews';
import { useMyJob } from '../hooks/useMyJob';
import { useResubmitJob } from '../hooks/useResubmitJob';
import { DEFAULT_JOB_DETAIL_TAB, DETAIL_TABS } from '../constants/employer-jobs.constants';
import { isValidJobDetailTab } from '../utils/employer-jobs.utils';
import type {
  EmployerJobDetailTab,
  EmployerJobDetailViewProps,
} from '../types/employer-job.types';
import { TalentMatchPanel } from './TalentMatchPanel';
import { DeactivationBanner } from './DeactivationBanner';
import { JobStatusBadge } from './JobStatusBadge';

import { EmployerJobDetailSkeleton } from './EmployerJobDetailSkeleton';

// Employer's single-job page: specification, applicants and interviews tabs.
export function EmployerJobDetailView({ jobId, initialTab }: EmployerJobDetailViewProps) {
  const { data: job, isPending, isError, error, refetch } = useMyJob(jobId);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const resolvedInitialTab: EmployerJobDetailTab = isValidJobDetailTab(tabParam)
    ? tabParam
    : (initialTab ?? DEFAULT_JOB_DETAIL_TAB);
  const [activeTab, setActiveTab] = useState<EmployerJobDetailTab>(resolvedInitialTab);
  const resubmitMutation = useResubmitJob(jobId);

  const [prevTabParam, setPrevTabParam] = useState(tabParam);
  if (tabParam !== prevTabParam) {
    setPrevTabParam(tabParam);
    if (isValidJobDetailTab(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }

  const handleTabChange = (nextTab: EmployerJobDetailTab) => {
    if (nextTab === activeTab) return;
    setActiveTab(nextTab);
    const targetUrl = nextTab === DEFAULT_JOB_DETAIL_TAB
      ? `/job/job-listing/${jobId}`
      : `/job/job-listing/${jobId}?tab=${nextTab}`;
    router.replace(targetUrl, { scroll: false });
  };

  const isDeactivated = job?.status === 'Deactivated';

  const handleResubmit = async () => {
    try {
      await resubmitMutation.mutateAsync(jobId);
    } catch {
      // The hook toasts the reason, which names any fields still missing.
    }
  };

  if (isPending) {
    return <EmployerJobDetailSkeleton />;
  }

  if (isError) {
    const status = (error as { status?: number | null })?.status;
    const message = (error as { message?: string })?.message;

    if (status === 404) {
      return (
        <PortalPageContainer>
          <div className="py-10 sm:py-14 space-y-8">
            <Link href="/job/job-listing" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
              <ChevronLeft className="size-4 mr-1" />
              Back to My Jobs
            </Link>
            <div className="rounded-md border border-slate-200 bg-white p-8 text-center">
              <h1 className="text-xl font-bold text-slate-900">Job not found</h1>
              <p className="mt-2 text-sm text-slate-500">This job may have been deleted, or the link is incorrect.</p>
            </div>
          </div>
        </PortalPageContainer>
      );
    }

    return (
      <PortalPageContainer>
        <div className="py-10 sm:py-14 space-y-8">
          <Link href="/job/job-listing" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
            <ChevronLeft className="size-4 mr-1" />
            Back to My Jobs
          </Link>
          <div className="rounded-md border border-slate-200 bg-white p-8 text-center">
            <h1 className="text-xl font-bold text-slate-900">Couldn&apos;t load this job</h1>
            <p className="mt-2 text-sm text-slate-500">{message ?? 'Something went wrong.'}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      </PortalPageContainer>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <PortalPageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/job/job-listing" className="inline-flex items-center hover:text-slate-900 transition-colors cursor-pointer">
            <ChevronLeft className="size-4 mr-1" />
            My Jobs
          </Link>
          <ChevronRight className="size-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md" title={job.title}>{job.title}</span>
          <JobStatusBadge status={job.status} className="shrink-0" />
        </div>

        <DeactivationBanner
          status={job.status}
          reasonLabel={job.deactivationReasonLabel}
          details={job.deactivationDetails}
          deactivatedAt={job.deactivatedAt}
        />

        {activeTab !== 'job-details' && <h1 className="sr-only">{job.title}</h1>}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Job details navigation"
            className="flex max-w-full overflow-x-auto p-1 bg-slate-100 border border-slate-200 rounded-md [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {DETAIL_TABS.map((tabOption) => {
              const isActive = activeTab === tabOption.value;
              const Icon = tabOption.icon;
              return (
                <button
                  key={tabOption.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTabChange(tabOption.value)}
                  className={cn(
                    'relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm cursor-pointer whitespace-nowrap shrink-0 outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2',
                    isActive ? 'text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeJobDetailTabIndicator"
                      className="absolute inset-0 rounded-sm bg-slate-950 shadow-xs"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <Icon className={cn("relative z-10 size-4", isActive ? "text-emerald-400" : "text-slate-500")} />
                  <span className="relative z-10">{tabOption.label}</span>
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {job.status !== 'PendingReview' && (
              <>
                {isDeactivated && (
                  <button
                    type="button"
                    onClick={handleResubmit}
                    disabled={resubmitMutation.isPending}
                    className="inline-flex items-center justify-center rounded-md border border-amber-300 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-800 shadow-2xs transition-colors hover:bg-amber-100 disabled:pointer-events-none disabled:opacity-60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                  >
                    {resubmitMutation.isPending ? (
                      <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Send className="size-3.5 mr-1.5" />
                    )}
                    Resubmit for review
                  </button>
                )}
                <Link
                  href={`/job/${job.id}/edit`}
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                >
                  <Pencil className="size-3.5 mr-1.5 text-slate-500" />
                  {isDeactivated ? 'Fix & Resubmit' : 'Edit Job'}
                </Link>
              </>
            )}
            {(job.status === 'Published' || job.status === 'Expired') && (
              <TalentMatchPanel jobId={jobId} />
            )}
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'job-details' && (
          <JobDetail job={job} showApply={false} />
        )}

        {activeTab === 'applicants' && (
          <ApplicantListView jobId={jobId} />
        )}

        {activeTab === 'interviews' && (
          <EmployerInterviewListView jobId={jobId} />
        )}
      </div>
    </PortalPageContainer>
  );
}
