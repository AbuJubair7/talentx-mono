'use client'

import { motion } from 'framer-motion'
import { Info, Sparkles } from 'lucide-react'
import { MockFrame } from '../landing/mock-frame'
import { Initials } from '../landing/initials'
import { scoredApplicants } from '../../constants/landingContent'

export function ApplicantScoringVisual() {
  return (
    <MockFrame title="Applicants · Senior Backend Engineer" meta="86 applicants · by relevance">
      <ul className="divide-y divide-slate-200">
        {scoredApplicants.map((a, i) => (
          <li key={a.name} className="p-5">
            <div className="flex items-center gap-3">
              <span className="w-4 text-xs font-bold tabular-nums text-slate-500">
                {i + 1}
              </span>
              <Initials value={a.initials} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{a.name}</p>
                <p className="text-[11px] text-slate-500">{a.applied}</p>
              </div>
              <span
                className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold ${
                  a.fit === 'Strong fit'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                {a.fit}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 pl-7">
              {a.scores.map((s, j) => (
                <div key={s.k}>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">{s.k}</span>
                    <span className="font-bold tabular-nums text-slate-900">{s.v}</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      className="h-full rounded-full bg-emerald-700"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${s.v}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.2 + i * 0.1 + j * 0.05, ease: [0.23, 1, 0.32, 1] }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 flex gap-2 pl-7 text-xs leading-relaxed text-slate-600">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-emerald-700" />
              {a.insight}
            </p>
            <div className="mt-3 flex gap-2 pl-7">
              <span className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-900">
                Review profile
              </span>
              <span className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                Add to shortlist
              </span>
            </div>
          </li>
        ))}
      </ul>
      <p className="flex items-start gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3 text-[11px] leading-relaxed text-slate-600">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        Assessments support your review. Shortlisting and hiring decisions stay
        with your team.
      </p>
    </MockFrame>
  )
}
