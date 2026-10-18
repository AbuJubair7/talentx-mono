import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// What a panel needs: a heading, an optional one-line explanation, optional controls in the header, and its body.
interface DashboardPanelProps {
  // Ties the visible heading to the section, so screen readers announce the panel by name.
  id: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

// The card frame shared by every chart and list on the dashboard (trend, applications, verification, jobs), so they
// all get the same border, spacing and heading style and any later restyling happens in one place.
export function DashboardPanel({ id, title, description, action, className, children }: DashboardPanelProps) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "flex h-full flex-col rounded-2xl border print:break-inside-avoid border-zinc-200/80 bg-white/95 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95",
        className
      )}
    >
      <header className="flex items-start justify-between gap-4 px-5 pt-5">
        <div className="min-w-0">
          <h2 id={id} className="text-[15px] font-semibold text-zinc-900 dark:text-slate-100">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-sm text-zinc-500 dark:text-slate-400">{description}</p>}
        </div>
        {action}
      </header>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">{children}</div>
    </section>
  );
}
