"use client";

import { useState } from "react";
import { ChangePasswordDialog } from "@/modules/auth/change-password/components/change-password-dialog";
import { AddPasswordDialog } from "@/modules/auth/add-password/components/add-password-dialog";
import { SettingsRow } from "./settings-row";

export interface SecuritySettingsRowProps {
  initialHasPassword?: boolean;
}

export function SecuritySettingsRow({ initialHasPassword = true }: SecuritySettingsRowProps) {
  const [hasPassword, setHasPassword] = useState(initialHasPassword);

  return (
    <SettingsRow
      title="Password"
      description={
        hasPassword
          ? "Change the password used to sign in."
          : "Add a password to enable email and password sign in."
      }
      control={
        hasPassword ? (
          <ChangePasswordDialog />
        ) : (
          <AddPasswordDialog onPasswordAdded={() => setHasPassword(true)} />
        )
      }
    />
  );
}
