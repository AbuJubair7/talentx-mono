"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useForgotPasswordForm } from "../hooks/use-forgot-password-form";

export function ForgotPasswordForm() {
  const {
    form,
    onSubmit,
    serverError,
    isSubmitting,
    isSuccess,
    isGoogleAccount,
    cooldown,
    isCooldownActive,
  } = useForgotPasswordForm();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

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
            Forgot password
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Enter your work email and we&apos;ll send you instructions to reset your password.
          </p>
        </div>

        <div className="space-y-4">
          {isGoogleAccount && (
            <div
              role="alert"
              className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs sm:text-sm text-blue-900 space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
                <p className="font-semibold text-blue-900">
                  This account is registered with Google. Please sign in with Google.
                </p>
              </div>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full h-10 rounded-xl font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 shadow-xs"
                )}
              >
                Sign in with Google
              </Link>
            </div>
          )}

          {isSuccess && !isGoogleAccount && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs sm:text-sm font-medium text-emerald-800"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              <p>
                If an account exists for this email, we&apos;ve sent instructions to reset your password. The link expires in 15 minutes.
              </p>
            </div>
          )}

          {serverError && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700"
              >
                Work Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 transition-all shadow-none"
                {...register("email")}
              />

              {errors.email && (
                <p className="text-xs font-medium text-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm mt-1"
              disabled={isSubmitting || isCooldownActive}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending instructions...
                </span>
              ) : isCooldownActive ? (
                `Resend instructions in ${cooldown}s`
              ) : (
                "Send reset instructions"
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
