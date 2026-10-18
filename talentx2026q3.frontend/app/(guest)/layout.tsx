import type { ReactNode } from "react";
import { requireAuth } from "@/lib/auth/require-auth";
import { UserRole } from "@/types/auth";

export default async function GuestLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuth([UserRole.Guest]);
  return <>{children}</>;
}