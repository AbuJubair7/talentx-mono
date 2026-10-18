"use server";

import type { ApiError } from "@/lib/api/axios";
import {
  changePasswordSchema,
  type ChangePasswordInput,
  type ChangePasswordState,
} from "../types";
import { serverApiClient } from "@/lib/api/server-axios";

export async function changePassword(
  input: ChangePasswordInput
): Promise<ChangePasswordState> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  try {
    await serverApiClient.post("/auth/change-password", {
      oldPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    });

    return { success: true };
  } catch (error) {    
    const apiError = error as ApiError;

    if (apiError.status === null) {
      return { success: false, error: "Unable to reach the server. Please try again." };
    }

    return {
      success: false,
      error: apiError.errors?.join(", ") ?? apiError.message ?? "Invalid credentials.",
    };
  }
}