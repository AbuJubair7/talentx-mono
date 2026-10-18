'use client';

import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { avatarColor, formatEnumString, formatShortDate, getInitials } from '../types/helpers';
import { EmptyRow, ErrorRow, LoadingRow } from './table-states';
import type { TalentInvitation } from '../types';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';

export function InvitationsTable({
  invitations,
  isLoading,
  isError,
  onRetry,
}: {
  invitations: TalentInvitation[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}) {
  const router = useRouter();
  const SHOW_MESSAGE_COLUMN = false;

  return (
    <div className="max-h-[500px] w-full max-w-full overflow-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full min-w-[860px] text-[15px]">
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
              Invited
            </th>
            <th className="bg-white px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Expires
            </th>
            {SHOW_MESSAGE_COLUMN && (
              <th className="bg-white px-5 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Message
              </th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <LoadingRow colSpan={SHOW_MESSAGE_COLUMN ? 6 : 5} />
          ) : isError ? (
            <ErrorRow
              colSpan={SHOW_MESSAGE_COLUMN ? 6 : 5}
              message="Couldn't load your invitations. Please try again."
              onRetry={onRetry}
            />
          ) : invitations.length === 0 ? (
            <EmptyRow
              colSpan={SHOW_MESSAGE_COLUMN ? 6 : 5}
              message="No invitations yet. Employers will reach out when your profile matches a role."
              actionLabel="Complete your profile"
              actionHref="/profile"
            />
          ) : (
            invitations.map((inv) => (
              <tr
                key={inv.id}
                onClick={() => router.push(`/jobs/${inv.jobId}`)}
                onKeyDown={(e) => e.key === 'Enter' && router.push(`/jobs/${inv.jobId}`)}
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
                        avatarColor(inv.company),
                      )}
                      aria-hidden="true"
                    >
                      {getInitials(inv.company)}
                    </div>

                    <div className="min-w-0">
                      <p className="max-w-[200px] truncate font-bold text-slate-900">
                        {inv.company}
                      </p>

                      <p className="block max-w-[200px] truncate text-[13px] text-slate-500 transition-colors group-hover:text-emerald-700">
                        {inv.jobTitle}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Work Arrangement */}
                <td className="whitespace-nowrap px-5 py-2.5 text-[15px] text-slate-600">
                  {inv.workArrangement ? (
                    <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[13px] font-medium text-emerald-700">
                      {formatEnumString(inv.workArrangement)}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                {/* Employment Type */}
                <td className="whitespace-nowrap px-5 py-2.5 text-[15px] text-slate-600">
                  {inv.employmentType ? (
                    <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[13px] font-medium text-slate-600">
                      {formatEnumString(inv.employmentType)}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                {/* Date Invited */}
                <td className="whitespace-nowrap px-5 py-2.5 text-[15px] text-slate-500">
                  {formatShortDate(inv.invitedDate)}
                </td>

                {/* Expiration Date */}
                <td className="whitespace-nowrap px-5 py-2.5 text-[15px] text-slate-500">
                  {formatShortDate(inv.expiresAt)}
                </td>

                {/* Message Dialog */}
                {SHOW_MESSAGE_COLUMN && (
                  <td className="whitespace-nowrap px-5 py-2.5 text-center text-[15px]">
                    <Dialog>
                      <DialogTrigger
                        type="button"
                        title={inv.message ? 'View Message' : 'No Message Attached'}
                        className="inline-flex size-8 items-center justify-center rounded-md transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <Mail
                          className={cn(
                            'size-5 transition-colors',
                            inv.message ? 'text-emerald-700' : 'text-slate-300'
                          )}
                        />
                        <span className="sr-only">View Message</span>
                      </DialogTrigger>

                      <DialogContent
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="sm:max-w-[425px]"
                      >
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            Invitation from {inv.company}
                          </DialogTitle>
                          <DialogDescription>
                            Role:{' '}
                            <span className="font-medium text-slate-700">{inv.jobTitle}</span>
                          </DialogDescription>
                        </DialogHeader>

                        <div className="mt-2 space-y-4">
                          {inv.message ? (
                            <div className="rounded-md bg-slate-50 p-3 text-sm whitespace-pre-wrap text-slate-700">
                              {inv.message}
                            </div>
                          ) : (
                            <div className="rounded-md bg-slate-50 p-4 text-center text-sm italic text-slate-400">
                              No custom message was attached to this invitation.
                            </div>
                          )}

                          <div className="flex justify-between text-xs text-slate-400">
                            <span>Sent: {formatShortDate(inv.invitedDate)}</span>
                            <span>Expires: {formatShortDate(inv.expiresAt)}</span>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
