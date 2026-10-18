"use server";

import { redirect } from "next/navigation";
import { API_URL } from "@/lib/config";
import { deleteAuthCookies, getAuthCookies } from "../../shared/auth-cookies.service";

export async function logout(): Promise<void> {
  const { refreshToken } = await getAuthCookies();

  if (refreshToken) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
    } catch {
      // Network failure, backend down, etc. — ignored on purpose.
      // Clearing local cookies below still logs the user out of this browser
      // regardless of whether the backend revoke call succeeded.
    }
  }

  await deleteAuthCookies();
  redirect("/login");
}