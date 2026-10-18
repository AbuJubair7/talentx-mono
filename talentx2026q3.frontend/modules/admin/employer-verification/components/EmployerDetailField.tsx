import type { ReactNode } from "react";

interface EmployerDetailFieldProps {
  label: string;
  value?: string | null;
  children?: ReactNode;
}

export function EmployerDetailField({ label, value, children }: EmployerDetailFieldProps) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
        {label}
      </p>
      {children || (
        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-slate-100">
          {value || "—"}
        </p>
      )}
    </div>
  );
}
