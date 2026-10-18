import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmployerReviewFilterToolbar } from '../components/EmployerReviewFilterToolbar'

// The real Select is a Base UI popover: its options only mount into an accessible
// (non-`hidden`) DOM node after an open animation that jsdom does not settle in tests.
// Mocking it lets us assert which options a trigger renders without fighting that lifecycle.
// Tabs render as plain buttons with no popover, so they need no such mock.
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

const counts = { Pending: 2, Published: 5, Rejected: 1, Hidden: 0, Withdrawn: 3 }

describe('EmployerReviewFilterToolbar', () => {
  const renderComponent = (overrides: Partial<React.ComponentProps<typeof EmployerReviewFilterToolbar>> = {}) =>
    render(
      <EmployerReviewFilterToolbar
        statusFilter="All"
        sentimentFilter="All"
        counts={counts}
        totalSubmitted={11}
        onStatusFilterChange={jest.fn()}
        onSentimentFilterChange={jest.fn()}
        {...overrides}
      />
    )

  it('renders an All tab plus one tab per status, each with its count', () => {
    renderComponent()

    expect(screen.getByRole('tab', { name: /all/i })).toHaveTextContent('11')
    expect(screen.getByRole('tab', { name: /pending review/i })).toHaveTextContent('2')
    expect(screen.getByRole('tab', { name: /published/i })).toHaveTextContent('5')
    expect(screen.getByRole('tab', { name: /rejected/i })).toHaveTextContent('1')
    expect(screen.getByRole('tab', { name: /hidden/i })).toHaveTextContent('0')
    expect(screen.getByRole('tab', { name: /withdrawn/i })).toHaveTextContent('3')
  })

  it('calls onStatusFilterChange when a status tab is clicked', async () => {
    const onStatusFilterChange = jest.fn()
    renderComponent({ onStatusFilterChange })

    await userEvent.click(screen.getByRole('tab', { name: /published/i }))

    expect(onStatusFilterChange).toHaveBeenCalledWith('Published')
  })

  it('offers every sentiment in the sentiment filter select', () => {
    renderComponent()

    const options = screen.getAllByRole('option').map((option) => option.textContent)
    expect(options).toEqual(expect.arrayContaining(['All Sentiments', 'Positive', 'Negative']))
  })
})
