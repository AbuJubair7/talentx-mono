"use client";

import { useState, useRef, useEffect, useContext } from "react";
import { QueryClientContext } from "@tanstack/react-query";
import { Bell, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { useNotificationsRealtime, useUnreadNotificationCount } from "../hooks";
import { formatUnreadCount } from "../utils";
import { NOTIFICATION_SEEN_UNREAD_STORAGE_KEY } from "../constants";

const NotificationDropdownPanel = dynamic(
  () =>
    import("./NotificationDropdownPanel").then(
      (module) => module.NotificationDropdownPanel
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8 text-slate-400">
        <Loader2 className="size-6 animate-spin text-emerald-600" />
        <span className="sr-only">Loading notifications...</span>
      </div>
    ),
  }
);

export interface NotificationBellDropdownProps {
  className?: string;
  defaultOpen?: boolean;
  align?: "left" | "right";
}

export function NotificationBellDropdown({
  className,
  defaultOpen = false,
  align = "right",
}: NotificationBellDropdownProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const queryClient = useContext(QueryClientContext);

  useNotificationsRealtime({ enabled: Boolean(queryClient) });

  const { data: unreadCount } = useUnreadNotificationCount({
    enabled: Boolean(queryClient),
  });

  const numericUnreadCount =
    typeof unreadCount === "number" && !Number.isNaN(unreadCount)
      ? Math.max(0, Math.floor(unreadCount))
      : 0;

  const [seenUnreadCount, setSeenUnreadCount] = useState<number>(() => {
    if (typeof window === "undefined") {
      return defaultOpen ? numericUnreadCount : 0;
    }
    const stored = parseInt(
      localStorage.getItem(NOTIFICATION_SEEN_UNREAD_STORAGE_KEY) ?? "",
      10
    );
    return Number.isFinite(stored) ? stored : defaultOpen ? numericUnreadCount : 0;
  });

  const persistSeenUnreadCount = (count: number) => {
    setSeenUnreadCount(count);
    if (typeof window !== "undefined") {
      localStorage.setItem(NOTIFICATION_SEEN_UNREAD_STORAGE_KEY, String(count));
    }
  };

  if (isOpen && seenUnreadCount !== numericUnreadCount) {
    persistSeenUnreadCount(numericUnreadCount);
  } else if (typeof unreadCount === "number" && numericUnreadCount < seenUnreadCount) {
    persistSeenUnreadCount(numericUnreadCount);
  }

  const formattedUnreadCount =
    typeof unreadCount === "number" ? formatUnreadCount(unreadCount) : "";
  const hasUnreadNotifications = formattedUnreadCount.length > 0;

  const shouldShowBadge =
    !isOpen && hasUnreadNotifications && numericUnreadCount > seenUnreadCount;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleDocumentClick = (mouseEvent: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(mouseEvent.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") {
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

  const handleToggleDropdown = () => {
    setIsOpen((previousIsOpen) => !previousIsOpen);
  };

  return (
    <div
      ref={dropdownRef}
      className={cn("relative inline-block text-left", className)}
    >
      <button
        ref={triggerRef}
        type="button"
        data-testid="notification-bell-trigger"
        aria-label={
          hasUnreadNotifications
            ? `Notifications (${formattedUnreadCount} unread)`
            : "Notifications"
        }
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="notification-dropdown-panel"
        onClick={handleToggleDropdown}
        className="relative flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 cursor-pointer dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <Bell className="size-5" />
        {shouldShowBadge && (
          <span
            data-testid="notification-unread-badge"
            aria-hidden="true"
            className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white ring-2 ring-white dark:ring-slate-950"
          >
            {formattedUnreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id="notification-dropdown-panel"
          data-testid="notification-dropdown-panel"
          role="dialog"
          aria-label="Notifications"
          onWheel={(wheelEvent) => wheelEvent.stopPropagation()}
          className={cn(
            "absolute top-full mt-2 z-50 w-80 sm:w-96 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5 duration-100 animate-in fade-in-0 zoom-in-95 overscroll-contain dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:shadow-slate-950/40",
            align === "left" ? "left-0" : "right-0"
          )}
        >
          <NotificationDropdownPanel />
        </div>
      )}
    </div>
  );
}
