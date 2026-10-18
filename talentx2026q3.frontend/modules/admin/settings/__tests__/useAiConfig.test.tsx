import { renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper";
import { useAiConfiguration, useUpdateAiConfiguration } from "../hooks/useAiConfig";
import {
  getAiConfiguration,
  updateAiConfiguration,
} from "../services/ai-config.service";
import type { AiConfiguration, UpdateAiConfigRequest } from "../types/ai-config";

jest.mock("../services/ai-config.service");
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedGetAiConfiguration = getAiConfiguration as jest.MockedFunction<
  typeof getAiConfiguration
>;
const mockedUpdateAiConfiguration = updateAiConfiguration as jest.MockedFunction<
  typeof updateAiConfiguration
>;

describe("useAiConfig hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useAiConfiguration", () => {
    it("fetches AI configuration successfully", async () => {
      const mockData: AiConfiguration = {
        modelName: "gemini-3.7-flash",
        maskedApiKey: "••••••••",
        hasCustomKey: true,
        updatedAt: null,
      };
      mockedGetAiConfiguration.mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useAiConfiguration(), {
        wrapper: createQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
      expect(mockedGetAiConfiguration).toHaveBeenCalledTimes(1);
    });
  });

  describe("useUpdateAiConfiguration", () => {
    it("mutates AI configuration and displays success toast", async () => {
      const payload: UpdateAiConfigRequest = {
        modelName: "gemini-2.5-flash",
      };
      const mockUpdated: AiConfiguration = {
        modelName: "gemini-2.5-flash",
        maskedApiKey: "••••••••",
        hasCustomKey: true,
        updatedAt: "2026-10-05T12:00:00Z",
      };
      mockedUpdateAiConfiguration.mockResolvedValueOnce(mockUpdated);

      const { result } = renderHook(() => useUpdateAiConfiguration(), {
        wrapper: createQueryWrapper(),
      });

      result.current.mutate(payload);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedUpdateAiConfiguration).toHaveBeenCalledWith(payload);
      expect(toast.success).toHaveBeenCalledWith("AI configuration updated successfully");
    });

    it("displays error toast on mutation failure", async () => {
      const payload: UpdateAiConfigRequest = {
        modelName: "invalid-model",
      };
      mockedUpdateAiConfiguration.mockRejectedValueOnce({
        message: "Invalid model specified",
      });

      const { result } = renderHook(() => useUpdateAiConfiguration(), {
        wrapper: createQueryWrapper(),
      });

      result.current.mutate(payload);

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith("Invalid model specified");
    });
  });
});
