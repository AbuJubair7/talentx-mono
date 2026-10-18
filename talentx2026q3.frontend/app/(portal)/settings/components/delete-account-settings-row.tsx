"use client";

import {
  DeleteAccountDialog,
  type DeleteAccountRole,
} from "@/modules/auth/account-deletion";
import { SettingsRow } from "./settings-row";

export type { DeleteAccountRole };

export interface DeleteAccountSettingsRowProps {
  role: DeleteAccountRole;
}

export function DeleteAccountSettingsRow({ role }: DeleteAccountSettingsRowProps) {
  return (
    <SettingsRow
      title="Delete Account"
      description="Permanently delete your account and all associated data."
      control={<DeleteAccountDialog role={role} />}
    />
  );
}
