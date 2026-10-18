import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { UserRole } from "@/types/auth";
import { TalentProfileView } from "@/modules/talent-profile";
import type { TalentProfileTab } from "@/modules/talent-profile";

export const metadata: Metadata = {
  title: "Profile | TalentX",
};

const TALENT_PROFILE_TABS = ["media-resume", "projects", "overview"] as const;

function resolveTalentTab(value?: string | string[]): TalentProfileTab {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || candidate === "experience-education") {
    return "media-resume";
  }
  return (TALENT_PROFILE_TABS as readonly string[]).includes(candidate)
    ? (candidate as TalentProfileTab)
    : "media-resume";
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const authenticatedSession = await requireAuth([
    UserRole.Talent,
    UserRole.Employer,
  ]);
  const { tab } = await searchParams;

  // Employers don't have a personal profile page — their profile lives under /company.
  if (authenticatedSession.role !== UserRole.Talent) {
    redirect("/company");
  }

  return <TalentProfileView initialTab={resolveTalentTab(tab)} />;
}

