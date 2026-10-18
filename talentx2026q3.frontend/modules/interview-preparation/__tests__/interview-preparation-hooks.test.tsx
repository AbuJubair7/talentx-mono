import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';

import {
  createQueryWrapper,
  createTestQueryClient,
} from '@/tests/test-utils/query-client-wrapper';

import { PREPARATION_QUERY_KEYS } from '../constants';
import { useEvaluateAnswers } from '../hooks/use-evaluate';
import { useGeneratePreparation } from '../hooks/use-generate-preparation';
import { useMoreQuestions } from '../hooks/use-more-questions';
import { usePreparation } from '../hooks/use-preparation';
import { usePreparationQuota } from '../hooks/use-preparation-quota';
import { useRegeneratePreparation } from '../hooks/use-regenerate-preparation';
import { useSaveAnswer } from '../hooks/use-save-answer';
import { interviewPreparationService } from '../services/interview-preparation.service';
import type {
  EvaluationDto,
  InterviewPreparationDto,
  InterviewPreparationQuota,
  SaveAnswerPayload,
} from '../types';

jest.mock('../services/interview-preparation.service');
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() } }));

const mockedService = interviewPreparationService as jest.Mocked<
  typeof interviewPreparationService
>;

function makeQuota(overrides: Partial<InterviewPreparationQuota> = {}): InterviewPreparationQuota {
  return {
    dailyGenerateLimit: 5,
    dailyGenerationLimit: 10,
    maxRegenerationCount: 3,
    accessWindowAfterInterviewMinutes: 30,
    generatesUsedToday: 1,
    generationsUsedToday: 3,
    remainingGeneratesToday: 4,
    remainingGenerationsToday: 7,
    ...overrides,
  };
}

function makePreparation(overrides: Partial<InterviewPreparationDto> = {}): InterviewPreparationDto {
  return {
    id: 'prep-1',
    interviewInvitationId: 'inv-1',
    jobId: 'job-1',
    jobTitle: 'Backend Engineer',
    companyName: 'Acme',
    interviewType: 'Technical',
    scheduledAt: null,
    status: 'Generated',
    technicalQuestions: [],
    behavioralQuestions: [],
    experienceBasedQuestions: [],
    roleSpecificQuestions: [],
    keyTopicsToPrepare: [],
    suggestedRevisionAreas: [],
    additionalQuestions: null,
    generationCount: 1,
    generatedAt: '2026-09-26T08:00:00Z',
    isAccessible: true,
    answers: [],
    evaluation: null,
    disclaimer: '',
    ...overrides,
  };
}

function makeEvaluation(): EvaluationDto {
  return {
    overallScore: 88,
    summary: 'Solid answers overall.',
    strengths: ['Clear structure'],
    areasToImprove: ['Add metrics'],
    questionFeedback: [],
    answeredCount: 1,
    totalCount: 3,
    evaluatedAt: '2026-09-27T09:00:00Z',
  };
}

function withQueryClient(testQueryClient: QueryClient) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
}

function createRetryingQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: 3, retryDelay: 0, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

afterEach(() => jest.resetAllMocks());

