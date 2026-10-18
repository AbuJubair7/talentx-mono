import { Fragment } from 'react'
import { SectionHeading } from '../landing/section-heading'
import { FeatureRow } from '../landing/feature-row'
import { StepConnector, StepRail } from '../landing/step-connector'
import { TalentMatchingVisual } from './talent-matching-visual'
import { ApplicantScoringVisual } from './applicant-scoring-visual'
import { HiringIntelligenceVisual } from './hiring-intelligence-visual'
import { employerFeatures } from '../../constants/landingContent'

const visuals: Record<string, React.ReactNode> = {
  matching: <TalentMatchingVisual />,
  scoring: <ApplicantScoringVisual />,
  intelligence: <HiringIntelligenceVisual />,
}

export function EmployerSection() {
  return (
    <section
      id="for-employers"
      aria-labelledby="employer-title"
      className="w-full scroll-mt-20 border-t border-slate-200 bg-slate-50/70 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="employer-title"
          eyebrow="For Employers"
          title="Find the right people without sorting through hundreds of applications manually."
          body="TalentX reads your requirements, understands candidate profiles and shows your team who’s worth a conversation, and why."
        />
        <div className="relative mt-16 lg:mt-24">
          <StepRail />
          {employerFeatures.map((f, i) => (
            <Fragment key={f.id}>
              {i > 0 && <StepConnector />}
              <div className="relative">
                <FeatureRow
                  feature={f}
                  visual={visuals[f.id]}
                  reverse={i % 2 === 1}
                  wide={f.id === 'intelligence'}
                />
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
