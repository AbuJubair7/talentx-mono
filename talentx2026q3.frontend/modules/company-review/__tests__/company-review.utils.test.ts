import { makeReview } from '@/tests/test-utils/company-review-fixtures'

import { toFormDefaults, toReviewContentPayload } from '../utils/company-review.utils'

describe('toReviewContentPayload', () => {
  it('trims the comment and sends skipped ratings as null', () => {
    const payload = toReviewContentPayload({
      sentiment: 'Positive',
      comment: '  Great team.  ',
      ratings: { recruitmentProcess: 5, communication: undefined },
    })

    expect(payload).toEqual({
      sentiment: 'Positive',
      comment: 'Great team.',
      ratings: { recruitmentProcess: 5, communication: null, interviewExperience: null, professionalism: null },
    })
  })

  it.each([undefined, '', '   '])('omits a blank comment (%p)', (comment) => {
    const payload = toReviewContentPayload({ sentiment: 'Negative', comment, ratings: {} })
    expect(payload.comment).toBeUndefined()
  })
})

describe('toFormDefaults', () => {
  it('is empty for a new review', () => {
    expect(toFormDefaults(null)).toEqual({ comment: '', ratings: {} })
  })

  it('maps a saved review back to form values (null → undefined)', () => {
    const defaults = toFormDefaults(makeReview({ sentiment: 'Negative', comment: null }))

    expect(defaults).toEqual({
      sentiment: 'Negative',
      comment: '',
      ratings: { recruitmentProcess: 5, communication: 4, interviewExperience: undefined, professionalism: 3 },
    })
  })
})
