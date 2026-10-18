"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLoginForm } from "../hooks/use-login-form";
import { GoogleSignInButton } from "@/components/google-signin-btn";

interface LoginFormProps {
  deactivatedMessage?: string;
  redirectTo?: string;
}

export function LoginForm({ deactivatedMessage, redirectTo }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    form,
    onSubmit,
    serverError,
    isSubmitting,
  } = useLoginForm(redirectTo);

  const displayError = serverError ?? deactivatedMessage;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-8 xl:p-14 min-h-screen lg:h-full lg:min-h-0 lg:overflow-y-auto bg-white">
      {/* -------------------------------------------------- */}
      {/* Mobile Header */}
      {/* -------------------------------------------------- */}

      <div className="lg:hidden flex items-center justify-between pb-4 mb-2 border-b border-slate-100">
        <Link href="/">
          <BrandLogo className="h-8.5 w-auto text-emerald-700" />
        </Link>
      </div>

      {/* -------------------------------------------------- */}
      {/* Login Content */}
      {/* -------------------------------------------------- */}

      <div className="w-full max-w-md mx-auto my-auto py-4">
        {/* Header */}
        <div className="mb-6 space-y-1.5 text-center sm:text-left">
          <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900">
            Welcome back
          </h2>

          <p className="text-xs sm:text-sm text-slate-500">
            Log in to manage your jobs, candidates, and applications.
          </p>
        </div>

        {/* -------------------------------------------------- */}
        {/* Login Form */}
        {/* -------------------------------------------------- */}

        <div className="space-y-4">
          {/* 1. Signup with Google */}
          <div className="flex justify-center w-full">
            <div className="w-full max-w-sm">
              <GoogleSignInButton />
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>

            <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <span className="bg-white px-3">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email & Password */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3.5"
          >
            {/* Email */}
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

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 transition-all shadow-none"
                  {...register("password")}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-xs font-medium text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Server Error */}
            {displayError && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />

                <span>{displayError}</span>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm mt-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </span>
              ) : (
                "Log In"
              )}
            </Button>
          </form>
        </div>

        {/* -------------------------------------------------- */}
        {/* Bottom Navigation */}
        {/* -------------------------------------------------- */}

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs text-slate-500">
          <span>
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-slate-900 hover:text-emerald-700 transition-colors"
            >
              Create an Account
            </Link>
          </span>
        </div>
      </div>

      {/* Desktop bottom spacer */}
      <div className="hidden lg:block h-2" />
    </div>
  );
}