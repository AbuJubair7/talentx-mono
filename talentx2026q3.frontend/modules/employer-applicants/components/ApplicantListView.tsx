'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CalendarClock } from 'lucide-react';
import { SendInterviewDialog } from '@/modules/employer-interviews';
import {
  ALL_STATUS_FILTER,
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  APPLICANT_FALLBACKS,
  canRevertToApplied,
  type ApplicationStatusFilter,
} from '../constants';
import { useJobApplicants } from '../hooks/useJobApplicants';
import { useUpdateApplicationStatus } from '../hooks/useUpdateApplicationStatus';
import { useScoreApplicants } from '../hooks/useScoreApplicants';
import type { ApplicationStatus } from '../types/applicant.types';
import { getErrorMessage } from '@/lib/errors';
import { ApplicantTable } from './ApplicantTable';
import { ApplicantListSkeleton } from './ApplicantListSkeleton';
import { ApplicantListError } from './ApplicantListError';
import { ApplicantSearchToolbar } from './ApplicantSearchToolbar';
import { BulkActionsBar } from './BulkActionsBar';
import { ApplicantPagination } from './ApplicantPagination';
import { ApplicantEmptyState } from './ApplicantEmptyState';

interface ApplicantListViewProps {
  jobId: string;
}

export function ApplicantListView({ jobId }: ApplicantListViewProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatusFilter>(ALL_STATUS_FILTER);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE_NUMBER);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingStatusIds, setPendingStatusIds] = useState<Set<string>>(new Set());
  const [sendInterviewOpen, setSendInterviewOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ sortBy: string; sortOrder: 'asc' | 'desc' }>({
    sortBy: 'aiMatchScore',
    sortOrder: 'desc',
  });

  const queryParams = useMemo(() => ({
    search: appliedSearch || undefined,
    status: statusFilter !== ALL_STATUS_FILTER ? statusFilter : undefined,
    sortBy: sortConfig.sortBy,
    sortOrder: sortConfig.sortOrder,
    page: currentPage,
    pageSize: DEFAULT_PAGE_SIZE,
  }), [appliedSearch, statusFilter, sortConfig, currentPage]);

  const {
    data: paginatedData,
    isPending,
    isError,
    error,
    isFetching,
    refetch,
  } = useJobApplicants(jobId, queryParams);

  const updateStatusMutation = useUpdateApplicationStatus(jobId);
  const scoreApplicantsMutation = useScoreApplicants(jobId);

  const applicants = paginatedData?.items ?? [];
  const totalCount = paginatedData?.totalCount ?? 0;
  const totalPages = paginatedData?.totalPages ?? 1;
  const fromItem = totalCount === 0 ? 0 : (currentPage - 1) * DEFAULT_PAGE_SIZE + 1;
  const toItem = Math.min(currentPage * DEFAULT_PAGE_SIZE, totalCount);

  const isFiltered = !!(appliedSearch || searchInput || statusFilter !== ALL_STATUS_FILTER);

  const clearSelections = () => setSelectedIds(new Set());

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setCurrentPage(DEFAULT_PAGE_NUMBER);
    clearSelections();
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setAppliedSearch('');
    setCurrentPage(DEFAULT_PAGE_NUMBER);
    clearSelections();
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setAppliedSearch('');
    setStatusFilter(ALL_STATUS_FILTER);
    setCurrentPage(DEFAULT_PAGE_NUMBER);
    clearSelections();
  };

  const handleStatusFilterChange = (value: ApplicationStatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(DEFAULT_PAGE_NUMBER);
    clearSelections();
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    setCurrentPage((prev) =>
      direction === 'prev'
        ? Math.max(prev - 1, DEFAULT_PAGE_NUMBER)
        : Math.min(prev + 1, totalPages)
    );
    clearSelections();
  };

  const handleSort = (sortBy: string) => {
    setSortConfig((prev) => ({
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
    setCurrentPage(DEFAULT_PAGE_NUMBER);
    clearSelections();
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (!applicants.length) return;
    const allSelected = applicants.every((app) => selectedIds.has(app.id));
    setSelectedIds(allSelected ? new Set() : new Set(applicants.map((app) => app.id)));
  };

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    setPendingStatusIds((prev) => new Set([...prev, applicationId]));
    try {
      const response = await updateStatusMutation.mutateAsync({ applicationId, newStatus });
      toast.success(response?.message || 'Application status updated.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update application status.'));
    } finally {
      setPendingStatusIds((prev) => {
        const next = new Set(prev);
        next.delete(applicationId);
        return next;
      });
    }
  };

  const handleBulkStatusChange = async (newStatus: ApplicationStatus) => {
    const ids = [...selectedIds];
    clearSelections();

    const isRevertToApplied = newStatus === 'Applied';
    const selectedApplicants = applicants.filter((app) => ids.includes(app.id));
    const targetIds = isRevertToApplied
      ? selectedApplicants.filter((app) => canRevertToApplied(app.status)).map((app) => app.id)
      : ids;
    const skipped = ids.length - targetIds.length;

    if (isRevertToApplied && targetIds.length === 0) {
      toast.warning(
        'No selected applicants can be reverted to Applied (only Shortlisted, Hired, or Rejected).'
      );
      return;
    }

    const results = await Promise.allSettled(
      targetIds.map((applicationId) =>
        updateStatusMutation.mutateAsync({ applicationId, newStatus })
      )
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    const successLabel = isRevertToApplied ? 'reverted to Applied' : `updated to ${newStatus}`;
    const skippedSuffix =
      skipped > 0
        ? `, ${skipped} skipped (only Shortlisted, Hired, or Rejected can be reverted)`
        : '';

    if (failed === 0) {
      toast.success(
        `${succeeded} application${succeeded !== 1 ? 's' : ''} ${successLabel}${skippedSuffix}.`
      );
    } else if (succeeded === 0) {
      toast.error(`Failed to update ${failed} application${failed !== 1 ? 's' : ''}${skippedSuffix}.`);
    } else {
      toast.warning(`${succeeded} updated, ${failed} failed${skippedSuffix}. Please retry the failed ones.`);
    }
  };

  const handleScoreApplicants = async () => {
    try {
      const result = await scoreApplicantsMutation.mutateAsync();
      const reused = result.reusedCount ?? 0;
      if (result.scoredCount === 0 && reused > 0) {
        toast.success(
          `No rescoring needed — reused ${reused} existing AI score${reused !== 1 ? 's' : ''}.`
        );
      } else {
        const reusedNote =
          reused > 0 ? ` Reused ${reused} existing score${reused !== 1 ? 's' : ''}.` : '';
        toast.success(
          `Scored ${result.scoredCount} applicant${result.scoredCount !== 1 ? 's' : ''} with AI.${reusedNote}`
        );
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to score applicants.'));
    }
  };

  const handleOpenProfile = (applicationId: string) => {
    const params = new URLSearchParams();
    if (appliedSearch) params.set('search', appliedSearch);
    if (statusFilter !== ALL_STATUS_FILTER) params.set('status', statusFilter);
    params.set('sortBy', sortConfig.sortBy);
    params.set('sortOrder', sortConfig.sortOrder);
    params.set('page', String(currentPage));
    router.push(`/job/job-listing/${jobId}/applicants/${applicationId}?${params.toString()}`);
  };

  if (isPending) return <ApplicantListSkeleton />;

  if (isError) {
    return (
      <ApplicantListError
        message={getErrorMessage(error, APPLICANT_FALLBACKS.ERROR_LOAD_LIST)}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-4 pt-1">
      <ApplicantSearchToolbar
        searchInput={searchInput}
        statusFilter={statusFilter}
        isScoring={scoreApplicantsMutation.isPending}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        onStatusFilterChange={handleStatusFilterChange}
        onScoreApplicants={handleScoreApplicants}
      />

      {selectedIds.size > 0 ? (
        <BulkActionsBar
          selectedCount={selectedIds.size}
          isUpdating={updateStatusMutation.isPending}
          onBulkStatusChange={handleBulkStatusChange}
          onClearSelection={clearSelections}
          onInviteToInterview={() => setSendInterviewOpen(true)}
        />
      ) : applicants.length > 0 ? (
        <div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100">
              <CalendarClock className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
              Select candidates to invite them to an interview
            </p>
          </div>
        </div>
      ) : null}

      {applicants.length > 0 ? (
        <>
          <ApplicantTable
            applicants={applicants}
            selectedIds={selectedIds}
            pendingStatusIds={pendingStatusIds}
            isFetching={isFetching}
            sortConfig={sortConfig}
            onToggleSelectAll={handleToggleSelectAll}
            onToggleSelect={handleToggleSelect}
            onOpenProfile={handleOpenProfile}
            onStatusChange={handleStatusChange}
            onSort={handleSort}
          />

          <ApplicantPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            fromItem={fromItem}
            toItem={toItem}
            isPending={isFetching}
            onPrevious={() => handlePageChange('prev')}
            onNext={() => handlePageChange('next')}
          />
        </>
      ) : (
        <ApplicantEmptyState isFiltered={isFiltered} onResetFilters={handleResetFilters} />
      )}

      <SendInterviewDialog
        jobId={jobId}
        applicationIds={[...selectedIds]}
        open={sendInterviewOpen}
        onOpenChange={setSendInterviewOpen}
        onSent={clearSelections}
      />
    </div>
  );
}
