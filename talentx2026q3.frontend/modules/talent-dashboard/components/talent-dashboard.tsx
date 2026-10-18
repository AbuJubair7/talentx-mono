'use client';

import { useEffect, useState } from 'react';
import {
  Bookmark,
  BriefcaseBusiness,
  Mail,
  MessageSquareText,
  Sparkles,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PortalPageContainer } from '@/components/layout';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

import { useTalentApplications } from '../hooks/use-talent-applications';
import { useTalentApplicationCounts } from '../hooks/use-talent-application-counts';
import { useTalentInvitations } from '../hooks/use-talent-invitations';
import { useTalentMatches } from '../hooks/use-talent-matches';
import { useTalentProfile } from '@/modules/talent-profile/hooks/useTalentProfile';
import { useSavedJobs, useRemoveSavedJob } from '@/modules/saved-jobs';
import {
  COMPANY_REVIEW_PAGE_NUMBER,
  COMPANY_REVIEW_PAGE_SIZE,
  TalentReviewsTab,
  useMyCompanyReviews,
} from '@/modules/company-review';
import { useMotivationalQuote } from '../hooks/use-motivational-quote';

import { DashboardPagination } from './dashboard-pagination';
import { DashboardSearchInput } from './dashboard-search-input';
import { ApplicationPieChart } from './application-pie-chart';
import { ApplicationsTable } from './applications-table';
import { InvitationsTable } from './invitations-table';
import { MatchesTable } from './matches-table';
import { SavedJobsTable } from './saved-jobs-table';

import type { ApplicationStatus } from '../types';
import { WeeklyGoalCard } from './weekly-goal-card';

const APPLICATIONS_PAGE_SIZE = 10;
const INVITATIONS_PAGE_SIZE = 10;
const MATCHES_PAGE_SIZE = 10;
const SAVED_JOBS_PAGE_SIZE = 10;
const DEFAULT_WEEKLY_GOAL = 10;

const STATUS_FILTERS: (ApplicationStatus | 'All')[] = [
  'All',
  'Applied',
  'Shortlisted',
  'Interview',
  'Hired',
  'Rejected',
];

type ActiveTab =
  | 'applications'
  | 'invitations'
  | 'matches'
  | 'saved'
  | 'reviews';

// Filters an already-loaded page of rows by company/role substring match.
// Used for the Invitations/Recommended/Saved Jobs tabs, which search only the
// current page rather than round-tripping to the server.
function filterByCompanyOrRole<T>(
  items: T[],
  query: string,
  getSearchableFields: (item: T) => (string | undefined)[]
): T[] {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return items;
  }

  return items.filter((item) =>
    getSearchableFields(item).some((field) =>
      field?.toLowerCase().includes(trimmed)
    )
  );
}

