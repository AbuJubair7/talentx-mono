import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { GenerationError } from '../components/GenerationError';

afterEach(() => jest.clearAllMocks());

describe('GenerationError', () => {
  it('renders an alert with the failure copy', () => {
    render(<GenerationError onRetry={jest.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      "We couldn't load your preparation",
    );
    expect(
      screen.getByText(/Your application and interview details are unaffected/),
    ).toBeInTheDocument();
  });

  it('calls onRetry when Try again is clicked', async () => {
    const onRetry = jest.fn();
    render(<GenerationError onRetry={onRetry} />);

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('disables the button and swaps the label while retrying', async () => {
    const onRetry = jest.fn();
    render(<GenerationError onRetry={onRetry} isRetrying />);

    const button = screen.getByRole('button', { name: 'Trying again…' });
    expect(button).toBeDisabled();

    await userEvent.click(button);
    expect(onRetry).not.toHaveBeenCalled();
  });
});
