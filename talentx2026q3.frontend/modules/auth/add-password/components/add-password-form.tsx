"use client";

import { useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PasswordStrengthMeter } from "@/modules/auth/password-strength/components/password-strength-meter";
import { useAddPasswordForm } from "../hooks/use-add-password-form";

export interface AddPasswordFormProps {
  onSuccess?: () => void;
}

export function AddPasswordForm({ onSuccess }: AddPasswordFormProps) {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    form,
    onSubmit,
    serverError,
    isSubmitting,
  } = useAddPasswordForm({ onSuccess });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const newPasswordValue = form.watch("newPassword");

  return (
    <div className="rounded-lg flex flex-col justify-between p-6 sm:p-8 bg-white">
      <div className="w-full max-w-lg mx-auto py-2">
        {/* Header */}
        <div className="mb-4 space-y-1.5 text-center sm:text-left">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mb-1">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900">
            Add a password
          </h2>
          <p className="text-xs text-slate-500">
            Set a password to enable email and password sign in for your account.
          </p>
        </div>

        {/* Top Error Alert if serverError */}
        {serverError && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
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
                className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 transition-all shadow-none"
                {...register("newPassword")}
              />

              <button
                type="button"
                onClick={() => setShowNewPassword((previousState) => !previousState)}
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

          {/* Confirm Password */}
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
                onClick={() => setShowConfirmPassword((previousState) => !previousState)}
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

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-semibold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm mt-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding password...
              </span>
            ) : (
              "Add Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
