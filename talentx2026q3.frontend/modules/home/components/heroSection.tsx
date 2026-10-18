'use client'

import type { CSSProperties } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { useGetStarted } from '@/components/providers/get-started-provider'
import { JobSearchBar } from './jobSearchBar'
import {
  HEADLINE_LINE_ONE_WORDS,
  HEADLINE_LINE_TWO_WORDS,
} from '../constants/headlineWavyWords'

export function HeroSection() {
  const router = useRouter()
  const { open: openGetStarted } = useGetStarted()

  return (
    <section className="relative overflow-hidden min-h-[calc(100svh-4rem)] lg:min-h-[calc(100svh-5rem)] flex flex-col justify-center items-center py-4 sm:py-6 text-center bg-gradient-to-b from-slate-50/70 via-white to-slate-50/40">
      {/* Decorative ambient radial emerald blur */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="h-96 w-[700px] -translate-y-20 rounded-full bg-emerald-100/35 blur-3xl" />
        <div className="h-80 w-[500px] translate-x-48 translate-y-16 rounded-full bg-teal-100/25 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl flex flex-col items-center">
          {/* Top Floating Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3.5 py-1 text-xs font-semibold text-emerald-800 shadow-xs backdrop-blur-xs mb-3 sm:mb-4">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Job Marketplace &amp; Recruiting Platform</span>
          </div>

          {/* Headline (H1) */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance select-none py-1"
            aria-label="Less effort to hire. Less wait to be hired."
          >
            <span className="block text-slate-900">
              {HEADLINE_LINE_ONE_WORDS.map((headlineWord, wordIndex) => (
                <span key={`${headlineWord.text}-${wordIndex}`}>
                  <span
                    className="animate-wave-word"
                    style={
                      {
                        '--wave-delay': headlineWord.delay,
                      } as CSSProperties
                    }
                  >
                    {headlineWord.text}
                  </span>
                  {wordIndex < HEADLINE_LINE_ONE_WORDS.length - 1 ? ' ' : ''}
                </span>
              ))}
            </span>
            <span className="block text-emerald-700 sm:inline-block sm:ml-2">
              {HEADLINE_LINE_TWO_WORDS.map((headlineWord, wordIndex) => (
                <span key={`${headlineWord.text}-${wordIndex}`}>
                  <span
                    className="animate-wave-word"
                    style={
                      {
                        '--wave-delay': headlineWord.delay,
                      } as CSSProperties
                    }
                  >
                    {headlineWord.text}
                  </span>
                  {wordIndex < HEADLINE_LINE_TWO_WORDS.length - 1 ? ' ' : ''}
                </span>
              ))}
            </span>
          </h1>

          {/* Context Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mt-3 mb-5 text-balance">
            TalentX is the intelligent marketplace connecting world-class tech companies with elite AI and engineering talent. Match faster, hire smarter, build further.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => openGetStarted('talent')}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 cursor-pointer"
            >
              Find Your Opportunity <ArrowRight className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => router.push('/signup')}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 cursor-pointer"
            >
              Find Great Talent
            </button>
          </div>

          {/* Hero Search Bar Integration */}
          <div className="w-full mt-6">
            <JobSearchBar />
          </div>

          {/* Dual-Audience Quick Links */}
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-600">
            <Link
              href="/jobs"
              className="group inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 rounded-md py-1 px-2"
            >
              <span>Looking for work?</span>
              <span className="font-semibold text-emerald-700 group-hover:text-emerald-800 group-hover:underline inline-flex items-center">
                Browse all open roles <span className="ml-1 transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
              </span>
            </Link>
            <span className="hidden sm:inline text-slate-300" aria-hidden="true">•</span>
            <Link
              href="/job/jobpost"
              className="group inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 rounded-md py-1 px-2"
            >
              <span>Hiring talent?</span>
              <span className="font-semibold text-emerald-700 group-hover:text-emerald-800 group-hover:underline inline-flex items-center">
                Post a Job for Free <span className="ml-1 transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
