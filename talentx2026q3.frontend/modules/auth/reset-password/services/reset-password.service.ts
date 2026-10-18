"use server";

import { type ApiError } from "@/lib/api/axios";
import { serverApiClient } from "@/lib/api/server-axios";
import {
  resetPasswordSchema,
  type ResetPasswordState,
} from "../types";

export interface ResetPasswordPayload {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export async function resetPassword(
  payload: ResetPasswordPayload
): Promise<ResetPasswordState> {
  const parsedResult = resetPasswordSchema.safeParse({
    newPassword: payload.newPassword,
    confirmPassword: payload.confirmPassword,
  });

  if (!parsedResult.success) {
    return {
      success: false,
      error: "Please check the form and try again.",
    };
  }

  if (!payload.email || !payload.token) {
    return {
      success: false,
      error: "Invalid or missing password reset link.",
    };
  }

  try {
    await serverApiClient.post("/auth/reset-password", {
      email: payload.email,
      token: payload.token,
      newPassword: parsedResult.data.newPassword,
      confirmPassword: parsedResult.data.confirmPassword,
    });

    return { success: true };
  } catch (caughtError) {
    const apiError = caughtError as ApiError;
    if (apiError.status === null) {
      return {
        success: false,
        error: "Unable to reach the server. Please try again.",
      };
    }
    return {
      success: false,
      error:
        apiError.errors?.join(", ") ??
        apiError.message ??
        "Failed to reset password.",
    };
  }
}

export async function validateResetToken(
  email: string,
  token: string
): Promise<boolean> {
  if (!email || !token) {
    return false;
  }

  try {
    const response = await serverApiClient.get<{ isValid: boolean }>(
      "/auth/validate-reset-token",
      {
        params: { email, token },
      }
    );

    return response.data?.isValid === true;
  } catch {
    return false;
  }
}
