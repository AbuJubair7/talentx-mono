import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BrandLogo } from '@/components/common/brand-logo'
import { Loader2 } from 'lucide-react'
import { AuthBrandPanel } from '@/components/auth-brand-panel'
import { OnboardingProfileForm } from '@/modules/auth/signup/components/onboarding-profile-form'

export const metadata: Metadata = {
  title: 'Complete Your Employer Profile — TalentX',
  description: 'Provide your name, organization, and set your account password.',
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* ── LEFT SECTION (50%): Reusable Constant Brand Panel ── */}
      <AuthBrandPanel />

      {/* ── RIGHT SECTION (50%): Onboarding Profile Form ── */}
      <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-8 xl:p-14 min-h-screen lg:h-full lg:min-h-0 lg:overflow-y-auto bg-white">
        {/* Mobile Header with Logo */}
        <div className="lg:hidden flex items-center justify-between pb-4 mb-2 border-b border-slate-100">
          <Link href="/">
            <BrandLogo className="h-8.5 w-auto text-emerald-700" />
          </Link>
          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-900">
            ← Home
          </Link>
        </div>

        {/* Center Container */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          {/* Header */}
          <div className="mb-6 space-y-1.5 text-center sm:text-left">
            <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900">
              Complete your profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Tell us a bit about yourself and your company to finalize setup.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center gap-3 p-12 text-slate-500">
                <Loader2 className="size-8 animate-spin text-slate-900" />
                <p className="text-sm">Loading onboarding form...</p>
              </div>
            }
          >
            <OnboardingProfileForm />
          </Suspense>
        </div>

        {/* Bottom spacer for clean symmetrical alignment */}
        <div className="hidden lg:block h-2" />
      </div>
    </div>
  )
}
