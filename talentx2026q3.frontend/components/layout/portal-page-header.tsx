"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PortalPageHeaderProps } from "./types";

export function PortalPageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
  className,
}: PortalPageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-8 flex flex-col flex-wrap gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="space-y-1.5">
        {eyebrow && <div className="mb-1">{eyebrow}</div>}
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-[28px] dark:text-zinc-100">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex min-w-0 flex-wrap items-center gap-3">{actions}</div>
      )}
    </header>
  );
}