'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, AlertCircle, Building2, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/password-input'
import { useSignupEmployer } from '../hooks/use-signup'
import { onboardingProfileSchema, type OnboardingProfileFormValues } from '../schemas/onboarding.schema'
import { PasswordStrengthMeter } from '../../password-strength/types'

export function OnboardingProfileForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [apiError, setApiError] = useState<string | null>(null)
  const [isExistingAccount, setIsExistingAccount] = useState(false)
  const { mutate: registerEmployer, isPending: isSubmitting, isSuccess } = useSignupEmployer()

  const isBusy = isSubmitting || isSuccess

  const form = useForm<OnboardingProfileFormValues>({
    resolver: zodResolver(onboardingProfileSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      companyName: '',
      password: '',
      confirmPassword: '',
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = form

  const newPasswordValue = form.watch("password")

  // If user directly browsed to /onboarding without any email parameter
  if (!email) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6 text-center py-6">
        <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 mx-auto shadow-xs">
          <AlertCircle className="size-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Session Not Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Please verify your work email first before completing your employer profile setup.
          </p>
        </div>
        <Button
          onClick={() => router.push('/signup')}
          className="w-full h-11 rounded-xl bg-slate-900 text-white font-semibold shadow-md hover:bg-slate-800 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
        >
          Start Sign Up <ArrowRight className="size-4" />
        </Button>
      </div>
    )
  }

  const onSubmit = (data: OnboardingProfileFormValues) => {
    if (isBusy) return
    setApiError(null)
    setIsExistingAccount(false)

    registerEmployer(
      {
        name: data.name,
        email: email,
        companyName: data.companyName,
        password: data.password,
        confirmPassword: data.confirmPassword,
      },
      {
        onSuccess: () => {
          router.push('/job/job-listing')
        },
        onError: (err: Error) => {
          const msg = err.message || ''
          const lowerMsg = msg.toLowerCase()

          const isCompanyConflict =
            lowerMsg.includes('company') &&
            (lowerMsg.includes('already registered') ||
              lowerMsg.includes('already exists') ||
              lowerMsg.includes('already taken') ||
              lowerMsg.includes('different company name') ||
              lowerMsg.includes('conflict'))

          const isAccountConflict =
            !isCompanyConflict &&
            (lowerMsg.includes('already registered') ||
              lowerMsg.includes('already verified') ||
              lowerMsg.includes('sign in') ||
              lowerMsg.includes('conflict'))

          if (isCompanyConflict) {
            setIsExistingAccount(false)
            const companyErrorMessage =
              msg || 'A company with this name is already registered. Please use a different company name.'
            setApiError(companyErrorMessage)
            setError('companyName', {
              type: 'server',
              message: companyErrorMessage,
            })
          } else if (isAccountConflict) {
            setIsExistingAccount(true)
            setApiError('This account is already registered and verified. Please sign in.')
          } else {
            setIsExistingAccount(false)
            setApiError(msg || 'Failed to complete registration. Please try again.')
          }
        },
      }
    )
  }

  return (
    <div className="space-y-4">
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

      {/* Verified Email Indicator */}
      {email && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-medium">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span className="truncate">
            Verified email: <strong className="text-emerald-950">{email}</strong>
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        {/* Full Name & Company Name */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g. Sarah Jenkins"
              autoComplete="name"
              disabled={isBusy}
              className="h-10 rounded-xl"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-[11px] text-red-600 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="companyName" className="text-xs font-semibold text-slate-700">
              Company / Organization Name
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                id="companyName"
                type="text"
                placeholder="e.g. Acme AI Corp"
                autoComplete="organization"
                disabled={isBusy}
                className="h-10 pl-9 rounded-xl"
                {...register('companyName')}
              />
            </div>
            {errors.companyName && (
              <p className="text-[11px] text-red-600 font-medium">{errors.companyName.message}</p>
            )}
          </div>
        </div>

        {/* Passwords */}
        <div className="space-y-3 pt-1">
          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
              Password <span className="text-red-500">*</span>
            </Label>
            <PasswordInput
              id="password"
              placeholder="••••••••••••"
              autoComplete="new-password"
              disabled={isBusy}
              error={errors.password?.message}
              className="h-10 rounded-xl"
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-[11px] text-red-600 font-medium">{errors.password.message}</p>
            ) : (
              <p className="text-[11px] text-slate-400">
                Min 8 characters with uppercase, lowercase, number, and special symbol.
              </p>
            )}
            <PasswordStrengthMeter password={newPasswordValue} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700">
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="••••••••••••"
              autoComplete="new-password"
              disabled={isBusy}
              error={errors.confirmPassword?.message}
              className="h-10 rounded-xl"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-[11px] text-red-600 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isBusy}
          className="w-full h-11 mt-2 rounded-xl bg-slate-900 text-sm font-semibold text-white shadow-md hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer"
        >
          {isBusy ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              {isSuccess ? 'Redirecting to Dashboard...' : 'Completing Profile Setup...'}
            </>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              Complete Setup &amp; Enter Dashboard <ArrowRight className="size-4 ml-1" />
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}
