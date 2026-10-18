'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, MailCheck, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OTP_RESEND_COOLDOWN_SECONDS } from '../constants/otp.constants'
import { useVerifyOtp, useSendOtp } from '../hooks/use-verify-otp'
import {
  processPastedOtp,
  processSingleDigit,
  getPreviousFocusIndex,
} from '../utils/otp.utils'

export function OtpVerifyForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email') || ''

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [resendCooldown, setResendCooldown] = useState(OTP_RESEND_COOLDOWN_SECONDS)
  const [clientError, setClientError] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [isExistingAccount, setIsExistingAccount] = useState(false)

  const canResend = resendCooldown <= 0

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const { mutate: verifyOtp, isPending: isVerifying, isSuccess: isVerifySuccess, error: verifyError } = useVerifyOtp()
  const { mutate: resendOtp, isPending: isResending } = useSendOtp()

  const isBusy = isVerifying || isVerifySuccess

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return

    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // If user directly browsed to /verify-email without any email parameter
  if (!email) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6 text-center py-6">
        <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 mx-auto shadow-xs">
          <AlertCircle className="size-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            No Email Provided
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Please start from the registration page by entering your work email.
          </p>
        </div>
        <Button
          onClick={() => router.push('/signup')}
          className="w-full h-11 rounded-xl bg-slate-900 text-white font-semibold shadow-md hover:bg-slate-800 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
        >
          Go to Sign Up <ArrowRight className="size-4" />
        </Button>
      </div>
    )
  }

  const handleDigitChange = (index: number, value: string) => {
    if (isBusy) return
    setClientError(null)

    // Handle multi-character paste (e.g. paste full 6-digit OTP)
    if (value.length > 1) {
      const { newDigits, nextFocusIndex, isComplete } = processPastedOtp(value, index, digits)
      setDigits(newDigits)
      inputRefs.current[nextFocusIndex]?.focus()

      if (isComplete) {
        submitOtp(newDigits.join(''))
      }
      return
    }

    const { newDigits, nextFocusIndex, isComplete } = processSingleDigit(value, index, digits)
    setDigits(newDigits)

    if (nextFocusIndex !== null) {
      inputRefs.current[nextFocusIndex]?.focus()
    }

    if (isComplete) {
      submitOtp(newDigits.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isBusy) return
    const previousIndex = getPreviousFocusIndex(index, digits[index], e.key)
    if (previousIndex !== null) {
      inputRefs.current[previousIndex]?.focus()
    }
  }

  const submitOtp = useCallback(
    (otpCode: string) => {
      if (isBusy) return
      if (otpCode.length !== 6) {
        setClientError('Please enter all 6 digits.')
        return
      }
      verifyOtp({ email, otp: otpCode })
    },
    [email, verifyOtp, isBusy]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isBusy) return
    submitOtp(digits.join(''))
  }

  const handleResend = () => {
    if (!canResend || isResending) return
    setClientError(null)
    setIsExistingAccount(false)

    resendOtp(
      { email },
      {
        onSuccess: () => {
          setResendSuccess(true)
          setResendCooldown(OTP_RESEND_COOLDOWN_SECONDS)
          setTimeout(() => setResendSuccess(false), 5000)
        },
        onError: (err: Error) => {
          const msg = err.message || ''
          const isConflict =
            msg.toLowerCase().includes('already registered') ||
            msg.toLowerCase().includes('already verified') ||
            msg.toLowerCase().includes('conflict')

          if (isConflict) {
            setIsExistingAccount(true)
            setClientError('This account is already registered and verified.')
          } else {
            setClientError(msg || 'Failed to resend code. Please try again.')
          }
        },
      }
    )
  }

  const errorMessage = clientError || verifyError?.message

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 mx-auto shadow-xs">
          <MailCheck className="size-6" />
        </div>
        <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900">
          Check your email
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          We’ve sent a 6-digit verification code to
          <br />
          <span className="font-semibold text-slate-800 break-all">{email}</span>
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
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
            <span className="font-medium">{errorMessage}</span>
            {isExistingAccount && (
              <div className="mt-1">
                <Link
                  href={`/login?email=${encodeURIComponent(email)}`}
                  className="font-semibold underline text-amber-950 hover:text-amber-800 transition-colors inline-flex items-center gap-1"
                >
                  Log in to your account <ArrowRight className="size-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resend Success Alert */}
      {resendSuccess && (
        <div className="p-3 text-xs rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-center font-medium">
          ✓ A fresh 6-digit code was sent to your email!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 6 Digit Input Group */}
        <div className="flex justify-center items-center gap-2 sm:gap-3">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              disabled={isBusy}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="size-11 sm:size-12 rounded-xl text-center text-lg sm:text-xl font-bold bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none transition-all"
            />
          ))}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isBusy || digits.some((d) => d === '')}
          className="w-full h-11 rounded-xl bg-slate-900 text-white font-semibold shadow-md hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer inline-flex items-center justify-center gap-2"
        >
          {isBusy ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>{isVerifySuccess ? 'Redirecting...' : 'Verifying Code...'}</span>
            </>
          ) : (
            'Verify & Continue'
          )}
        </Button>
      </form>

      {/* Resend & Back Action Links */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs">
        <button
          type="button"
          onClick={() => router.push('/signup')}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors font-medium cursor-pointer"
        >
          <ArrowLeft className="size-3.5" />
          Change email
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend || isResending}
          className={`font-semibold transition-colors cursor-pointer ${
            canResend && !isResending
              ? 'text-slate-900 hover:underline'
              : 'text-slate-400 cursor-not-allowed'
          }`}
        >
          {isResending ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 className="size-3 animate-spin" />
              Sending...
            </span>
          ) : canResend ? (
            'Resend Code'
          ) : (
            `Resend Code in ${resendCooldown}s`
          )}
        </button>
      </div>
    </div>
  )
}
