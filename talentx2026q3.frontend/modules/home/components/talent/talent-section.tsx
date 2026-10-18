import { Fragment } from 'react'
import { SectionHeading } from '../landing/section-heading'
import { FeatureRow } from '../landing/feature-row'
import { StepConnector, StepRail } from '../landing/step-connector'
import { ApplyFlowVisual } from './apply-flow-visual'
import { InterviewPrepVisual } from './interview-prep-visual'
import { JobAlertsVisual } from './job-alerts-visual'
import { talentFeatures } from '../../constants/landingContent'

const visuals: Record<string, React.ReactNode> = {
  apply: <ApplyFlowVisual />,
  prep: <InterviewPrepVisual />,
  alerts: <JobAlertsVisual />,
}

export function TalentSection() {
  return (
    <section
      id="for-talent"
      aria-labelledby="talent-title"
      className="w-full scroll-mt-20 border-t border-slate-200 bg-canvas py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="talent-title"
          eyebrow="For Talent"
          title="Your next opportunity shouldn’t depend on luck."
          body="Apply in minutes, prepare with context and let relevant roles find you."
        />
        <div className="relative mt-16 lg:mt-24">
          <StepRail />
          {talentFeatures.map((f, i) => (
            <Fragment key={f.id}>
              {i > 0 && <StepConnector />}
              <div className="relative">
                <FeatureRow feature={f} visual={visuals[f.id]} reverse={i % 2 === 1} />
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
