export interface InterviewPreparationConfig {
  id: string;
  dailyGenerateLimit: number;
  dailyGenerationLimit: number;
  maxRegenerationCount: number;
  accessWindowAfterInterviewMinutes: number;
  createdAt: string;
  updatedAt: string | null;
}
