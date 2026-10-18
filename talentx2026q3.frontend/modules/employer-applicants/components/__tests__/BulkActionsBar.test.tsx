import React from 'react';
import { render, screen } from '@testing-library/react';
import { BulkActionsBar } from '../BulkActionsBar';

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

describe('BulkActionsBar', () => {
  const onBulkStatusChange = jest.fn();
  const onClearSelection = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <BulkActionsBar
        selectedCount={2}
        isUpdating={false}
        onBulkStatusChange={onBulkStatusChange}
        onClearSelection={onClearSelection}
      />
    );

  it('renders the selected count', () => {
    renderComponent();
    expect(screen.getByText('2 candidates selected')).toBeInTheDocument();
  });

  it('offers every manual status including the Applied revert in the bulk status select', () => {
    renderComponent();

    const options = screen.getAllByRole('option').map((option) => option.textContent);
    expect(options).toEqual(['Applied', 'Shortlisted', 'Hired', 'Rejected']);
    expect(options).not.toContain('PendingVerification');
    expect(options).not.toContain('Reviewed');
    expect(options).not.toContain('Interview');
    expect(options).not.toContain('Invited');
  });
});
