"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { resetPassword } from "../services/reset-password.service";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
  type ResetPasswordState,
} from "../types";

export interface UseResetPasswordFormOptions {
  email: string;
  token: string;
  onSuccess?: () => void;
}

export function useResetPasswordForm({
  email,
  token,
  onSuccess,
}: UseResetPasswordFormOptions) {
  const router = useRouter();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation<ResetPasswordState, Error, ResetPasswordInput>({
    mutationFn: (formValues: ResetPasswordInput) =>
      resetPassword({
        ...formValues,
        email,
        token,
      }),
    onSuccess: (mutationResult) => {
      if (!mutationResult.success) {
        return;
      }
      toast.success(
        "Password reset successfully. Please log in with your new credentials."
      );
      onSuccess?.();
      router.push("/login");
    },
  });

  function onSubmit(formValues: ResetPasswordInput) {
    mutation.mutate(formValues);
  }

  const serverError =
    mutation.data?.success === false
      ? (mutation.data.error ?? "Failed to reset password.")
      : mutation.error
        ? "Something went wrong. Please try again."
        : null;

  const isExpiredOrInvalidToken =
    serverError !== null &&
    (serverError.toLowerCase().includes("expired") ||
      serverError.toLowerCase().includes("invalid") ||
      serverError.toLowerCase().includes("already been used"));

  return {
    form,
    onSubmit,
    serverError,
    isExpiredOrInvalidToken,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.data?.success === true,
  };
}
