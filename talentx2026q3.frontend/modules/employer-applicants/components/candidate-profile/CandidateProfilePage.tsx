'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useCandidateProfile } from '../../hooks/useCandidateProfile';
import { useJobApplicants } from '../../hooks/useJobApplicants';
import { useUpdateApplicationStatus } from '../../hooks/useUpdateApplicationStatus';
import { APPLICANT_FALLBACKS, statusOptionsFor } from '../../constants';
import { getErrorMessage } from '@/lib/errors';
import type { ApplicationStatus, GetJobApplicantsQueryParams } from '../../types/applicant.types';
import { ProfileTopBar } from './ProfileTopBar';
import { ProfileHeader } from './ProfileHeader';
import { ProfileMainSections } from './ProfileMainSections';
import { ProfileSideRail } from './ProfileSideRail';
import { ProfileActionBar } from './ProfileActionBar';
import { CandidateProfileSkeleton } from './CandidateProfileSkeleton';

type SearchParamsInput = Record<string, string | string[] | undefined>;

interface CandidateProfilePageProps {
  jobId: string;
  applicationId: string;
  searchParams?: SearchParamsInput;
}

const NEIGHBOR_PAGE_SIZE = 100;

function readParam(searchParams: SearchParamsInput | undefined, key: string): string | undefined {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] : value;
}

export function CandidateProfilePage({ jobId, applicationId, searchParams }: CandidateProfilePageProps) {
  const { data: profile, isPending, isError, error, refetch } = useCandidateProfile(applicationId);
  const updateStatusMutation = useUpdateApplicationStatus(jobId);
  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(null);

  const listParams = useMemo<GetJobApplicantsQueryParams>(
    () => ({
      search: readParam(searchParams, 'search'),
      status: readParam(searchParams, 'status'),
      sortBy: readParam(searchParams, 'sortBy'),
      sortOrder: readParam(searchParams, 'sortOrder'),
      page: Number(readParam(searchParams, 'page')) || undefined,
      pageSize: NEIGHBOR_PAGE_SIZE,
    }),
    [searchParams]
  );

  const { data: applicants } = useJobApplicants(jobId, listParams);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    const search = readParam(searchParams, 'search');
    const status = readParam(searchParams, 'status');
    const sortBy = readParam(searchParams, 'sortBy');
    const sortOrder = readParam(searchParams, 'sortOrder');
    const page = readParam(searchParams, 'page');
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (sortBy) params.set('sortBy', sortBy);
    if (sortOrder) params.set('sortOrder', sortOrder);
    if (page) params.set('page', page);
    return params.toString();
  }, [searchParams]);

  const buildApplicantHref = (id: string) => {
    const base = `/job/job-listing/${jobId}/applicants/${id}`;
    return queryString ? `${base}?${queryString}` : base;
  };

  const backHref = `/job/job-listing/${jobId}?tab=applicants`;

  const currentStatus = profile?.applicationStatus ?? null;
  const statusOptions = statusOptionsFor(currentStatus);
  const hasCurrentStatusOption =
    currentStatus !== null && statusOptions.some((opt) => opt.value === currentStatus);
  const statusValue = pendingStatus ?? (hasCurrentStatusOption ? currentStatus : null);
  const canSave = pendingStatus !== null && pendingStatus !== currentStatus;

  const handleSaveStatus = async () => {
    if (!pendingStatus) return;
    try {
      const response = await updateStatusMutation.mutateAsync({ applicationId, newStatus: pendingStatus });
      toast.success(response?.message || 'Application status updated.');
      setPendingStatus(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update application status.'));
    }
  };

  const applicantItems = applicants?.items ?? [];
  const currentIndex = applicantItems.findIndex((applicant) => applicant.id === applicationId);
  const prevHref = currentIndex > 0 ? buildApplicantHref(applicantItems[currentIndex - 1].id) : null;
  const nextHref =
    currentIndex >= 0 && currentIndex < applicantItems.length - 1
      ? buildApplicantHref(applicantItems[currentIndex + 1].id)
      : null;
  const position = currentIndex >= 0 ? currentIndex + 1 : null;
  const total = applicants?.totalCount ?? null;

  if (isPending) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
        <CandidateProfileSkeleton />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
        <div className="mx-auto flex w-full flex-1 flex-col px-4 pt-5 sm:px-6 lg:px-8 md:pt-6">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 self-start rounded-md px-1 py-1 text-sm font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Back to applicants
          </Link>

          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="text-sm font-semibold text-rose-600">{APPLICANT_FALLBACKS.ERROR_LOAD_PROFILE_TITLE}</p>
            <p className="max-w-sm text-xs text-ink-subtle">
              {(error as { message?: string })?.message ?? APPLICANT_FALLBACKS.ERROR_LOAD_PROFILE}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink shadow-card transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <RefreshCw className="size-3.5 text-ink-subtle" aria-hidden="true" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <div className="mx-auto flex w-full flex-1 flex-col px-4 pb-8 pt-5 sm:px-6 lg:px-8 md:pt-6">
        <ProfileTopBar
          backHref={backHref}
          position={position}
          total={total}
          prevHref={prevHref}
          nextHref={nextHref}
        />

        <div className="mt-4">
          <ProfileHeader profile={profile} />
        </div>

        <div className="mt-4 grid items-start gap-4 md:mt-5 md:gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProfileMainSections profile={profile} />
          </div>
          <aside aria-label="Application details" className="lg:sticky lg:top-6">
            <ProfileSideRail profile={profile} />
          </aside>
        </div>
      </div>

      <ProfileActionBar
        statusValue={statusValue}
        currentStatus={currentStatus}
        statusOptions={statusOptions}
        onStatusChange={setPendingStatus}
        onSave={handleSaveStatus}
        canSave={canSave}
        saving={updateStatusMutation.isPending}
        resumeUrl={profile.resumeUrl}
      />
    </div>
  );
}
