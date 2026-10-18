import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SettingsCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: "default" | "danger";
  children: React.ReactNode;
}

export function SettingsCard({
  icon: Icon,
  title,
  description,
  tone = "default",
  children,
}: SettingsCardProps) {
  const isDanger = tone === "danger";
  const headingId = `settings-card-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "overflow-hidden rounded-xl border shadow-sm",
        isDanger ? "border-destructive/20 bg-destructive/5" : "border-border bg-card"
      )}
    >
      <header
        className={cn(
          "flex items-center gap-3 border-b px-5 py-4",
          isDanger ? "border-destructive/20" : "border-border"
        )}
      >
        <div
          aria-hidden="true"
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            isDanger
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h2
            id={headingId}
            className={cn(
              "text-sm font-semibold",
              isDanger ? "text-destructive" : "text-foreground"
            )}
          >
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </header>

      <div className={cn("divide-y", isDanger ? "divide-destructive/20" : "divide-border")}>
        {children}
      </div>
    </section>
  );
}
