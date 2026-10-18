"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortalBreadcrumbs } from "./breadcrumb-context";

export interface PortalTopNavbarProps {
  className?: string;
  children?: React.ReactNode;
}

export function PortalTopNavbar({ className, children }: PortalTopNavbarProps) {
  const { breadcrumbs } = usePortalBreadcrumbs();

  return (
    <header
      role="region"
      aria-label="Portal Navigation"
      className={cn(
        "hidden md:flex sticky top-0 z-20 h-14 w-full shrink-0 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-md",
        className
      )}
    >
      <nav aria-label="Breadcrumb" className="flex items-center min-w-0">
        <ol className="flex items-center flex-wrap gap-2 text-sm">
          {breadcrumbs.map((segment, segmentIndex) => {
            const isLastSegment = segmentIndex === breadcrumbs.length - 1;
            return (
              <li
                key={`${segment}-${segmentIndex}`}
                className="flex items-center gap-2 min-w-0"
              >
                <span
                  className={cn(
                    "truncate select-none",
                    isLastSegment
                      ? "font-semibold text-foreground"
                      : "font-medium text-muted-foreground"
                  )}
                  {...(isLastSegment ? { "aria-current": "page" as const } : {})}
                >
                  {segment}
                </span>
                {!isLastSegment && (
                  <ChevronRight
                    className="size-4 text-muted-foreground/60 shrink-0"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </header>
  );
}
