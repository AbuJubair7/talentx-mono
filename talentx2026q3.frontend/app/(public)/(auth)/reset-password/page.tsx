import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthBrandPanel } from "@/components/auth-brand-panel";
import { ResetPasswordForm } from "@/modules/auth/reset-password/components/reset-password-form";
import { validateResetToken } from "@/modules/auth/reset-password/services/reset-password.service";

export const metadata: Metadata = {
  title: "Reset Password — TalentX",
  description: "Set a new password for your TalentX account.",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
    email?: string;
  }>;
};

export default async function ResetPasswordPage(props: ResetPasswordPageProps) {
  const searchParams = await props.searchParams;
  const token = searchParams?.token;
  const email = searchParams?.email;

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Invalid or missing password reset link.
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              The password reset link is invalid or incomplete. Please request a new link to reset your password.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className={cn(
              buttonVariants(),
              "w-full h-11 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-white"
            )}
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  const isTokenValid = await validateResetToken(email, token);

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Password reset link expired or already used
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              This password reset link has already been used or has expired. Please request a new link to reset your password.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className={cn(
              buttonVariants(),
              "w-full h-11 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-white"
            )}
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-white">
      <AuthBrandPanel />
      <ResetPasswordForm email={email} token={token} />
    </div>
  );
}
