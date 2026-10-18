import { CheckCircle2, Clock, XCircle, type LucideIcon } from "lucide-react";

export interface VerificationStatusBadgeConfig {
  label: string;
  className: string;
  icon: LucideIcon;
}

export const VERIFICATION_STATUS_BADGE_CONFIG: Record<string, VerificationStatusBadgeConfig> = {
  PendingVerification: {
    label: "Pending Verification",
    className:
      "bg-amber-50 text-amber-800 border border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
    icon: Clock,
  },
  Verified: {
    label: "Verified",
    className:
      "bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
    icon: CheckCircle2,
  },
  Rejected: {
    label: "Rejected",
    className:
      "bg-rose-50 text-rose-800 border border-rose-200/80 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
    icon: XCircle,
  },
};

export const DEFAULT_VERIFICATION_STATUS_BADGE_CONFIG: VerificationStatusBadgeConfig = {
  label: "Unknown",
  className: "bg-zinc-100 text-zinc-800 dark:bg-slate-800 dark:text-slate-300",
  icon: Clock,
};

export function getVerificationStatusBadge(status: string): VerificationStatusBadgeConfig {
  const badgeConfig = VERIFICATION_STATUS_BADGE_CONFIG[status];
  if (badgeConfig) {
    return badgeConfig;
  }
  return { ...DEFAULT_VERIFICATION_STATUS_BADGE_CONFIG, label: status };
}
