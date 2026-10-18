import { apiClient } from '@/lib/api/axios';
import type { InterviewPreparationDto, InterviewPreparationQuota, SaveAnswerPayload } from '../types';

const BASE_URL = '/talents/me/interviews';

export const interviewPreparationService = {
  getPreparationQuota: async (signal?: AbortSignal): Promise<InterviewPreparationQuota> => {
    const { data } = await apiClient.get<InterviewPreparationQuota>(
      `${BASE_URL}/preparation/quota`,
      { signal }
    );
    return data;
  },

  getPreparation: async (invitationId: string, signal?: AbortSignal): Promise<InterviewPreparationDto> => {
    const { data } = await apiClient.get<InterviewPreparationDto>(
      `${BASE_URL}/${invitationId}/preparation`,
      { signal }
    );
    return data;
  },

  generatePreparation: async (invitationId: string): Promise<InterviewPreparationDto> => {
    const { data } = await apiClient.post<InterviewPreparationDto>(
      `${BASE_URL}/${invitationId}/preparation`
    );
    return data;
  },

  regeneratePreparation: async (invitationId: string): Promise<InterviewPreparationDto> => {
    const { data } = await apiClient.post<InterviewPreparationDto>(
      `${BASE_URL}/${invitationId}/preparation/regenerate`
    );
    return data;
  },

  generateMoreQuestions: async (invitationId: string): Promise<InterviewPreparationDto> => {
    const { data } = await apiClient.post<InterviewPreparationDto>(
      `${BASE_URL}/${invitationId}/preparation/additional-questions`
    );
    return data;
  },

  saveAnswer: async (
    invitationId: string,
    payload: SaveAnswerPayload
  ): Promise<InterviewPreparationDto> => {
    const { data } = await apiClient.put<InterviewPreparationDto>(
      `${BASE_URL}/${invitationId}/preparation/answers`,
      payload
    );
    return data;
  },

  evaluateAnswers: async (invitationId: string): Promise<InterviewPreparationDto> => {
    const { data } = await apiClient.post<InterviewPreparationDto>(
      `${BASE_URL}/${invitationId}/preparation/evaluate`
    );
    return data;
  },
};
