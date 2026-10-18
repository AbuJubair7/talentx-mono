'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { MockFrame } from '../landing/mock-frame'
import { MatchBadge } from '../landing/match-badge'
import { Initials } from '../landing/initials'
import {
  jobRequirements,
  matchSignalNames,
  matchedCandidates,
  type SignalState,
} from '../../constants/landingContent'

const dot: Record<SignalState, string> = {
  met: 'bg-emerald-700',
  partial: 'bg-amber-400',
  gap: 'bg-slate-200',
}

export function TalentMatchingVisual() {
  const reduce = useReducedMotion()
  return (
    <MockFrame title="Senior Backend Engineer · Matching" meta="1,240 profiles analyzed">
      <div className="grid md:grid-cols-[190px_1fr]">
        <div className="border-b border-slate-200 bg-slate-50 p-4 md:border-b-0 md:border-r">
          <p className="text-[11px] font-bold text-slate-900">Job requirements</p>
          <dl className="mt-3 space-y-2.5">
            {jobRequirements.map((r) => (
              <div key={r.k}>
                <dt className="text-[11px] text-slate-500">{r.k}</dt>
                <dd className="text-xs font-medium text-slate-900">{r.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="p-4 pr-8">
          <div className="grid h-14 grid-cols-[1fr_repeat(7,22px)] items-end gap-x-1 pb-2 text-[10px] font-medium text-slate-500">
            <span className="text-[11px] font-bold text-slate-900">
              Relevant candidates
            </span>
            {matchSignalNames.map((s) => (
              <span key={s} className="origin-bottom-left translate-x-2 -rotate-45 whitespace-nowrap">
                {s}
              </span>
            ))}
          </div>
          <ul className="divide-y divide-slate-200 border-t border-slate-200">
            {matchedCandidates.map((c, i) => (
              <motion.li
                key={c.name}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.28, delay: 0.2 + i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                className="py-3"
              >
                <div className="grid grid-cols-[1fr_repeat(7,22px)] items-center gap-x-1">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Initials value={c.initials} />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900">{c.name}</p>
                      <p className="truncate text-[11px] text-slate-500">{c.title}</p>
                    </div>
                  </div>
                  {c.signals.map((s, j) => (
                    <span key={j} className="flex justify-center">
                      <span className={`size-2.5 rounded-full ${dot[s]}`} />
                    </span>
                  ))}
                </div>
                <div className="mt-2 pl-[42px]">
                  <MatchBadge label={c.label} />
                </div>
              </motion.li>
            ))}
          </ul>
          <div className="mt-2 flex gap-4 border-t border-slate-200 pt-3 text-[11px] text-slate-500">
            {(['met', 'partial', 'gap'] as SignalState[]).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${dot[s]}`} />
                {s === 'met' ? 'Meets' : s === 'partial' ? 'Partly meets' : 'Gap'}
              </span>
            ))}
          </div>
        </div>
      </div>
    </MockFrame>
  )
}
