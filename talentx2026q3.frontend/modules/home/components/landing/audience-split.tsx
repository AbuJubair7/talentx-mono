'use client'

import Link from 'next/link'
import { ArrowDown } from 'lucide-react'
import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'
import {
  audiencePanels,
  employerAudience,
  talentAudience,
} from '../../constants/landingContent'
import type { AudienceItem } from '../../constants/landingContent'

export function AudienceSplit() {
  return (
    <section
      aria-labelledby="audience-title"
      className="w-full border-t border-slate-200 bg-canvas py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="audience-title"
          title="Finding the right match is hard on both sides."
          body="Talent spends hours searching and filling in forms. Employers spend days sorting applications. TalentX understands people, roles and requirements, so both sides spend less time looking."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <Panel
              audience={audiencePanels.talent.audience}
              statement={audiencePanels.talent.statement}
              items={talentAudience}
              href={audiencePanels.talent.href}
              cta={audiencePanels.talent.cta}
            />
          </Reveal>
          <Reveal delay={0.05}>
            <Panel
              dark
              audience={audiencePanels.employer.audience}
              statement={audiencePanels.employer.statement}
              items={employerAudience}
              href={audiencePanels.employer.href}
              cta={audiencePanels.employer.cta}
            />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

type PanelProps = {
  audience: string
  statement: string
  items: AudienceItem[]
  href: string
  cta: string
  dark?: boolean
}

function Panel({ audience, statement, items, href, cta, dark }: PanelProps) {
  return (
    <div
      className={`flex h-full flex-col rounded-2xl p-8 lg:p-10 ${
        dark ? 'bg-slate-900 text-white' : 'border border-emerald-100 bg-emerald-50/60 text-slate-900'
      }`}
    >
      <p className={`text-sm font-bold ${dark ? 'text-emerald-400' : 'text-emerald-700'}`}>
        {audience}
      </p>
      <p className="mt-3 max-w-md text-2xl font-extrabold leading-snug tracking-tight sm:text-[28px]">
        {statement}
      </p>
      <ul className="mt-8 space-y-3.5">
        {items.map((item) => (
          <li
            key={item.text}
            className={`flex items-center gap-3 text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}
          >
            <item.icon
              className={`size-4 shrink-0 ${dark ? 'text-emerald-400' : 'text-emerald-700'}`}
              aria-hidden="true"
            />
            {item.text}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-auto inline-flex items-center gap-2 self-start pt-10 text-sm font-bold transition-colors ${
          dark ? 'text-white hover:text-emerald-400' : 'text-emerald-700 hover:text-emerald-800'
        }`}
      >
        {cta} <ArrowDown className="size-4" />
      </Link>
    </div>
  )
}