export function TalentDashboard({
  className,
}: {
  className?: string;
}) {
  const [activeTab, setActiveTab] =
    useState<ActiveTab>('applications');

  const [statusFilter, setStatusFilter] =
    useState<ApplicationStatus | 'All'>('All');

  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearch =
    useDebouncedValue(searchQuery, 300);

  // Invitations / Recommended / Saved Jobs search
  const [invitationsSearch, setInvitationsSearch] =
    useState('');

  const debouncedInvitationsSearch =
    useDebouncedValue(invitationsSearch, 300);

  const [matchesSearch, setMatchesSearch] =
    useState('');

  const debouncedMatchesSearch =
    useDebouncedValue(matchesSearch, 300);

  const [savedJobsSearch, setSavedJobsSearch] =
    useState('');

  const debouncedSavedJobsSearch =
    useDebouncedValue(savedJobsSearch, 300);

  // Dynamic greeting based on time of day
  const [greeting, setGreeting] =
    useState('Good morning');

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();

      if (hour < 12) {
        setGreeting('Good morning');
      } else if (hour < 17) {
        setGreeting('Good afternoon');
      } else {
        setGreeting('Good evening');
      }
    };

    // Set the greeting immediately when the component loads.
    updateGreeting();

    // Keep the greeting updated while the dashboard remains open.
    const interval = setInterval(
      updateGreeting,
      60 * 1000
    );

    return () => clearInterval(interval);
  }, []);

  const [applicationsPage, setApplicationsPage] =
    useState(1);

  const [invitationsPage, setInvitationsPage] =
    useState(1);

  const [matchesPage, setMatchesPage] =
    useState(1);

  const [savedJobsPage, setSavedJobsPage] =
    useState(1);

  // Dynamic weekly goal state with localStorage persistence
  const [weeklyGoal, setWeeklyGoal] =
    useState<number>(DEFAULT_WEEKLY_GOAL);

  useEffect(() => {
    try {
      const savedGoal = localStorage.getItem(
        'talentx_weekly_goal'
      );

      if (savedGoal) {
        const parsed = parseInt(savedGoal, 10);

        if (!isNaN(parsed) && parsed > 0) {
          setWeeklyGoal(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  function handleSaveGoal(targetGoal?: number) {
    const nextGoal = targetGoal ?? weeklyGoal;

    if (
      !isNaN(nextGoal) &&
      nextGoal > 0 &&
      nextGoal <= 100
    ) {
      setWeeklyGoal(nextGoal);

      try {
        localStorage.setItem(
          'talentx_weekly_goal',
          String(nextGoal)
        );
      } catch {
        // Ignore localStorage errors
      }
    }
  }

  // Application queries & counts
  const applicationsQuery = useTalentApplications({
    status: statusFilter,
    search: debouncedSearch,
    page: applicationsPage,
    pageSize: APPLICATIONS_PAGE_SIZE,
  });

  // Dedicated query for weekly goal calculation
  // across all application statuses
  const weeklyApplicationsQuery =
    useTalentApplications({
      status: 'All',
      page: 1,
      pageSize: 100,
    });

  const countsQuery =
    useTalentApplicationCounts();

  const invitationsQuery =
    useTalentInvitations({
      page: invitationsPage,
      pageSize: INVITATIONS_PAGE_SIZE,
    });

  const matchesQuery =
    useTalentMatches({
      page: matchesPage,
      pageSize: MATCHES_PAGE_SIZE,
      minScore: 50,
    });

  const savedJobsQuery =
    useSavedJobs({
      page: savedJobsPage,
      pageSize: SAVED_JOBS_PAGE_SIZE,
    });

  const removeSavedJobMutation =
    useRemoveSavedJob();

  // Same params as the first page the Reviews tab requests, so the tab badge and
  // the tab body share one cached query instead of fetching twice.
  const reviewsQuery =
    useMyCompanyReviews({
      page: COMPANY_REVIEW_PAGE_NUMBER,
      pageSize: COMPANY_REVIEW_PAGE_SIZE,
    });

  // Talent name comes live from the database (GET /talents/me),
  // shared via the TanStack Query cache with the profile page.
  const { data: talentProfile } =
    useTalentProfile();

  const talentFirstName =
    talentProfile?.name?.trim().split(/\s+/)[0] ?? '';

  const { quote: motivationalQuote, author: quoteAuthor } =
    useMotivationalQuote();

  const applications =
    applicationsQuery.data?.items ?? [];

  const weeklyApplications =
    weeklyApplicationsQuery.data?.items ?? [];

  const invitations =
    invitationsQuery.data?.items ?? [];

  const matches =
    matchesQuery.data?.items ?? [];

  const savedJobs =
    savedJobsQuery.data?.items ?? [];

  const filteredInvitations =
    filterByCompanyOrRole(
      invitations,
      debouncedInvitationsSearch,
      (inv) => [
        inv.company,
        inv.jobTitle,
      ]
    );

  const filteredMatches =
    filterByCompanyOrRole(
      matches,
      debouncedMatchesSearch,
      (match) => [
        match.company,
        match.jobTitle,
      ]
    );

  const filteredSavedJobs =
    filterByCompanyOrRole(
      savedJobs,
      debouncedSavedJobsSearch,
      (job) => [
        job.companyName,
        job.jobTitle,
      ]
    );

  // Search is a client-side filter over the current page only (the backend
  // has no `search` param yet). While a search is active we hide pagination
  // so page counts can't mislead, and show a result-count note instead.
  const isApplicationsSearching = debouncedSearch.trim().length > 0;
  const isInvitationsSearching =
    debouncedInvitationsSearch.trim().length > 0;
  const isMatchesSearching =
    debouncedMatchesSearch.trim().length > 0;
  const isSavedJobsSearching =
    debouncedSavedJobsSearch.trim().length > 0;

  const applicationTotal =
    applicationsQuery.data?.totalCount ?? 0;

  const invitationTotal =
    invitationsQuery.data?.totalCount ?? 0;

  const matchTotal =
    matchesQuery.data?.totalCount ?? 0;

  const savedJobTotal =
    savedJobsQuery.data?.totalCount ?? 0;

  const reviewTotal =
    reviewsQuery.data?.totalCount ?? 0;

  // True overall counts from backend status queries.
  // On error we surface the failure to the pie chart instead of
  // silently rendering all-zeros (which looks like "no data").
  const counts = countsQuery.data;
  const countsFailed = countsQuery.isError && !countsQuery.data;

  const total = counts?.total ?? applicationTotal;

  // Calculate applications applied this week
  // within the last 7 days.
  const oneWeekAgo = new Date(
    Date.now() -
      7 * 24 * 60 * 60 * 1000
  );

  const appliedThisWeek =
    weeklyApplications.filter((app) => {
      if (!app.appliedDate) {
        return false;
      }

      const date = new Date(app.appliedDate);

      return (
        !isNaN(date.getTime()) &&
        date >= oneWeekAgo
      );
    }).length;

  const currentGoalCount =
    appliedThisWeek;

  function handleStatusFilterChange(
    status: ApplicationStatus | 'All'
  ) {
    setStatusFilter(status);
    setApplicationsPage(1);
  }

  function handleClearSearch() {
    setSearchQuery('');
    setApplicationsPage(1);
  }

  const TABS: {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    count: number;
  }[] = [
    {
      id: 'applications',
      label: 'Applications',
      icon: BriefcaseBusiness,
      count: applicationTotal,
    },
    {
      id: 'invitations',
      label: 'Invitations',
      icon: Mail,
      count: invitationTotal,
    },
    {
      id: 'matches',
      label: 'Recommended',
      icon: Sparkles,
      count: matchTotal,
    },
    {
      id: 'saved',
      label: 'Saved Jobs',
      icon: Bookmark,
      count: savedJobTotal,
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: MessageSquareText,
      count: reviewTotal,
    },
  ];

  return (
    <PortalPageContainer className={cn('space-y-6', className)}>
      {/* Top Section - Two Column Layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">

        {/* Left Panel - Greeting + Weekly Goal */}
        <div className="rounded-md border border-slate-200/90 bg-white p-5 shadow-xs lg:col-span-2">

          {/* Employer Greeting */}
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <Sun
                className="size-5 text-amber-500"
                aria-hidden="true"
              />

              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {greeting}
                {talentFirstName
                  ? `, ${talentFirstName}`
                  : ''}
              </h2>
            </div>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {motivationalQuote}
              {quoteAuthor && (
                <span className="ml-1 text-slate-400">
                  &mdash; {quoteAuthor}
                </span>
              )}
            </p>
          </div>

          {/* Weekly Goal */}
          <WeeklyGoalCard
            currentGoalCount={currentGoalCount}
            weeklyGoal={weeklyGoal}
            onSaveGoal={handleSaveGoal}
          />
        </div>

        {/* Right Panel - Application Stats */}
        <div className="rounded-md border border-slate-200/90 bg-white px-5 py-4 shadow-xs lg:col-span-3">
          <p className="mb-3 text-xs font-medium text-slate-500">
            Applications Overview
          </p>

          <ApplicationPieChart
            total={total}
            isLoading={countsQuery.isLoading}
            isError={countsFailed}
            onRetry={() => countsQuery.refetch()}
            segments={[
              {
                label: 'Interviews',
                value: counts?.interviews ?? 0,
                color: '#d97706',
              },
              {
                label: 'Offers',
                value: counts?.offers ?? 0,
                color: '#15603d',
              },
              {
                label: 'Rejected',
                value: counts?.rejected ?? 0,
                color: '#e11d46',
              },
              {
                label: 'Applied',
                value: counts?.applied ?? 0,
                color: '#0691b2',
              },
            ]}
          />
        </div>
      </div>

      {/* Main Content Card with Tabs and Filter/Search */}
      <div className="w-full min-w-0 overflow-hidden rounded-md border border-slate-200/90 bg-white shadow-xs">

        {/* Tabs */}
        <div className="flex items-center gap-0 overflow-x-auto border-b border-slate-100 px-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id)
                }
                className={cn(
                  'flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium -mb-px transition-colors',
                  isActive
                    ? 'border-emerald-700 text-emerald-700 font-semibold'
                    : 'border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-700'
                )}
              >
                <Icon
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />

                {tab.label}

                <span
                  className={cn(
                    'ml-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Applications Search & Filters */}
        {activeTab === 'applications' && (
          <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <DashboardSearchInput
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
                setApplicationsPage(1);
              }}
              onClear={handleClearSearch}
            />

            <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
              {STATUS_FILTERS.map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      handleStatusFilterChange(
                        status
                      )
                    }
                    className={cn(
                      'cursor-pointer rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors',
                      statusFilter === status
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                    )}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Invitations Search */}
        {activeTab === 'invitations' && (
          <div className="border-b border-slate-100 px-4 py-2.5">
            <DashboardSearchInput
              value={invitationsSearch}
              onChange={(value) => {
                setInvitationsSearch(value);
                setInvitationsPage(1);
              }}
              onClear={() => {
                setInvitationsSearch('');
                setInvitationsPage(1);
              }}
            />
          </div>
        )}

        {/* Matches Search */}
        {activeTab === 'matches' && (
          <div className="border-b border-slate-100 px-4 py-2.5">
            <DashboardSearchInput
              value={matchesSearch}
              onChange={(value) => {
                setMatchesSearch(value);
                setMatchesPage(1);
              }}
              onClear={() => {
                setMatchesSearch('');
                setMatchesPage(1);
              }}
            />
          </div>
        )}

        {/* Saved Jobs Search */}
        {activeTab === 'saved' && (
          <div className="border-b border-slate-100 px-4 py-2.5">
            <DashboardSearchInput
              value={savedJobsSearch}
              onChange={(value) => {
                setSavedJobsSearch(value);
                setSavedJobsPage(1);
              }}
              onClear={() => {
                setSavedJobsSearch('');
                setSavedJobsPage(1);
              }}
            />
          </div>
        )}

        {/* Applications */}
        {activeTab === 'applications' && (
          <>
            <ApplicationsTable
              applications={applications}
              isLoading={
                applicationsQuery.isLoading
              }
              isError={
                applicationsQuery.isError
              }
              onRetry={() =>
                applicationsQuery.refetch()
              }
            />

            {isApplicationsSearching ? (
              <p className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500">
                {applications.length === 1
                  ? '1 result'
                  : `${applications.length} results`}{' '}
                on this page — search filters the current page only.
              </p>
            ) : (
              <DashboardPagination
                page={applicationsPage}
                pageSize={
                  APPLICATIONS_PAGE_SIZE
                }
                totalCount={applicationTotal}
                onPageChange={
                  setApplicationsPage
                }
              />
            )}
          </>
        )}

        {/* Invitations */}
        {activeTab === 'invitations' && (
          <>
            <InvitationsTable
              invitations={
                filteredInvitations
              }
              isLoading={
                invitationsQuery.isLoading
              }
              isError={
                invitationsQuery.isError
              }
              onRetry={() =>
                invitationsQuery.refetch()
              }
            />

            {isInvitationsSearching ? (
              <p className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500">
                {filteredInvitations.length === 1
                  ? '1 result'
                  : `${filteredInvitations.length} results`}{' '}
                on this page — search filters the current page only.
              </p>
            ) : (
              <DashboardPagination
                page={invitationsPage}
                pageSize={
                  INVITATIONS_PAGE_SIZE
                }
                totalCount={invitationTotal}
                onPageChange={
                  setInvitationsPage
                }
              />
            )}
          </>
        )}

        {/* Matches */}
        {activeTab === 'matches' && (
          <>
            <MatchesTable
              matches={filteredMatches}
              isLoading={
                matchesQuery.isLoading
              }
              isError={
                matchesQuery.isError
              }
              onRetry={() =>
                matchesQuery.refetch()
              }
            />

            {isMatchesSearching ? (
              <p className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500">
                {filteredMatches.length === 1
                  ? '1 result'
                  : `${filteredMatches.length} results`}{' '}
                on this page — search filters the current page only.
              </p>
            ) : (
              <DashboardPagination
                page={matchesPage}
                pageSize={
                  MATCHES_PAGE_SIZE
                }
                totalCount={matchTotal}
                onPageChange={
                  setMatchesPage
                }
              />
            )}
          </>
        )}

        {/* Saved Jobs */}
        {activeTab === 'saved' && (
          <>
            <SavedJobsTable
              savedJobs={filteredSavedJobs}
              isLoading={
                savedJobsQuery.isLoading
              }
              isError={
                savedJobsQuery.isError
              }
              onRetry={() =>
                savedJobsQuery.refetch()
              }
              onRemove={(jobId) =>
                removeSavedJobMutation.mutate(
                  jobId
                )
              }
              removingJobId={
                removeSavedJobMutation.isPending
                  ? removeSavedJobMutation.variables
                  : undefined
              }
            />

            {isSavedJobsSearching ? (
              <p className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500">
                {filteredSavedJobs.length === 1
                  ? '1 result'
                  : `${filteredSavedJobs.length} results`}{' '}
                on this page — search filters the current page only.
              </p>
            ) : (
              <DashboardPagination
                page={savedJobsPage}
                pageSize={
                  SAVED_JOBS_PAGE_SIZE
                }
                totalCount={savedJobTotal}
                onPageChange={
                  setSavedJobsPage
                }
              />
            )}
          </>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <TalentReviewsTab />
        )}
      </div>
    </PortalPageContainer>
  );
}