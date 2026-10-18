'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Loader2, Mail, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleSignInButton } from '@/components/google-signin-btn'
import { useSendOtp } from '../hooks/use-verify-otp'

const emailOnlySchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your work email')
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
})

type EmailOnlyFormValues = z.infer<typeof emailOnlySchema>

export function SignupForm() {
  const router = useRouter()
  const { mutate: sendOtp, isPending: isSendingOtp } = useSendOtp()
  const [apiError, setApiError] = useState<string | null>(null)
  const [isExistingAccount, setIsExistingAccount] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<EmailOnlyFormValues>({
    resolver: zodResolver(emailOnlySchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = (data: EmailOnlyFormValues) => {
    setApiError(null)
    setIsExistingAccount(false)

    // Send OTP to email and navigate to OTP verification step
    sendOtp(
      { email: data.email },
      {
        onSuccess: () => {
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
        },
        onError: (err: Error) => {
          const msg = err.message || ''
          const isConflict =
            msg.toLowerCase().includes('already registered') ||
            msg.toLowerCase().includes('already verified') ||
            msg.toLowerCase().includes('conflict') ||
            msg.toLowerCase().includes('sign in')

          if (isConflict) {
            setIsExistingAccount(true)
            setApiError('This email is already registered and verified.')
          } else {
            setApiError(msg || 'Failed to send verification code. Please try again.')
          }
        },
      }
    )
  }

  return (
    <div className="space-y-4">
      {/* 1. Signup with Google */}
      <div className="flex justify-center w-full">
        <div className="w-full max-w-sm">
          <GoogleSignInButton />
        </div>
      </div>

      {/* ─── OR CONTINUE WITH EMAIL ─── */}
      <div className="flex items-center justify-center gap-2.5 py-1">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          OR CONTINUE WITH EMAIL
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Server / API Error Alert */}
      {apiError && (
        <div
          role="alert"
          className={`flex items-start gap-2.5 p-3 text-xs rounded-xl border transition-all ${
            isExistingAccount
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          <AlertCircle className={`size-4 shrink-0 mt-0.5 ${isExistingAccount ? 'text-amber-600' : 'text-red-500'}`} />
          <div className="leading-snug text-left">
            <span className="font-medium">{apiError}</span>
            {isExistingAccount && (
              <div className="mt-1">
                <Link
                  href={`/login?email=${encodeURIComponent(getValues('email'))}`}
                  className="font-semibold underline text-amber-950 hover:text-amber-800 transition-colors inline-flex items-center gap-1"
                >
                  Log in to your account <ArrowRight className="size-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Email Box with Seamless Integrated Full-Height Arrow Box */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <div className="space-y-1.5 text-left">
          <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
            Work Email
          </Label>
          
          {/* Seamless Integrated Container */}
          <div
            className={`flex items-stretch h-11.5 w-full rounded-xl bg-slate-50/80 border transition-all overflow-hidden ${
              errors.email
                ? 'border-red-500 ring-1 ring-red-500'
                : 'border-slate-200 focus-within:bg-white focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10'
            }`}
          >
            {/* Left Mail Icon */}
            <div className="flex items-center pl-3.5 pr-1.5 text-slate-400 shrink-0 pointer-events-none">
              <Mail className="size-4" />
            </div>

            {/* Native Text Input */}
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              autoComplete="email"
              disabled={isSendingOtp}
              className="flex-1 min-w-0 h-full bg-transparent px-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
              {...register('email')}
            />

            {/* Seamless Attached Full-Height Right Box Button */}
            <button
              type="submit"
              disabled={isSendingOtp}
              aria-label="Submit work email"
              className="h-full px-4 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center shrink-0 active:bg-slate-950 cursor-pointer border-l border-slate-200"
            >
              {isSendingOtp ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
            </button>
          </div>

          {errors.email && (
            <p className="text-[11px] text-red-600 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Terms Agreement Note */}
        <p className="text-[10.5px] text-slate-500 leading-relaxed text-center pt-1">
          By continuing, you agree to TalentX’s{' '}
          <Link href="/terms" className="underline hover:text-slate-800 transition-colors">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-slate-800 transition-colors">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </div>
  )
}
