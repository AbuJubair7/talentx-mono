"use client";

import Link from "next/link";
import { Loader2, RefreshCw, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuditLogs } from "@/modules/admin/audit-log/hooks/use-audit-logs";
import { formatToLocalTime } from "@/modules/admin/audit-log/utils/format-timestamp";
import { useAdminUserDetails } from "../hooks/useAdminUserDetails";
import type { AdminAccountStatus, AdminUserDetails } from "../types/user";

interface UserDetailViewProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestStatusChange: (user: AdminUserDetails, newStatus: AdminAccountStatus) => void;
}

const ACCOUNT_STATUS_STYLES: Record<AdminAccountStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  Deactivated: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};

function DetailField({
  label,
  value,
  breakAll = false,
}: {
  label: string;
  value: string;
  breakAll?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
        {label}
      </p>
      <p
        className={`mt-0.5 text-sm text-zinc-800 dark:text-slate-200 ${
          breakAll ? "break-all" : "break-words [overflow-wrap:anywhere]"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function AdminActivitySection({ email }: { email: string }) {
  const { data, isLoading } = useAuditLogs({ searchQuery: email, pageSize: 5 });
  const items = data?.items ?? [];

  return (
    <div className="border-t border-zinc-100 pt-5 dark:border-slate-800">
      <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-slate-100">
        Recent Activity
      </h3>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`activity-skeleton-${index}`}
              className="h-4 w-full animate-pulse rounded bg-zinc-100 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-slate-400">
          No admin activity recorded for this account.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <span className="text-zinc-700 dark:text-slate-300">{item.action}</span>
              <span
                suppressHydrationWarning
                className="shrink-0 whitespace-nowrap font-mono text-xs text-zinc-500 dark:text-slate-400"
              >
                {formatToLocalTime(item.timestamp)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function UserDetailContent({ user }: { user: AdminUserDetails }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DetailField label="Name" value={user.name} />
        <DetailField label="Email" value={user.email} breakAll />
        <DetailField label="Role" value={user.role} />
        <DetailField label="Email Status" value={user.isVerified ? "Verified" : "Unverified"} />
        <DetailField
          label="Registered Date"
          value={new Date(user.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          })}
        />
      </div>

      {user.talentDetails && (
        <div className="border-t border-zinc-100 pt-5 dark:border-slate-800">
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-slate-100">
            Talent Profile
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailField label="Tagline" value={user.talentDetails.tagline ?? ""} />
            <DetailField label="Location" value={user.talentDetails.location ?? ""} />
            <DetailField label="Phone" value={user.talentDetails.phone ?? ""} />
            <DetailField
              label="Years of Experience"
              value={user.talentDetails.totalYearsExperience?.toString() ?? ""}
            />
          </div>
          {user.talentDetails.shortBio && (
            <div className="mt-4">
              <DetailField label="Bio" value={user.talentDetails.shortBio} />
            </div>
          )}
        </div>
      )}

      {user.employerDetails && (
        <div className="border-t border-zinc-100 pt-5 dark:border-slate-800">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-slate-100">
              Employer Profile
            </h3>
            <Link
              href="/admin/employers"
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline dark:text-emerald-400"
            >
              Review Verification &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailField label="Company Name" value={user.employerDetails.companyName} />
            <DetailField
              label="Employer Verification"
              value={
                user.employerDetails.verificationStatus === "Verified"
                  ? "Verified"
                  : user.employerDetails.verificationStatus === "Rejected"
                    ? "Rejected"
                    : "Pending Verification"
              }
            />
          </div>
        </div>
      )}

      <AdminActivitySection email={user.email} />
    </div>
  );
}

export function UserDetailView({
  userId,
  isOpen,
  onClose,
  onRequestStatusChange,
}: UserDetailViewProps) {
  const { data: user, isPending, isError, error, refetch } = useAdminUserDetails(
    isOpen ? userId ?? undefined : undefined
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col p-0 border-zinc-200 shadow-2xl rounded-2xl bg-white dark:border-slate-800 dark:bg-slate-900">
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-zinc-200/80 bg-zinc-50/80 shrink-0 pr-12 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <UserRound className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold tracking-tight text-zinc-900 dark:text-slate-100">
                Account Details
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-slate-400">
                View account information and status
              </DialogDescription>
            </div>
          </div>

          {user && (
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${ACCOUNT_STATUS_STYLES[user.status]}`}
              >
                {user.status}
              </span>
              {user.role !== "Guest" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={
                    user.status === "Active"
                      ? "cursor-pointer border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-500/30 dark:text-rose-400"
                      : "cursor-pointer border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400"
                  }
                  onClick={() =>
                    onRequestStatusChange(
                      user,
                      user.status === "Active" ? "Deactivated" : "Active"
                    )
                  }
                >
                  {user.status === "Active" ? "Deactivate" : "Activate"}
                </Button>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {isPending && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-zinc-400 dark:text-slate-500">
              <Loader2 className="size-8 animate-spin text-emerald-600" />
              <p className="text-sm font-medium text-zinc-600 dark:text-slate-300">
                Loading account details…
              </p>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                Couldn&apos;t load account details
              </p>
              <p className="max-w-sm text-xs text-zinc-500 dark:text-slate-400">
                {(error as { message?: string })?.message ?? "Please try again."}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RefreshCw className="size-3.5 text-zinc-500" />
                Retry
              </button>
            </div>
          )}

          {user && <UserDetailContent user={user} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
