"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteAccount,
  sendDeleteAccountOtp,
} from "../services/delete-account.service";
import {
  deleteAccountSchema,
  type DeleteAccountInput,
  type DeleteAccountStep,
} from "../types";
import {
  clearStoredCooldown,
  getStoredCooldownSeconds,
  setStoredCooldownSeconds,
  RESEND_COOLDOWN_SECONDS,
} from "../utils/cooldown-storage";

export function useDeleteAccount() {
  const [step, setStep] = useState<DeleteAccountStep>("warning");
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(() => getStoredCooldownSeconds());
  const [resendSuccess, setResendSuccess] = useState(false);
  const otpRequestedRef = useRef(getStoredCooldownSeconds() > 0);

  const form = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      otp: "",
      isConfirmed: false,
    },
  });

  const { mutate: requestOtp, isPending: isSendingOtp } = useMutation({
    mutationFn: sendDeleteAccountOtp,
    onSuccess: (result) => {
      if (!result.success) {
        setServerError(result.error ?? null);
        otpRequestedRef.current = false;
        if (result.error) {
          const match = result.error.match(/wait (\d+) seconds/i);
          if (match && match[1]) {
            const remaining = parseInt(match[1], 10);
            if (!isNaN(remaining) && remaining > 0) {
              setStoredCooldownSeconds(remaining);
              setResendCooldown(remaining);
              otpRequestedRef.current = true;
            }
          }
        }
        return;
      }
      setServerError(null);
      setResendSuccess(true);
      setStoredCooldownSeconds(RESEND_COOLDOWN_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      otpRequestedRef.current = true;
      toast.success("A 6-digit verification code was sent to your email.");
    },
    onError: () => {
      setServerError("Something went wrong. Please try again.");
      otpRequestedRef.current = false;
    },
  });

  const { mutate: submitDelete, isPending: isDeleting } = useMutation({
    mutationFn: deleteAccount,
    onSuccess: (result) => {
      if (!result.success) {
        setServerError(result.error ?? null);
      }
    },
    onError: () => setServerError("Something went wrong. Please try again."),
  });

  const requestOtpIfNeeded = useCallback(() => {
    setResendSuccess(false);
    const remaining = getStoredCooldownSeconds();
    if (remaining > 0) {
      setResendCooldown(remaining);
      otpRequestedRef.current = true;
      return;
    }
    if (otpRequestedRef.current) return;
    otpRequestedRef.current = true;
    requestOtp();
  }, [requestOtp]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      const remaining = getStoredCooldownSeconds();
      setResendCooldown(remaining);
      if (remaining <= 0) {
        clearStoredCooldown();
        otpRequestedRef.current = false;
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const resendOtp = useCallback(() => {
    const remaining = getStoredCooldownSeconds();
    if (remaining > 0 || isSendingOtp) return;
    otpRequestedRef.current = true;
    requestOtp();
  }, [isSendingOtp, requestOtp]);

  const onSubmit = useCallback(
    (values: DeleteAccountInput) => {
      setServerError(null);
      submitDelete(values);
    },
    [submitDelete]
  );

  const reset = useCallback(() => {
    setStep("warning");
    setServerError(null);
    setResendSuccess(false);
    if (getStoredCooldownSeconds() <= 0) {
      otpRequestedRef.current = false;
    }
    form.reset();
  }, [form]);

  return {
    step,
    setStep,
    form,
    onSubmit,
    serverError,
    isSendingOtp,
    resendOtp,
    resendCooldown,
    resendSuccess,
    isDeleting,
    requestOtpIfNeeded,
    reset,
  };
}
