import { apiClient } from "@/lib/api/axios";
import { InterviewPreparationConfig } from "../types/config";

export async function fetchInterviewPrepConfig(): Promise<InterviewPreparationConfig> {
  const response = await apiClient.get<InterviewPreparationConfig>("/admin/interview-preparation-config");
  return response.data;
}

export type UpdateInterviewPrepConfigData = Omit<InterviewPreparationConfig, "id" | "createdAt" | "updatedAt">;

export async function updateInterviewPrepConfig(data: UpdateInterviewPrepConfigData): Promise<InterviewPreparationConfig> {
  const response = await apiClient.put<InterviewPreparationConfig>("/admin/interview-preparation-config", data);
  return response.data;
}
