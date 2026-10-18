import { render, screen, fireEvent } from '@testing-library/react'

import { SaveJobButton } from '../SaveJobButton'

describe('SaveJobButton', () => {
  it('renders "Save" with a gray background when isSaved is false', () => {
    render(<SaveJobButton jobId="job-1" isSaved={false} onToggle={jest.fn()} />)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button.className).toContain('bg-slate-100')
    expect(button.className).not.toContain('bg-white')
  })

  it('renders "Saved" with a white (page-color) background and black text when isSaved is true', () => {
    render(<SaveJobButton jobId="job-1" isSaved={true} onToggle={jest.fn()} />)
    const button = screen.getByRole('button', { name: 'Saved' })
    expect(button.className).toContain('bg-white')
    expect(button.className).toContain('text-slate-900')
  })

  it('calls onToggle with the flipped saved state on click', () => {
    const onToggle = jest.fn()
    render(<SaveJobButton jobId="job-1" isSaved={false} onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledWith('job-1', true)
  })

  it('prevents the click from reaching an ancestor click handler', () => {
    const onToggle = jest.fn()
    const parentClick = jest.fn()
    render(
      <div onClick={parentClick}>
        <SaveJobButton jobId="job-1" isSaved={false} onToggle={onToggle} />
      </div>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalled()
    expect(parentClick).not.toHaveBeenCalled()
  })

  it('does not call onToggle when disabled', () => {
    const onToggle = jest.fn()
    render(<SaveJobButton jobId="job-1" isSaved={false} onToggle={onToggle} disabled />)
    fireEvent.click(screen.getByRole('button'))
    expect(onToggle).not.toHaveBeenCalled()
  })
})
