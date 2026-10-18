'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  MailCheckIcon,
  SearchIcon,
  UserRoundIcon,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

export type GetStartedView = 'choose' | 'talent'

type GetStartedDialogProps = {
  open: boolean
  view: GetStartedView
  onViewChange: (view: GetStartedView) => void
  onClose: () => void
}

const talentSteps = [
  {
    title: 'Find a role that fits',
    body: 'Browse open roles. You don’t need an account to search or view jobs — searching is completely open.',
  },
  {
    title: 'Apply with your CV',
    body: 'Takes about 3 minutes. This application is your sign-up: there is no separate registration form. We build your talent profile from it, so you won’t fill anything in twice.',
  },
  {
    title: 'Your account is created, then you activate it',
    body: 'The moment your first application is submitted, your Talent account is created automatically. We then email you a link to set your password — after that you can track applications and apply to other roles in one click.',
  },
]

export function GetStartedDialog({
  open,
  view,
  onViewChange,
  onClose,
}: GetStartedDialogProps) {
  const router = useRouter()

  const goEmployer = () => {
    onClose()
    router.push('/signup')
  }

  const browseJobs = () => {
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
        className={
          view === 'choose' ? 'p-0 sm:max-w-xl' : 'p-0 sm:max-w-lg'
        }
      >
        {view === 'choose' ? (
          <div className="p-6 sm:p-8">
            <DialogTitle className="pr-10 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Join TalentX
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-slate-500">
              How will you use TalentX?
            </DialogDescription>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={goEmployer}
                className="group flex h-full flex-col rounded-xl border border-slate-200 p-5 text-left transition-colors hover:border-emerald-600 hover:bg-emerald-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <BriefcaseIcon className="size-5" />
                </span>
                <span className="mt-4 text-base font-bold text-slate-900">
                  I&apos;m hiring
                </span>
                <span className="mt-1 text-sm leading-relaxed text-slate-600">
                  Create a company account now and post your first job in
                  minutes.
                </span>
                <span className="mt-auto flex items-center justify-between pt-5 text-xs font-bold text-emerald-700">
                  Create your account now
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
                  I&apos;m looking for work
                </span>
                <span className="mt-1 text-sm leading-relaxed text-slate-600">
                  No separate sign-up. Your account is created when you apply
                  to your first role.
                </span>
                <span className="mt-auto flex items-center justify-between pt-5 text-xs font-bold text-emerald-700">
                  Created when you apply
                  <ArrowRightIcon className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                </span>
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link
                href="/login"
                onClick={onClose}
                className="font-bold text-emerald-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
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
              Looking for a job? No need to sign up!!
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-relaxed text-slate-600">
              We&apos;ll create your Talent account automatically after your
              first application.
            </DialogDescription>

            <ol className="mt-7">
              {talentSteps.map((step, i) => {
                const last = i === talentSteps.length - 1
                return (
                  <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                    {!last && (
                      <span
                        className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px bg-emerald-200"
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white">
                      {i + 1}
                    </span>
                    <div className="pt-1">
                      <p className="text-sm font-bold text-slate-900">
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {step.body}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>

            <button
              type="button"
              onClick={browseJobs}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
            >
              <SearchIcon className="size-4" /> Browse open roles
            </button>

            <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
              <MailCheckIcon className="size-5 shrink-0 text-emerald-700" />
              <p className="text-sm text-slate-600">
                Already applied? Check the email we sent you to set your
                password.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
