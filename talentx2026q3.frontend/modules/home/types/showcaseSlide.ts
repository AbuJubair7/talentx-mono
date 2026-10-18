import type { ShowcaseAudience } from './showcaseAudience'

export interface ShowcaseSlide {
  readonly id: string
  readonly audience: ShowcaseAudience
  readonly title: string
  readonly subtitle: string
  readonly badge: string
  readonly imagePath?: string
  readonly windowTitle?: string
}
