'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Cpu } from 'lucide-react'
import { SectionHeading } from './section-heading'
import { Reveal } from './reveal'
import { aiCapabilities, aiInputs } from '../../constants/landingContent'
import type { AiCapability } from '../../constants/landingContent'

export function AISection() {
  const left = aiCapabilities.slice(0, 2)
  const right = aiCapabilities.slice(2)

  return (
    <section
      id="ai-features"
      aria-labelledby="ai-title"
      className="w-full scroll-mt-20 bg-slate-900 py-20 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="ai-title"
          tone="dark"
          align="center"
          eyebrow="AI features"
          title="AI that works behind the scenes."
          body="Not a chatbot bolted on. One intelligence layer powers matching, preparation, resume parsing and alerts, using the structured data already in TalentX."
        />

        <div className="mt-16 grid items-center gap-6 lg:mt-20 lg:grid-cols-[1fr_280px_1fr] lg:gap-0">
          <div className="space-y-6 lg:order-1">
            {left.map((c, i) => (
              <CapabilityCard key={c.title} capability={c} side="left" delay={i * 0.05} />
            ))}
          </div>

          <Reveal className="order-first lg:order-2">
            <CoreNode />
          </Reveal>

          <div className="space-y-6 lg:order-3">
            {right.map((c, i) => (
              <CapabilityCard key={c.title} capability={c} side="right" delay={0.1 + i * 0.05} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CoreNode() {
  const reduce = useReducedMotion()
  return (
    <div className="relative mx-auto max-w-[280px] rounded-2xl border border-emerald-500/30 bg-slate-800 p-6 text-center">
      {!reduce && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl border border-emerald-400/40"
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-emerald-700 text-white">
        <Cpu className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-4 text-lg font-extrabold text-white">TalentX intelligence</p>
      <p className="mt-1 text-xs text-slate-400">Learns from structured data</p>
      <ul className="mt-5 space-y-1.5 text-left">
        {aiInputs.map((input) => (
          <li
            key={input}
            className="flex items-center gap-2 rounded-md bg-white/5 px-2.5 py-1.5 text-xs text-slate-300"
          >
            <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            {input}
          </li>
        ))}
      </ul>
    </div>
  )
}

function CapabilityCard({
  capability: c,
  side,
  delay,
}: {
  capability: AiCapability
  side: 'left' | 'right'
  delay: number
}) {
  const reduce = useReducedMotion()
  return (
    <Reveal delay={delay} className={`relative ${side === 'left' ? 'lg:pr-14' : 'lg:pl-14'}`}>
      <span
        aria-hidden="true"
        className={`absolute top-1/2 hidden h-px w-14 overflow-hidden bg-white/15 lg:block ${
          side === 'left' ? 'right-0' : 'left-0'
        }`}
      >
        {!reduce && (
          <motion.span
            className="absolute top-0 h-px w-3 bg-emerald-400"
            initial={{ left: side === 'left' ? '100%' : '-25%' }}
            animate={{ left: side === 'left' ? '-25%' : '100%' }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'linear',
              delay: delay * 6,
              repeatDelay: 1.2,
            }}
          />
        )}
      </span>
      <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-emerald-400">
            <c.icon className="size-4" aria-hidden="true" />
          </span>
          <h3 className="text-base font-bold text-white">{c.title}</h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{c.body}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3 text-xs">
          <div>
            <dt className="text-slate-500">Uses</dt>
            <dd className="mt-0.5 text-slate-300">{c.uses}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Produces</dt>
            <dd className="mt-0.5 text-slate-300">{c.produces}</dd>
          </div>
        </dl>
      </article>
    </Reveal>
  )
}
