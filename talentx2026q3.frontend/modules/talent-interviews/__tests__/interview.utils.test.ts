import { getDisplayStatus, isPast } from '../utils/interview.utils'
import type { TalentInterviewDto } from '../types/interview.types'

function makeInterview(overrides: Partial<TalentInterviewDto> = {}): TalentInterviewDto {
  return {
    id: 'inv-1',
    jobId: 'job-1',
    jobApplicationId: 'app-1',
    jobTitle: 'Backend Engineer',
    companyName: 'Acme',
    type: 'OnCall',
    status: 'Pending',
    assessmentUrl: null,
    assessmentDeadline: null,
    locationOrLink: null,
    instructions: null,
    selectedTimeslotId: null,
    scheduledAt: null,
    sentAt: '2026-03-01T12:00:00Z',
    respondedAt: null,
    timeslots: [],
    ...overrides,
  }
}

const NOW = new Date('2026-01-01T00:00:00Z')

describe('isPast', () => {
  it('returns false when there is no date to compare against', () => {
    expect(isPast(makeInterview(), NOW)).toBe(false)
  })

  it('uses scheduledAt when present', () => {
    expect(isPast(makeInterview({ scheduledAt: '2020-01-01T00:00:00Z' }), NOW)).toBe(true)
    expect(isPast(makeInterview({ scheduledAt: '2030-01-01T00:00:00Z' }), NOW)).toBe(false)
  })

  it('uses assessmentDeadline when present', () => {
    expect(isPast(makeInterview({ assessmentDeadline: '2020-01-01T00:00:00Z' }), NOW)).toBe(true)
    expect(isPast(makeInterview({ assessmentDeadline: '2030-01-01T00:00:00Z' }), NOW)).toBe(false)
  })

  it('is NOT past while at least one offered timeslot is still in the future', () => {
    const inv = makeInterview({
      timeslots: [
        { id: 't1', startTime: '2020-01-01T09:00:00Z', endTime: '2020-01-01T09:30:00Z', isBooked: false, meetingUrl: null },
        { id: 't2', startTime: '2026-06-01T09:00:00Z', endTime: '2026-06-01T09:30:00Z', isBooked: false, meetingUrl: null },
      ],
    })
    expect(isPast(inv, NOW)).toBe(false)
  })

  it('is past only once every offered timeslot has passed', () => {
    const inv = makeInterview({
      timeslots: [
        { id: 't1', startTime: '2020-01-01T09:00:00Z', endTime: '2020-01-01T09:30:00Z', isBooked: false, meetingUrl: null },
        { id: 't2', startTime: '2020-06-01T09:00:00Z', endTime: '2020-06-01T09:30:00Z', isBooked: false, meetingUrl: null },
      ],
    })
    expect(isPast(inv, NOW)).toBe(true)
  })
})

describe('getDisplayStatus', () => {
  it('maps a Pending + past invitation to "expired"', () => {
    const inv = makeInterview({ assessmentDeadline: '2020-01-01T00:00:00Z', type: 'OnlineAssessment' })
    expect(getDisplayStatus(inv, NOW)).toBe('expired')
  })

  it('maps a Pending invitation with a still-future timeslot to "pending", not "expired"', () => {
    const inv = makeInterview({
      timeslots: [
        { id: 't1', startTime: '2020-01-01T09:00:00Z', endTime: '2020-01-01T09:30:00Z', isBooked: false, meetingUrl: null },
        { id: 't2', startTime: '2026-06-01T09:00:00Z', endTime: '2026-06-01T09:30:00Z', isBooked: false, meetingUrl: null },
      ],
    })
    expect(getDisplayStatus(inv, NOW)).toBe('pending')
  })
})
