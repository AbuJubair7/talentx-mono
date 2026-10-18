"use server";

import { cookies } from "next/headers";
import { type ApiError } from "@/lib/api/axios";
import { serverApiClient } from "@/lib/api/server-axios";
import { REFRESH_TOKEN_COOKIE } from "@/modules/auth/shared/cookie-config";
import { addPasswordSchema, type AddPasswordInput, type AddPasswordState } from "../types";

export async function addPassword(input: AddPasswordInput): Promise<AddPasswordState> {
  const parsedResult = addPasswordSchema.safeParse(input);
  if (!parsedResult.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  try {
    const cookieStore = await cookies();
    const currentRefreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    await serverApiClient.post("/auth/add-password", {
      newPassword: parsedResult.data.newPassword,
      confirmPassword: parsedResult.data.confirmPassword,
      currentRefreshToken,
    });

    return { success: true };
  } catch (caughtError) {
    const apiError = caughtError as ApiError;
    if (apiError.status === null) {
      return { success: false, error: "Unable to reach the server. Please try again." };
    }
    return {
      success: false,
      error: apiError.errors?.join(", ") ?? apiError.message ?? "Failed to add password.",
    };
  }
}
