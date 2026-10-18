import { act, cleanup, render, screen } from '@testing-library/react';

import { PrepGenerating } from '../components/PrepGenerating';

function stepStates(container: HTMLElement) {
  return Array.from(container.querySelectorAll('li')).map((li) => ({
    text: li.textContent ?? '',
    done: Boolean(li.querySelector('svg.text-success')),
    active: Boolean(li.querySelector('svg.animate-spin')),
  }));
}

describe('PrepGenerating', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('announces the loading state politely', () => {
    render(<PrepGenerating />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Generating interview preparation…')).toBeInTheDocument();
  });

  it('lists all three preparation steps using the default interview type', () => {
    render(<PrepGenerating />);

    expect(screen.getByText('Reading the job posting')).toBeInTheDocument();
    expect(screen.getByText('Matching it with your profile')).toBeInTheDocument();
    expect(screen.getByText('Tailoring to your interview interview')).toBeInTheDocument();
  });

  it('tailors the last step to the given interview type', () => {
    render(<PrepGenerating interviewType="HR" />);

    expect(screen.getByText('Tailoring to your hr interview')).toBeInTheDocument();
  });

  it('starts with the first step active and the rest pending', () => {
    const { container } = render(<PrepGenerating />);

    const steps = stepStates(container);
    expect(steps).toHaveLength(3);
    expect(steps[0]).toMatchObject({ done: false, active: true });
    expect(steps[1]).toMatchObject({ done: false, active: false });
    expect(steps[2]).toMatchObject({ done: false, active: false });
  });

  it('advances one step per interval and stays on the last step', () => {
    const { container } = render(<PrepGenerating />);

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(stepStates(container)).toEqual([
      { text: 'Reading the job posting', done: true, active: false },
      { text: 'Matching it with your profile', done: false, active: true },
      { text: 'Tailoring to your interview interview', done: false, active: false },
    ]);

    act(() => {
      jest.advanceTimersByTime(500);
    });
    let steps = stepStates(container);
    expect(steps[1].done).toBe(true);
    expect(steps[2].active).toBe(true);

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    steps = stepStates(container);
    expect(steps.filter((s) => s.active)).toHaveLength(1);
    expect(steps[2].active).toBe(true);
  });
});
