import { renderHook, waitFor } from "@testing-library/react"

import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper"

import { useUpdateTalentProfile } from "../hooks/useUpdateTalentProfile"
import { talentProfileService } from "../services/talent-profile.service"

jest.mock("../services/talent-profile.service")
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

const mockedTalentProfileService = talentProfileService as jest.Mocked<typeof talentProfileService>

describe("useUpdateTalentProfile", () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it("calls updateMyProfile with the given payload", async () => {
    mockedTalentProfileService.updateMyProfile.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useUpdateTalentProfile(), { wrapper: createQueryWrapper() })

    result.current.mutate({ name: "Ada Lovelace", location: "Dhaka" })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedTalentProfileService.updateMyProfile).toHaveBeenCalledWith({
      name: "Ada Lovelace",
      location: "Dhaka",
    })
  })

  it("surfaces a mutation error", async () => {
    mockedTalentProfileService.updateMyProfile.mockRejectedValueOnce({
      status: 400,
      message: "Validation failed",
      errors: ["Bio must not exceed 1000 characters."],
    })

    const { result } = renderHook(() => useUpdateTalentProfile(), { wrapper: createQueryWrapper() })

    result.current.mutate({ name: "Ada Lovelace" })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
