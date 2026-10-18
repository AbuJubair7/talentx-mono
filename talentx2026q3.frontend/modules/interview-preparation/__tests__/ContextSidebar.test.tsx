import { render, screen } from '@testing-library/react';

import { ContextSidebar } from '../components/ContextSidebar';
import type { InterviewPreparationDto } from '../types';

jest.mock('@/modules/talent-profile/hooks/useTalentProfile', () => ({
  useTalentProfile: jest.fn(() => ({ data: undefined })),
}));

import { useTalentProfile } from '@/modules/talent-profile/hooks/useTalentProfile';

const mockedUseTalentProfile = useTalentProfile as jest.MockedFunction<typeof useTalentProfile>;

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

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseTalentProfile.mockReturnValue({ data: undefined } as unknown as ReturnType<
    typeof useTalentProfile
  >);
});

describe('ContextSidebar', () => {
  it('lists the guidance sources', () => {
    render(<ContextSidebar prep={makePreparation()} />);

    expect(
      screen.getByRole('heading', { name: 'What this guidance is based on' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Technical')).toBeInTheDocument();
    expect(screen.getByText('Backend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();
  });

  it('omits the schedule row when there is no scheduled date', () => {
    render(<ContextSidebar prep={makePreparation({ scheduledAt: null })} />);

    expect(screen.queryByText('When')).not.toBeInTheDocument();
    expect(screen.queryByText(/^Access ends/)).not.toBeInTheDocument();
  });

  it('shows the schedule and access deadline when a date exists', () => {
    render(<ContextSidebar prep={makePreparation({ scheduledAt: '2026-12-24T18:30:00Z' })} />);

    expect(screen.getByText('When')).toBeInTheDocument();
    expect(screen.getByText(/^Access ends shortly after your interview starts on/)).toBeInTheDocument();
  });

  it('states the exact access deadline when the window is known', () => {
    render(
      <ContextSidebar
        prep={makePreparation({ scheduledAt: '2026-12-24T18:30:00Z' })}
        accessWindowMinutes={30}
      />,
    );

    expect(screen.getByText(/\(30 minutes after your interview starts\)/)).toBeInTheDocument();
    expect(screen.getByText(/^Access ends /)).toBeInTheDocument();
  });

  it('hides the profile block when no profile is loaded', () => {
    render(<ContextSidebar prep={makePreparation()} />);

    expect(screen.queryByText('Your profile')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /update profile/i })).not.toBeInTheDocument();
  });

  it('shows a profile summary and update link when the profile is loaded', () => {
    mockedUseTalentProfile.mockReturnValue({
      data: {
        tagline: 'Distributed systems engineer',
        totalYearsExperience: 6,
        resumeOriginalFileName: 'resume.pdf',
        updatedAt: '2026-09-01T00:00:00Z',
        workExperiences: [{ companyName: 'Globex' }],
      },
    } as unknown as ReturnType<typeof useTalentProfile>);

    render(<ContextSidebar prep={makePreparation()} />);

    expect(screen.getByText('Your profile')).toBeInTheDocument();
    expect(screen.getByText('resume.pdf')).toBeInTheDocument();
    expect(screen.getByText('Distributed systems engineer · 6 years · Globex')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /update profile/i })).toHaveAttribute(
      'href',
      '/profile',
    );
  });

  it('states the privacy guarantee', () => {
    render(<ContextSidebar prep={makePreparation()} />);

    expect(screen.getByRole('heading', { name: 'Private to you' })).toBeInTheDocument();
    expect(screen.getByText(/can't see this preparation/)).toBeInTheDocument();
  });
});
