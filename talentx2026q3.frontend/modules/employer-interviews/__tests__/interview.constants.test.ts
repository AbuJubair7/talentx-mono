import {
  INTERVIEW_ENDPOINTS,
  INTERVIEW_QUERY_KEYS,
  INTERVIEW_STATUS_STYLES,
  INTERVIEW_TYPE_OPTIONS,
} from '../constants/interview.constants'

describe('INTERVIEW_ENDPOINTS', () => {
  it('builds the send-batch and list URLs from a job id', () => {
    expect(INTERVIEW_ENDPOINTS.sendBatch('job-1')).toBe('/jobs/job-1/interviews/send-batch')
    expect(INTERVIEW_ENDPOINTS.jobInterviews('job-1')).toBe('/jobs/job-1/interviews')
  })
})

describe('INTERVIEW_QUERY_KEYS', () => {
  it('nests each level as a prefix of the next', () => {
    expect(INTERVIEW_QUERY_KEYS.all).toEqual(['employer-interviews'])
    expect(INTERVIEW_QUERY_KEYS.lists()).toEqual(['employer-interviews', 'list'])
    expect(INTERVIEW_QUERY_KEYS.jobLists('job-1')).toEqual(['employer-interviews', 'list', 'job-1'])
  })

  it('appends the query params object as the leaf segment', () => {
    expect(INTERVIEW_QUERY_KEYS.list('job-1', { page: 2, pageSize: 10 })).toEqual([
      'employer-interviews',
      'list',
      'job-1',
      { page: 2, pageSize: 10 },
    ])
  })

  it('keeps different jobs on independent key branches', () => {
    expect(INTERVIEW_QUERY_KEYS.jobLists('job-1')).not.toEqual(INTERVIEW_QUERY_KEYS.jobLists('job-2'))
  })
})

describe('INTERVIEW_TYPE_OPTIONS', () => {
  it('exposes the three interview types with human labels', () => {
    expect(INTERVIEW_TYPE_OPTIONS.map((o) => o.value)).toEqual(['OnlineAssessment', 'OnCall', 'OnSite'])
    expect(INTERVIEW_TYPE_OPTIONS.find((o) => o.value === 'OnlineAssessment')?.label).toBe('Online Assessment')
  })
})

describe('INTERVIEW_STATUS_STYLES', () => {
  it('has a style entry for every lowercased status', () => {
    expect(Object.keys(INTERVIEW_STATUS_STYLES).sort()).toEqual(
      ['accepted', 'cancelled', 'declined', 'pending'].sort()
    )
  })
})
