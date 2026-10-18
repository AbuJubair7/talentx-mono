'use client'

import { motion } from 'framer-motion'
import { Calendar, FileText, Sparkles } from 'lucide-react'
import { MockFrame } from '../landing/mock-frame'
import {
  prepAskThem,
  prepQuestions,
  prepTopics,
} from '../../constants/landingContent'

export function InterviewPrepVisual() {
  return (
    <MockFrame title="Interview preparation" meta="Personalized for you">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-600">
        <span className="flex items-center gap-1.5 font-bold text-slate-900">
          <Calendar className="size-3.5" /> Technical interview · Tue 14 Oct
        </span>
        <span>45 min · System design + coding</span>
        <span>With: Engineering Manager</span>
      </div>

      <div className="p-5">
        <div className="flex gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3.5">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-emerald-700" />
          <p className="text-xs leading-relaxed text-slate-700">
            <span className="font-bold">Focus on streaming design.</span> This
            role emphasizes real-time pipelines, and your CV shows mostly batch
            work. Prepare one example that shows streaming trade-offs.
          </p>
        </div>

        <div className="mt-5 grid gap-6 sm:grid-cols-[1.25fr_1fr]">
          <div>
            <p className="text-xs font-bold text-slate-900">Likely questions</p>
            <ol className="mt-2.5 space-y-2.5">
              {prepQuestions.map((q, i) => (
                <li
                  key={q}
                  className="flex gap-2.5 text-xs leading-relaxed text-slate-600"
                >
                  <span className="font-bold tabular-nums text-slate-400">
                    Q{i + 1}
                  </span>
                  {q}
                </li>
              ))}
            </ol>
            <p className="mt-5 text-xs font-bold text-slate-900">
              Questions to ask them
            </p>
            <ul className="mt-2 space-y-1.5">
              {prepAskThem.map((q) => (
                <li key={q} className="text-xs text-slate-600">
                  — {q}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Topics to prepare</p>
            <ul className="mt-2.5 space-y-3">
              {prepTopics.map((t, i) => (
                <li key={t.name}>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">{t.name}</span>
                    <span className="tabular-nums text-slate-500">
                      {t.readiness}%
                    </span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      className={`h-full rounded-full ${
                        t.readiness < 50 ? 'bg-amber-500' : 'bg-emerald-700'
                      }`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${t.readiness}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.2 + i * 0.06, ease: [0.23, 1, 0.32, 1] }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <FileText className="size-4 text-slate-400" />
          <div>
            <p className="text-xs font-bold text-slate-900">
              Preparation report
            </p>
            <p className="text-[11px] text-slate-500">Overall readiness 68%</p>
          </div>
        </div>
        <span className="whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
          Open report
        </span>
      </div>
    </MockFrame>
  )
}
