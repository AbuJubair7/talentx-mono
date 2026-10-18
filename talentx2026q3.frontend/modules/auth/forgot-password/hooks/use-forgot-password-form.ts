import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../services/forgot-password.service";
import { FORGOT_PASSWORD_COOLDOWN_SECONDS } from "../constants/forgot-password.constants";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
  type ForgotPasswordState,
} from "../types";

export function useForgotPasswordForm() {
  const [cooldown, setCooldown] = useState(0);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation<ForgotPasswordState, Error, ForgotPasswordInput>({
    mutationFn: (formValues: ForgotPasswordInput) => forgotPassword(formValues),
    onSuccess: (data) => {
      if (data?.success === true && data?.provider !== "Google") {
        setCooldown(FORGOT_PASSWORD_COOLDOWN_SECONDS);
      }
    },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((previousSeconds) => previousSeconds - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  function onSubmit(formValues: ForgotPasswordInput) {
    mutation.mutate(formValues);
  }

  const serverError =
    mutation.data?.provider !== "Google" && mutation.data?.success === false
      ? (mutation.data.error ?? mutation.data.message ?? "Something went wrong.")
      : mutation.error
        ? "Something went wrong. Please try again."
        : null;

  return {
    form,
    onSubmit,
    mutation,
    serverError,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.data?.success === true,
    isGoogleAccount: mutation.data?.provider === "Google",
    provider: mutation.data?.provider ?? null,
    cooldown,
    isCooldownActive: cooldown > 0,
  };
}

