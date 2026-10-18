import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { QuestionsSection } from '../components/QuestionsSection';
import { questionKey } from '../constants';
import type {
  AnswerMap,
  InterviewPreparationDto,
  InterviewPreparationQuota,
  PrepQuestion,
  SaveState,
} from '../types';

function question(text: string, category = 'Technical'): PrepQuestion {
  return { question: text, category, tip: null };
}

function makeQuota(overrides: Partial<InterviewPreparationQuota> = {}): InterviewPreparationQuota {
  return {
    dailyGenerateLimit: 5,
    dailyGenerationLimit: 10,
    maxRegenerationCount: 3,
    accessWindowAfterInterviewMinutes: 30,
    generatesUsedToday: 0,
    generationsUsedToday: 3,
    remainingGeneratesToday: 5,
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
    technicalQuestions: [question('What is a closure?')],
    behavioralQuestions: [question('Tell me about a conflict.', 'Behavioral')],
    experienceBasedQuestions: [],
    roleSpecificQuestions: [question('How do you scale a queue?', 'Role-Specific')],
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

interface SectionProps {
  prep: InterviewPreparationDto;
  answers?: AnswerMap;
  saveStates?: Record<string, SaveState>;
  onTogglePracticed?: (key: string) => void;
  onAnswerChange?: (key: string, text: string) => void;
  onGenerateMore?: () => void;
  isGeneratingMore?: boolean;
  onEvaluate?: () => void;
  isEvaluating?: boolean;
  quota?: InterviewPreparationQuota | null;
}

function renderSection({
  prep,
  answers = {},
  saveStates = {},
  onTogglePracticed = jest.fn(),
  onAnswerChange = jest.fn(),
  onGenerateMore = jest.fn(),
  isGeneratingMore = false,
  onEvaluate = jest.fn(),
  isEvaluating = false,
  quota,
}: SectionProps) {
  return render(
    <QuestionsSection
      prep={prep}
      answers={answers}
      saveStates={saveStates}
      onTogglePracticed={onTogglePracticed}
      onAnswerChange={onAnswerChange}
      onGenerateMore={onGenerateMore}
      isGeneratingMore={isGeneratingMore}
      onEvaluate={onEvaluate}
      isEvaluating={isEvaluating}
      quota={quota}
    />,
  );
}

afterEach(() => jest.clearAllMocks());

describe('QuestionsSection', () => {
  it('shows an empty state when no questions exist', () => {
    renderSection({
      prep: makePreparation({
        technicalQuestions: [],
        behavioralQuestions: [],
        roleSpecificQuestions: [],
        additionalQuestions: null,
      }),
    });

    expect(screen.getByText(/No questions in this preparation yet/)).toBeInTheDocument();
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });

  it('renders category groups in canonical order with counts', () => {
    renderSection({ prep: makePreparation() });

    expect(screen.getByRole('heading', { level: 3, name: /Role-Specific Questions/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Technical Questions/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Behavioral Questions/ })).toBeInTheDocument();

    const order = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(order[0]).toContain('Role-Specific Questions');
    expect(order[1]).toContain('Technical Questions');
    expect(order[2]).toContain('Behavioral Questions');
  });

  it('adds an Additional group only when extra questions exist', () => {
    const { rerender } = renderSection({ prep: makePreparation() });
    expect(screen.queryByRole('heading', { level: 3, name: /Additional Questions/ })).not.toBeInTheDocument();

    rerender(
      <QuestionsSection
        prep={makePreparation({
          additionalQuestions: [question('What interests you about us?', 'Additional')],
        })}
        answers={{}}
        onTogglePracticed={jest.fn()}
        onAnswerChange={jest.fn()}
        onGenerateMore={jest.fn()}
        isGeneratingMore={false}
        onEvaluate={jest.fn()}
        isEvaluating={false}
      />,
    );

    expect(screen.getByRole('heading', { level: 3, name: /Additional Questions/ })).toBeInTheDocument();
  });

  it('filters to a single category via the filter pills', async () => {
    renderSection({ prep: makePreparation() });

    const allPill = screen.getByRole('button', { name: /^All/ });
    expect(allPill).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: /^Behavioral/ }));

    expect(screen.getByRole('button', { name: /^Behavioral/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.queryByText('What is a closure?')).not.toBeInTheDocument();
    expect(screen.getByText('Tell me about a conflict.')).toBeInTheDocument();

    await userEvent.click(allPill);

    expect(screen.getByText('What is a closure?')).toBeInTheDocument();
  });

  it('reports practiced progress against the total question count', () => {
    const prep = makePreparation();
    renderSection({
      prep,
      answers: {
        [questionKey('Role-Specific', 0, prep.roleSpecificQuestions[0])]: {
          text: '',
          practiced: true,
        },
        [questionKey('Technical', 0, prep.technicalQuestions[0])]: {
          text: '',
          practiced: true,
        },
      },
    });

    const progress = screen.getByRole('progressbar', { name: 'Questions practiced' });
    expect(progress).toHaveAttribute('aria-valuenow', '2');
    expect(progress).toHaveAttribute('aria-valuemax', '3');
    expect(screen.getByText('2 of 3 practiced')).toBeInTheDocument();
  });

  it('forwards a toggle for the clicked question key', async () => {
    const onTogglePracticed = jest.fn();
    renderSection({ prep: makePreparation(), onTogglePracticed });

    await userEvent.click(screen.getAllByRole('checkbox')[0]);

    expect(onTogglePracticed).toHaveBeenCalledWith(
      'Role-Specific::0::How do you scale a queue?',
    );
  });

  it('requests more questions when the footer button is clicked', async () => {
    const onGenerateMore = jest.fn();
    renderSection({ prep: makePreparation(), onGenerateMore });

    await userEvent.click(screen.getByRole('button', { name: /generate more questions/i }));

    expect(onGenerateMore).toHaveBeenCalledTimes(1);
  });

  it('disables the footer button and announces progress while generating', () => {
    renderSection({ prep: makePreparation(), isGeneratingMore: true });

    expect(
      screen.getByRole('button', { name: /generating questions…/i }),
    ).toBeDisabled();
    expect(screen.getByText('Generating more questions')).toBeInTheDocument();
  });

  it('disables evaluation until at least one question is answered', () => {
    const { rerender } = renderSection({ prep: makePreparation() });

    const evaluateButton = screen.getByRole('button', { name: /evaluate my answers/i });
    expect(evaluateButton).toBeDisabled();
    expect(screen.getByText(/0 of 3 answered/)).toBeInTheDocument();

    const prep = makePreparation();
    rerender(
      <QuestionsSection
        prep={prep}
        answers={{
          [questionKey('Technical', 0, prep.technicalQuestions[0])]: {
            text: 'A scoped function',
            practiced: false,
          },
        }}
        onTogglePracticed={jest.fn()}
        onAnswerChange={jest.fn()}
        onGenerateMore={jest.fn()}
        isGeneratingMore={false}
        onEvaluate={jest.fn()}
        isEvaluating={false}
      />,
    );

    expect(screen.getByRole('button', { name: /evaluate my answers/i })).toBeEnabled();
    expect(screen.getByText(/1 of 3 answered/)).toBeInTheDocument();
  });

  it('runs the evaluation when the button is clicked', async () => {
    const onEvaluate = jest.fn();
    const prep = makePreparation();
    renderSection({
      prep,
      answers: {
        [questionKey('Technical', 0, prep.technicalQuestions[0])]: {
          text: 'A scoped function',
          practiced: false,
        },
      },
      onEvaluate,
    });

    await userEvent.click(screen.getByRole('button', { name: /evaluate my answers/i }));

    expect(onEvaluate).toHaveBeenCalledTimes(1);
  });

  it('shows the evaluating state and blocks repeat clicks', () => {
    renderSection({ prep: makePreparation(), isEvaluating: true });

    expect(
      screen.getByRole('button', { name: /evaluating your answers…/i }),
    ).toBeDisabled();
    expect(screen.getByText('Evaluating your answers')).toBeInTheDocument();
  });

  it('shows a pending panel describing the evaluation while it runs', () => {
    const prep = makePreparation();
    renderSection({
      prep,
      answers: {
        [questionKey('Technical', 0, prep.technicalQuestions[0])]: {
          text: 'A scoped function',
          practiced: false,
        },
      },
      isEvaluating: true,
    });

    expect(screen.getByText(/Reviewing 1 answer against the rubric/)).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: /evaluation in progress/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/AI reviews only answered questions/)).not.toBeInTheDocument();
  });

  it('shows how many generations are left today when quota is provided', () => {
    renderSection({ prep: makePreparation(), quota: makeQuota() });

    expect(screen.getByText('7 of 10 generations left today')).toBeInTheDocument();
    expect(screen.getByText('7 of 10 generations left today')).not.toHaveClass('text-warning');
  });

  it('highlights the quota line when the daily budget is spent', () => {
    renderSection({ prep: makePreparation(), quota: makeQuota({ remainingGenerationsToday: 0 }) });

    const line = screen.getByText('0 of 10 generations left today');
    expect(line).toHaveClass('text-warning');
  });
});
