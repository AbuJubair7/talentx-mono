import React from "react";
import { cn } from "@/lib/utils";

export interface BrandAmbientBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  contentClassName?: string;
}

export function BrandAmbientBackground({
  className,
  children,
  contentClassName,
}: BrandAmbientBackgroundProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-50/50 via-slate-50 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-foreground",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-24 -left-24 size-96 rounded-full bg-blue-100/40 dark:bg-blue-950/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 -right-24 size-96 rounded-full bg-emerald-100/35 dark:bg-emerald-950/20 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-10 -right-10 select-none opacity-[0.035] dark:opacity-[0.02] text-[280px] sm:text-[360px] font-black tracking-tighter text-slate-900 dark:text-white leading-none z-0"
      >
        TX
      </div>

      <div className={cn("relative z-10 min-h-full", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
