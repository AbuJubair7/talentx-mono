import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RunMatchingButton } from '../components/RunMatchingButton';

describe('RunMatchingButton', () => {
  it('renders Find matching candidates when no matches exist', () => {
    render(<RunMatchingButton onClick={jest.fn()} isLoading={false} hasMatches={false} />);
    expect(screen.getByText('Find matching candidates')).toBeInTheDocument();
  });

  it('renders match count badge when matches exist', () => {
    render(<RunMatchingButton onClick={jest.fn()} isLoading={false} hasMatches={true} matchCount={3} />);
    expect(screen.getByText('Find matching candidates')).toBeInTheDocument();
    expect(screen.getByText('3 matches ready')).toBeInTheDocument();
  });

  it('renders loading state when isLoading is true', () => {
    render(<RunMatchingButton onClick={jest.fn()} isLoading={true} />);
    expect(screen.getByText('Finding candidates...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick when clicked and enabled', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<RunMatchingButton onClick={handleClick} isLoading={false} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<RunMatchingButton onClick={jest.fn()} isLoading={false} disabled={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders circular border beam light animation elements', () => {
    const { container } = render(<RunMatchingButton onClick={jest.fn()} isLoading={false} />);
    const animatedElements = container.querySelectorAll('.animate-border-beam');
    expect(animatedElements.length).toBeGreaterThanOrEqual(1);
  });
});