describe('usePreparation', () => {
  it('fetches the preparation for the given invitation', async () => {
    const preparation = makePreparation();
    mockedService.getPreparation.mockResolvedValueOnce(preparation);

    const { result } = renderHook(() => usePreparation('inv-1'), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(preparation);
    expect(mockedService.getPreparation).toHaveBeenCalledWith('inv-1', expect.anything());
  });

  it('does not retry on a 404 (no preparation exists yet)', async () => {
    mockedService.getPreparation.mockRejectedValue({ status: 404, message: 'Not found' });
    const wrapper = withQueryClient(createRetryingQueryClient());

    const { result } = renderHook(() => usePreparation('inv-1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.status).toBe(404);
    expect(mockedService.getPreparation).toHaveBeenCalledTimes(1);
  });

  it('retries other failures up to three times', async () => {
    mockedService.getPreparation.mockRejectedValue({ status: 500, message: 'Boom' });
    const wrapper = withQueryClient(createRetryingQueryClient());

    const { result } = renderHook(() => usePreparation('inv-1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });
    expect(mockedService.getPreparation).toHaveBeenCalledTimes(4);
  });
});

describe('useGeneratePreparation', () => {
  it('generates, seeds the detail cache, and toasts on success', async () => {
    const preparation = makePreparation();
    mockedService.generatePreparation.mockResolvedValueOnce(preparation);
    const testQueryClient = createTestQueryClient();

    const { result } = renderHook(() => useGeneratePreparation(), {
      wrapper: withQueryClient(testQueryClient),
    });
    result.current.mutate('inv-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedService.generatePreparation).toHaveBeenCalledWith('inv-1');
    expect(testQueryClient.getQueryData(PREPARATION_QUERY_KEYS.detail('inv-1'))).toBe(
      preparation,
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Interview preparation generated successfully.',
    );
  });

  it('invalidates the daily quota cache after a successful generate', async () => {
    mockedService.generatePreparation.mockResolvedValueOnce(makePreparation());
    const testQueryClient = createTestQueryClient();
    testQueryClient.setQueryData(PREPARATION_QUERY_KEYS.quota(), makeQuota());

    const { result } = renderHook(() => useGeneratePreparation(), {
      wrapper: withQueryClient(testQueryClient),
    });
    result.current.mutate('inv-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      testQueryClient.getQueryState(PREPARATION_QUERY_KEYS.quota())?.isInvalidated,
    ).toBe(true);
  });

  it('shows the server message on failure', async () => {
    mockedService.generatePreparation.mockRejectedValue({
      status: 429,
      message: 'Daily interview preparation limit reached (5/day).',
    });

    const { result } = renderHook(() => useGeneratePreparation(), {
      wrapper: createQueryWrapper(),
    });
    result.current.mutate('inv-1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith(
      'Daily interview preparation limit reached (5/day).',
    );
  });

  it('falls back to a default message when the server sends none', async () => {
    mockedService.generatePreparation.mockRejectedValue({ status: 500, message: '' });

    const { result } = renderHook(() => useGeneratePreparation(), {
      wrapper: createQueryWrapper(),
    });
    result.current.mutate('inv-1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Failed to generate preparation.');
  });
});

describe('useRegeneratePreparation', () => {
  it('regenerates, seeds the detail cache, and toasts on success', async () => {
    const preparation = makePreparation({ generationCount: 2 });
    mockedService.regeneratePreparation.mockResolvedValueOnce(preparation);
    const testQueryClient = createTestQueryClient();
    testQueryClient.setQueryData(PREPARATION_QUERY_KEYS.quota(), makeQuota());

    const { result } = renderHook(() => useRegeneratePreparation(), {
      wrapper: withQueryClient(testQueryClient),
    });
    result.current.mutate('inv-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedService.regeneratePreparation).toHaveBeenCalledWith('inv-1');
    expect(testQueryClient.getQueryData(PREPARATION_QUERY_KEYS.detail('inv-1'))).toBe(
      preparation,
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Interview preparation regenerated successfully.',
    );
    expect(
      testQueryClient.getQueryState(PREPARATION_QUERY_KEYS.quota())?.isInvalidated,
    ).toBe(true);
  });

  it('falls back to a default message when the server sends none', async () => {
    mockedService.regeneratePreparation.mockRejectedValue({ status: 500, message: '' });

    const { result } = renderHook(() => useRegeneratePreparation(), {
      wrapper: createQueryWrapper(),
    });
    result.current.mutate('inv-1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Failed to regenerate preparation.');
  });
});

describe('useMoreQuestions', () => {
  it('requests more questions, seeds the detail cache, and toasts on success', async () => {
    const preparation = makePreparation({
      additionalQuestions: [{ question: 'Q?', category: 'Technical', tip: null }],
    });
    mockedService.generateMoreQuestions.mockResolvedValueOnce(preparation);
    const testQueryClient = createTestQueryClient();
    testQueryClient.setQueryData(PREPARATION_QUERY_KEYS.quota(), makeQuota());

    const { result } = renderHook(() => useMoreQuestions(), {
      wrapper: withQueryClient(testQueryClient),
    });
    result.current.mutate('inv-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedService.generateMoreQuestions).toHaveBeenCalledWith('inv-1');
    expect(testQueryClient.getQueryData(PREPARATION_QUERY_KEYS.detail('inv-1'))).toBe(
      preparation,
    );
    expect(toast.success).toHaveBeenCalledWith('More questions generated successfully.');
    expect(
      testQueryClient.getQueryState(PREPARATION_QUERY_KEYS.quota())?.isInvalidated,
    ).toBe(true);
  });

  it('falls back to a default message when the server sends none', async () => {
    mockedService.generateMoreQuestions.mockRejectedValue({ status: 500, message: '' });

    const { result } = renderHook(() => useMoreQuestions(), {
      wrapper: createQueryWrapper(),
    });
    result.current.mutate('inv-1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Failed to generate more questions.');
  });
});

describe('useSaveAnswer', () => {
  const payload: SaveAnswerPayload = {
    category: 'Technical',
    questionIndex: 0,
    answer: 'A scoped function.',
    practiced: true,
  };

  it('PUTs the answer and seeds the detail cache on success', async () => {
    const preparation = makePreparation();
    mockedService.saveAnswer.mockResolvedValueOnce(preparation);
    const testQueryClient = createTestQueryClient();

    const { result } = renderHook(() => useSaveAnswer(), {
      wrapper: withQueryClient(testQueryClient),
    });
    result.current.mutate({ invitationId: 'inv-1', payload });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedService.saveAnswer).toHaveBeenCalledWith('inv-1', payload);
    expect(testQueryClient.getQueryData(PREPARATION_QUERY_KEYS.detail('inv-1'))).toBe(
      preparation,
    );
  });

  it('shows the server message on failure', async () => {
    mockedService.saveAnswer.mockRejectedValue({ status: 400, message: 'Answer too long.' });

    const { result } = renderHook(() => useSaveAnswer(), {
      wrapper: createQueryWrapper(),
    });
    result.current.mutate({ invitationId: 'inv-1', payload });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Answer too long.');
  });

  it('falls back to a default message when the server sends none', async () => {
    mockedService.saveAnswer.mockRejectedValue({ status: 500, message: '' });

    const { result } = renderHook(() => useSaveAnswer(), {
      wrapper: createQueryWrapper(),
    });
    result.current.mutate({ invitationId: 'inv-1', payload });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Could not save your answer. Please try again.');
  });

  it('explains when the save cleared the report the cache was holding', async () => {
    const testQueryClient = createTestQueryClient();
    testQueryClient.setQueryData(
      PREPARATION_QUERY_KEYS.detail('inv-1'),
      makePreparation({ evaluation: makeEvaluation() }),
    );
    mockedService.saveAnswer.mockResolvedValueOnce(makePreparation({ evaluation: null }));

    const { result } = renderHook(() => useSaveAnswer(), {
      wrapper: withQueryClient(testQueryClient),
    });
    result.current.mutate({ invitationId: 'inv-1', payload });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.info).toHaveBeenCalledWith(
      'Your answer changed, so the AI report was cleared. Evaluate again for a fresh report.',
    );
  });

  it('stays quiet when the report survives the save', async () => {
    const testQueryClient = createTestQueryClient();
    testQueryClient.setQueryData(
      PREPARATION_QUERY_KEYS.detail('inv-1'),
      makePreparation({ evaluation: makeEvaluation() }),
    );
    mockedService.saveAnswer.mockResolvedValueOnce(
      makePreparation({ evaluation: makeEvaluation() }),
    );

    const { result } = renderHook(() => useSaveAnswer(), {
      wrapper: withQueryClient(testQueryClient),
    });
    result.current.mutate({ invitationId: 'inv-1', payload });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.info).not.toHaveBeenCalled();
  });
});

describe('useEvaluateAnswers', () => {
  it('runs the evaluation, seeds the detail cache, and toasts on success', async () => {
    const preparation = makePreparation();
    mockedService.evaluateAnswers.mockResolvedValueOnce(preparation);
    const testQueryClient = createTestQueryClient();

    const { result } = renderHook(() => useEvaluateAnswers(), {
      wrapper: withQueryClient(testQueryClient),
    });
    result.current.mutate('inv-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedService.evaluateAnswers).toHaveBeenCalledWith('inv-1');
    expect(testQueryClient.getQueryData(PREPARATION_QUERY_KEYS.detail('inv-1'))).toBe(
      preparation,
    );
    expect(toast.success).toHaveBeenCalledWith('Your AI evaluation report is ready.');
  });

  it('shows the server message on failure', async () => {
    mockedService.evaluateAnswers.mockRejectedValue({ status: 429, message: 'Slow down.' });

    const { result } = renderHook(() => useEvaluateAnswers(), {
      wrapper: createQueryWrapper(),
    });
    result.current.mutate('inv-1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Slow down.');
  });

  it('falls back to a default message when the server sends none', async () => {
    mockedService.evaluateAnswers.mockRejectedValue({ status: 500, message: '' });

    const { result } = renderHook(() => useEvaluateAnswers(), {
      wrapper: createQueryWrapper(),
    });
    result.current.mutate('inv-1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith(
      'Could not evaluate your answers. Please try again.',
    );
  });
});

describe('usePreparationQuota', () => {
  it('fetches the daily generation budget', async () => {
    const quota = makeQuota();
    mockedService.getPreparationQuota.mockResolvedValueOnce(quota);

    const { result } = renderHook(() => usePreparationQuota(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(quota);
    expect(mockedService.getPreparationQuota).toHaveBeenCalledWith(expect.anything());
  });
});
