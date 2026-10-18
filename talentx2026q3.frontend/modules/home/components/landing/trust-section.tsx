import { Reveal } from './reveal'
import { trustItems } from '../../constants/landingContent'

export function TrustSection() {
  return (
    <section
      id="about"
      aria-labelledby="trust-title"
      className="w-full scroll-mt-20 bg-canvas py-20 lg:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Trust</p>
          <h2
            id="trust-title"
            className="mt-3 text-3xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-4xl"
          >
            A professional platform both sides can rely on.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
            TalentX is built around verified accounts, structured data and AI
            that explains itself.
          </p>
          <div className="mt-10 border-l-2 border-emerald-700 pl-6">
            <p className="text-2xl font-extrabold tracking-tight text-slate-900">
              AI assists. People decide.
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
              Every recommendation shows the signals behind it. Final decisions
              always rest with the people involved.
            </p>
          </div>
        </Reveal>

        <ul className="divide-y divide-slate-200 border-y border-slate-200">
          {trustItems.map((item, i) => (
            <Reveal
              as="li"
              key={item.title}
              delay={i * 0.04}
              className="grid grid-cols-[auto_1fr] gap-4 py-5"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <item.icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-0.5 text-sm text-slate-600">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
