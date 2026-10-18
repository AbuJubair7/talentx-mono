export interface AiConfiguration {
  modelName: string;
  maskedApiKey: string;
  hasCustomKey: boolean;
  updatedAt: string | null;
}

export interface UpdateAiConfigRequest {
  modelName: string;
  apiKey?: string;
}
