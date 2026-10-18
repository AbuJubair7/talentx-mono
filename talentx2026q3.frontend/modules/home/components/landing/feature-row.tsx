import { Reveal } from './reveal'
import { FlowSteps } from './flow-steps'
import type { LandingFeature } from '../../constants/landingContent'

type FeatureRowProps = {
  feature: LandingFeature
  visual: React.ReactNode
  reverse?: boolean
  wide?: boolean
}

const demoStage = 'rounded-2xl border border-slate-200/80 bg-slate-200/50 p-4 sm:p-6'

export function FeatureRow({ feature, visual, reverse, wide }: FeatureRowProps) {
  const text = (
    <div className="max-w-md">
      <p className="text-sm font-bold tabular-nums text-emerald-700">{feature.number}</p>
      <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        {feature.title}
      </h3>
      <p className="mt-3 text-base leading-relaxed text-slate-600">{feature.body}</p>
      <div className="mt-6">
        <FlowSteps steps={feature.flow} />
      </div>
    </div>
  )

  if (wide) {
    return (
      <div>
        <Reveal>{text}</Reveal>
        <Reveal delay={0.05} className="mt-10">
          <div className={demoStage}>{visual}</div>
        </Reveal>
      </div>
    )
  }

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
      <Reveal className={reverse ? 'lg:order-2' : ''}>{text}</Reveal>
      <Reveal delay={0.05} className={reverse ? 'lg:order-1' : ''}>
        <div className={demoStage}>{visual}</div>
      </Reveal>
    </div>
  )
}
