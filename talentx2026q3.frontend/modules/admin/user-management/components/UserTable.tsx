import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminAccountStatus, AdminUserListItem, AdminUserRole } from "../types/user";

interface UserTableProps {
  items: AdminUserListItem[];
  isLoading: boolean;
  onView: (id: string) => void;
  onRequestStatusChange: (user: AdminUserListItem, newStatus: AdminAccountStatus) => void;
}

const ACCOUNT_STATUS_STYLES: Record<AdminAccountStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  Deactivated: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};

// Distinct from ACCOUNT_STATUS_STYLES (emerald/rose) and the amber used app-wide for
// pending/warning states, so the role badge doesn't borrow another badge's meaning.
const ROLE_BADGE_STYLES: Partial<Record<AdminUserRole, { bg: string; dot: string }>> = {
  Talent: {
    bg: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30",
    dot: "bg-sky-500",
  },
  Employer: {
    bg: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/30",
    dot: "bg-teal-500",
  },
};

function formatRegisteredDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function UserTable({ items, isLoading, onView, onRequestStatusChange }: UserTableProps) {
  return (
    <table className="w-full min-w-[760px] text-left text-sm">
      <thead className="sticky top-0 z-10 border-b border-zinc-100 bg-white dark:border-slate-800 dark:bg-slate-900">
        <tr className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
          <th className="px-5 py-3.5 font-semibold">User Details</th>
          <th className="px-5 py-3.5 font-semibold">Role</th>
          <th className="px-5 py-3.5 font-semibold">Account Status</th>
          <th className="px-5 py-3.5 font-semibold">Registered Date</th>
          <th className="px-5 py-3.5 font-semibold text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-50 dark:divide-slate-800/60">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <tr key={`skeleton-${index}`} className="animate-pulse">
              <td className="px-5 py-4">
                <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-slate-800" />
              </td>
              <td className="px-5 py-4">
                <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-slate-800" />
              </td>
              <td className="px-5 py-4">
                <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-slate-800" />
              </td>
              <td className="px-5 py-4">
                <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-slate-800" />
              </td>
              <td className="px-5 py-4">
                <div className="ml-auto h-4 w-12 rounded bg-zinc-200 dark:bg-slate-800" />
              </td>
            </tr>
          ))
        ) : items.length === 0 ? (
          <tr>
            <td colSpan={5} className="h-32 text-center text-sm text-zinc-500 dark:text-slate-400">
              No matching users found.
            </td>
          </tr>
        ) : (
          items.map((user) => (
            <tr
              key={user.id}
              role="button"
              tabIndex={0}
              aria-label={`View details for ${user.name}`}
              onClick={() => onView(user.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onView(user.id);
                }
              }}
              className="cursor-pointer outline-none hover:bg-zinc-50/60 focus-visible:bg-zinc-50/60 dark:hover:bg-slate-800/40 dark:focus-visible:bg-slate-800/40 transition-colors"
            >
              <td className="px-5 py-4 max-w-[240px] min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-slate-800 dark:text-slate-300">
                    {getInitial(user.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-800 dark:text-slate-200" title={user.name}>{user.name}</p>
                    <p className="truncate text-xs text-zinc-500 dark:text-slate-400" title={user.email}>{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                {ROLE_BADGE_STYLES[user.role] && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${ROLE_BADGE_STYLES[user.role]!.bg}`}
                  >
                    <span className={`size-1.5 rounded-full shrink-0 ${ROLE_BADGE_STYLES[user.role]!.dot}`} aria-hidden="true" />
                    {user.role}
                  </span>
                )}
              </td>
              <td className="px-5 py-4">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${ACCOUNT_STATUS_STYLES[user.status]}`}
                >
                  {user.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-zinc-600 dark:text-slate-400">
                {formatRegisteredDate(user.createdAt)}
              </td>
              <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                {user.role === "Guest" ? (
                  <button
                    type="button"
                    disabled
                    title="No account exists yet for this Guest"
                    aria-label={`More actions for ${user.name} (unavailable)`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 dark:text-slate-600 cursor-not-allowed"
                  >
                    <MoreVertical className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 cursor-pointer"
                      aria-label={`More actions for ${user.name}`}
                      aria-haspopup="menu"
                    >
                      <MoreVertical className="h-4 w-4" aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {user.status === "Active" ? (
                        <DropdownMenuItem
                          className="cursor-pointer text-rose-600 focus:text-rose-700"
                          onClick={() => onRequestStatusChange(user, "Deactivated")}
                        >
                          Deactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="cursor-pointer text-emerald-600 focus:text-emerald-700"
                          onClick={() => onRequestStatusChange(user, "Active")}
                        >
                          Activate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
