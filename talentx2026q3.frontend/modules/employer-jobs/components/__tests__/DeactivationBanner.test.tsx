import { render, screen } from '@testing-library/react';

import { DeactivationBanner } from '../DeactivationBanner';

describe('DeactivationBanner', () => {
  const deactivatedProps = {
    status: 'Deactivated' as const,
    reasonLabel: 'Misleading or invalid information',
    details: "The salary in the title doesn't match the posting.",
    deactivatedAt: '2026-09-10T08:00:00Z',
  };

  it.each(['Published', 'Draft', 'Closed', 'Expired'] as const)(
    'renders nothing for a %s job',
    (status) => {
      const { container } = render(<DeactivationBanner status={status} reasonLabel="Spam" />);

      expect(container).toBeEmptyDOMElement();
    }
  );

  it('tells a deactivated job what happened, why, and what to do next', () => {
    render(<DeactivationBanner {...deactivatedProps} />);

    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent('An admin deactivated this job');
    expect(banner).toHaveTextContent('Reason: Misleading or invalid information');
    expect(banner).toHaveTextContent("The salary in the title doesn't match the posting.");
    expect(banner).toHaveTextContent('Fix the issues below, then resubmit for review.');
  });

  it('says editing is locked while the job is under review, and keeps the original reason', () => {
    render(<DeactivationBanner {...deactivatedProps} status="PendingReview" />);

    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent('Under admin review — editing is locked until the review is complete.');
    expect(banner).toHaveTextContent('Original reason: Misleading or invalid information');
    expect(banner).not.toHaveTextContent('Fix the issues below');
  });

  it('omits the next step when the caller turns it off', () => {
    render(<DeactivationBanner {...deactivatedProps} showNextStep={false} />);

    expect(screen.getByRole('status')).not.toHaveTextContent('Fix the issues below');
  });

  it('still renders when the reason fields are missing', () => {
    render(<DeactivationBanner status="Deactivated" />);

    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent('An admin deactivated this job');
    expect(banner).not.toHaveTextContent('Reason:');
  });
});
