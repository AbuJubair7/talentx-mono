import {
  INTERVIEW_TYPE_LABELS,
  TALENT_INTERVIEW_ENDPOINTS,
  TALENT_INTERVIEW_QUERY_KEYS,
} from '../constants/interview.constants'

describe('TALENT_INTERVIEW_ENDPOINTS', () => {
  it('builds the list / accept / decline URLs', () => {
    expect(TALENT_INTERVIEW_ENDPOINTS.myInterviews()).toBe('/talents/me/interviews')
    expect(TALENT_INTERVIEW_ENDPOINTS.accept('inv-1')).toBe('/talents/me/interviews/inv-1/accept')
    expect(TALENT_INTERVIEW_ENDPOINTS.decline('inv-1')).toBe('/talents/me/interviews/inv-1/decline')
  })
})

describe('TALENT_INTERVIEW_QUERY_KEYS', () => {
  it('nests list keys under the module root', () => {
    expect(TALENT_INTERVIEW_QUERY_KEYS.all).toEqual(['talent-interviews'])
    expect(TALENT_INTERVIEW_QUERY_KEYS.lists()).toEqual(['talent-interviews', 'list'])
    expect(TALENT_INTERVIEW_QUERY_KEYS.list({ page: 1, pageSize: 10 })).toEqual([
      'talent-interviews',
      'list',
      { page: 1, pageSize: 10 },
    ])
  })
})

describe('INTERVIEW_TYPE_LABELS', () => {
  it('maps each interview type to a human label', () => {
    expect(INTERVIEW_TYPE_LABELS.OnlineAssessment).toBe('Online Assessment')
    expect(INTERVIEW_TYPE_LABELS.OnCall).toBe('On Call')
    expect(INTERVIEW_TYPE_LABELS.OnSite).toBe('On Site')
  })
})
