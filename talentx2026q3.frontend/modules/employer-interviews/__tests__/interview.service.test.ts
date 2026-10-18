import { apiClient } from '@/lib/api/axios'

import { interviewService } from '../services/interview.service'
import type { PaginatedInterviewList, EmployerInterviewDto, SendInterviewBatchPayload } from '../types/interview.types'

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}))

const mockedGet = jest.mocked(apiClient.get)
const mockedPost = jest.mocked(apiClient.post)

afterEach(() => jest.clearAllMocks())

describe('interviewService.sendBatch', () => {
  const payload: SendInterviewBatchPayload = {
    applicationIds: ['app-1', 'app-2'],
    type: 'OnlineAssessment',
    assessmentUrl: 'https://hackerrank.test/x',
    assessmentDeadline: '2030-01-01T00:00:00.000Z',
  }

  const mockResponse = {
    totalProcessed: 2,
    invitedCount: 2,
    skippedCount: 0,
    results: [
      { applicationId: 'app-1', candidateName: 'Alex', candidateEmail: 'alex@test.com', success: true },
      { applicationId: 'app-2', candidateName: 'Sam', candidateEmail: 'sam@test.com', success: true },
    ],
  }

  it('POSTs the payload to /jobs/:jobId/interviews/send-batch and returns the result', async () => {
    mockedPost.mockResolvedValueOnce({ data: mockResponse })

    const result = await interviewService.sendBatch('job-1', payload)

    expect(mockedPost).toHaveBeenCalledWith('/jobs/job-1/interviews/send-batch', payload)
    expect(result).toEqual(mockResponse)
  })

  it('propagates a partial response (with skipped candidate)', async () => {
    const partialResponse = {
      totalProcessed: 2,
      invitedCount: 1,
      skippedCount: 1,
      results: [
        { applicationId: 'app-1', candidateName: 'Alex', candidateEmail: 'alex@test.com', success: true },
        { applicationId: 'app-2', candidateName: 'Sam', candidateEmail: 'sam@test.com', success: false, skipReason: 'Pending invite exists' },
      ],
    }
    mockedPost.mockResolvedValueOnce({ data: partialResponse })
    await expect(interviewService.sendBatch('job-1', payload)).resolves.toEqual(partialResponse)
  })

  it('forwards force: true in the payload unchanged', async () => {
    const forcePayload: SendInterviewBatchPayload = { ...payload, applicationIds: ['app-2'], force: true }
    mockedPost.mockResolvedValueOnce({ data: mockResponse })

    await interviewService.sendBatch('job-1', forcePayload)

    expect(mockedPost).toHaveBeenCalledWith('/jobs/job-1/interviews/send-batch', forcePayload)
  })
})

describe('interviewService.getJobInterviews', () => {
  const page: PaginatedInterviewList<EmployerInterviewDto> = {
    items: [],
    page: 2,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  }

  it('GETs /jobs/:jobId/interviews forwarding params and the abort signal', async () => {
    mockedGet.mockResolvedValueOnce({ data: page })
    const controller = new AbortController()

    const result = await interviewService.getJobInterviews('job-1', { page: 2, pageSize: 10 }, controller.signal)

    expect(mockedGet).toHaveBeenCalledWith('/jobs/job-1/interviews', {
      params: { page: 2, pageSize: 10 },
      signal: controller.signal,
    })
    expect(result).toBe(page)
  })
})
