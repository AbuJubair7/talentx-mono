import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/image'
import { Loader2 } from 'lucide-react'
import { AuthBrandPanel } from '@/components/auth-brand-panel'
import { OtpVerifyForm } from '@/modules/auth'

export const metadata: Metadata = {
  title: 'Verify Your Email — TalentX',
  description: 'Enter your 6-digit verification code to complete your TalentX employer registration.',
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* ── LEFT SECTION (50%): Reusable Constant Brand Panel ── */}
      <AuthBrandPanel />

      {/* ── RIGHT SECTION (50%): OTP Verification Form ── */}
      <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-8 xl:p-14 min-h-screen lg:h-full lg:min-h-0 lg:overflow-y-auto bg-white">
        
        {/* Mobile Spacer */}
        <div className="lg:hidden h-2" />

        {/* Center OTP Container */}
        <div className="w-full max-w-md mx-auto my-auto py-6">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center gap-3 p-12 text-slate-500">
                <Loader2 className="size-8 animate-spin text-slate-900" />
                <p className="text-sm">Loading verification screen...</p>
              </div>
            }
          >
            <OtpVerifyForm />
          </Suspense>
        </div>

        {/* Bottom Spacer */}
        <div className="hidden lg:block h-2" />
      </div>
    </div>
  )
}
