import React from 'react';
import { render, screen } from '@testing-library/react';
import { MatchScoreBadge } from '../components/MatchScoreBadge';

describe('MatchScoreBadge', () => {
  it('renders high score with correct text', () => {
    render(<MatchScoreBadge score={92.4} />);
    expect(screen.getByText('92% Match')).toBeInTheDocument();
  });

  it('renders medium score correctly', () => {
    render(<MatchScoreBadge score={74.8} />);
    expect(screen.getByText('75% Match')).toBeInTheDocument();
  });

  it('renders moderate score correctly', () => {
    render(<MatchScoreBadge score={55} />);
    expect(screen.getByText('55% Match')).toBeInTheDocument();
  });

  it('renders low score correctly', () => {
    render(<MatchScoreBadge score={35} />);
    expect(screen.getByText('35% Match')).toBeInTheDocument();
  });
});
