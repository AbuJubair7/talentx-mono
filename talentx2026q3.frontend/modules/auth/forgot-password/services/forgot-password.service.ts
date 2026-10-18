"use server";

import { type ApiError } from "@/lib/api/axios";
import { serverApiClient } from "@/lib/api/server-axios";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
  type ForgotPasswordState,
} from "../types";

interface ForgotPasswordBackendResponse {
  success: boolean;
  provider?: string | null;
  message?: string;
}

export async function forgotPassword(
  input: ForgotPasswordInput
): Promise<ForgotPasswordState> {
  const parsedResult = forgotPasswordSchema.safeParse(input);
  if (!parsedResult.success) {
    return {
      success: false,
      error: "Please enter a valid email address.",
    };
  }

  try {
    const apiResponse =
      await serverApiClient.post<ForgotPasswordBackendResponse>(
        "/auth/forgot-password",
        {
          email: parsedResult.data.email,
        }
      );

    return {
      success: apiResponse.data.success,
      provider: apiResponse.data.provider,
      message: apiResponse.data.message,
    };
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
        "Failed to process forgot password request.",
    };
  }
}
