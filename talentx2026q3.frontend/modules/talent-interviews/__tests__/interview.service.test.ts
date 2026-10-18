import { apiClient } from '@/lib/api/axios'

import { talentInterviewService } from '../services/interview.service'
import type { PaginatedInterviewList, TalentInterviewDto } from '../types/interview.types'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}))

const mockedGet = jest.mocked(apiClient.get)
const mockedPost = jest.mocked(apiClient.post)

afterEach(() => jest.clearAllMocks())

describe('talentInterviewService.getMyInterviews', () => {
  it('GETs /talents/me/interviews forwarding params + signal', async () => {
    const page: PaginatedInterviewList<TalentInterviewDto> = {
      items: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    }
    mockedGet.mockResolvedValueOnce({ data: page })
    const controller = new AbortController()

    const result = await talentInterviewService.getMyInterviews({ page: 1, pageSize: 10 }, controller.signal)

    expect(mockedGet).toHaveBeenCalledWith('/talents/me/interviews', {
      params: { page: 1, pageSize: 10 },
      signal: controller.signal,
    })
    expect(result).toBe(page)
  })
})

describe('talentInterviewService.accept', () => {
  it('POSTs the selected timeslot to the accept endpoint', async () => {
    mockedPost.mockResolvedValueOnce({ data: { message: 'Accepted' } })

    const result = await talentInterviewService.accept('inv-1', { selectedTimeslotId: 'slot-9' })

    expect(mockedPost).toHaveBeenCalledWith('/talents/me/interviews/inv-1/accept', { selectedTimeslotId: 'slot-9' })
    expect(result).toEqual({ message: 'Accepted' })
  })

  it('normalises an empty body to {}', async () => {
    mockedPost.mockResolvedValueOnce({ data: undefined })
    await expect(talentInterviewService.accept('inv-1', {})).resolves.toEqual({})
  })
})

describe('talentInterviewService.decline', () => {
  it('POSTs the reason to the decline endpoint', async () => {
    mockedPost.mockResolvedValueOnce({ data: { message: 'Declined' } })

    const result = await talentInterviewService.decline('inv-1', { reason: 'Accepted another offer' })

    expect(mockedPost).toHaveBeenCalledWith('/talents/me/interviews/inv-1/decline', {
      reason: 'Accepted another offer',
    })
    expect(result).toEqual({ message: 'Declined' })
  })

  it('normalises an empty body to {}', async () => {
    mockedPost.mockResolvedValueOnce({ data: null })
    await expect(talentInterviewService.decline('inv-1', {})).resolves.toEqual({})
  })
})
