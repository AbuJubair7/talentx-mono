import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthBackground } from "@/components/auth-background";
import { BrandLogo } from "@/components/common/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GoodbyeCooldownCleanup } from "./goodbye-cooldown-cleanup";

export const metadata: Metadata = {
  title: "Account Deleted | TalentX",
};

export default function GoodbyePage() {
  return (
    <AuthBackground className="flex items-center justify-center p-4">
      <GoodbyeCooldownCleanup />
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mb-6 flex justify-center lg:hidden">
          <Link href="/">
            <BrandLogo className="h-8.5 w-auto text-emerald-700" />
          </Link>
        </div>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <MailCheck className="h-7 w-7" />
        </div>

        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">
          Your account has been deleted
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Your TalentX account and all associated data have been permanently
          removed. A confirmation email has been sent to you. If you ever want
          to use TalentX again, you&apos;re welcome to sign up for a new
          account at any time.
        </p>

        <div className="mt-7 space-y-2.5">
          <Link
            href="/signup"
            className={cn(
              buttonVariants(),
              "w-full h-11 rounded-lg font-semibold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white"
            )}
          >
            Create a New Account
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full h-11 rounded-lg font-semibold text-xs sm:text-sm"
            )}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </AuthBackground>
  );
}
