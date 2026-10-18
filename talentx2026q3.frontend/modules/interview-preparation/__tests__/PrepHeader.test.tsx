import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PrepHeader } from '../components/PrepHeader';
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

afterEach(() => jest.clearAllMocks());

describe('PrepHeader', () => {
  it('renders the company, job title, and interview type', () => {
    render(
      <PrepHeader
        prep={makePreparation()}
        onRegenerate={jest.fn()}
        regenerateDisabled={false}
      />,
    );

    expect(screen.getByText(/Interview preparation · Acme/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Backend Engineer' })).toBeInTheDocument();
    expect(screen.getByText('Technical')).toBeInTheDocument();
  });

  it('omits the schedule rows when there is no scheduled date', () => {
    render(
      <PrepHeader
        prep={makePreparation({ scheduledAt: null })}
        onRegenerate={jest.fn()}
        regenerateDisabled={false}
      />,
    );

    expect(screen.queryByText(/Interview starts in/)).not.toBeInTheDocument();
  });

  it('shows the formatted schedule and countdown when a date exists', () => {
    render(
      <PrepHeader
        prep={makePreparation({ scheduledAt: '2026-12-24T18:30:00Z' })}
        onRegenerate={jest.fn()}
        regenerateDisabled={false}
      />,
    );

    expect(screen.getByText(/Interview starts in/)).toBeInTheDocument();
  });

  it('calls onRegenerate when the button is clicked', async () => {
    const onRegenerate = jest.fn();
    render(
      <PrepHeader prep={makePreparation()} onRegenerate={onRegenerate} regenerateDisabled={false} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Regenerate' }));

    expect(onRegenerate).toHaveBeenCalledTimes(1);
  });

  it('disables the button while regeneration is not allowed', () => {
    render(
      <PrepHeader prep={makePreparation()} onRegenerate={jest.fn()} regenerateDisabled />,
    );

    expect(screen.getByRole('button', { name: 'Regenerate' })).toBeDisabled();
  });

  it('shows the regenerating label while regenerating', () => {
    render(
      <PrepHeader
        prep={makePreparation()}
        onRegenerate={jest.fn()}
        regenerateDisabled
        regenerating
      />,
    );

    expect(screen.getByRole('button', { name: 'Regenerating…' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Regenerate' })).not.toBeInTheDocument();
  });
});
