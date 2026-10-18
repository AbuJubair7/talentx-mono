'use client'

import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  LogInIcon,
  SearchIcon,
  UserRoundIcon,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

export type SignInView = 'choose' | 'talent'

type SignInDialogProps = {
  open: boolean
  view: SignInView
  onViewChange: (view: SignInView) => void
  onClose: () => void
}

export function SignInDialog({
  open,
  view,
  onViewChange,
  onClose,
}: SignInDialogProps) {
  const router = useRouter()

  const signInAsEmployer = () => {
    onClose()
    router.push('/login')
  }

  const signInAsTalent = () => {
    onClose()
    router.push('/login')
  }

  const applyFirst = () => {
    onClose()
    router.push('/jobs')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <DialogContent
        className={view === 'choose' ? 'p-0 sm:max-w-xl' : 'p-0 sm:max-w-lg'}
      >
        {view === 'choose' ? (
          <div className="p-6 sm:p-8">
            <DialogTitle className="pr-10 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Sign in to TalentX
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-slate-500">
              Who are you signing in as?
            </DialogDescription>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={signInAsEmployer}
                className="group flex h-full flex-col rounded-xl border border-slate-200 p-5 text-left transition-colors hover:border-emerald-600 hover:bg-emerald-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <BriefcaseIcon className="size-5" />
                </span>
                <span className="mt-4 text-base font-bold text-slate-900">
                  Sign in as Employer
                </span>
                <span className="mt-1 text-sm leading-relaxed text-slate-600">
                  Post jobs, manage applicants and run your hiring pipeline.
                </span>
                <span className="mt-auto flex items-center justify-between pt-5 text-xs font-bold text-emerald-700">
                  Continue to login
                  <ArrowRightIcon className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => onViewChange('talent')}
                className="group flex h-full flex-col rounded-xl border border-slate-200 p-5 text-left transition-colors hover:border-emerald-600 hover:bg-emerald-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <UserRoundIcon className="size-5" />
                </span>
                <span className="mt-4 text-base font-bold text-slate-900">
                  Sign in as Talent
                </span>
                <span className="mt-1 text-sm leading-relaxed text-slate-600">
                  Track applications and apply to roles in one click.
                </span>
                <span className="mt-auto flex items-center justify-between pt-5 text-xs font-bold text-emerald-700">
                  One quick question first
                  <ArrowRightIcon className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <button
              type="button"
              onClick={() => onViewChange('choose')}
              className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeftIcon className="size-4" /> Back
            </button>

            <DialogTitle className="pr-10 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Sign in as Talent
            </DialogTitle>
            <DialogDescription className="mt-4 rounded-xl border border-amber-300 bg-amber-100 p-4 text-sm font-semibold leading-relaxed text-amber-900">
              Did you apply for any job before and create an account? If not,
              please apply first — your account is created automatically with
              your first application.
            </DialogDescription>

            <div className="mt-7 flex flex-col gap-3">
              <button
                type="button"
                onClick={signInAsTalent}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                <LogInIcon className="size-4" /> I already have an account
              </button>

              <button
                type="button"
                onClick={applyFirst}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                <SearchIcon className="size-4" /> No, I haven&apos;t applied yet
                — apply first
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm leading-relaxed text-slate-600">
              Not sure? Browse open roles and apply — it takes about 3 minutes
              and doubles as your sign-up. Once applied, come back and choose{' '}
              <span className="font-bold text-slate-900">
                &ldquo;I already have an account&rdquo;
              </span>{' '}
              to sign in.
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
