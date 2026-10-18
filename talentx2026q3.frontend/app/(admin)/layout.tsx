import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import type { SidebarUser } from "@/components/layout/types";
import { getSidebarCollapsedCookie } from "@/components/layout/utils/sidebar-cookie";
import { requireAuth } from "@/lib/auth/require-auth";
import { UserRole } from "@/types/auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [session, initialCollapsed] = await Promise.all([
    requireAuth([UserRole.Admin]),
    getSidebarCollapsedCookie(),
  ]);

  const currentUser: SidebarUser = {
    name:
      typeof session.name === "string" && session.name.trim().length > 0
        ? session.name
        : "Super Admin",
    email: session.email || "superadmin@ait.com",
    role: "Admin",
    roleSubtitle: "System Administrator",
  };

  return (
    <AppShell
      role="admin"
      user={currentUser}
      initialCollapsed={initialCollapsed}
    >
      {children}
    </AppShell>
  );
}
