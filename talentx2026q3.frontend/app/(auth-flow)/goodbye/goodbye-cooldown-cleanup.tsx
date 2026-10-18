"use client";

import { useEffect } from "react";
import { clearStoredCooldown } from "@/modules/auth/account-deletion/utils/cooldown-storage";

// The account-deletion flow leaves an OTP resend cooldown in sessionStorage.
// A later user signing up in the same tab must not inherit it, so clear it
// whenever the post-deletion confirmation page is reached.
export function GoodbyeCooldownCleanup() {
  useEffect(() => {
    clearStoredCooldown();
  }, []);

  return null;
}
