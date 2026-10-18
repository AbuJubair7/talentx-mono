'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { SectionHeading } from './section-heading'
import { Reveal } from './reveal'
import { howItWorksSteps } from '../../constants/landingContent'

export function HowItWorks() {
  const reduce = useReducedMotion()
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="w-full scroll-mt-20 border-t border-slate-200 bg-canvas py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="how-title"
          align="center"
          title="How TalentX works"
          body="One continuous flow, from profile to conversation."
        />

        <ol className="relative mt-16 grid gap-10 lg:grid-cols-4 lg:gap-8">
          <span
            aria-hidden="true"
            className="absolute bottom-5 left-5 top-5 w-px bg-slate-200 lg:hidden"
          />
          <span
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-5 hidden h-px bg-slate-200 lg:block"
          >
            <motion.span
              className="absolute inset-0 origin-left bg-emerald-700"
              initial={{ scaleX: reduce ? 1 : 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-120px' }}
              transition={{ duration: 0.3, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            />
          </span>
          {howItWorksSteps.map((step, i) => (
            <Reveal
              as="li"
              key={step.title}
              delay={i * 0.05}
              className="relative flex gap-5 lg:flex-col lg:items-center lg:text-center"
            >
              <span
                className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border bg-white ${
                  i === 2
                    ? 'border-emerald-700 text-emerald-700'
                    : 'border-slate-200 text-slate-900'
                }`}
              >
                <step.icon className="size-4" aria-hidden="true" />
              </span>
              <div className="lg:mt-5">
                <p className="text-xs font-bold text-emerald-700">{step.actor}</p>
                <h3 className="mt-1 text-base font-bold text-slate-900">{step.title}</h3>
                <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-600 lg:mx-auto">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
