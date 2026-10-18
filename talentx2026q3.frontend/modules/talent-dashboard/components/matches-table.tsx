'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { avatarColor, formatEnumString, formatShortDate, getInitials } from '../types/helpers';
import { EmptyRow, ErrorRow, LoadingRow } from './table-states';
import type { TalentMatch } from '../types';

export function MatchesTable({
  matches,
  isLoading,
  isError,
  onRetry,
}: {
  matches: TalentMatch[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}) {
  const router = useRouter();

  return (
    <div className="max-h-[500px] w-full max-w-full overflow-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full min-w-[760px] text-[15px]">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-slate-100 bg-white">
            <th className="bg-white px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Company / Role
            </th>
            <th className="bg-white px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Work Arrangement
            </th>
            <th className="bg-white px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Employment Type
            </th>
            <th className="bg-white px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Match Score
            </th>
            <th className="bg-white px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Application Deadline
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <LoadingRow colSpan={5} />
          ) : isError ? (
            <ErrorRow
              colSpan={5}
              message="Couldn't load your matches. Please try again."
              onRetry={onRetry}
            />
          ) : matches.length === 0 ? (
            <EmptyRow
              colSpan={5}
              message="No matches yet. Complete your profile with more skills to get matched to open roles."
              actionLabel="Complete your profile"
              actionHref="/profile"
            />
          ) : (
            matches.map((match) => (
              <tr
                key={match.jobId}
                onClick={() => router.push(`/jobs/${match.jobId}`)}
                onKeyDown={(e) => e.key === 'Enter' && router.push(`/jobs/${match.jobId}`)}
                tabIndex={0}
                role="link"
                className="group cursor-pointer transition-colors hover:bg-slate-50/50 focus:bg-slate-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-700"
              >
                {/* Company & Role */}
                <td className="px-5 py-2.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-md text-[13px] font-bold text-white',
                        avatarColor(match.company),
                      )}
                      aria-hidden="true"
                    >
                      {getInitials(match.company)}
                    </div>

                    <div className="min-w-0">
                      <p className="max-w-[200px] truncate font-bold text-slate-900">
                        {match.company}
                      </p>

                      <p className="block max-w-[200px] truncate text-[13px] text-slate-500 transition-colors group-hover:text-emerald-700">
                        {match.jobTitle}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Work Arrangement */}
                <td className="whitespace-nowrap px-5 py-2.5 text-[15px] text-slate-600">
                  {match.workArrangement ? (
                    <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[13px] font-medium text-emerald-700">
                      {formatEnumString(match.workArrangement)}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                {/* Employment Type */}
                <td className="whitespace-nowrap px-5 py-2.5 text-[15px] text-slate-600">
                  {match.employmentType ? (
                    <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[13px] font-medium text-slate-600">
                      {formatEnumString(match.employmentType)}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                {/* Match Score */}
                <td className="whitespace-nowrap px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-700"
                        style={{
                          width: `${Math.min(match.matchScore, 100)}%`,
                        }}
                      />
                    </div>

                    <span className="text-[13px] font-bold text-emerald-700">
                      {match.matchScore}%
                    </span>
                  </div>
                </td>

                {/* Application Deadline */}
                <td className="whitespace-nowrap px-5 py-2.5 text-[15px] text-slate-500">
                  {match.expireAt ? formatShortDate(match.expireAt) : <span className="text-slate-400">—</span>}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
