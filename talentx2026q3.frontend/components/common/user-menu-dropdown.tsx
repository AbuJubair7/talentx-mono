"use client";

import React, { useState, useRef, useEffect, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QueryClientContext } from "@tanstack/react-query";
import { LayoutDashboard, LogOut, PlusCircle, Settings, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { logout } from "@/modules/auth/logout/services/logout.service";
import { clearWizardBackup } from "@/modules/jobposting/utils/wizard-backup";
import { extractInitials } from "@/components/layout/app-sidebar";
import { UserRole } from "@/types/auth";
import type { HeaderUser } from "./types";

export interface UserMenuDropdownProps {
  user: HeaderUser;
  onSignOut?: () => Promise<void> | void;
  className?: string;
  defaultOpen?: boolean;
  align?: "left" | "right";
}

function formatRoleDisplayName(userRole?: string | null): string {
  if (!userRole) {
    return "Talent";
  }
  const normalizedUserRole = userRole.trim().toLowerCase();
  if (normalizedUserRole === "employer") {
    return "Employer";
  }
  if (normalizedUserRole === "talent") {
    return "Talent";
  }
  if (normalizedUserRole === "admin") {
    return "Admin";
  }
  return userRole.charAt(0).toUpperCase() + userRole.slice(1);
}

export function UserMenuDropdown({
  user,
  onSignOut,
  className,
  defaultOpen = false,
  align = "right",
}: UserMenuDropdownProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const queryClient = useContext(QueryClientContext);

  const resolvedDisplayName = user.name?.trim() || user.email || "User";
  const resolvedRole = formatRoleDisplayName(user.role);
  const normalizedRole = user.role?.trim().toLowerCase();
  const isAdmin =
    normalizedRole === "admin" || user.role === UserRole.Admin;
  const isEmployer =
    normalizedRole === "employer" || user.role === UserRole.Employer;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSignOutAction = async (): Promise<void> => {
    setIsOpen(false);
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

  const handleToggleMenu = () => {
    setIsOpen((previousOpenState) => !previousOpenState);
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        ref={triggerRef}
        type="button"
        data-testid="user-menu-trigger"
        aria-label="User account menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={handleToggleMenu}
        className="flex items-center rounded-full p-0.5 transition-opacity hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-900 cursor-pointer"
      >
        <Avatar size="default" className="size-9 shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
          {user.avatarUrl ? (
            <AvatarImage
              src={user.avatarUrl}
              alt={resolvedDisplayName}
            />
          ) : null}
          <AvatarFallback className="font-semibold text-xs bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            {extractInitials(resolvedDisplayName)}
          </AvatarFallback>
        </Avatar>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-trigger"
          className={cn(
            "absolute top-full mt-2 z-50 min-w-56 overflow-hidden rounded-xl border border-slate-200/90 bg-white p-1.5 text-slate-900 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5 duration-100 animate-in fade-in-0 zoom-in-95 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:shadow-slate-950/40",
            align === "left" ? "left-0" : "right-0",
            className
          )}
        >
          <div className="flex flex-col gap-1 px-2.5 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100" title={resolvedDisplayName}>
                {resolvedDisplayName}
              </span>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {resolvedRole}
              </Badge>
            </div>
            {user.email ? (
              <span className="truncate text-xs text-slate-500 dark:text-slate-400" title={user.email}>
                {user.email}
              </span>
            ) : null}
          </div>

          <div className="-mx-1 my-1 h-px bg-slate-100 dark:bg-slate-800" role="separator" />

          {isAdmin ? (
            <Link
              href="/admin/dashboard"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:bg-slate-100 focus-visible:text-slate-900 focus-visible:outline-hidden dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
            >
              <LayoutDashboard className="size-4 text-slate-400 dark:text-slate-500" />
              <span>Dashboard</span>
            </Link>
          ) : isEmployer ? (
            <>
              <Link
                href="/dashboard"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:bg-slate-100 focus-visible:text-slate-900 focus-visible:outline-hidden dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
              >
                <LayoutDashboard className="size-4 text-slate-400 dark:text-slate-500" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/job/jobpost"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:bg-slate-100 focus-visible:text-slate-900 focus-visible:outline-hidden dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
              >
                <PlusCircle className="size-4 text-slate-400 dark:text-slate-500" />
                <span>Post a Job</span>
              </Link>

              <Link
                href="/settings"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:bg-slate-100 focus-visible:text-slate-900 focus-visible:outline-hidden dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
              >
                <Settings className="size-4 text-slate-400 dark:text-slate-500" />
                <span>Settings</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/profile"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:bg-slate-100 focus-visible:text-slate-900 focus-visible:outline-hidden dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
              >
                <UserIcon className="size-4 text-slate-400 dark:text-slate-500" />
                <span>My Profile</span>
              </Link>

              <Link
                href="/dashboard"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:bg-slate-100 focus-visible:text-slate-900 focus-visible:outline-hidden dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
              >
                <LayoutDashboard className="size-4 text-slate-400 dark:text-slate-500" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/settings"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:bg-slate-100 focus-visible:text-slate-900 focus-visible:outline-hidden dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
              >
                <Settings className="size-4 text-slate-400 dark:text-slate-500" />
                <span>Settings</span>
              </Link>
            </>
          )}

          <div className="-mx-1 my-1 h-px bg-slate-100 dark:bg-slate-800" role="separator" />

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOutAction}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:bg-red-50 focus-visible:text-red-700 focus-visible:outline-hidden dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 cursor-pointer"
          >
            <LogOut className="size-4 text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
