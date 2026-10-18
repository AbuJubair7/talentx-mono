"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { AlertCircle, Check, Eye, EyeOff, Info, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useChangePasswordForm } from "../hooks/use-change-password-form";
import { PasswordStrengthMeter } from "../../password-strength/components/password-strength-meter";

interface ChangePasswordFormProps {
  showVerificationInstruction?: boolean;
  onSuccess?: () => void;
}

export function ChangePasswordForm({ showVerificationInstruction, onSuccess }: ChangePasswordFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    form,
    onSubmit,
    serverError,
    isSubmitting,
  } = useChangePasswordForm({ onSuccess });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const newPasswordValue = form.watch("newPassword") || "";

  // Password validation rules (ASP.NET Identity standard)
  const passwordRules = [
    { label: "At least 8 characters", valid: newPasswordValue.length >= 8 },
    { label: "At least one uppercase letter (A-Z)", valid: /[A-Z]/.test(newPasswordValue) },
    { label: "At least one lowercase letter (a-z)", valid: /[a-z]/.test(newPasswordValue) },
    { label: "At least one number (0-9)", valid: /[0-9]/.test(newPasswordValue) },
    { label: "At least one special character (!@#$%^&*)", valid: /[^a-zA-Z0-9]/.test(newPasswordValue) },
  ];

  return (
    <div className="rounded-md flex flex-col justify-between p-4 sm:p-6 lg:p-4 xl:p-8 min-h-screen lg:h-full lg:min-h-0 lg:overflow-y-auto bg-white [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between pb-4 mb-2 border-b border-slate-100">
        <Link href="/">
          <BrandLogo className="h-8.5 w-auto text-emerald-700" />
        </Link>
      </div>

      {/* Main Content Container (Wider layout) */}
      <div className="w-full max-w-xl mx-auto my-auto py-1">
        <div className="mb-4 space-y-1.5 text-center sm:text-left">
          <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900">
            Set a new password
          </h2>
        </div>

        {showVerificationInstruction && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-2">
            <Info className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Check your email</p>
              <p className="mt-1 text-sm text-blue-700">
                Your account has been created. We&apos;ve sent a temporary password to your email
                address. Enter it below as your <span className="font-semibold">current password</span>,
                then set a new one.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="currentPassword"
              className="block text-xs font-semibold text-slate-700"
            >
              Current Password
            </label>

            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full h-11 pl-3.5 pr-10 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 transition-all shadow-none"
                {...register("currentPassword")}
              />

              <button
                type="button"
                onClick={() => setShowCurrentPassword((previous) => !previous)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {errors.currentPassword && (
              <p className="text-xs font-medium text-red-600 mt-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
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
                className="w-full h-11 pl-3.5 pr-10 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 transition-all shadow-none"
                {...register("newPassword")}
              />

              <button
                type="button"
                onClick={() => setShowNewPassword((previous) => !previous)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
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

          {/* Confirm New Password */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold text-slate-700"
            >
              Confirm New Password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••••••"
                autoComplete="new-password"
                className="w-full h-11 pl-3.5 pr-10 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 transition-all shadow-none"
                {...register("confirmPassword")}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((previous) => !previous)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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

          {/* Password Requirements Checklist (Single Column Layout) */}
          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2 space-y-2">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Password Requirements
            </p>
            <ul className="flex flex-col space-y-1.5 text-xs">
              {passwordRules.map((rule) => (
                <li key={rule.label} className="flex items-center gap-1">
                  {rule.valid ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                  )}
                  <span className={rule.valid ? "font-medium text-slate-700" : "text-slate-400"}>
                    {rule.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Server Error */}
          {serverError && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-1.5 text-xs font-medium text-red-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 rounded-lg font-semibold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </span>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}