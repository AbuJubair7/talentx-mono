import type { HeadlineWavyWord } from '../types/headlineWavyWord'

export const HEADLINE_LINE_ONE_WORDS: readonly HeadlineWavyWord[] = [
  { text: 'Less', delay: '0.00s' },
  { text: 'effort', delay: '0.14s' },
  { text: 'to', delay: '0.28s' },
  { text: 'hire.', delay: '0.42s' },
] as const

export const HEADLINE_LINE_TWO_WORDS: readonly HeadlineWavyWord[] = [
  { text: 'Less', delay: '0.56s' },
  { text: 'wait', delay: '0.70s' },
  { text: 'to', delay: '0.84s' },
  { text: 'be', delay: '0.98s' },
  { text: 'hired.', delay: '1.12s' },
] as const
