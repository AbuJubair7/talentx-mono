"use server";

import { redirect } from "next/navigation";
import { type ApiError } from "@/lib/api/axios";
import {
  serverApiClient,
  serverApiClientNoRefresh,
} from "@/lib/api/server-axios";
import { deleteAuthCookies } from "@/modules/auth/shared/auth-cookies.service";
import {
  deleteAccountSchema,
  type DeleteAccountInput,
  type DeleteAccountState,
} from "../types";

export async function sendDeleteAccountOtp(): Promise<DeleteAccountState> {
  try {
    await serverApiClient.post("/auth/delete-account/send-otp");
    return { success: true };
  } catch (error) {
    const apiError = error as ApiError;

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
        "Could not send the verification code. Please try again.",
    };
  }
}

export async function deleteAccount(
  input: DeleteAccountInput
): Promise<DeleteAccountState> {
  const parsed = deleteAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." };
  }

  try {
    await serverApiClientNoRefresh.post("/auth/delete-account", {
      otp: parsed.data.otp,
    });
  } catch (error) {
    const apiError = error as ApiError;

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
        "Account deletion failed. Please try again.",
    };
  }

  await deleteAuthCookies();
  redirect("/goodbye");
}
