import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { UserRole } from "@/types/auth";
import { PortalPageContainer, PortalPageHeader } from "@/components/layout";

export const metadata: Metadata = {
  title: "Notifications | TalentX",
};

export default async function NotificationsPage() {
  const authenticatedSession = await requireAuth([
    UserRole.Talent,
    UserRole.Employer,
  ]);

  if (authenticatedSession.role === UserRole.Talent) {
    redirect("/");
  }

  return (
    <PortalPageContainer>
      <PortalPageHeader
        title="Employer Notifications"
        subtitle="Your candidate alerts and application notifications will appear here."
      />
    </PortalPageContainer>
  );
}
