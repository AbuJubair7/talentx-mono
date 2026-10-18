import type { ReactNode } from "react";
import { requireAuth } from "@/lib/auth/require-auth";
import { UserRole } from "@/types/auth";

export default async function EmployerJobManagementLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuth([UserRole.Employer]);
  return <>{children}</>;
}
