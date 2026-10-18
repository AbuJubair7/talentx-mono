import { createSendInterviewSchema, type SendInterviewFormValues } from '../schemas/send-interview-schema'

/** `YYYY-MM-DDTHH:mm` (the shape a <input type="datetime-local"> produces), offset from now. */
function localDateTime(daysFromNow: number): string {
  return new Date(Date.now() + daysFromNow * 86_400_000).toISOString().slice(0, 16)
}

type Input = Partial<SendInterviewFormValues>

function baseValues(overrides: Input = {}): Input {
  return {
    type: 'OnlineAssessment',
    assessmentUrl: '',
    assessmentDeadline: '',
    locationOrLink: '',
    instructions: '',
    timeslots: [],
    ...overrides,
  }
}

/** Finds the issue whose `path` exactly matches, regardless of ordering. */
function issueAt(result: ReturnType<ReturnType<typeof createSendInterviewSchema>['safeParse']>, path: (string | number)[]) {
  if (result.success) return undefined
  return result.error.issues.find((i) => JSON.stringify(i.path) === JSON.stringify(path))
}

describe('createSendInterviewSchema', () => {
  describe('OnlineAssessment', () => {
    const schema = createSendInterviewSchema(1)

    it('requires an assessment URL', () => {
      const result = schema.safeParse(baseValues({ assessmentDeadline: localDateTime(3) }))
      expect(issueAt(result, ['assessmentUrl'])?.message).toBe(
        'Assessment URL is required for an online assessment.'
      )
    })

    it('requires a deadline', () => {
      const result = schema.safeParse(baseValues({ assessmentUrl: 'https://hackerrank.test/x' }))
      expect(issueAt(result, ['assessmentDeadline'])?.message).toBe(
        'A deadline is required for an online assessment.'
      )
    })

    it('rejects a deadline in the past', () => {
      const result = schema.safeParse(
        baseValues({ assessmentUrl: 'https://hackerrank.test/x', assessmentDeadline: localDateTime(-1) })
      )
      expect(issueAt(result, ['assessmentDeadline'])?.message).toBe('Deadline must be in the future.')
    })

    it('accepts a URL + future deadline', () => {
      const result = schema.safeParse(
        baseValues({ assessmentUrl: 'https://hackerrank.test/x', assessmentDeadline: localDateTime(3) })
      )
      expect(result.success).toBe(true)
    })

    it('does not require location or timeslots', () => {
      const result = schema.safeParse(
        baseValues({ assessmentUrl: 'https://hackerrank.test/x', assessmentDeadline: localDateTime(3) })
      )
      expect(issueAt(result, ['locationOrLink'])).toBeUndefined()
      expect(issueAt(result, ['timeslots'])).toBeUndefined()
    })

    it('caps the assessment URL length', () => {
      const result = schema.safeParse(
        baseValues({ assessmentUrl: `https://x.test/${'a'.repeat(1000)}`, assessmentDeadline: localDateTime(3) })
      )
      expect(issueAt(result, ['assessmentUrl'])?.message).toContain('1000 characters')
    })
  })

  describe('OnCall / OnSite', () => {
    it('requires a meeting link for OnCall', () => {
      const result = createSendInterviewSchema(1).safeParse(
        baseValues({
          type: 'OnCall',
          timeslots: [{ startTime: localDateTime(2), endTime: localDateTime(3) }],
        })
      )
      expect(issueAt(result, ['locationOrLink'])?.message).toBe('A meeting link is required.')
    })

    it('requires an office address for OnSite', () => {
      const result = createSendInterviewSchema(1).safeParse(
        baseValues({
          type: 'OnSite',
          timeslots: [{ startTime: localDateTime(2), endTime: localDateTime(3) }],
        })
      )
      expect(issueAt(result, ['locationOrLink'])?.message).toBe('An office address is required.')
    })

    it('requires at least one timeslot', () => {
      const result = createSendInterviewSchema(1).safeParse(
        baseValues({ type: 'OnCall', locationOrLink: 'https://meet.test/abc', timeslots: [] })
      )
      expect(issueAt(result, ['timeslots'])?.message).toBe('Please add one timeslot for each talent.')
    })

    it('requires at least one timeslot per invited candidate', () => {
      const result = createSendInterviewSchema(3).safeParse(
        baseValues({
          type: 'OnCall',
          locationOrLink: 'https://meet.test/abc',
          timeslots: [{ startTime: localDateTime(2), endTime: localDateTime(3) }],
        })
      )
      expect(issueAt(result, ['timeslots'])?.message).toBe(
        'Offer at least 3 timeslots — one per invited candidate — so everyone has a slot to choose from.'
      )
    })

    it('accepts a valid OnCall payload', () => {
      const result = createSendInterviewSchema(2).safeParse(
        baseValues({
          type: 'OnCall',
          locationOrLink: 'https://meet.test/abc',
          timeslots: [
            { startTime: localDateTime(2), endTime: localDateTime(3) },
            { startTime: localDateTime(4), endTime: localDateTime(5), meetingUrl: 'https://meet.test/2' },
          ],
        })
      )
      expect(result.success).toBe(true)
    })

    it('flags a timeslot whose start is in the past', () => {
      const result = createSendInterviewSchema(1).safeParse(
        baseValues({
          type: 'OnCall',
          locationOrLink: 'https://meet.test/abc',
          timeslots: [{ startTime: localDateTime(-1), endTime: localDateTime(3) }],
        })
      )
      expect(issueAt(result, ['timeslots', 0, 'startTime'])?.message).toBe('Start time must be in the future.')
    })

    it('flags a timeslot whose end is not after its start', () => {
      const result = createSendInterviewSchema(1).safeParse(
        baseValues({
          type: 'OnCall',
          locationOrLink: 'https://meet.test/abc',
          timeslots: [{ startTime: localDateTime(5), endTime: localDateTime(4) }],
        })
      )
      expect(issueAt(result, ['timeslots', 1 - 1, 'endTime'])?.message).toBe('End time must be after start time.')
    })

    it('flags an empty start/end on an added-but-unfilled slot', () => {
      const result = createSendInterviewSchema(1).safeParse(
        baseValues({
          type: 'OnCall',
          locationOrLink: 'https://meet.test/abc',
          timeslots: [{ startTime: '', endTime: '' }],
        })
      )
      expect(issueAt(result, ['timeslots', 0, 'startTime'])?.message).toBe('Start time is required.')
      expect(issueAt(result, ['timeslots', 0, 'endTime'])?.message).toBe('End time is required.')
    })
  })

  it('is a factory whose candidate-count rule is captured at creation time', () => {
    const forFive = createSendInterviewSchema(5)
    const result = forFive.safeParse(
      baseValues({
        type: 'OnSite',
        locationOrLink: '123 Main St',
        timeslots: [{ startTime: localDateTime(2), endTime: localDateTime(3) }],
      })
    )
    expect(issueAt(result, ['timeslots'])?.message).toContain('at least 5 timeslots')
  })
})
