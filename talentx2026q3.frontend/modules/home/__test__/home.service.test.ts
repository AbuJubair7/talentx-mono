import { getRecentJobs, getJobById } from '../services/home.service'
import { apiClient } from '@/lib/api/axios'
import type { JobDto } from '@/types/job'

// Mock the HTTP client so no real network call happens and we can assert
// exactly what the service requests and how it unwraps the response.
jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn() },
}))
const mockedGet = jest.mocked(apiClient.get)

const sampleJob: JobDto = {
  id: 'job-1',
  title: 'Backend Engineer (.NET)',
  companyName: 'Northwind Labs',
  location: 'Remote',
  employmentType: 'Contract',
  experienceLevel: 'SeniorLevel',
  workArrangement: 'FullRemote',
  requiredSkills: ['C#', '.NET'],
  createdAt: '2026-08-01T00:00:00Z',
  expireAt: '2026-12-31T00:00:00Z',
}

afterEach(() => {
  jest.clearAllMocks()
})

describe('home.service', () => {
  describe('getRecentJobs', () => {
    it('calls GET /jobs with page 1 and pageSize 6', async () => {
      mockedGet.mockResolvedValueOnce({ data: { items: [sampleJob] } })
      await getRecentJobs()
      expect(mockedGet).toHaveBeenCalledWith('/jobs', {
        params: { page: 1, pageSize: 6 },
      })
    })

    it('returns the items array from the paged response', async () => {
      mockedGet.mockResolvedValueOnce({ data: { items: [sampleJob] } })
      const jobs = await getRecentJobs()
      expect(jobs).toEqual([sampleJob])
    })

    it('returns each job with the fields the UI depends on', async () => {
      mockedGet.mockResolvedValueOnce({ data: { items: [sampleJob] } })
      const [job] = await getRecentJobs()
      expect(job).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          companyName: expect.any(String),
          employmentType: expect.any(String),
          location: expect.any(String),
        }),
      )
    })

    it('returns an empty array when the API returns no items', async () => {
      mockedGet.mockResolvedValueOnce({ data: { items: [] } })
      const jobs = await getRecentJobs()
      expect(jobs).toEqual([])
    })

    it('propagates an error when the request fails', async () => {
      mockedGet.mockRejectedValueOnce(new Error('network down'))
      await expect(getRecentJobs()).rejects.toThrow('network down')
    })
  })

  describe('getJobById', () => {
    it('calls GET /jobs/:id with the given id', async () => {
      mockedGet.mockResolvedValueOnce({ data: sampleJob })
      await getJobById('job-1')
      expect(mockedGet).toHaveBeenCalledWith('/jobs/job-1')
    })

    it('returns the job when found', async () => {
      mockedGet.mockResolvedValueOnce({ data: sampleJob })
      const job = await getJobById('job-1')
      expect(job?.id).toBe('job-1')
    })

    it('returns null when the API returns no data', async () => {
      mockedGet.mockResolvedValueOnce({ data: null })
      const job = await getJobById('missing')
      expect(job).toBeNull()
    })
  })
})