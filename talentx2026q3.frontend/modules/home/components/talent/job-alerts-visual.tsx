'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Bell, SlidersHorizontal } from 'lucide-react'
import { MockFrame } from '../landing/mock-frame'
import { alertPreferences, jobAlerts } from '../../constants/landingContent'

export function JobAlertsVisual() {
  const reduce = useReducedMotion()
  return (
    <div className="mx-auto w-full max-w-md">
      <MockFrame
        title="Smart job alerts"
        meta={<span className="font-bold text-emerald-700">Active</span>}
      >
        <div className="px-4 py-3.5">
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <SlidersHorizontal className="size-3" /> Matching your profile
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {alertPreferences.map((p) => (
              <span
                key={p}
                className="rounded-md border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
        <ul className="space-y-2.5 border-t border-slate-200 bg-slate-50 p-4">
          {jobAlerts.map((a, i) => (
            <motion.li
              key={a.title}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.25, delay: 0.3 + i * 0.18, ease: [0.23, 1, 0.32, 1] }}
              className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Bell className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {a.title}
                  </p>
                  <span className="shrink-0 text-[11px] text-slate-500">
                    {a.time}
                  </span>
                </div>
                <p className="truncate text-xs text-slate-500">{a.meta}</p>
                <p className="mt-1.5 text-xs font-medium text-emerald-700">
                  {a.why}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </MockFrame>
    </div>
  )
}
