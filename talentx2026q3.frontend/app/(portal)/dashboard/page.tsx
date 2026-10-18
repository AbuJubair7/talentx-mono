import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import { UserRole } from "@/types/auth";
import { TalentDashboard } from "@/modules/talent-dashboard/components/talent-dashboard";
import { EmployerDashboardClient } from "@/modules/employer-jobs";

export const metadata: Metadata = {
  title: "Dashboard | TalentX",
};

export default async function DashboardPage() {
  const authenticatedSession = await requireAuth([
    UserRole.Talent,
    UserRole.Employer,
  ]);

  if (authenticatedSession.role === UserRole.Talent) {
    return <TalentDashboard />;
  }

  return (
    <div className="min-h-screen">
      <EmployerDashboardClient
        userName={authenticatedSession.name}
        userEmail={authenticatedSession.email}
      />
    </div>
  );
}
