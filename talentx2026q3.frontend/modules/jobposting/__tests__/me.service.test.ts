import { apiClient } from "@/lib/api/axios"
import { meService } from "../services/me.service"

jest.mock("@/lib/api/axios", () => ({
  apiClient: { get: jest.fn() },
}))

const mockedGet = jest.mocked(apiClient.get)

afterEach(() => {
  jest.clearAllMocks()
})

describe("meService", () => {
  describe("getCurrentEmployer", () => {
    it("calls GET /employers/me", async () => {
      mockedGet.mockResolvedValueOnce({
        data: { id: "employer-1", companyName: "Acme Corp" },
      })

      await meService.getCurrentEmployer()

      expect(mockedGet).toHaveBeenCalledWith("/employers/me")
    })

    it("returns the employer data", async () => {
      mockedGet.mockResolvedValueOnce({
        data: { id: "employer-1", companyName: "Acme Corp" },
      })

      const result = await meService.getCurrentEmployer()

      expect(result).toEqual({ id: "employer-1", companyName: "Acme Corp" })
    })

    it("propagates API errors", async () => {
      mockedGet.mockRejectedValueOnce(new Error("Network error"))

      await expect(meService.getCurrentEmployer()).rejects.toThrow("Network error")
    })
  })
})
