import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CandidateRow } from '../components/CandidateRow';
import type { CandidateMatch } from '../types/employer-job.types';

const mockCandidate: CandidateMatch = {
  candidateId: 'cand-1',
  talentUserId: 'talent-usr-1',
  name: 'Jane Doe',
  tagline: 'Senior Full Stack Engineer',
  location: 'Remote, US',
  totalYearsExperience: 6,
  expectedSalary: 120000,
  technicalSkills: ['React', 'TypeScript', 'Node.js'],
  score: 89,
  explanation: 'Strong background in modern frontend and backend architectures.',
  status: 'Active',
  hasActiveInvitation: false,
  matchedAt: '2026-09-01T00:00:00Z',
};

describe('CandidateRow', () => {
  it('renders candidate name, score, and details', async () => {
    const user = userEvent.setup();
    render(
      <CandidateRow
        candidate={mockCandidate}
        onViewProfile={jest.fn()}
        onSendInvite={jest.fn()}
        isInviting={false}
      />
    );

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Senior Full Stack Engineer')).toBeInTheDocument();
    // Score renders as a dial (accessible label) alongside a band chip
    expect(
      screen.getByRole('img', { name: 'Match score 89 out of 100' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Strong match')).toBeInTheDocument();
    expect(screen.getByText('Remote, US')).toBeInTheDocument();
    expect(screen.getByText('6y')).toBeInTheDocument();

    // Explanation and skills live in the expandable details section
    await user.click(screen.getByRole('button', { name: /See details/i }));

    expect(screen.getByText(/Strong background in modern frontend/)).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('renders salary in featured mode', () => {
    render(
      <CandidateRow
        candidate={mockCandidate}
        onViewProfile={jest.fn()}
        onSendInvite={jest.fn()}
        isInviting={false}
        featured
      />
    );

    expect(screen.getByText('$120,000/yr')).toBeInTheDocument();
  });

  it('calls onViewProfile when View Profile button is clicked', async () => {
    const handleViewProfile = jest.fn();
    const user = userEvent.setup();

    render(
      <CandidateRow
        candidate={mockCandidate}
        onViewProfile={handleViewProfile}
        onSendInvite={jest.fn()}
        isInviting={false}
      />
    );

    await user.click(screen.getByRole('button', { name: /View Profile/i }));
    expect(handleViewProfile).toHaveBeenCalledWith(mockCandidate);
  });

  it('calls onSendInvite when Invite button is clicked', async () => {
    const handleSendInvite = jest.fn();
    const user = userEvent.setup();

    render(
      <CandidateRow
        candidate={mockCandidate}
        onViewProfile={jest.fn()}
        onSendInvite={handleSendInvite}
        isInviting={false}
      />
    );

    await user.click(screen.getByRole('button', { name: /Invite/i }));
    expect(handleSendInvite).toHaveBeenCalledWith('talent-usr-1');
  });

  it('displays Invited badge when candidate already has active invitation', () => {
    const invitedCandidate = { ...mockCandidate, hasActiveInvitation: true };

    render(
      <CandidateRow
        candidate={invitedCandidate}
        onViewProfile={jest.fn()}
        onSendInvite={jest.fn()}
        isInviting={false}
      />
    );

    expect(screen.getByText('Invited')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Invite$/i })).not.toBeInTheDocument();
  });

  it('shows Withdraw button for a pending invitation and calls onWithdraw with invitation id', async () => {
    const handleWithdraw = jest.fn();
    const user = userEvent.setup();
    const pendingCandidate = {
      ...mockCandidate,
      hasActiveInvitation: true,
      invitationStatus: 'Pending',
      invitationId: 'inv-1',
    };

    render(
      <CandidateRow
        candidate={pendingCandidate}
        onViewProfile={jest.fn()}
        onSendInvite={jest.fn()}
        isInviting={false}
        onWithdraw={handleWithdraw}
        isWithdrawing={false}
      />
    );

    await user.click(screen.getByRole('button', { name: /Withdraw/i }));
    expect(handleWithdraw).toHaveBeenCalledWith('inv-1');
  });

  it('hides Withdraw button once the invitation is accepted', () => {
    const acceptedCandidate = {
      ...mockCandidate,
      hasActiveInvitation: true,
      invitationStatus: 'Accepted',
      invitationId: 'inv-1',
    };

    render(
      <CandidateRow
        candidate={acceptedCandidate}
        onViewProfile={jest.fn()}
        onSendInvite={jest.fn()}
        isInviting={false}
        onWithdraw={jest.fn()}
        isWithdrawing={false}
      />
    );

    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Withdraw/i })).not.toBeInTheDocument();
  });
});
