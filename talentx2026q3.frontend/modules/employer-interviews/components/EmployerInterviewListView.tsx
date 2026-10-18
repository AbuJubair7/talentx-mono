'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/errors';
import {
  ALL_INTERVIEW_STATUS_FILTER,
  ALL_INTERVIEW_TYPE_FILTER,
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  INTERVIEW_FALLBACKS,
} from '../constants/interview.constants';
import { useJobInterviews } from '../hooks/useJobInterviews';
import type { InterviewStatusFilter, InterviewTypeFilter } from '../types/interview.types';
import { EmployerInterviewSearchToolbar } from './EmployerInterviewSearchToolbar';
import { EmployerInterviewTable } from './EmployerInterviewTable';

interface EmployerInterviewListViewProps {
  jobId: string;
}

export function EmployerInterviewListView({ jobId }: EmployerInterviewListViewProps) {
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE_NUMBER);
  const [statusFilter, setStatusFilter] = useState<InterviewStatusFilter>(ALL_INTERVIEW_STATUS_FILTER);
  const [typeFilter, setTypeFilter] = useState<InterviewTypeFilter>(ALL_INTERVIEW_TYPE_FILTER);

  const queryParams = useMemo(() => ({
    status: statusFilter !== ALL_INTERVIEW_STATUS_FILTER ? statusFilter : undefined,
    type: typeFilter !== ALL_INTERVIEW_TYPE_FILTER ? typeFilter : undefined,
    page: currentPage,
    pageSize: DEFAULT_PAGE_SIZE,
  }), [statusFilter, typeFilter, currentPage]);

  const {
    data: paginatedData,
    isPending,
    isError,
    error,
    isFetching,
    refetch,
  } = useJobInterviews(jobId, queryParams);

  const handleStatusFilterChange = (value: InterviewStatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(DEFAULT_PAGE_NUMBER);
  };

  const handleTypeFilterChange = (value: InterviewTypeFilter) => {
    setTypeFilter(value);
    setCurrentPage(DEFAULT_PAGE_NUMBER);
  };

  const interviews = paginatedData?.items ?? [];
  const totalCount = paginatedData?.totalCount ?? 0;
  const totalPages = paginatedData?.totalPages ?? 1;
  const fromItem = totalCount === 0 ? 0 : (currentPage - 1) * DEFAULT_PAGE_SIZE + 1;
  const toItem = Math.min(currentPage * DEFAULT_PAGE_SIZE, totalCount);

  if (isPending) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
        Loading interview invitations…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
        <p className="text-sm text-slate-600">{getErrorMessage(error, INTERVIEW_FALLBACKS.ERROR_LOAD_LIST)}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => refetch()} className="cursor-pointer">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-1">
      <EmployerInterviewSearchToolbar
        totalCount={totalCount}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        onStatusFilterChange={handleStatusFilterChange}
        onTypeFilterChange={handleTypeFilterChange}
      />

      {interviews.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center">
          <p className="text-sm text-slate-500">
            {statusFilter !== ALL_INTERVIEW_STATUS_FILTER || typeFilter !== ALL_INTERVIEW_TYPE_FILTER
              ? 'No interview invitations match the selected filters.'
              : 'No interview invitations sent yet. Select candidates from the Applicants Management tab to invite them.'}
          </p>
        </div>
      ) : (
        <EmployerInterviewTable interviews={interviews} isFetching={isFetching} />
      )}

      {totalCount > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row pt-2 text-sm text-slate-500">
          <p>
            Showing <span className="font-medium text-slate-700">{fromItem}</span>–
            <span className="font-medium text-slate-700">{toItem}</span> of{' '}
            <span className="font-medium text-slate-700">{totalCount}</span> invitations
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isFetching}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, DEFAULT_PAGE_NUMBER))}
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              Previous
            </Button>
            <span className="text-sm font-medium text-slate-700 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isFetching}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
