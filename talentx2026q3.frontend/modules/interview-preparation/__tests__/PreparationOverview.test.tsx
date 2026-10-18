import { render, screen, waitFor, within, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useGeneratePreparation } from '../hooks/use-generate-preparation';
import { useMoreQuestions } from '../hooks/use-more-questions';
import { usePreparation } from '../hooks/use-preparation';
import { useRegeneratePreparation } from '../hooks/use-regenerate-preparation';
import { useSaveAnswer } from '../hooks/use-save-answer';
import { useEvaluateAnswers } from '../hooks/use-evaluate';
import { usePreparationQuota } from '../hooks/use-preparation-quota';
import { PreparationOverview } from '../components/PreparationOverview';
import { ANSWER_AUTOSAVE_DEBOUNCE_MS } from '../constants';
import type {
  EvaluationDto,
  InterviewPreparationDto,
  InterviewPreparationQuota,
  PrepAnswerDto,
  PrepQuestion,
} from '../types';

jest.mock('../hooks/use-preparation');
jest.mock('../hooks/use-generate-preparation');
jest.mock('../hooks/use-regenerate-preparation');
jest.mock('../hooks/use-more-questions');
jest.mock('../hooks/use-save-answer');
jest.mock('../hooks/use-evaluate');
jest.mock('../hooks/use-preparation-quota', () => ({
  usePreparationQuota: jest.fn(() => ({ data: undefined })),
}));
jest.mock('../components/ContextSidebar', () => ({
  ContextSidebar: () => <div data-testid="context-sidebar" />,
}));

const mockedUsePreparation = usePreparation as jest.MockedFunction<typeof usePreparation>;
const mockedUseGenerate = useGeneratePreparation as jest.MockedFunction<
  typeof useGeneratePreparation
>;
const mockedUseRegenerate = useRegeneratePreparation as jest.MockedFunction<
  typeof useRegeneratePreparation
>;
const mockedUseMore = useMoreQuestions as jest.MockedFunction<typeof useMoreQuestions>;
const mockedUseSaveAnswer = useSaveAnswer as jest.MockedFunction<typeof useSaveAnswer>;
const mockedUseEvaluate = useEvaluateAnswers as jest.MockedFunction<typeof useEvaluateAnswers>;
const mockedUsePreparationQuota = usePreparationQuota as jest.MockedFunction<
  typeof usePreparationQuota
>;

function question(text: string, tip: string | null = 'Take your time.'): PrepQuestion {
  return { question: text, category: 'Technical', tip };
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
    technicalQuestions: [question('What is a closure?')],
    behavioralQuestions: [question('Tell me about a conflict.')],
    experienceBasedQuestions: [],
    roleSpecificQuestions: [question('How do you scale a queue?')],
    keyTopicsToPrepare: ['Idempotency'],
    suggestedRevisionAreas: ['SQL tuning'],
    additionalQuestions: null,
    generationCount: 1,
    generatedAt: '2026-09-26T08:00:00Z',
    isAccessible: true,
    answers: [],
    evaluation: null,
    disclaimer: 'AI-generated guidance.',
    ...overrides,
  };
}

function mockPreparationState(
  partial: Partial<ReturnType<typeof usePreparation>> = {},
): void {
  mockedUsePreparation.mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
    isFetching: false,
    refetch: jest.fn(),
    ...partial,
  } as unknown as ReturnType<typeof usePreparation>);
}

interface MutationHookMock {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockReturnValue(value: any): unknown;
}

function mockMutation(
  hook: MutationHookMock,
  partial: { mutate?: jest.Mock; isPending?: boolean } = {},
): jest.Mock {
  const mutate = partial.mutate ?? jest.fn();
  hook.mockReturnValue({
    mutate,
    isPending: partial.isPending ?? false,
  });
  return mutate;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockPreparationState();
  mockedUsePreparationQuota.mockReturnValue({
    data: undefined,
  } as unknown as ReturnType<typeof usePreparationQuota>);
  mockMutation(mockedUseGenerate);
  mockMutation(mockedUseRegenerate);
  mockMutation(mockedUseMore);
  mockMutation(mockedUseSaveAnswer);
  mockMutation(mockedUseEvaluate);
});

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

