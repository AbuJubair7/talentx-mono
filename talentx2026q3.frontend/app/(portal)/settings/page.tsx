import type { Metadata } from "next";
import { AlertTriangle, Bell, KeyRound } from "lucide-react";

import { serverApiClient } from "@/lib/api/server-axios";
import { requireAuth } from "@/lib/auth/require-auth";
import { UserRole } from "@/types/auth";
import { PortalPageContainer, PortalPageHeader } from "@/components/layout";
import { JobAlertNotificationRow } from "./components/job-alert-notification-row";
import { SecuritySettingsRow } from "./components/security-settings-row";
import { DeleteAccountSettingsRow } from "./components/delete-account-settings-row";
import { SettingsCard } from "./components/settings-card";

export const metadata: Metadata = {
  title: "Settings | TalentX",
};

export default async function SettingsPage() {
  const session = await requireAuth([UserRole.Talent, UserRole.Employer]);

  let hasPassword = true;
  try {
    const userResponse = await serverApiClient.get<{ hasPassword?: boolean }>(
      "/auth/user",
    );
    if (typeof userResponse?.data?.hasPassword === "boolean") {
      hasPassword = userResponse.data.hasPassword;
    }
  } catch {
    hasPassword = true;
  }

  return (
    <PortalPageContainer>
      <PortalPageHeader
        title="Settings"
        subtitle="Manage your account, notifications and security."
      />

      <div className="space-y-5">
        {session.role === UserRole.Talent && (
          <SettingsCard
            icon={Bell}
            title="Notification Preferences"
            description="Choose how TalentX keeps you updated on new opportunities."
          >
            <JobAlertNotificationRow />
          </SettingsCard>
        )}

        <SettingsCard
          icon={KeyRound}
          title="Security"
          description="Keep your account protected with a strong password."
        >
          <SecuritySettingsRow initialHasPassword={hasPassword} />
        </SettingsCard>

        <SettingsCard
          icon={AlertTriangle}
          title="Danger Zone"
          description="Irreversible actions that affect your entire account."
          tone="danger"
        >
          <DeleteAccountSettingsRow
            role={session.role === UserRole.Employer ? "employer" : "talent"}
          />
        </SettingsCard>
      </div>
    </PortalPageContainer>
  );
}
