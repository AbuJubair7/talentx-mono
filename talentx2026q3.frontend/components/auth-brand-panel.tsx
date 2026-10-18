import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";

export interface AuthBrandPanelProps {
  className?: string;
}

/**
 * Reusable 50% left-side brand panel for all Authentication & Onboarding pages (Signup, Login, OTP, Onboarding).
 * Features light mesh theme, faint "TX" watermark, and glassmorphic feature card.
 */
export function AuthBrandPanel({ className = "" }: AuthBrandPanelProps) {
  return (
    <div
      className={`hidden lg:flex flex-col justify-between p-8 xl:p-14 bg-gradient-to-br from-blue-50/70 via-slate-50 to-indigo-50/40 border-r border-slate-200/80 relative overflow-hidden h-full ${className}`}
    >
      {/* Subtle decorative background blur elements & watermark */}
      <div className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-blue-100/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -right-24 size-96 rounded-full bg-emerald-100/40 blur-3xl" />

      {/* Faint watermark graphic in background */}
      <div className="pointer-events-none absolute -bottom-10 -right-10 select-none opacity-[0.04] text-[300px] font-black tracking-tighter text-slate-900 leading-none">
        TX
      </div>

      {/* Top Header: Logo */}
      <div className="relative z-10 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <BrandLogo className="h-8.5 w-auto text-emerald-700" />
        </Link>
      </div>

      {/* Middle Content: Headline, Description & Glassmorphism Card */}
      <div className="relative z-10 my-auto py-4 space-y-6 max-w-lg">
        {/* Main Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl xl:text-[40px] font-extrabold tracking-tight text-slate-900 leading-[1.16]">
            Reduce hiring effort.
            <br />
            Accelerate hiring decisions.
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            TalentX helps businesses automatically screen CVs, rank candidates
            based on job requirements, and surface the most qualified
            applicants, allowing hiring teams to focus on interviews and
            selecting the right talent.
          </p>
        </div>

        {/* Frosted Glassmorphism Feature Badge Card */}
        <div className="rounded-3xl bg-white/40 backdrop-blur-xl p-5 sm:p-6 border border-white/80 shadow-[0_8px_32px_0_rgba(15,23,42,0.06)] ring-1 ring-white/60 space-y-3.5 relative overflow-hidden">
          {/* Subtle specular glass highlight gradient */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

          <div className="flex items-center gap-2.5 text-emerald-950 font-bold text-sm sm:text-base">
            <div className="size-5 rounded-full border-2 border-emerald-700/80 bg-white/50 backdrop-blur-xs flex items-center justify-center shadow-2xs">
              <div className="size-2 rounded-full bg-emerald-700" />
            </div>
            <span className="tracking-tight">
              Automated CV Screening Analysis
            </span>
          </div>

          {/* Frosted Feature Pills */}
          <div className="flex flex-wrap gap-2 pt-0.5">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md text-slate-800 text-xs font-medium border border-white/90 shadow-2xs hover:bg-white/90 transition-colors">
              <span className="size-1.5 rounded-full bg-emerald-600" />
              AI Job Descriptions
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md text-slate-800 text-xs font-medium border border-white/90 shadow-2xs hover:bg-white/90 transition-colors">
              <span className="size-1.5 rounded-full bg-emerald-600" />
              Candidate Ranking
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md text-slate-800 text-xs font-medium border border-white/90 shadow-2xs hover:bg-white/90 transition-colors">
              <span className="size-1.5 rounded-full bg-emerald-600" />
              CV Screening
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md text-slate-800 text-xs font-medium border border-white/90 shadow-2xs hover:bg-white/90 transition-colors">
              <span className="size-1.5 rounded-full bg-emerald-600" />
              Hiring Pipeline
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md text-slate-800 text-xs font-medium border border-white/90 shadow-2xs hover:bg-white/90 transition-colors">
              <span className="size-1.5 rounded-full bg-emerald-600" />
              Analytics
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Footer / Copyright */}
      <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
        <p>© {new Date().getFullYear()} TalentX Inc.</p>
        <div className="flex gap-4">
          <Link
            href="/privacy"
            className="hover:text-slate-700 transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="hover:text-slate-700 transition-colors"
          >
            Terms
          </Link>
        </div>
      </div>
    </div>
  );
}
