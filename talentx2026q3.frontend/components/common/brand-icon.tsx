import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export interface BrandIconProps extends ComponentPropsWithoutRef<"svg"> {
  className?: string;
}

export function BrandIcon({ className, ...elementProperties }: BrandIconProps) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="TalentX Icon"
      className={cn("text-emerald-700", className)}
      {...elementProperties}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24C0 10.7452 10.7452 0 24 0ZM10.6445 10.2295V12.1433C10.6445 13.2821 10.327 14.1363 9.69198 14.7057C9.0845 15.2751 8.20058 15.5367 7.04086 15.5368H6.68852V20.8475H10.6445V29.7549C10.6445 32.358 11.3903 34.3917 12.8814 35.8559C14.3927 37.1084 15.9136 37.5992 17.0383 37.7678C17.0499 37.7678 17.7039 37.765 17.9823 37.7678C18.5871 37.7738 18.9584 37.7679 18.9652 37.7678H24.1848L28.4988 31.4589L32.8828 37.7678H40.0482L32.134 26.7253L40.1311 15.5368H32.9243L28.4988 21.8595L24.1433 15.5368H20.7925V20.2227C20.7926 23.7954 23.7144 26.6989 27.3358 26.7253C23.5727 26.7517 20.5285 29.7548 20.5017 33.4672C20.4749 29.7548 17.431 26.7517 13.6679 26.7253C17.2893 26.6989 20.2107 23.7954 20.2108 20.2227V15.5368H16.8665V10.2295H10.6445Z"
        fill="currentColor"
      />
    </svg>
  );
}
