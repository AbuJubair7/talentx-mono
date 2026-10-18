import React from 'react';
import { render, screen } from '@testing-library/react';
import { MatchedCandidatesList } from '../components/MatchedCandidatesList';
import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper';

jest.mock('../hooks/useMatchedCandidates', () => ({
  useMatchedCandidates: jest.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
  })),
}));

jest.mock('../hooks/useRunMatching', () => ({
  useRunMatching: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
}));

jest.mock('../hooks/useSendInvitation', () => ({
  useSendInvitation: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
}));

describe('MatchedCandidatesList', () => {
  it('renders section title and empty state when no candidates found', () => {
    const Wrapper = createQueryWrapper();

    render(
      <Wrapper>
        <MatchedCandidatesList jobId="job-1" />
      </Wrapper>
    );

    expect(screen.getByText('AI Talent Recommendations')).toBeInTheDocument();
    expect(screen.getByText('No Candidate Matches Yet')).toBeInTheDocument();
    expect(screen.getByText(/Run AI Matching/)).toBeInTheDocument();
  });

  it('keeps the run matching button enabled so any job status can trigger it', () => {
    const Wrapper = createQueryWrapper();

    render(
      <Wrapper>
        <MatchedCandidatesList jobId="job-1" />
      </Wrapper>
    );

    const runButton = screen.getByRole('button', { name: /Find matching candidates/i });
    expect(runButton).toBeEnabled();
  });
});
