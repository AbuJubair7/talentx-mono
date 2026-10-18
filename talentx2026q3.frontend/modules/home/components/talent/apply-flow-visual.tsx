'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { MockFrame } from '../landing/mock-frame'
import { heroApplySteps } from '../../constants/landingContent'

export function ApplyFlowVisual() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const reduce = useReducedMotion()
  const [ticked, setTicked] = useState(0)

  useEffect(() => {
    if (reduce) return
    if (!inView || ticked >= heroApplySteps.length) return
    const t = setTimeout(() => setTicked((d) => d + 1), ticked === 0 ? 300 : 650)
    return () => clearTimeout(t)
  }, [inView, ticked, reduce])

  const done = reduce ? heroApplySteps.length : ticked
  const complete = done >= heroApplySteps.length

  return (
    <div ref={ref} className="mx-auto w-full max-w-md">
      <MockFrame
        title="Application · Data Platform Engineer"
        meta={
          <span className={complete ? 'font-bold text-emerald-700' : ''}>
            {complete ? 'Account ready' : 'In progress'}
          </span>
        }
      >
        <div className="p-5">
          <div className="h-1 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-emerald-700"
              animate={{ width: `${(done / heroApplySteps.length) * 100}%` }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            />
          </div>
          <ol className="mt-5 space-y-4">
            {heroApplySteps.map((s, i) => {
              const isDone = i < done
              const current = i === done
              return (
                <li key={s.label} className="flex gap-3">
                  <span
                    className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                      isDone
                        ? 'border-emerald-700 bg-emerald-700 text-white'
                        : current
                          ? 'border-emerald-700 bg-white'
                          : 'border-slate-200 bg-white'
                    }`}
                  >
                    {isDone ? (
                      <Check className="size-3" strokeWidth={3} />
                    ) : current ? (
                      <span className="size-1.5 rounded-full bg-emerald-700" />
                    ) : null}
                  </span>
                  <div>
                    <p
                      className={`text-sm font-medium transition-colors duration-200 ${
                        isDone || current ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </p>
                    <p className="text-xs text-slate-500">{s.detail}</p>
                  </div>
                </li>
              )
            })}
          </ol>
          <p className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-xs text-slate-600">
            <Sparkles className="size-3.5 shrink-0 text-emerald-700" />
            No registration form. Your account is created from your application.
          </p>
        </div>
      </MockFrame>
    </div>
  )
}
