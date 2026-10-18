export interface PrepQuestion {
  question: string;
  category: string;
  tip: string | null;
}

export interface PrepAnswerDto {
  category: string;
  questionIndex: number;
  question: string;
  answer: string;
  practiced: boolean;
}

export interface QuestionFeedback {
  category: string;
  questionIndex: number;
  score: number;
  feedback: string;
  suggestedAnswer: string | null;
}

export interface EvaluationDto {
  overallScore: number;
  summary: string;
  strengths: string[];
  areasToImprove: string[];
  questionFeedback: QuestionFeedback[];
  answeredCount: number;
  totalCount: number;
  evaluatedAt: string;
}

export interface AnswerEntry {
  text: string;
  practiced: boolean;
}

export type AnswerMap = Record<string, AnswerEntry>;

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface SaveAnswerPayload {
  category: string;
  questionIndex: number;
  answer: string;
  practiced: boolean;
}

export interface InterviewPreparationQuota {
  dailyGenerateLimit: number;
  dailyGenerationLimit: number;
  maxRegenerationCount: number;
  accessWindowAfterInterviewMinutes: number;
  generatesUsedToday: number;
  generationsUsedToday: number;
  remainingGeneratesToday: number;
  remainingGenerationsToday: number;
}

export interface InterviewPreparationDto {
  id: string;
  interviewInvitationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  interviewType: string;
  scheduledAt: string | null;
  status: string;
  technicalQuestions: PrepQuestion[];
  behavioralQuestions: PrepQuestion[];
  experienceBasedQuestions: PrepQuestion[];
  roleSpecificQuestions: PrepQuestion[];
  keyTopicsToPrepare: string[];
  suggestedRevisionAreas: string[];
  additionalQuestions: PrepQuestion[] | null;
  generationCount: number;
  generatedAt: string;
  isAccessible: boolean;
  answers: PrepAnswerDto[];
  evaluation: EvaluationDto | null;
  disclaimer: string;
}
