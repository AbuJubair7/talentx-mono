'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { useGetStarted } from '@/components/providers/get-started-provider'
import { Reveal } from './reveal'

export function FinalCTA() {
  const router = useRouter()
  const { open: openGetStarted } = useGetStarted()

  return (
    <section aria-labelledby="cta-title" className="w-full bg-canvas pb-20 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="rounded-2xl bg-emerald-800 px-6 py-14 sm:px-12 lg:py-20">
          <h2
            id="cta-title"
            className="mx-auto max-w-3xl text-center text-3xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            Ready to make your next career move, or your next great hire?
          </h2>
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => openGetStarted('talent')}
              className="group flex h-full flex-col rounded-xl bg-white p-6 text-left transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-800 cursor-pointer"
            >
              <span className="flex items-center justify-between gap-3 text-lg font-bold text-slate-900">
                I&apos;m looking for opportunities
                <ArrowRight className="size-5 shrink-0 text-emerald-700 transition-transform duration-150 group-hover:translate-x-0.5" />
              </span>
              <span className="mt-2 text-sm text-slate-600">
                Apply first. Your account is created for you.
              </span>
            </button>
            <button
              type="button"
              onClick={() => router.push('/signup')}
              className="group flex h-full flex-col rounded-xl border border-white/20 bg-white/5 p-6 text-left transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
            >
              <span className="flex items-center justify-between gap-3 text-lg font-bold text-white">
                I&apos;m hiring
                <ArrowRight className="size-5 shrink-0 text-emerald-300 transition-transform duration-150 group-hover:translate-x-0.5" />
              </span>
              <span className="mt-2 text-sm text-slate-300">
                Create an employer account and post your first role.
              </span>
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
