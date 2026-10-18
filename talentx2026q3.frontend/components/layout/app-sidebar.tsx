"use client";

import React, { useContext, useEffect, useRef, useSyncExternalStore, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { BrandIcon } from "@/components/common/brand-icon";
import { usePathname, useRouter } from "next/navigation";
import { QueryClientContext, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertTriangle,
  BellRing,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  ChevronsUpDown,
  Flag,
  LayoutDashboard,
  LogOut,
  MessageSquareWarning,
  Pencil,
  PlusCircle,
  RefreshCw,
  ScrollText,
  Settings,
  ShieldCheck,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { SidebarToggleIcon } from "./sidebar-toggle-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { logout } from "@/modules/auth/logout/services/logout.service";
import { clearWizardBackup } from "@/modules/jobposting/utils/wizard-backup";
import { useTalentProfile } from "@/modules/talent-profile/hooks/useTalentProfile";
import { useCurrentEmployer } from "@/modules/jobposting/hooks/useCurrentEmployer";
import { meService } from "@/modules/jobposting/services/me.service";
import { UserRole } from "@/types/auth";
import type { AppSidebarProps, SidebarNavItem, SidebarUser } from "./types";

export function extractInitials(fullName?: string | null): string {
  if (!fullName || typeof fullName !== "string") {
    return "TX";
  }
  const cleanName = fullName.trim();
  if (cleanName.length === 0) {
    return "TX";
  }
  const nameSegments = cleanName.split(/\s+/).filter(Boolean);
  if (nameSegments.length === 0) {
    return "TX";
  }
  if (nameSegments.length === 1) {
    return nameSegments[0].slice(0, 2).toUpperCase();
  }
  const firstInitial = nameSegments[0].charAt(0);
  const lastInitial = nameSegments[nameSegments.length - 1].charAt(0);
  return `${firstInitial}${lastInitial}`.toUpperCase();
}

export const TALENT_NAVIGATION_ITEMS: SidebarNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Jobs",
    href: "/jobs",
    icon: Briefcase,
  },
  {
    label: "Job Alerts",
    href: "/job-alerts",
    icon: BellRing,
  },
  {
    label: "Interviews",
    href: "/interviews",
    icon: CalendarClock,
  },
  {
    label: "My Profile",
    href: "/profile",
    icon: User,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export const EMPLOYER_NAVIGATION_ITEMS: SidebarNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Company",
    href: "/company",
    icon: Building2,
  },
  {
    label: "My Jobs",
    href: "/job/job-listing",
    icon: Briefcase,
    matchPatterns: [/^\/job\/[^/]+\/edit(?:\/.*)?$/],
  },
  {
    label: "Post a Job",
    href: "/job/jobpost",
    icon: PlusCircle,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export const ADMIN_NAVIGATION_ITEMS: SidebarNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Employer Verification",
    href: "/admin/employers",
    icon: ShieldCheck,
  },
  {
    label: "Job Moderation",
    href: "/admin/jobs",
    icon: BriefcaseBusiness,
  },
  {
    label: "Company Reviews",
    href: "/admin/reviews",
    icon: MessageSquareWarning,
  },
  {
    label: "Reported Jobs",
    href: "/admin/reported-jobs",
    icon: Flag,
  },
  {
    label: "Audit Log",
    href: "/admin/audit-log",
    icon: ScrollText,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

const emptySubscribe = () => () => {};

export function AppSidebar({
  role = UserRole.Talent,
  customNavItems,
  user,
  isCollapsed = false,
  onToggleCollapse,
  className,
  onSignOut,
  layoutIdPrefix = "sidebar",
  hideHeader = false,
  onNavigate,
}: AppSidebarProps) {
  const currentPathname = usePathname();
  const router = useRouter();

  const isEmployerRole = role === "employer" || role === UserRole.Employer;
  const isAdminRole = role === "admin" || role === UserRole.Admin;
  const isTalentRole = !isEmployerRole && !isAdminRole;

  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isUserMenuOpen) {
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isUserMenuOpen]);

  const hasMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const navigationItems =
    customNavItems && customNavItems.length > 0
      ? customNavItems
      : isAdminRole
      ? ADMIN_NAVIGATION_ITEMS
      : isEmployerRole
      ? EMPLOYER_NAVIGATION_ITEMS
      : TALENT_NAVIGATION_ITEMS;

  const defaultRoleDisplayName = isAdminRole
    ? "Admin"
    : isEmployerRole
    ? "Employer"
    : "Talent";
  const defaultPortalSubtitle = isAdminRole
    ? "Admin Portal"
    : isEmployerRole
    ? "Employer Portal"
    : "Talent Portal";

  const defaultUserProfile: SidebarUser = {
    name: isAdminRole
      ? "Super Admin"
      : isEmployerRole
      ? "Employer User"
      : "Talent User",
    email: isAdminRole
      ? "superadmin@ait.com"
      : isEmployerRole
      ? "employer@portal.local"
      : "talent@portal.local",
    role: defaultRoleDisplayName,
    roleSubtitle: isAdminRole
      ? "System Administrator"
      : isEmployerRole
      ? "Hiring Manager"
      : "Job Seeker",
  };

  const activeUser: SidebarUser = {
    ...defaultUserProfile,
    ...user,
  };

  const queryClient = useContext(QueryClientContext);
  const { data: talentProfileData } = useTalentProfile({
    enabled: isTalentRole && Boolean(queryClient),
  });
  const { data: currentEmployer } = useCurrentEmployer({
    enabled: isEmployerRole && Boolean(queryClient),
  });

  const queryClientMut = useQueryClient();
  const reApplyMutation = useMutation({
    mutationFn: meService.reApply,
    onSuccess: () => {
      toast.success("Re-application submitted");
      queryClientMut.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to re-apply");
    },
  });

  const resolvedAvatarUrl =
    isTalentRole && talentProfileData?.profilePictureUrl
      ? talentProfileData.profilePictureUrl
      : activeUser.avatarUrl || null;
  const resolvedDisplayName =
    isTalentRole && talentProfileData?.name
      ? talentProfileData.name
      : activeUser.name;
  const resolvedRoleSubtitle =
    isTalentRole && talentProfileData?.tagline
      ? talentProfileData.tagline
      : activeUser.roleSubtitle || activeUser.email;

  const isRouteActive = (
    itemOrHref: SidebarNavItem | string,
    exactMatching?: boolean,
    explicitMatchPatterns?: (string | RegExp)[]
  ): boolean => {
    if (!currentPathname) {
      return false;
    }

    const targetHref =
      typeof itemOrHref === "string" ? itemOrHref : itemOrHref.href;
    const isExact =
      typeof itemOrHref === "string"
        ? exactMatching
        : itemOrHref.exact ?? exactMatching;
    const patterns =
      typeof itemOrHref === "string"
        ? explicitMatchPatterns
        : itemOrHref.matchPatterns ?? explicitMatchPatterns;

    if (patterns && patterns.length > 0) {
      const matchesAnyPattern = patterns.some((pattern) => {
        if (pattern instanceof RegExp) {
          return pattern.test(currentPathname);
        }
        return (
          currentPathname === pattern ||
          currentPathname.startsWith(`${pattern}/`)
        );
      });

      if (matchesAnyPattern) {
        return true;
      }
    }

    if (isExact || targetHref === "/") {
      return currentPathname === targetHref;
    }
    return (
      currentPathname === targetHref ||
      currentPathname.startsWith(`${targetHref}/`)
    );
  };

  const handleSignOutAction = async (): Promise<void> => {
    setIsUserMenuOpen(false);
    if (queryClient) {
      queryClient.clear();
    }
    clearWizardBackup();
    if (onSignOut) {
      await onSignOut();
      return;
    }
    try {
      await logout();
    } catch {
      router.push("/login");
    }
  };

  return (
    <aside
      aria-label="Sidebar"
      data-collapsed={isCollapsed}
      onClick={(clickEvent) => {
        if (
          isCollapsed &&
          onToggleCollapse &&
          !(clickEvent.target as HTMLElement).closest('a, button, [role="button"]')
        ) {
          onToggleCollapse();
        }
      }}
      className={cn(
        "group/sidebar flex flex-col justify-between h-full bg-sidebar border-r border-sidebar-border select-none",
        hasMounted
          ? "transition-[width] duration-300 motion-reduce:transition-none"
          : "transition-none motion-reduce:transition-none",
        isCollapsed
          ? "w-20 overflow-visible cursor-pointer"
          : "w-60 overflow-y-auto overflow-x-hidden",
        className
      )}
    >
      <div className="flex flex-col">
        {hideHeader ? null : isCollapsed ? (
          <div className="flex shrink-0 items-center justify-center h-16">
            {onToggleCollapse ? (
              <div className="group/monogram relative flex items-center justify-center">
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  aria-label="Open sidebar"
                  data-testid="sidebar-monogram"
                  className="group/monogram relative flex size-10 items-center justify-center rounded-lg p-1.5 transition-all hover:bg-sidebar-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring cursor-pointer select-none"
                >
                  <BrandIcon
                    className="size-7 object-contain text-emerald-700 group-hover/sidebar:hidden group-focus-visible/sidebar:hidden transition-opacity"
                  />
                  <SidebarToggleIcon className="hidden size-5 text-sidebar-foreground group-hover/sidebar:block group-focus-visible/sidebar:block transition-transform duration-200 scale-x-[-1]" />
                </button>
              </div>
            ) : (
              <div
                data-testid="sidebar-monogram"
                className="flex size-10 items-center justify-center rounded-lg p-1.5 select-none"
              >
                <BrandIcon
                  className="size-7 object-contain text-emerald-700 group-hover/sidebar:hidden transition-opacity"
                />
                <SidebarToggleIcon className="hidden size-5 text-sidebar-foreground group-hover/sidebar:block transition-transform duration-200" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex shrink-0 items-center border-b border-transparent h-16 gap-2 px-4">
            <Link href="/" className="flex items-center min-w-0 flex-1 group">
              <BrandLogo
                className="h-5 min-w-0 object-contain object-left text-emerald-700 transition-transform duration-200 group-hover:scale-[1.02]"
                preserveAspectRatio="xMinYMid meet"
              />
            </Link>
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Close sidebar"
                title="Collapse sidebar"
                className="flex size-8 shrink-0 items-center justify-center rounded-full cursor-pointer transition-colors hover:bg-sidebar-accent text-zinc-600 dark:text-zinc-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              >
                <SidebarToggleIcon className="size-4.5" />
              </button>
            )}
          </div>
        )}

        <div className={cn("flex flex-col pt-4", isCollapsed ? "px-2" : "px-4")}>
          {!hideHeader && !isCollapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {defaultPortalSubtitle}
            </p>
          )}

          <nav
            role="navigation"
            aria-label="Sidebar Navigation"
            className={cn(
              "relative flex flex-col gap-0.5",
              isCollapsed ? "overflow-visible items-center" : "overflow-visible"
            )}
          >
            {navigationItems.map((navigationItem) => {
              const isItemActiveState = isRouteActive(navigationItem);
              const NavigationIcon = navigationItem.icon;

              if (isCollapsed) {
                return (
                  <Link
                    key={navigationItem.href}
                    href={navigationItem.href}
                    onClick={onNavigate}
                    aria-label={navigationItem.label}
                    aria-current={isItemActiveState ? "page" : undefined}
                    className={cn(
                      "group relative flex size-10 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isItemActiveState
                        ? "text-white dark:text-slate-950"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
                    )}
                  >
                    {isItemActiveState && (
                      <motion.div
                        layoutId={`${layoutIdPrefix}-collapsed-indicator`}
                        data-testid="sidebar-active-indicator"
                        className="absolute inset-0 rounded-lg bg-slate-950 shadow-xs dark:bg-white"
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 35,
                        }}
                      />
                    )}
                    <NavigationIcon
                      className={cn(
                        "relative z-10 size-5 shrink-0 transition-colors",
                        isItemActiveState
                          ? "text-emerald-500"
                          : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                      )}
                    />
                    {navigationItem.badge !== undefined && (
                      <span className="relative z-10 absolute top-1 right-1 flex size-2 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
                    )}
                  </Link>
                );
              }

              return (
                <Link
                  key={navigationItem.href}
                  href={navigationItem.href}
                  onClick={onNavigate}
                  aria-current={isItemActiveState ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isItemActiveState
                      ? "text-white font-semibold dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
                  )}
                >
                  {isItemActiveState && (
                    <motion.div
                      layoutId={`${layoutIdPrefix}-indicator`}
                      data-testid="sidebar-active-indicator"
                      className="absolute inset-0 rounded-lg bg-slate-950 shadow-xs dark:bg-white"
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 35,
                      }}
                    />
                  )}
                  <NavigationIcon
                    className={cn(
                      "relative z-10 size-5 shrink-0 transition-colors",
                      isItemActiveState
                        ? "text-emerald-500 shrink-0 transition-colors"
                        : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                    )}
                  />
                  <span className="relative z-10 truncate flex-1">{navigationItem.label}</span>
                  {navigationItem.badge !== undefined && (
                    <Badge
                      variant={isItemActiveState ? "default" : "secondary"}
                      className={cn(
                        "relative z-10 ml-auto text-xs px-2 py-0.5",
                        isItemActiveState
                          ? "bg-emerald-500 text-white font-bold"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      )}
                    >
                      {navigationItem.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {isEmployerRole && !isCollapsed && currentEmployer && currentEmployer.verificationStatus !== 'Verified' && (
          <div className="mt-2 px-4">
            {currentEmployer?.verificationStatus === 'Rejected' ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <div className="flex items-center gap-2 text-red-800">
                  <XCircle className="size-4 shrink-0" />
                  <span className="text-xs font-semibold">Verification Rejected</span>
                </div>
                {currentEmployer.rejectionReason && (
                  <div className="mt-1.5">
                    <p className="text-[11px] text-red-700 line-clamp-2">
                      {currentEmployer.rejectionReason}
                    </p>
                    {currentEmployer.rejectionReason.length > 60 && (
                      <button
                        type="button"
                        onClick={() => setShowRejectionDialog(true)}
                        className="mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-medium text-red-600 hover:text-red-800 transition-colors"
                      >
                        Show Details
                      </button>
                    )}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => reApplyMutation.mutate()}
                    disabled={reApplyMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded bg-red-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className={`size-3 ${reApplyMutation.isPending ? "animate-spin" : ""}`} />
                    {reApplyMutation.isPending ? "Re-applying..." : "Re-apply"}
                  </button>
                  <Link
                    href="/company"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700 hover:text-red-800 transition-colors"
                  >
                    <Pencil className="size-3" /> Edit Profile
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span className="text-xs font-semibold">Pending Verification</span>
                </div>
                <p className="mt-1 text-[11px] text-amber-700">
                  Waiting for admin approval.
                </p>
                <Link
                  href="/company"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 hover:text-amber-800 transition-colors"
                >
                  <Pencil className="size-3" /> Edit Profile
                </Link>
              </div>
            )}
          </div>
        )}

      </div>

      <div className="mt-auto">
        {isCollapsed ? (
          <div
            ref={userMenuRef}
            className="relative border-t border-sidebar-border p-3 flex flex-col items-center gap-3"
          >
            {isUserMenuOpen && (
              <div
                role="menu"
                className="absolute bottom-full mb-2 left-2 z-50 min-w-36 rounded-xl border border-border/80 bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95 duration-100"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSignOutAction}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <LogOut className="size-4 shrink-0" />
                  <span>Sign out</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsUserMenuOpen((previousState) => !previousState)}
              aria-label="User account menu"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
              className="group relative flex items-center justify-center rounded-full cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar size="default" className="size-9 shrink-0">
                {resolvedAvatarUrl ? (
                  <AvatarImage
                    src={resolvedAvatarUrl}
                    alt={resolvedDisplayName}
                  />
                ) : null}
                <AvatarFallback className="font-semibold text-xs bg-muted text-foreground">
                  {extractInitials(resolvedDisplayName)}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        ) : (
          <div
            ref={userMenuRef}
            className="relative border-t border-sidebar-border p-3"
          >
            {isUserMenuOpen && (
              <div
                role="menu"
                className="absolute bottom-full mb-2 left-3 right-3 z-50 rounded-xl border border-border/80 bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95 duration-100"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSignOutAction}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <LogOut className="size-4 shrink-0" />
                  <span>Sign out</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsUserMenuOpen((previousState) => !previousState)}
              aria-label="User account menu"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
              className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent/50 transition-colors text-left cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring select-none"
            >
              <Avatar size="default" className="size-9 shrink-0">
                {resolvedAvatarUrl ? (
                  <AvatarImage
                    src={resolvedAvatarUrl}
                    alt={resolvedDisplayName}
                  />
                ) : null}
                <AvatarFallback className="font-semibold text-xs bg-muted text-foreground">
                  {extractInitials(resolvedDisplayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="truncate text-sm font-semibold text-foreground"
                    title={resolvedDisplayName}
                  >
                    {resolvedDisplayName}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-medium"
                  >
                    {activeUser.role || defaultRoleDisplayName}
                  </Badge>
                </div>
                <span
                  className="truncate text-xs text-muted-foreground"
                  title={resolvedRoleSubtitle}
                >
                  {resolvedRoleSubtitle}
                </span>
              </div>
              <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="size-5 text-red-600" />
              <span>Rejection Details</span>
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800 whitespace-pre-wrap break-words">
              {currentEmployer?.rejectionReason}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Update your profile based on the reason above, then re-apply for verification.
          </p>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
