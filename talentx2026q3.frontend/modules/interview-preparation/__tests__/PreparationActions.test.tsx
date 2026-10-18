import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PreparationActions } from '../components/PreparationActions';
import type { InterviewPreparationQuota } from '../types';

function makeQuota(overrides: Partial<InterviewPreparationQuota> = {}): InterviewPreparationQuota {
  return {
    dailyGenerateLimit: 5,
    dailyGenerationLimit: 10,
    maxRegenerationCount: 3,
    accessWindowAfterInterviewMinutes: 30,
    generatesUsedToday: 1,
    generationsUsedToday: 3,
    remainingGeneratesToday: 4,
    remainingGenerationsToday: 7,
    ...overrides,
  };
}

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

afterEach(() => jest.clearAllMocks());

describe('PreparationActions', () => {
  it('renders nothing while closed', () => {
    render(
      <PreparationActions
        open={false}
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
        isPending={false}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('explains what regenerating will replace when open', () => {
    render(
      <PreparationActions
        open
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
        isPending={false}
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Regenerate preparation?')).toBeInTheDocument();
    expect(within(dialog).getByText(/practiced marks will be replaced/)).toBeInTheDocument();
  });

  it('shows the remaining regenerations and daily budget when quota is provided', () => {
    render(
      <PreparationActions
        open
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
        isPending={false}
        quota={makeQuota()}
        generationCount={2}
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByText(/Regenerations left for this preparation/),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('1 of 3')).toBeInTheDocument();
    expect(within(dialog).getByText('7 of 10')).toBeInTheDocument();
  });

  it('omits the quota note when no quota is provided', () => {
    render(
      <PreparationActions
        open
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
        isPending={false}
      />,
    );

    expect(
      screen.queryByText(/Regenerations left for this preparation/),
    ).not.toBeInTheDocument();
  });

  it('closes through Cancel without confirming', async () => {
    const onOpenChange = jest.fn();
    const onConfirm = jest.fn();
    render(
      <PreparationActions open onOpenChange={onOpenChange} onConfirm={onConfirm} isPending={false} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('confirms through the Regenerate button', async () => {
    const onConfirm = jest.fn();
    render(
      <PreparationActions open onOpenChange={jest.fn()} onConfirm={onConfirm} isPending={false} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Regenerate' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons and swaps the label while pending', async () => {
    const onOpenChange = jest.fn();
    const onConfirm = jest.fn();
    render(
      <PreparationActions open onOpenChange={onOpenChange} onConfirm={onConfirm} isPending />,
    );

    const cancel = screen.getByRole('button', { name: 'Cancel' });
    const confirm = screen.getByRole('button', { name: 'Regenerating…' });
    expect(cancel).toBeDisabled();
    expect(confirm).toBeDisabled();

    await userEvent.click(cancel);
    await userEvent.click(confirm);

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
