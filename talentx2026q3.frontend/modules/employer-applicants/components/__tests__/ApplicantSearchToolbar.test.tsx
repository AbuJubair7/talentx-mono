import React from 'react';
import { render, screen } from '@testing-library/react';
import { ApplicantSearchToolbar } from '../ApplicantSearchToolbar';

// The real Select is a Base UI popover: its options only mount into an accessible
// (non-`hidden`) DOM node after an open animation that jsdom does not settle in tests.
// Mocking it lets us assert which options a trigger renders without fighting that lifecycle.
jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <button type="button" role="combobox" aria-expanded="false" aria-controls="mock-select-list">
      {children}
    </button>
  ),
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div id="mock-select-list">{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div role="option" aria-selected="false" data-value={value}>{children}</div>
  ),
}));

describe('ApplicantSearchToolbar', () => {
  const renderComponent = () =>
    render(
      <ApplicantSearchToolbar
        searchInput=""
        statusFilter="All"
        isScoring={false}
        onSearchInputChange={jest.fn()}
        onSearchSubmit={jest.fn()}
        onClearSearch={jest.fn()}
        onStatusFilterChange={jest.fn()}
        onScoreApplicants={jest.fn()}
      />
    );

  it('offers every employer-visible status in the filter select', () => {
    renderComponent();

    const options = screen.getAllByRole('option').map((option) => option.textContent);
    expect(options).toEqual([
      'All Statuses',
      'Applied',
      'Reviewed',
      'Shortlisted',
      'Interview',
      'Hired',
      'Rejected',
      'Invited',
    ]);
    // PendingVerification is hidden from employers until the guest verifies their email.
    expect(options).not.toContain('Pending Verification');
  });

  it('renders Score with AI button with circular border beam light animation', () => {
    const { container } = renderComponent();
    const scoreButton = screen.getByRole('button', { name: /Score with AI/i });
    expect(scoreButton).toBeInTheDocument();
    const animatedElements = container.querySelectorAll('.animate-border-beam');
    expect(animatedElements.length).toBeGreaterThanOrEqual(1);
  });
});
