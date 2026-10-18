'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, Search } from 'lucide-react'
import { MockFrame } from '../landing/mock-frame'
import { MatchBadge } from '../landing/match-badge'
import { Initials } from '../landing/initials'
import {
  discoveryCandidates,
  discoveryFilters,
  discoveryInsights,
  funnel,
} from '../../constants/landingContent'

export function HiringIntelligenceVisual() {
  const reduce = useReducedMotion()
  return (
    <MockFrame title="Candidate discovery · Senior Backend Engineer" meta="Updated just now">
      <ol className="grid border-b border-slate-200 sm:grid-cols-3">
        {funnel.map((f, i) => {
          const last = i === funnel.length - 1
          return (
            <li
              key={f.label}
              className={`relative flex items-center justify-between gap-3 px-5 py-4 ${
                i > 0 ? 'border-t border-slate-200 sm:border-l sm:border-t-0' : ''
              } ${last ? 'bg-emerald-50/60' : ''}`}
            >
              <div>
                <p
                  className={`text-2xl font-extrabold tabular-nums ${
                    last ? 'text-emerald-800' : 'text-slate-900'
                  }`}
                >
                  {f.value}
                </p>
                <p className="text-xs text-slate-500">{f.label}</p>
              </div>
              {!last && (
                <ArrowRight className="hidden size-4 text-slate-300 sm:block" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>

      <div className="grid lg:grid-cols-[200px_1fr_240px]">
        <div className="hidden border-r border-slate-200 p-4 lg:block">
          <div className="flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-500">
            <Search className="size-3" /> Search candidates
          </div>
          {discoveryFilters.map((g) => (
            <div key={g.group} className="mt-4">
              <p className="text-[11px] font-bold text-slate-900">{g.group}</p>
              <ul className="mt-2 space-y-1.5">
                {g.options.map((o) => (
                  <li key={o.label} className="flex items-center gap-2 text-xs text-slate-600">
                    <span
                      className={`flex size-3.5 items-center justify-center rounded border ${
                        o.on ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300'
                      }`}
                    >
                      {o.on && <Check className="size-2.5" strokeWidth={3} />}
                    </span>
                    {o.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <ul className="grid gap-3 bg-slate-50 p-4 sm:grid-cols-2">
          {discoveryCandidates.map((c, i) => (
            <motion.li
              key={c.name}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.25, delay: 0.15 + i * 0.05, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col rounded-lg border border-slate-200 bg-white p-3.5"
            >
              <div className="flex items-center gap-2.5">
                <Initials value={c.initials} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900">{c.name}</p>
                  <p className="truncate text-[11px] text-slate-500">{c.title}</p>
                </div>
                <MatchBadge label={c.label} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {c.tags.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                  >
                    <Check className="size-2.5 text-emerald-700" strokeWidth={3} />
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-auto pt-3 text-[11px] text-slate-600">{c.why}</p>
            </motion.li>
          ))}
        </ul>

        <div className="border-t border-slate-200 p-4 lg:border-l lg:border-t-0">
          <p className="text-[11px] font-bold text-slate-900">Pool insights</p>
          <dl className="mt-3 divide-y divide-slate-200">
            {discoveryInsights.map((d) => (
              <div key={d.k} className="py-3 first:pt-0">
                <dt className="text-[11px] text-slate-500">{d.k}</dt>
                <dd className="mt-0.5 text-sm font-bold text-slate-900">{d.v}</dd>
                <dd className="text-[11px] text-slate-500">{d.note}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </MockFrame>
  )
}
