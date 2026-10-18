import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import type { LayoutRole, SidebarUser } from "@/components/layout/types";
import { getSidebarCollapsedCookie } from "@/components/layout/utils/sidebar-cookie";
import { requireAuth } from "@/lib/auth/require-auth";
import { PostJobChooser } from "@/modules/jobposting";
import { UserRole } from "@/types/auth";

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [authenticatedSession, initialCollapsed] = await Promise.all([
    requireAuth([UserRole.Employer, UserRole.Talent]),
    getSidebarCollapsedCookie(),
  ]);

  const layoutRole: LayoutRole =
    authenticatedSession.role === UserRole.Employer ? "employer" : "talent";

  const fallbackUserName =
    layoutRole === "employer" ? "Employer User" : "Talent User";

  const resolvedUserName =
    typeof authenticatedSession.name === "string" &&
    authenticatedSession.name.trim().length > 0
      ? authenticatedSession.name
      : fallbackUserName;

  const currentUser: SidebarUser | undefined = authenticatedSession.email
    ? {
        name: resolvedUserName,
        email: authenticatedSession.email,
        role: authenticatedSession.role,
      }
    : undefined;

  return (
    <AppShell
      role={layoutRole}
      user={currentUser}
      initialCollapsed={initialCollapsed}
    >
      {children}
      {layoutRole === "employer" && <PostJobChooser />}
    </AppShell>
  );
}
