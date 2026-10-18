"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/common/brand-logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QueryClientContext } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useTalentProfile } from "@/modules/talent-profile/hooks/useTalentProfile";
import { NotificationBellDropdown } from "@/modules/notifications";
import { DashboardHeaderBackground } from "./dashboard-header-background";
import { UserRole } from "@/types/auth";
import { AppSidebar, extractInitials } from "./app-sidebar";
import {
  PortalBreadcrumbProvider,
  PortalTopNavbar,
} from "./portal-breadcrumb";
import { PORTAL_SIDEBAR_COLLAPSED_STORAGE_KEY } from "./constants/sidebar.constants";
import type { AppShellProps, SidebarUser } from "./types";
import { setSidebarCollapsedCookie } from "./utils/sidebar-cookie-client";

export function AppShell({
  children,
  role = UserRole.Talent,
  customNavItems,
  user,
  className,
  onSignOut,
  initialCollapsed = false,
}: AppShellProps) {
  const currentPathname = usePathname();
  const mainScrollRef = useRef<HTMLElement>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(initialCollapsed);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [lastTrackedPathname, setLastTrackedPathname] =
    useState<string>(currentPathname);

  if (currentPathname !== lastTrackedPathname) {
    setLastTrackedPathname(currentPathname);
    setIsMobileDrawerOpen(false);
  }

  useEffect(() => {
    let isMounted = true;
    try {
      const storedPreference = localStorage.getItem(
        PORTAL_SIDEBAR_COLLAPSED_STORAGE_KEY
      );
      if (storedPreference !== null) {
        const storedCollapsedState = storedPreference === "true";
        setSidebarCollapsedCookie(storedCollapsedState);
        if (storedCollapsedState !== initialCollapsed) {
          queueMicrotask(() => {
            if (isMounted) {
              setIsCollapsed(storedCollapsedState);
            }
          });
        }
      }
    } catch {
      // Ignore localStorage access restrictions
    }
    return () => {
      isMounted = false;
    };
  }, [initialCollapsed]);

  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [currentPathname]);

  useEffect(() => {
    const handleKeyDown = (keyboardEvent: KeyboardEvent): void => {
      if (keyboardEvent.key === "Escape" && isMobileDrawerOpen) {
        setIsMobileDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileDrawerOpen]);

  const handleToggleCollapse = (): void => {
    const nextCollapseState = !isCollapsed;
    setIsCollapsed(nextCollapseState);
    try {
      localStorage.setItem(
        PORTAL_SIDEBAR_COLLAPSED_STORAGE_KEY,
        String(nextCollapseState)
      );
    } catch {
      // Ignore localStorage access restrictions
    }
    setSidebarCollapsedCookie(nextCollapseState);
  };

  const isEmployerRole = role === "employer" || role === UserRole.Employer;
  const isAdminRole = role === "admin" || role === UserRole.Admin;
  const isTalentRole = !isEmployerRole && !isAdminRole;

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

  const resolvedAvatarUrl =
    isTalentRole && talentProfileData?.profilePictureUrl
      ? talentProfileData.profilePictureUrl
      : activeUser.avatarUrl || null;
  const resolvedDisplayName =
    isTalentRole && talentProfileData?.name
      ? talentProfileData.name
      : activeUser.name;

  return (
    <PortalBreadcrumbProvider>
      <div
        className={cn(
          // app-shell-print-expand: grows to the full content height when printing the admin dashboard,
          // otherwise only one screen of the page would print (scoped rule lives in globals.css).
          "h-screen overflow-hidden flex flex-col md:flex-row bg-background text-foreground app-shell-print-expand",
          className
        )}
      >
        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-col shrink-0 h-full z-20 app-shell-print-hide">
          <AppSidebar
            role={role}
            customNavItems={customNavItems}
            user={activeUser}
            isCollapsed={isCollapsed}
            onToggleCollapse={handleToggleCollapse}
            onSignOut={onSignOut}
            layoutIdPrefix="desktop-sidebar"
          />
        </div>

        {/* Mobile Top Navigation Header */}
        <header className="shrink-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md md:hidden app-shell-print-hide">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Menu className="size-5" />
            </button>

            <Link href="/" className="flex items-center gap-2">
              <BrandLogo
                preserveAspectRatio="xMinYMid meet"
                className="h-5.5 w-auto text-emerald-700"
              />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider hidden sm:inline-block">
                {defaultPortalSubtitle}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {(isTalentRole || isAdminRole || isEmployerRole) && <NotificationBellDropdown align="right" />}
            <Avatar size="sm" className="size-8">
              {resolvedAvatarUrl ? (
                <AvatarImage src={resolvedAvatarUrl} alt={resolvedDisplayName} />
              ) : null}
              <AvatarFallback className="font-semibold text-xs bg-muted text-foreground">
                {extractInitials(resolvedDisplayName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Mobile Drawer Overlay and Panel */}
        {isMobileDrawerOpen && (
          <div
            className="fixed inset-0 z-50 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileDrawerOpen(false)}
              aria-hidden="true"
            />

            <div className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-sidebar shadow-2xl border-r border-sidebar-border animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between border-b border-sidebar-border p-4">
                <Link
                  href="/"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex flex-col items-start group min-w-0"
                >
                  <BrandLogo
                    preserveAspectRatio="xMinYMid meet"
                    className="h-5.5 w-auto text-emerald-700"
                  />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">
                    {defaultPortalSubtitle}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  aria-label="Close navigation menu"
                  className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <AppSidebar
                  role={role}
                  customNavItems={customNavItems}
                  user={activeUser}
                  isCollapsed={false}
                  layoutIdPrefix="mobile-sidebar"
                  hideHeader
                  onNavigate={() => setIsMobileDrawerOpen(false)}
                  onSignOut={
                    onSignOut
                      ? async () => {
                          setIsMobileDrawerOpen(false);
                          await onSignOut();
                        }
                      : undefined
                  }
                  className="w-full border-r-0 h-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main
          ref={mainScrollRef}
          className="relative flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden app-shell-print-expand bg-gradient-to-br from-blue-50/50 via-slate-50 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
        >
          <PortalTopNavbar className="app-shell-print-hide">
            {(isTalentRole || isAdminRole || isEmployerRole) && <NotificationBellDropdown align="right" />}
          </PortalTopNavbar>

          <div
            aria-hidden="true"
            className="pointer-events-none fixed -top-24 -left-24 size-96 rounded-full bg-blue-100/40 dark:bg-blue-950/20 blur-3xl app-shell-print-hide"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none fixed bottom-0 -right-24 size-96 rounded-full bg-emerald-100/35 dark:bg-emerald-950/20 blur-3xl app-shell-print-hide"
          />

          <DashboardHeaderBackground className="pointer-events-none fixed inset-x-0 top-0 h-[480px] w-full opacity-60 app-shell-print-hide" />

          <div
            aria-hidden="true"
            className="pointer-events-none fixed -bottom-10 -right-10 select-none app-shell-print-hide opacity-[0.035] dark:opacity-[0.02] text-[280px] sm:text-[360px] font-black tracking-tighter text-slate-900 dark:text-white leading-none z-0"
          >
            TX
          </div>

          <div className="relative z-10 min-h-[calc(100%-3.5rem)]">
            {children}
          </div>
        </main>
      </div>
    </PortalBreadcrumbProvider>
  );
}
