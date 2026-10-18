import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { RatingStars } from '../components/RatingStars'

describe('RatingStars (read-only)', () => {
  it('describes the rating for assistive tech', () => {
    render(<RatingStars value={4} />)
    expect(screen.getByRole('img', { name: '4 out of 5' })).toBeInTheDocument()
  })

  it('describes a missing rating as not rated', () => {
    render(<RatingStars value={null} />)
    expect(screen.getByRole('img', { name: 'Not rated' })).toBeInTheDocument()
  })

  it('has no buttons', () => {
    render(<RatingStars value={3} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('RatingStars (interactive)', () => {
  it('renders five keyboard-reachable star buttons inside a labelled group', () => {
    render(<RatingStars value={null} onChange={jest.fn()} label="Communication" />)

    const group = screen.getByRole('group', { name: 'Communication' })
    expect(group).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Rate \d out of 5/ })).toHaveLength(5)
  })

  it('reports the chosen star', async () => {
    const onChange = jest.fn()
    render(<RatingStars value={null} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Rate 4 out of 5' }))

    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('marks the current rating as pressed', () => {
    render(<RatingStars value={2} onChange={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Rate 2 out of 5' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Rate 3 out of 5' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('can be operated with the keyboard', async () => {
    const onChange = jest.fn()
    render(<RatingStars value={null} onChange={onChange} />)

    await userEvent.tab()
    await userEvent.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('offers Clear only when clearable and a rating is set, and clears to undefined', async () => {
    const onChange = jest.fn()
    const { rerender } = render(<RatingStars value={null} onChange={onChange} clearable />)
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument()

    rerender(<RatingStars value={3} onChange={onChange} clearable />)
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onChange).toHaveBeenCalledWith(undefined)

    rerender(<RatingStars value={3} onChange={onChange} />)
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument()
  })
})
