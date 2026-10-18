'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react'
import { BrandAmbientBackground } from '@/components/brand-ambient-background'
import { useVerifyEmail } from '@/modules/verify-email/hooks/use-verify-email'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { status, message, userEmail, requiresPasswordChange, countdown } = useVerifyEmail(token)

  if (status === 'loading') {
    return (
      <BrandAmbientBackground className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-emerald-600 mx-auto" />
          <p className="mt-4 text-sm text-slate-500">Checking verification…</p>
        </div>
      </BrandAmbientBackground>
    )
  }

  if (status === 'success') {
    return (
      <BrandAmbientBackground className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-2xl border border-emerald-100 bg-white p-8 sm:p-10 text-center shadow-sm max-w-md w-full">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="size-9 text-emerald-600" />
          </div>
          <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-900">
            Email verified!
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Your email <span className="font-semibold text-slate-700">{userEmail}</span> has been
            verified. Your application is now active.
          </p>
          {requiresPasswordChange ? (
            <>
              <div className="mt-5 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-left">
                <Info className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Check your email</p>
                  <p className="mt-1 text-sm text-blue-700">
                    A temporary password has been sent to{' '}
                    <span className="font-semibold">{userEmail}</span>. You need to set a new
                    password before you can continue — you&apos;ll be redirected automatically.
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400">
                Redirecting you to set your password in {countdown}s…
              </p>
              <Link
                href="/change-password?source=verification"
                className="mt-4 inline-flex items-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-500"
              >
                Set New Password
              </Link>
            </>
          ) : (
            <>
              <p className="mt-4 text-xs text-slate-400">
                Redirecting you to your dashboard in {countdown}s…
              </p>
              <Link
                href="/dashboard"
                className="mt-4 inline-flex items-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-500"
              >
                Go to Dashboard
              </Link>
            </>
          )}
        </div>
      </BrandAmbientBackground>
    )
  }

  return (
    <BrandAmbientBackground className="flex min-h-screen items-center justify-center px-4">
      <div className="rounded-2xl border border-red-100 bg-white p-8 sm:p-10 text-center shadow-sm max-w-md w-full">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="size-9 text-red-600" />
        </div>
        <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-900">
          Verification failed
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/jobs"
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-500"
          >
            Browse Jobs
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Sign In
          </Link>
        </div>
      </div>
    </BrandAmbientBackground>
  )
}

export default function VerifyEmailPage() {
  return (
    <BrandAmbientBackground className="flex min-h-screen items-center justify-center">
      <Suspense
        fallback={
          <div className="text-center">
            <Loader2 className="size-8 animate-spin text-emerald-600 mx-auto" />
            <p className="mt-4 text-sm text-slate-500">Verifying your email…</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </BrandAmbientBackground>
  )
}
