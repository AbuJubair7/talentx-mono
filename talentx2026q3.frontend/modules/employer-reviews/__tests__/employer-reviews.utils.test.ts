import { formatScore, overallSummaryAverage, reviewAverage, scoreTone } from '../utils/employer-reviews.utils'
import type { CompanyReviewRatingsDto, CompanyReviewSummaryDto } from '@/modules/company-review'

function makeSummary(overrides: Partial<CompanyReviewSummaryDto> = {}): CompanyReviewSummaryDto {
  return {
    totalCount: 0,
    positiveCount: 0,
    negativeCount: 0,
    positivePercent: 0,
    recruitmentProcess: { average: null, ratingCount: 0 },
    communication: { average: null, ratingCount: 0 },
    interviewExperience: { average: null, ratingCount: 0 },
    professionalism: { average: null, ratingCount: 0 },
    ...overrides,
  }
}

describe('overallSummaryAverage', () => {
  it('returns 0 when nothing has been rated', () => {
    expect(overallSummaryAverage(makeSummary())).toBe(0)
  })

  it('averages only the categories that have ratings', () => {
    const summary = makeSummary({
      recruitmentProcess: { average: 4, ratingCount: 2 },
      communication: { average: 2, ratingCount: 1 },
    })

    expect(overallSummaryAverage(summary)).toBe(3)
  })

  it('averages all four categories when every one is rated', () => {
    const summary = makeSummary({
      recruitmentProcess: { average: 5, ratingCount: 1 },
      communication: { average: 4, ratingCount: 1 },
      interviewExperience: { average: 3, ratingCount: 1 },
      professionalism: { average: 4, ratingCount: 1 },
    })

    expect(overallSummaryAverage(summary)).toBe(4)
  })
})

describe('reviewAverage', () => {
  it('returns 0 when nothing on the review is rated', () => {
    const ratings: CompanyReviewRatingsDto = {
      recruitmentProcess: null,
      communication: null,
      interviewExperience: null,
      professionalism: null,
    }

    expect(reviewAverage(ratings)).toBe(0)
  })

  it('averages only the rated categories on that review', () => {
    const ratings: CompanyReviewRatingsDto = {
      recruitmentProcess: 5,
      communication: 3,
      interviewExperience: null,
      professionalism: null,
    }

    expect(reviewAverage(ratings)).toBe(4)
  })
})

describe('formatScore', () => {
  it('formats to one decimal place', () => {
    expect(formatScore(4)).toBe('4.0')
    expect(formatScore(3.456)).toBe('3.5')
  })
})

describe('scoreTone', () => {
  it('is emerald at 4 and above', () => {
    expect(scoreTone(4)).toBe('bg-emerald-500')
    expect(scoreTone(5)).toBe('bg-emerald-500')
  })

  it('is amber between 3 and 4', () => {
    expect(scoreTone(3)).toBe('bg-amber-500')
    expect(scoreTone(3.9)).toBe('bg-amber-500')
  })

  it('is rose below 3', () => {
    expect(scoreTone(2.9)).toBe('bg-rose-500')
    expect(scoreTone(0)).toBe('bg-rose-500')
  })
})
