import type { ReactNode } from "react";
import { BrandAmbientBackground } from "@/components/brand-ambient-background";

export default function PublicJobsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <BrandAmbientBackground className="flex min-h-screen flex-col">
      {children}
    </BrandAmbientBackground>
  );
}
