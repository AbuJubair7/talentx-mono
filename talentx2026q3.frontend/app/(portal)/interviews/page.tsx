import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import { UserRole } from "@/types/auth";
import { TalentInterviewListView } from "@/modules/talent-interviews";
import { PortalPageContainer, PortalPageHeader } from "@/components/layout";

export const metadata: Metadata = {
  title: "My Interviews | TalentX",
};

export default async function InterviewsPage() {
  await requireAuth([UserRole.Talent]);

  return (
    <PortalPageContainer>
      <PortalPageHeader
        title="My Interviews"
        subtitle="Interview invitations from employers, and your responses."
      />
      <TalentInterviewListView />
    </PortalPageContainer>
  );
}
