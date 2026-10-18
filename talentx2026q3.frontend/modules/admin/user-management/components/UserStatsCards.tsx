"use client";

import { Building2, UserX, Users, UsersRound } from "lucide-react";
import { useAdminUserStats } from "../hooks/useAdminUserStats";

interface StatCardConfig {
  key: string;
  label: string;
  value: (stats: ReturnType<typeof useAdminUserStats>["data"]) => number;
  icon: typeof Users;
  iconClassName: string;
}

const STAT_CARDS: StatCardConfig[] = [
  {
    key: "total",
    label: "Total Users",
    value: (stats) => stats?.totalUsers ?? 0,
    icon: Users,
    iconClassName: "bg-zinc-100 text-zinc-600 dark:bg-slate-800 dark:text-slate-300",
  },
  {
    key: "talents",
    label: "Talents",
    value: (stats) => stats?.talentsCount ?? 0,
    icon: UsersRound,
    iconClassName: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    key: "employers",
    label: "Employers",
    value: (stats) => stats?.employersCount ?? 0,
    icon: Building2,
    iconClassName: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  },
  {
    key: "deactivated",
    label: "Deactivated",
    value: (stats) => stats?.deactivatedCount ?? 0,
    icon: UserX,
    iconClassName: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  },
];

export function UserStatsCards() {
  const { data: stats, isLoading } = useAdminUserStats();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STAT_CARDS.map(({ key, label, value, icon: Icon, iconClassName }) => (
        <div
          key={key}
          className="flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white/95 p-4 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95"
        >
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}>
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
              {label}
            </p>
            {isLoading ? (
              <div className="mt-1 h-5 w-10 animate-pulse rounded bg-zinc-200 dark:bg-slate-800" />
            ) : (
              <p className="text-lg font-bold text-zinc-900 dark:text-slate-100">
                {value(stats)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
