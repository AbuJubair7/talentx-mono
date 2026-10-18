import { companyReviewFormSchema } from '../schemas/company-review.schema'

const emptyRatings = {}

describe('companyReviewFormSchema', () => {
  it('accepts a review with only the required sentiment', () => {
    const result = companyReviewFormSchema.safeParse({ sentiment: 'Positive', ratings: emptyRatings })
    expect(result.success).toBe(true)
  })

  it('accepts a fully filled review', () => {
    const result = companyReviewFormSchema.safeParse({
      sentiment: 'Negative',
      comment: 'Slow replies.',
      ratings: { recruitmentProcess: 1, communication: 2, interviewExperience: 3, professionalism: 5 },
    })
    expect(result.success).toBe(true)
  })

  it('requires a sentiment, with a friendly message', () => {
    const result = companyReviewFormSchema.safeParse({ ratings: emptyRatings })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['sentiment'])
      expect(result.error.issues[0].message).toBe('Please choose Positive or Negative.')
    }
  })

  it('rejects an unknown sentiment', () => {
    expect(companyReviewFormSchema.safeParse({ sentiment: 'Neutral', ratings: emptyRatings }).success).toBe(false)
  })

  it.each([0, 6, -1, 2.5])('rejects the rating %s', (rating) => {
    const result = companyReviewFormSchema.safeParse({ sentiment: 'Positive', ratings: { communication: rating } })
    expect(result.success).toBe(false)
  })

  it.each([1, 5])('accepts the boundary rating %s', (rating) => {
    const result = companyReviewFormSchema.safeParse({ sentiment: 'Positive', ratings: { communication: rating } })
    expect(result.success).toBe(true)
  })

  it('accepts a comment of exactly 2000 characters and rejects 2001', () => {
    const ok = companyReviewFormSchema.safeParse({ sentiment: 'Positive', comment: 'a'.repeat(2000), ratings: emptyRatings })
    const tooLong = companyReviewFormSchema.safeParse({ sentiment: 'Positive', comment: 'a'.repeat(2001), ratings: emptyRatings })

    expect(ok.success).toBe(true)
    expect(tooLong.success).toBe(false)
    if (!tooLong.success) {
      expect(tooLong.error.issues[0].message).toBe('Feedback must not exceed 2000 characters.')
    }
  })

  it('does not count surrounding whitespace towards the comment limit', () => {
    const padded = `  ${'a'.repeat(2000)}  `
    expect(companyReviewFormSchema.safeParse({ sentiment: 'Positive', comment: padded, ratings: emptyRatings }).success).toBe(true)
  })
})
