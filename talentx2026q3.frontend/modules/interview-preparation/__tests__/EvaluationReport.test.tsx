import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EvaluationReport } from '../components/EvaluationReport';
import type { EvaluationDto, InterviewPreparationDto, PrepQuestion } from '../types';

function question(text: string): PrepQuestion {
  return { question: text, category: 'Technical', tip: null };
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

function makeEvaluation(overrides: Partial<EvaluationDto> = {}): EvaluationDto {
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

interface ReportProps {
  prep?: InterviewPreparationDto;
  evaluation?: EvaluationDto;
  onReevaluate?: () => void;
  isEvaluating?: boolean;
}

function renderReport({
  prep = makePreparation(),
  evaluation = makeEvaluation(),
  onReevaluate = jest.fn(),
  isEvaluating = false,
}: ReportProps = {}) {
  return render(
    <EvaluationReport
      prep={prep}
      evaluation={evaluation}
      onReevaluate={onReevaluate}
      isEvaluating={isEvaluating}
    />,
  );
}

afterEach(() => jest.clearAllMocks());

describe('EvaluationReport', () => {
  it('renders the overall score, band, summary, and coverage line', () => {
    renderReport();

    expect(screen.getByRole('heading', { name: 'Your AI evaluation report' })).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('78')).toBeInTheDocument();
    expect(screen.getByText('Solid answers with room for more structure.')).toBeInTheDocument();
    expect(screen.getByText(/Answered 1 of 3 questions/)).toBeInTheDocument();
    expect(
      screen.getByText('Overall score 78 out of 100, Good'),
    ).toBeInTheDocument();
  });

  it('lists strengths and areas to improve', () => {
    renderReport({
      evaluation: makeEvaluation({
        strengths: ['Concrete examples'],
        areasToImprove: ['Add measurable outcomes'],
      }),
    });

    expect(screen.getByRole('heading', { name: /What you did well/ })).toBeInTheDocument();
    expect(screen.getByText('Concrete examples')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Where to improve/ })).toBeInTheDocument();
    expect(screen.getByText('Add measurable outcomes')).toBeInTheDocument();
  });

  it('renders per-question feedback with the question text and suggested answer', () => {
    renderReport();

    expect(
      screen.getByRole('heading', { name: /Feedback per answered question \(1\)/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('What is a closure?')).toBeInTheDocument();
    expect(screen.getByText('Good, add more detail.')).toBeInTheDocument();
    expect(screen.getByText('Suggested stronger answer')).toBeInTheDocument();
    expect(screen.getByText('Mention scope capture explicitly.')).toBeInTheDocument();
    expect(screen.getByText('74')).toBeInTheDocument();
  });

  it('flags feedback whose question no longer exists', () => {
    renderReport({
      evaluation: makeEvaluation({
        questionFeedback: [
          {
            category: 'Technical',
            questionIndex: 5,
            score: 60,
            feedback: 'Needs structure.',
            suggestedAnswer: null,
          },
        ],
      }),
    });

    expect(screen.getByText('Question no longer available')).toBeInTheDocument();
    expect(screen.queryByText('Suggested stronger answer')).not.toBeInTheDocument();
  });

  it('handles empty strengths, improvements, and feedback lists', () => {
    renderReport({
      evaluation: makeEvaluation({
        strengths: [],
        areasToImprove: [],
        questionFeedback: [],
      }),
    });

    expect(screen.getByText('No standout strengths recorded.')).toBeInTheDocument();
    expect(screen.getByText('No specific improvements flagged.')).toBeInTheDocument();
    expect(
      screen.getByText('No per-question feedback was returned for this evaluation.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Feedback per answered question \(0\)/ }),
    ).toBeInTheDocument();
  });

  it('runs the evaluation again through onReevaluate', async () => {
    const onReevaluate = jest.fn();
    renderReport({ onReevaluate });

    await userEvent.click(screen.getByRole('button', { name: /re-run evaluation/i }));

    expect(onReevaluate).toHaveBeenCalledTimes(1);
  });

  it('disables re-run and announces progress while evaluating', () => {
    renderReport({ isEvaluating: true });

    expect(screen.getByRole('button', { name: /re-running…/i })).toBeDisabled();
  });
});
