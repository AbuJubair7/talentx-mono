import { apiClient } from "@/lib/api/axios";
import {
  getAiConfiguration,
  updateAiConfiguration,
} from "../services/ai-config.service";
import type { AiConfiguration, UpdateAiConfigRequest } from "../types/ai-config";

jest.mock("@/lib/api/axios", () => ({
  apiClient: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("ai-config.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getAiConfiguration calls GET /admin/ai-configuration", async () => {
    const mockData: AiConfiguration = {
      modelName: "gemini-3.7-flash",
      maskedApiKey: "••••••••",
      hasCustomKey: true,
      updatedAt: "2026-10-05T10:00:00.000Z",
    };
    mockedApiClient.get.mockResolvedValueOnce({ data: mockData });

    const result = await getAiConfiguration();

    expect(mockedApiClient.get).toHaveBeenCalledWith("/admin/ai-configuration");
    expect(result).toEqual(mockData);
  });

  it("updateAiConfiguration calls PUT /admin/ai-configuration with payload", async () => {
    const payload: UpdateAiConfigRequest = {
      modelName: "gemini-2.5-flash",
      apiKey: "new-api-key",
    };
    const mockData: AiConfiguration = {
      modelName: "gemini-2.5-flash",
      maskedApiKey: "••••••••",
      hasCustomKey: true,
      updatedAt: "2026-10-05T10:00:00.000Z",
    };
    mockedApiClient.put.mockResolvedValueOnce({ data: mockData });

    const result = await updateAiConfiguration(payload);

    expect(mockedApiClient.put).toHaveBeenCalledWith(
      "/admin/ai-configuration",
      payload
    );
    expect(result).toEqual(mockData);
  });
});
