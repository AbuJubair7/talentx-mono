import { act, renderHook, waitFor } from '@testing-library/react';

import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper';

import { ANSWER_AUTOSAVE_DEBOUNCE_MS, answerKey } from '../constants';
import { useAnswerAutosave } from '../hooks/use-answer-autosave';
import { interviewPreparationService } from '../services/interview-preparation.service';
import type { InterviewPreparationDto, PrepAnswerDto } from '../types';

jest.mock('../services/interview-preparation.service');
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockedService = interviewPreparationService as jest.Mocked<
  typeof interviewPreparationService
>;

const TECHNICAL_KEY = answerKey('Technical', 0, 'What is a closure?');

function makePreparation(answers: PrepAnswerDto[] = []): InterviewPreparationDto {
  return {
    id: 'prep-1',
    interviewInvitationId: 'inv-1',
    jobId: 'job-1',
    jobTitle: 'Backend Engineer',
    companyName: 'Acme',
    interviewType: 'Technical',
    scheduledAt: null,
    status: 'Generated',
    technicalQuestions: [
      { question: 'What is a closure?', category: 'Technical', tip: null },
    ],
    behavioralQuestions: [],
    experienceBasedQuestions: [],
    roleSpecificQuestions: [],
    keyTopicsToPrepare: [],
    suggestedRevisionAreas: [],
    additionalQuestions: null,
    generationCount: 1,
    generatedAt: '2026-09-26T08:00:00Z',
    isAccessible: true,
    answers,
    evaluation: null,
    disclaimer: '',
  };
}

function renderAutosave(prep: InterviewPreparationDto) {
  return renderHook(() => useAnswerAutosave('inv-1', prep), {
    wrapper: createQueryWrapper(),
  });
}

function storedAnswer(overrides: Partial<PrepAnswerDto> = {}): PrepAnswerDto {
  return {
    category: 'Technical',
    questionIndex: 0,
    question: 'What is a closure?',
    answer: 'A stored answer.',
    practiced: true,
    ...overrides,
  };
}

afterEach(() => {
  jest.resetAllMocks();
  jest.useRealTimers();
});

describe('useAnswerAutosave', () => {
  it('hydrates the drafts from the preparation answers', () => {
    const prep = makePreparation([storedAnswer()]);

    const { result } = renderAutosave(prep);

    expect(result.current.answers[TECHNICAL_KEY]).toEqual({
      text: 'A stored answer.',
      practiced: true,
    });
    expect(result.current.saveStates).toEqual({});
  });

  it('saves a practiced toggle immediately without waiting for the debounce', async () => {
    const prep = makePreparation();
    mockedService.saveAnswer.mockResolvedValue(prep);
    const { result } = renderAutosave(prep);

    act(() => result.current.togglePracticed(TECHNICAL_KEY));

    await waitFor(() =>
      expect(mockedService.saveAnswer).toHaveBeenCalledWith('inv-1', {
        category: 'Technical',
        questionIndex: 0,
        answer: '',
        practiced: true,
      }),
    );
    await waitFor(() => expect(result.current.saveStates[TECHNICAL_KEY]).toBe('saved'));
  });

  it('debounces typed answers into a single save', async () => {
    jest.useFakeTimers();
    const prep = makePreparation();
    mockedService.saveAnswer.mockResolvedValue(prep);
    const { result } = renderAutosave(prep);

    act(() => result.current.handleAnswerChange(TECHNICAL_KEY, 'A'));
    act(() => result.current.handleAnswerChange(TECHNICAL_KEY, 'A typed answer'));

    expect(mockedService.saveAnswer).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(ANSWER_AUTOSAVE_DEBOUNCE_MS);
    });

    await waitFor(() =>
      expect(mockedService.saveAnswer).toHaveBeenCalledWith('inv-1', {
        category: 'Technical',
        questionIndex: 0,
        answer: 'A typed answer',
        practiced: false,
      }),
    );
    expect(mockedService.saveAnswer).toHaveBeenCalledTimes(1);
  });

  it('skips the save when the draft matches what the server already has', async () => {
    jest.useFakeTimers();
    const prep = makePreparation([storedAnswer()]);
    mockedService.saveAnswer.mockResolvedValue(prep);
    const { result } = renderAutosave(prep);

    act(() => result.current.handleAnswerChange(TECHNICAL_KEY, 'A stored answer.'));
    act(() => {
      jest.advanceTimersByTime(ANSWER_AUTOSAVE_DEBOUNCE_MS);
    });

    expect(mockedService.saveAnswer).not.toHaveBeenCalled();
  });

  it('flushes a pending draft when the view unmounts', async () => {
    jest.useFakeTimers();
    const prep = makePreparation();
    mockedService.saveAnswer.mockResolvedValue(prep);
    const { result, unmount } = renderAutosave(prep);

    act(() => result.current.handleAnswerChange(TECHNICAL_KEY, 'Unsaved draft'));
    unmount();

    await waitFor(() =>
      expect(mockedService.saveAnswer).toHaveBeenCalledWith('inv-1', {
        category: 'Technical',
        questionIndex: 0,
        answer: 'Unsaved draft',
        practiced: false,
      }),
    );
  });

  it('reset clears the drafts and any in-flight debounce', async () => {
    jest.useFakeTimers();
    const prep = makePreparation([storedAnswer()]);
    mockedService.saveAnswer.mockResolvedValue(prep);
    const { result } = renderAutosave(prep);

    act(() => result.current.handleAnswerChange(TECHNICAL_KEY, 'Draft that never saves'));
    act(() => result.current.reset());

    expect(result.current.answers).toEqual({});
    expect(result.current.saveStates).toEqual({});

    act(() => {
      jest.advanceTimersByTime(ANSWER_AUTOSAVE_DEBOUNCE_MS);
    });

    expect(mockedService.saveAnswer).not.toHaveBeenCalled();
  });
});
