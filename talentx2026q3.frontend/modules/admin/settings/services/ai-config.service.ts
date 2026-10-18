import { apiClient } from "@/lib/api/axios";
import type { AiConfiguration, UpdateAiConfigRequest } from "../types/ai-config";

export async function getAiConfiguration(): Promise<AiConfiguration> {
  const response = await apiClient.get<AiConfiguration>("/admin/ai-configuration");
  return response.data;
}

export async function updateAiConfiguration(
  data: UpdateAiConfigRequest
): Promise<AiConfiguration> {
  const response = await apiClient.put<AiConfiguration>("/admin/ai-configuration", data);
  return response.data;
}
