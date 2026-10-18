import { render, screen } from '@testing-library/react';

import { AiGuidanceCard } from '../components/AiGuidanceCard';
import type { InterviewPreparationDto } from '../types';

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

describe('AiGuidanceCard', () => {
  it('renders the guidance heading linked to its section', () => {
    render(<AiGuidanceCard prep={makePreparation()} />);

    const section = screen.getByRole('region', { name: 'AI preparation guidance' });
    expect(section).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'AI preparation guidance' })).toBeInTheDocument();
  });

  it('summarises the interview in lowercase interview type', () => {
    render(<AiGuidanceCard prep={makePreparation()} />);

    expect(
      screen.getByText(/This technical interview for Backend Engineer at Acme/),
    ).toBeInTheDocument();
  });

  it('includes the formatted schedule in the summary when scheduled', () => {
    render(<AiGuidanceCard prep={makePreparation({ scheduledAt: '2026-12-24T18:30:00Z' })} />);

    expect(screen.getByText(/will likely focus on/)).toHaveTextContent('on');
  });

  it('marks a first generation as generated for you', () => {
    render(<AiGuidanceCard prep={makePreparation({ generationCount: 1 })} />);

    expect(screen.getByText('Generated for you')).toBeInTheDocument();
  });

  it('shows the version number once regenerated', () => {
    render(<AiGuidanceCard prep={makePreparation({ generationCount: 3 })} />);

    expect(screen.getByText('Regenerated · version 3')).toBeInTheDocument();
  });

  it('renders the disclaimer only when present', () => {
    const { rerender } = render(
      <AiGuidanceCard prep={makePreparation({ disclaimer: 'Not the employer’s questions.' })} />,
    );
    expect(screen.getByText('Not the employer’s questions.')).toBeInTheDocument();

    rerender(<AiGuidanceCard prep={makePreparation({ disclaimer: '' })} />);
    expect(screen.queryByText('Not the employer’s questions.')).not.toBeInTheDocument();
  });
});
