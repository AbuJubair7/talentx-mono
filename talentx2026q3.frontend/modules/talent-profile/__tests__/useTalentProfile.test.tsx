import { renderHook, waitFor } from "@testing-library/react"

import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper"

import { useTalentProfile } from "../hooks/useTalentProfile"
import { talentProfileService } from "../services/talent-profile.service"
import type { TalentProfileDto } from "../types/talent-profile.types"

jest.mock("../services/talent-profile.service")

const mockedTalentProfileService = talentProfileService as jest.Mocked<typeof talentProfileService>

const profile: TalentProfileDto = {
  id: "talent-1",
  userId: "user-1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  tagline: null,
  shortBio: null,
  location: null,
  phone: null,
  linkedInUrl: null,
  additionalUrls: [],
  totalYearsExperience: null,
  expectedSalary: null,
  skillPropositions: [],
  technicalSkills: [],
  softSkills: [],
  toolsAndPlatforms: [],
  profilePictureUrl: null,
  videoIntroUrl: null,
  resumeOriginalFileName: null,
  resumeUrl: null,
  resumes: [],
  workExperiences: [],
  educations: [],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: null,
}

describe("useTalentProfile", () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it("returns the fetched profile on success", async () => {
    mockedTalentProfileService.getMyProfile.mockResolvedValueOnce(profile)

    const { result } = renderHook(() => useTalentProfile(), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(profile)
    expect(mockedTalentProfileService.getMyProfile).toHaveBeenCalledTimes(1)
  })

  it("does not retry on a 404", async () => {
    mockedTalentProfileService.getMyProfile.mockRejectedValue({ status: 404, message: "Not found" })

    const { result } = renderHook(() => useTalentProfile(), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockedTalentProfileService.getMyProfile).toHaveBeenCalledTimes(1)
  })
})
