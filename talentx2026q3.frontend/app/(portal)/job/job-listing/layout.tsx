import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employer Dashboard | TalentX",
};

export default function JobListingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
