"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PasswordStrengthMeter } from "@/modules/auth/password-strength/components/password-strength-meter";
import { useResetPasswordForm } from "../hooks/use-reset-password-form";

export interface ResetPasswordFormProps {
  email: string;
  token: string;
  onSuccess?: () => void;
}

export function ResetPasswordForm({
  email,
  token,
  onSuccess,
}: ResetPasswordFormProps) {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    form,
    onSubmit,
    serverError,
    isExpiredOrInvalidToken,
    isSubmitting,
    isSuccess,
  } = useResetPasswordForm({ email, token, onSuccess });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  const newPasswordValue = watch("newPassword") ?? "";

  return (
    <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-8 xl:p-14 min-h-screen lg:h-full lg:min-h-0 lg:overflow-y-auto bg-white">
      <div className="lg:hidden flex items-center justify-between pb-4 mb-2 border-b border-slate-100">
        <Link href="/">
          <BrandLogo className="h-8.5 w-auto text-emerald-700" />
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto my-auto py-4">
        <div className="mb-6 space-y-1.5 text-center sm:text-left">
          <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900">
            Set new password
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Create a strong new password for your TalentX account.
          </p>
        </div>

        <div className="space-y-4">
          {isExpiredOrInvalidToken && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-900 space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                <p className="font-semibold text-red-900">
                  This password reset link has expired or has already been used.
                </p>
              </div>
              <Link
                href="/forgot-password"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full h-10 rounded-xl font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 shadow-xs"
                )}
              >
                Request a new link
              </Link>
            </div>
          )}

          {serverError && !isExpiredOrInvalidToken && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{serverError}</span>
            </div>
          )}

          {isSuccess && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs sm:text-sm font-medium text-emerald-800"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              <p>Password reset successfully. Redirecting to login...</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="newPassword"
                className="block text-xs font-semibold text-slate-700"
              >
                New Password
              </label>

              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 transition-all shadow-none"
                  {...register("newPassword")}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword((previousState) => !previousState)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  aria-label={
                    showNewPassword ? "Hide password" : "Show password"
                  }
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {errors.newPassword && (
                <p className="text-xs font-medium text-red-600 mt-1">
                  {errors.newPassword.message}
                </p>
              )}

              <PasswordStrengthMeter password={newPasswordValue} />
            </div>

            <div className="space-y-1.5 text-left">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-slate-700"
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 transition-all shadow-none"
                  {...register("confirmPassword")}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((previousState) => !previousState)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-xs font-medium text-red-600 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm mt-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resetting password...
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center text-xs text-slate-500">
          <Link
            href="/login"
            className="font-semibold text-slate-900 hover:text-emerald-700 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to log in
          </Link>
        </div>
      </div>

      <div className="hidden lg:block h-2" />
    </div>
  );
}
