'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { avatarColor, formatShortDate, getInitials } from '../types/helpers';
import { ApplicationTimeline } from './application-timeline';
import { StatusPill } from './status-pill';
import { EmptyRow, ErrorRow, LoadingRow } from './table-states';
import type { TalentApplication } from '../types';

export function ApplicationsTable({
  applications,
  isLoading,
  isError,
  onRetry,
}: {
  applications: TalentApplication[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleExpanded(applicationId: string) {
    setExpandedId((current) => (current === applicationId ? null : applicationId));
  }

  return (
    <div className="max-h-[500px] w-full max-w-full overflow-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full min-w-[560px] text-[15px]">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-slate-100 bg-white">
            <th className="bg-white px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Company / Role
            </th>
            <th className="bg-white px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Date Applied
            </th>
            <th className="bg-white px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Status
            </th>
            <th className="bg-white px-2 py-2.5 w-10" aria-label="Timeline">
              <span className="sr-only">Timeline</span>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <LoadingRow colSpan={4} />
          ) : isError ? (
            <ErrorRow
              colSpan={4}
              message="Couldn't load your applications. Please try again."
              onRetry={onRetry}
            />
          ) : applications.length === 0 ? (
            <EmptyRow
              colSpan={4}
              message="No applications yet. Browse open roles to get started!"
              actionLabel="Browse jobs"
              actionHref="/jobs"
            />
          ) : (
            applications.flatMap((app) => {
              const isExpanded = expandedId === app.id;
              const rows = [
                <tr
                  key={app.id}
                  onClick={() => router.push(`/jobs/${app.jobId}`)}
                  onKeyDown={(e) => e.key === 'Enter' && router.push(`/jobs/${app.jobId}`)}
                  tabIndex={0}
                  role="link"
                  className="group cursor-pointer transition-colors hover:bg-slate-50/50 focus:bg-slate-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-700"
                >
                <td className="px-5 py-2.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-md text-[13px] font-bold text-white',
                        avatarColor(app.company),
                      )}
                      aria-hidden="true"
                    >
                      {getInitials(app.company)}
                    </div>

                    <div className="min-w-0">
                      <p className="max-w-[200px] truncate font-bold text-slate-900">
                        {app.company}
                      </p>
                      <p
                        className="block max-w-[200px] truncate text-[13px] text-slate-500 transition-colors hover:text-emerald-700"
                      >
                        {app.jobTitle}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="whitespace-nowrap px-5 py-2.5 text-[15px] text-slate-500">
                  {formatShortDate(app.appliedDate)}
                </td>

                <td className="px-5 py-2.5">
                  <StatusPill status={app.status} />
                </td>

                <td className="px-2 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(app.id);
                    }}
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? 'Hide status timeline' : 'Show status timeline'}
                    className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <ChevronDown
                      className={cn('size-4 transition-transform', isExpanded && 'rotate-180')}
                      aria-hidden="true"
                    />
                  </button>
                </td>
              </tr>,
              ];
              if (isExpanded) {
                rows.push(
                  <tr key={`${app.id}-timeline`} className="bg-slate-50/60">
                    <td colSpan={4} className="px-5 py-1 pb-3">
                      <ApplicationTimeline
                        applicationId={app.id}
                        appliedDate={app.appliedDate}
                        currentStatus={app.status}
                      />
                    </td>
                  </tr>
                );
              }
              return rows;
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
