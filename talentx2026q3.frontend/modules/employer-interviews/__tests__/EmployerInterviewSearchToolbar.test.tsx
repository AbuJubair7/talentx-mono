import React from 'react'
import { render, screen } from '@testing-library/react'
import { EmployerInterviewSearchToolbar } from '../components/EmployerInterviewSearchToolbar'

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
}))

describe('EmployerInterviewSearchToolbar', () => {
  const renderComponent = () =>
    render(
      <EmployerInterviewSearchToolbar
        totalCount={3}
        statusFilter="All"
        typeFilter="All"
        onStatusFilterChange={jest.fn()}
        onTypeFilterChange={jest.fn()}
      />
    )

  it('offers every interview type in the type filter select', () => {
    renderComponent()

    const options = screen.getAllByRole('option').map((option) => option.textContent)
    expect(options).toEqual(
      expect.arrayContaining(['All Types', 'Online Assessment', 'On Call', 'On Site'])
    )
  })

  it('offers every interview status (including Cancelled) in the status filter select', () => {
    renderComponent()

    const options = screen.getAllByRole('option').map((option) => option.textContent)
    expect(options).toEqual(
      expect.arrayContaining(['All Statuses', 'Pending', 'Accepted', 'Declined', 'Cancelled'])
    )
  })
})
