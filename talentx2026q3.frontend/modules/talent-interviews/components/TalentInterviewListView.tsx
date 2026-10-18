'use client';

import { useMemo, useState } from 'react';
import { CalendarCheck2, CalendarX2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/errors';
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  TALENT_INTERVIEW_FALLBACKS,
} from '../constants/interview.constants';
import { useMyInterviews } from '../hooks/useMyInterviews';
import type { InterviewFilter } from '../types/interview.types';
import {
  formatRelative,
  formatWhen,
  getInterviewWhen,
  isPast,
} from '../utils/interview.utils';
import { InvitationSection } from './InvitationSection';

const tabs: { value: InterviewFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
];

export function TalentInterviewListView() {
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE_NUMBER);
  const [filter, setFilter] = useState<InterviewFilter>('all');
  const [query, setQuery] = useState('');
  const now = useMemo(() => new Date(), []);

  const {
    data: paginatedData,
    isPending,
    isError,
    error,
    isFetching,
    refetch,
  } = useMyInterviews({ page: currentPage, pageSize: DEFAULT_PAGE_SIZE });

  const items = paginatedData?.items ?? [];
  const totalCount = paginatedData?.totalCount ?? 0;
  const totalPages = paginatedData?.totalPages ?? 1;

  const counts: Record<InterviewFilter, number> = useMemo(
    () => ({
      all: items.length,
      pending: items.filter((i) => (i.status || 'Pending') === 'Pending' && !isPast(i, now)).length,
      accepted: items.filter((i) => i.status === 'Accepted').length,
      declined: items.filter((i) => i.status === 'Declined').length,
    }),
    [items, now]
  );

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const visible = items.filter((i) => {
      const statusLower = (i.status || 'Pending').toLowerCase();
      if (filter !== 'all' && statusLower !== filter) return false;
      if (!q) return true;
      return [i.jobTitle, i.companyName, i.instructions ?? ''].some(
        (v) => v && v.toLowerCase().includes(q)
      );
    });

    // The API already returns items in the right order — upcoming soonest-first, then
    // ended/cancelled most-recently-first, then declined (see
    // InterviewInvitationRepository.GetByTalentUserIdPaginatedAsync on the backend). We only
    // partition that order into display groups here, we never re-sort it.
    return {
      needsResponse: visible.filter((i) => (i.status || 'Pending') === 'Pending' && !isPast(i, now)),
      upcoming: visible.filter((i) => i.status === 'Accepted' && !isPast(i, now)),
      past: visible.filter((i) => (i.status === 'Accepted' && isPast(i, now)) || i.status === 'Cancelled'),
      expired: visible.filter((i) => (i.status || 'Pending') === 'Pending' && isPast(i, now)),
      declined: visible.filter((i) => i.status === 'Declined'),
      total: visible.length,
    };
  }, [items, filter, query, now]);

  const nextUp = useMemo(
    () =>
      items
        .filter((i) => i.status === 'Accepted' && !isPast(i, now))
        .sort((a, b) => +new Date(getInterviewWhen(a)) - +new Date(getInterviewWhen(b)))[0],
    [items, now]
  );

  if (isPending) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Loading your interview invitations…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {getErrorMessage(error, TALENT_INTERVIEW_FALLBACKS.ERROR_LOAD_LIST)}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => refetch()} className="cursor-pointer">
          Retry
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">You haven&apos;t received any interview invitations yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Next Up highlight */}
      {nextUp && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 md:max-w-md">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CalendarCheck2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Next up · <span className="font-medium text-emerald-700 dark:text-emerald-400">{formatRelative(getInterviewWhen(nextUp), now)}</span>
            </p>
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {nextUp.jobTitle} at {nextUp.companyName}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{formatWhen(getInterviewWhen(nextUp))}</p>
          </div>
        </div>
      )}

      {/* Toolbar: Filter Tabs + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setFilter(t.value)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                filter === t.value
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold tabular-nums ${
                  t.value === 'pending' && counts.pending > 0
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                }`}
              >
                {counts[t.value]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search role or company"
            aria-label="Search invitations"
            className="bg-white pl-9 dark:bg-slate-900"
          />
        </div>
      </div>

      {/* Lists / Sections */}
      <div className="space-y-8" aria-busy={isFetching}>
        <InvitationSection
          title="Needs your response"
          description="accept or decline before the date"
          items={sections.needsResponse}
          now={now}
          highlight
        />
        <InvitationSection title="Upcoming" items={sections.upcoming} now={now} />
        <InvitationSection
          title="Past"
          description="interviews that already took place or were cancelled"
          items={sections.past}
          now={now}
        />
        <InvitationSection
          title="Expired"
          description="invitations you didn't respond to in time"
          items={sections.expired}
          now={now}
        />
        <InvitationSection
          title="Declined"
          description="invitations you declined"
          items={sections.declined}
          now={now}
        />

        {sections.total === 0 && (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <CalendarX2 className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">No invitations found</h2>
            <p className="mt-1 max-w-xs break-words text-sm text-slate-500 [overflow-wrap:anywhere] dark:text-slate-400">
              {query
                ? `Nothing matches “${query}”. Try a different search.`
                : 'When employers invite you to interview, they’ll show up here.'}
            </p>
            {(query || filter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 cursor-pointer"
                onClick={() => {
                  setQuery('');
                  setFilter('all');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
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
          <span className="text-sm font-medium text-slate-700 font-mono dark:text-slate-300">
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
      )}

      {totalCount > 0 && (
        <p className="text-center text-xs text-slate-400">{totalCount} interview invitation{totalCount > 1 ? 's' : ''}</p>
      )}
    </div>
  );
}
