"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PortalPageContainerProps } from "./types";

export function PortalPageContainer({
  children,
  className,
  containerClassName,
}: PortalPageContainerProps) {
  return (
    <div className={cn("relative px-6 py-6 lg:px-8", containerClassName)}>
      <div className={cn("mx-auto w-full", className)}>
        {children}
      </div>
    </div>
  );
}