import { apiClient } from '@/lib/api/axios';

import { interviewPreparationService } from '../services/interview-preparation.service';
import type { InterviewPreparationDto, InterviewPreparationQuota, SaveAnswerPayload } from '../types';

jest.mock('@/lib/api/axios', () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

const mockedGet = jest.mocked(apiClient.get);
const mockedPost = jest.mocked(apiClient.post);
const mockedPut = jest.mocked(apiClient.put);

function makePreparation(overrides: Partial<InterviewPreparationDto> = {}): InterviewPreparationDto {
  return {
    id: 'prep-1',
    interviewInvitationId: 'inv-1',
    jobId: 'job-1',
    jobTitle: 'Backend Engineer',
    companyName: 'Acme',
    interviewType: 'Technical',
    scheduledAt: '2026-09-30T10:00:00Z',
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

afterEach(() => jest.clearAllMocks());

describe('interviewPreparationService.getPreparation', () => {
  it('GETs the preparation endpoint forwarding the abort signal', async () => {
    const preparation = makePreparation();
    mockedGet.mockResolvedValueOnce({ data: preparation });
    const controller = new AbortController();

    const result = await interviewPreparationService.getPreparation('inv-1', controller.signal);

    expect(mockedGet).toHaveBeenCalledWith('/talents/me/interviews/inv-1/preparation', {
      signal: controller.signal,
    });
    expect(result).toBe(preparation);
  });

  it('calls GET without a signal when none is provided', async () => {
    mockedGet.mockResolvedValueOnce({ data: makePreparation() });

    await interviewPreparationService.getPreparation('inv-2');

    expect(mockedGet).toHaveBeenCalledWith('/talents/me/interviews/inv-2/preparation', {
      signal: undefined,
    });
  });
});

describe('interviewPreparationService.getPreparationQuota', () => {
  const quota: InterviewPreparationQuota = {
    dailyGenerateLimit: 5,
    dailyGenerationLimit: 10,
    maxRegenerationCount: 3,
    accessWindowAfterInterviewMinutes: 30,
    generatesUsedToday: 1,
    generationsUsedToday: 3,
    remainingGeneratesToday: 4,
    remainingGenerationsToday: 7,
  };

  it('GETs the quota endpoint forwarding the abort signal', async () => {
    mockedGet.mockResolvedValueOnce({ data: quota });
    const controller = new AbortController();

    const result = await interviewPreparationService.getPreparationQuota(controller.signal);

    expect(mockedGet).toHaveBeenCalledWith('/talents/me/interviews/preparation/quota', {
      signal: controller.signal,
    });
    expect(result).toBe(quota);
  });

  it('calls GET without a signal when none is provided', async () => {
    mockedGet.mockResolvedValueOnce({ data: quota });

    await interviewPreparationService.getPreparationQuota();

    expect(mockedGet).toHaveBeenCalledWith('/talents/me/interviews/preparation/quota', {
      signal: undefined,
    });
  });
});

describe('interviewPreparationService.generatePreparation', () => {
  it('POSTs to the preparation endpoint', async () => {
    const preparation = makePreparation();
    mockedPost.mockResolvedValueOnce({ data: preparation });

    const result = await interviewPreparationService.generatePreparation('inv-1');

    expect(mockedPost).toHaveBeenCalledWith('/talents/me/interviews/inv-1/preparation');
    expect(result).toBe(preparation);
  });
});

describe('interviewPreparationService.regeneratePreparation', () => {
  it('POSTs to the regenerate endpoint', async () => {
    const preparation = makePreparation({ generationCount: 2 });
    mockedPost.mockResolvedValueOnce({ data: preparation });

    const result = await interviewPreparationService.regeneratePreparation('inv-1');

    expect(mockedPost).toHaveBeenCalledWith(
      '/talents/me/interviews/inv-1/preparation/regenerate',
    );
    expect(result).toBe(preparation);
  });
});

describe('interviewPreparationService.generateMoreQuestions', () => {
  it('POSTs to the additional-questions endpoint', async () => {
    const preparation = makePreparation({
      additionalQuestions: [{ question: 'Q?', category: 'Technical', tip: null }],
    });
    mockedPost.mockResolvedValueOnce({ data: preparation });

    const result = await interviewPreparationService.generateMoreQuestions('inv-1');

    expect(mockedPost).toHaveBeenCalledWith(
      '/talents/me/interviews/inv-1/preparation/additional-questions',
    );
    expect(result).toBe(preparation);
  });
});

describe('interviewPreparationService.saveAnswer', () => {
  it('PUTs the answer payload to the answers endpoint', async () => {
    const preparation = makePreparation();
    mockedPut.mockResolvedValueOnce({ data: preparation });
    const payload: SaveAnswerPayload = {
      category: 'Technical',
      questionIndex: 0,
      answer: 'A scoped function.',
      practiced: true,
    };

    const result = await interviewPreparationService.saveAnswer('inv-1', payload);

    expect(mockedPut).toHaveBeenCalledWith(
      '/talents/me/interviews/inv-1/preparation/answers',
      payload,
    );
    expect(result).toBe(preparation);
  });
});

describe('interviewPreparationService.evaluateAnswers', () => {
  it('POSTs to the evaluate endpoint', async () => {
    const preparation = makePreparation({
      evaluation: {
        overallScore: 81,
        summary: 'Good coverage.',
        strengths: ['Structure'],
        areasToImprove: ['Metrics'],
        questionFeedback: [],
        answeredCount: 2,
        totalCount: 3,
        evaluatedAt: '2026-09-28T10:00:00Z',
      },
    });
    mockedPost.mockResolvedValueOnce({ data: preparation });

    const result = await interviewPreparationService.evaluateAnswers('inv-1');

    expect(mockedPost).toHaveBeenCalledWith(
      '/talents/me/interviews/inv-1/preparation/evaluate',
    );
    expect(result).toBe(preparation);
  });
});
