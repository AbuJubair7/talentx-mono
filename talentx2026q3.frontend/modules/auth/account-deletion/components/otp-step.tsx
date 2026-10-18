"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { DeleteAccountInput } from "../types";

interface OtpStepProps {
  register: UseFormRegister<DeleteAccountInput>;
  errors: FieldErrors<DeleteAccountInput>;
  otpValue: string;
  serverError: string | null;
  isDeleting: boolean;
  isSendingOtp: boolean;
  resendCooldown: number;
  resendSuccess: boolean;
  onResend: () => void;
  onBack: () => void;
  onSubmit: (event?: React.BaseSyntheticEvent) => void;
}

export function OtpStep({
  register,
  errors,
  otpValue,
  serverError,
  isDeleting,
  isSendingOtp,
  resendCooldown,
  resendSuccess,
  onResend,
  onBack,
  onSubmit,
}: OtpStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-xs text-slate-500 leading-relaxed">
        We&apos;ve sent a 6-digit verification code to your email address. Enter
        it below to permanently delete your account.
      </p>

      <div className="space-y-1.5">
        <label
          htmlFor="delete-account-otp"
          className="block text-xs font-semibold text-slate-700"
        >
          Verification Code
        </label>
        <input
          id="delete-account-otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="••••••"
          maxLength={6}
          disabled={isDeleting}
          className="w-full h-11 rounded-lg border border-slate-200 bg-white text-center text-lg font-bold tracking-[0.4em] text-slate-900 placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 transition-all shadow-none"
          {...register("otp")}
        />
        {errors.otp && (
          <p className="text-xs font-medium text-red-600">
            {errors.otp.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Didn&apos;t receive the code?</span>
        <button
          type="button"
          onClick={onResend}
          disabled={resendCooldown > 0 || isSendingOtp || isDeleting}
          className="font-semibold text-slate-900 hover:text-slate-600 transition-colors disabled:text-slate-300 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSendingOtp
            ? "Sending..."
            : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend code"}
        </button>
      </div>

      {resendSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs font-medium text-emerald-800">
          A fresh 6-digit code was sent to your email.
        </div>
      )}

      {serverError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs font-medium text-red-700"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-10 text-xs font-semibold"
          disabled={isDeleting}
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={isDeleting || otpValue.length !== 6}
          className="h-10 rounded-lg bg-red-600 font-semibold text-xs text-white hover:bg-red-700 transition-all shadow-sm disabled:opacity-50"
        >
          {isDeleting ? (
            <span className="flex items-center justify-center gap-1.5">
              <Loader2 className="h-4 w-4 animate-spin" />
              Deleting...
            </span>
          ) : (
            "Delete My Account"
          )}
        </Button>
      </div>
    </form>
  );
}