function mockQuota(value: InterviewPreparationQuota | undefined): void {
  mockedUsePreparationQuota.mockReturnValue({
    data: value,
  } as unknown as ReturnType<typeof usePreparationQuota>);
}

function makeEvaluation(
  overrides: Partial<EvaluationDto> = {},
): EvaluationDto {
  return {
    overallScore: 78,
    summary: 'Solid answers with room for more structure.',
    strengths: ['Concrete examples'],
    areasToImprove: ['Add measurable outcomes'],
    questionFeedback: [
      {
        category: 'Technical',
        questionIndex: 0,
        score: 74,
        feedback: 'Good, add more detail.',
        suggestedAnswer: 'Mention scope capture explicitly.',
      },
    ],
    answeredCount: 1,
    totalCount: 3,
    evaluatedAt: '2026-09-28T10:00:00Z',
    ...overrides,
  };
}

function makeAnswer(overrides: Partial<PrepAnswerDto> = {}): PrepAnswerDto {
  return {
    category: 'Technical',
    questionIndex: 0,
    question: 'What is a closure?',
    answer: 'A closure captures its lexical scope.',
    practiced: true,
    ...overrides,
  };
}

describe('PreparationOverview', () => {
  it('shows the generating state while the preparation is loading', () => {
    mockPreparationState({ isLoading: true });

    render(<PreparationOverview invitationId="inv-1" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Reading the job posting')).toBeInTheDocument();
  });

  it('shows the error state with a retry that refetches for non-404 failures', async () => {
    const refetch = jest.fn();
    mockPreparationState({
      error: { status: 500, message: 'Server exploded' },
      refetch,
    });

    render(<PreparationOverview invitationId="inv-1" />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      "We couldn't load your preparation",
    );
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows the empty state with a generate button when nothing exists yet', async () => {
    const generate = mockMutation(mockedUseGenerate);

    render(<PreparationOverview invitationId="inv-1" />);

    expect(
      screen.getByRole('heading', { name: 'AI Interview Preparation' }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: /generate preparation guide/i }),
    );
    expect(generate).toHaveBeenCalledWith('inv-1');
  });

  it('treats a 404 as an empty state rather than an error', () => {
    mockPreparationState({ error: { status: 404, message: 'Not found' } });

    render(<PreparationOverview invitationId="inv-1" />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /generate preparation guide/i }),
    ).toBeInTheDocument();
  });

  it('shows how many guides are left today under the generate button', () => {
    mockQuota(makeQuota());

    render(<PreparationOverview invitationId="inv-1" />);

    expect(screen.getByText('4 of 5 guides left today')).toBeInTheDocument();
  });

  it('omits the guide quota until it has loaded', () => {
    mockQuota(undefined);

    render(<PreparationOverview invitationId="inv-1" />);

    expect(screen.queryByText(/guides left today/)).not.toBeInTheDocument();
  });

  it('shows the generating state right after generate is triggered', () => {
    mockMutation(mockedUseGenerate, { isPending: true });

    render(<PreparationOverview invitationId="inv-1" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the header, guidance card, sidebar, and question counts', () => {
    const prep = makePreparation();
    mockPreparationState({ data: prep });

    render(<PreparationOverview invitationId="inv-1" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Backend Engineer' })).toBeInTheDocument();
    expect(screen.getByText(/Interview preparation · Acme/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /AI preparation guidance/ })).toBeInTheDocument();
    expect(screen.getByTestId('context-sidebar')).toBeInTheDocument();

    expect(screen.getByRole('tab', { name: /Interview questions/ })).toHaveTextContent('3');
    expect(screen.getByRole('tab', { name: /Topics to prepare/ })).toHaveTextContent('2');
  });

  it('switches to the topics tab and back', async () => {
    mockPreparationState({ data: makePreparation() });

    render(<PreparationOverview invitationId="inv-1" />);

    const questionsTab = screen.getByRole('tab', { name: /Interview questions/ });
    const topicsTab = screen.getByRole('tab', { name: /Topics to prepare/ });
    expect(questionsTab).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(topicsTab);

    expect(topicsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'Key topics to prepare' })).toBeInTheDocument();
    expect(screen.queryByText('What is a closure?')).not.toBeInTheDocument();

    await userEvent.click(questionsTab);

    expect(screen.getByText('What is a closure?')).toBeInTheDocument();
  });

  it('toggles a question as practiced from the questions panel', async () => {
    mockPreparationState({ data: makePreparation() });

    render(<PreparationOverview invitationId="inv-1" />);

    const checkbox = screen.getAllByRole('checkbox', { name: 'Mark as practiced' })[0];
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(checkbox);

    expect(screen.getByRole('checkbox', { name: 'Mark as not practiced' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByText('1 of 3 practiced')).toBeInTheDocument();
  });

  it('requests more questions from the questions panel', async () => {
    const getMore = mockMutation(mockedUseMore);
    mockPreparationState({ data: makePreparation() });

    render(<PreparationOverview invitationId="inv-1" />);

    await userEvent.click(screen.getByRole('button', { name: /generate more questions/i }));

    expect(getMore).toHaveBeenCalledWith('inv-1');
  });

  it('opens the confirm dialog and regenerates on confirm', async () => {
    const regenerate = mockMutation(mockedUseRegenerate);
    mockPreparationState({ data: makePreparation() });

    render(<PreparationOverview invitationId="inv-1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Regenerate' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Regenerate preparation?')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Regenerate' }));

    expect(regenerate).toHaveBeenCalledWith('inv-1');
    await waitForDialogToClose();
  });

  it('shows the remaining regenerations and daily budget in the confirm dialog', async () => {
    mockPreparationState({ data: makePreparation({ generationCount: 2 }) });
    mockQuota(makeQuota());

    render(<PreparationOverview invitationId="inv-1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Regenerate' }));

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByText(/Regenerations left for this preparation/),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('1 of 3')).toBeInTheDocument();
    expect(within(dialog).getByText('7 of 10')).toBeInTheDocument();
  });

  it('shows the daily generation budget inside the questions panel', () => {
    mockPreparationState({ data: makePreparation() });
    mockQuota(makeQuota());

    render(<PreparationOverview invitationId="inv-1" />);

    expect(screen.getByText('7 of 10 generations left today')).toBeInTheDocument();
  });

  it('does not regenerate when the confirm dialog is cancelled', async () => {
    const regenerate = mockMutation(mockedUseRegenerate);
    mockPreparationState({ data: makePreparation() });

    render(<PreparationOverview invitationId="inv-1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Regenerate' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(regenerate).not.toHaveBeenCalled();
    await waitForDialogToClose();
  });

  it('replaces the grid with the generating state while regenerating', () => {
    const mutate = mockMutation(mockedUseRegenerate, { isPending: true });
    mockPreparationState({ data: makePreparation() });

    render(<PreparationOverview invitationId="inv-1" />);

    expect(mutate).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Tailoring to your technical interview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Regenerating…' })).toBeDisabled();
    expect(screen.queryByTestId('context-sidebar')).not.toBeInTheDocument();
  });

  it('hydrates saved answers into chatboxes and checkboxes without re-saving them', () => {
    const save = mockMutation(mockedUseSaveAnswer);
    mockPreparationState({ data: makePreparation({ answers: [makeAnswer()] }) });

    render(<PreparationOverview invitationId="inv-1" />);

    expect(
      screen.getByLabelText('Your answer to: What is a closure?'),
    ).toHaveValue('A closure captures its lexical scope.');
    expect(screen.getByRole('checkbox', { name: 'Mark as not practiced' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByText('1 of 3 practiced')).toBeInTheDocument();
    expect(save).not.toHaveBeenCalled();
  });

  it('saves a practiced toggle immediately with the parsed question key', async () => {
    const save = mockMutation(mockedUseSaveAnswer);
    mockPreparationState({ data: makePreparation() });

    render(<PreparationOverview invitationId="inv-1" />);

    const checkbox = screen.getAllByRole('checkbox', { name: 'Mark as practiced' })[0];
    await userEvent.click(checkbox);

    expect(save).toHaveBeenCalledWith(
      {
        invitationId: 'inv-1',
        payload: {
          category: 'Role-Specific',
          questionIndex: 0,
          answer: '',
          practiced: true,
        },
      },
      expect.anything(),
    );
    expect(
      screen.getByRole('checkbox', { name: 'Mark as not practiced' }),
    ).toBeInTheDocument();
    expect(screen.getByText('1 of 3 practiced')).toBeInTheDocument();
  });

  it('persists a changed practiced flag for a hydrated answer', async () => {
    const save = mockMutation(mockedUseSaveAnswer);
    mockPreparationState({ data: makePreparation({ answers: [makeAnswer()] }) });

    render(<PreparationOverview invitationId="inv-1" />);

    await userEvent.click(screen.getByRole('checkbox', { name: 'Mark as not practiced' }));

    expect(save).toHaveBeenCalledWith(
      {
        invitationId: 'inv-1',
        payload: {
          category: 'Technical',
          questionIndex: 0,
          answer: 'A closure captures its lexical scope.',
          practiced: false,
        },
      },
      expect.anything(),
    );
  });

  it('debounces typed answers before autosaving them', () => {
    jest.useFakeTimers();
    try {
      const save = mockMutation(mockedUseSaveAnswer);
      mockPreparationState({ data: makePreparation() });

      render(<PreparationOverview invitationId="inv-1" />);

      fireEvent.change(screen.getByLabelText('Your answer to: What is a closure?'), {
        target: { value: 'A closure captures scope.' },
      });

      expect(save).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(ANSWER_AUTOSAVE_DEBOUNCE_MS);
      });

      expect(save).toHaveBeenCalledWith(
        {
          invitationId: 'inv-1',
          payload: {
            category: 'Technical',
            questionIndex: 0,
            answer: 'A closure captures scope.',
            practiced: false,
          },
        },
        expect.anything(),
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it('runs the evaluation and switches to the AI report tab', async () => {
    const evaluate = jest.fn(
      (_id: string, options?: { onSuccess?: () => void }) => options?.onSuccess?.(),
    );
    mockMutation(mockedUseEvaluate, { mutate: evaluate });
    mockPreparationState({
      data: makePreparation({ answers: [makeAnswer()], evaluation: makeEvaluation() }),
    });

    render(<PreparationOverview invitationId="inv-1" />);

    await userEvent.click(screen.getByRole('button', { name: /evaluate my answers/i }));

    expect(evaluate).toHaveBeenCalledWith('inv-1', expect.anything());
    expect(screen.getByRole('heading', { name: 'Your AI evaluation report' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /AI report/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Solid answers with room for more structure.')).toBeInTheDocument();
    expect(
      screen.getByText(/Feedback per answered question \(1\)/),
    ).toBeInTheDocument();
  });

  it('shows the AI report tab with the overall score only when an evaluation exists', () => {
    mockPreparationState({ data: makePreparation() });
    const { rerender } = render(<PreparationOverview invitationId="inv-1" />);

    expect(screen.queryByRole('tab', { name: /AI report/ })).not.toBeInTheDocument();

    mockPreparationState({
      data: makePreparation({ evaluation: makeEvaluation() }),
    });
    rerender(<PreparationOverview invitationId="inv-1" />);

    expect(screen.getByRole('tab', { name: /AI report/ })).toHaveTextContent('78');
  });
});

async function waitForDialogToClose() {
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
}
