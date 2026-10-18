import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { AuthBrandPanel } from "@/components/auth-brand-panel";
import { SignupForm } from "@/modules/auth";
import { getAuthCookies } from "@/modules/auth/shared/auth-cookies.service";
import { decodeAccessToken } from "@/lib/auth/jwt";
import { UserRole } from "@/types/auth";

export const metadata: Metadata = {
  title: "Sign Up as an Employer — TalentX",
  description:
    "Create an employer account on TalentX to hire vetted AI and tech talent with $0 platform fees.",
};

export default async function SignupPage() {
  const { accessToken } = await getAuthCookies();
  const session = accessToken ? decodeAccessToken(accessToken) : null;

  if (session) {
    switch (session.role) {
      case UserRole.Admin:
        redirect("/admin/dashboard");
      case UserRole.Guest:
        redirect("/change-password?source=verification");
      case UserRole.Employer:
      case UserRole.Talent:
      default:
        redirect("/dashboard");
    }
  }

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* ── LEFT SECTION (50%): Reusable Constant Brand Panel ── */}
      <AuthBrandPanel />

      {/* ── RIGHT SECTION (50%): Compact Signup Form ── */}
      <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-8 xl:p-14 min-h-screen lg:h-full lg:min-h-0 lg:overflow-y-auto bg-white">
        {/* Mobile Header with Logo */}
        <div className="lg:hidden flex items-center justify-between pb-4 mb-2 border-b border-slate-100">
          <Link href="/">
            <BrandLogo className="h-8.5 w-auto text-emerald-700" />
          </Link>
        </div>

        {/* Center Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          {/* Header */}
          <div className="mb-6 space-y-1.5 text-center sm:text-left">
            <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900">
              Create your employer account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Start posting roles and sourcing verified talent in minutes.
            </p>
          </div>

          {/* Form with Google & Attached Email Box */}
          <SignupForm />

          {/* Bottom Navigation Links */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs text-slate-500">
            <span>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-slate-900 hover:text-emerald-700 transition-colors"
              >
                Log In
              </Link>
            </span>
            <span className="hidden sm:block text-slate-300">·</span>
            <span>
              Looking for a job?{" "}
              <Link
                href="/jobs"
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Discover Roles →
              </Link>
            </span>
          </div>
        </div>

        {/* Bottom spacer for clean symmetrical alignment */}
        <div className="hidden lg:block h-2" />
      </div>
    </div>
  );
}
