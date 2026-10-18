import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PortfolioLinksEditor } from '../components/PortfolioLinksEditor'

function Harness({ initial = [] as string[] }) {
  const [urls, setUrls] = useState<string[]>(initial)
  return <PortfolioLinksEditor urls={urls} onChange={setUrls} />
}

describe('PortfolioLinksEditor', () => {
  it('renders one input per url', () => {
    render(<Harness initial={['https://ada.dev', 'https://ada.github.io']} />)

    expect(screen.getByLabelText('Portfolio URL 1')).toHaveValue('https://ada.dev')
    expect(screen.getByLabelText('Portfolio URL 2')).toHaveValue('https://ada.github.io')
  })

  it('shows a hint when there are no urls', () => {
    render(<Harness initial={[]} />)

    expect(screen.getByText(/no portfolio links yet/i)).toBeInTheDocument()
  })

  it('appends a row when "Add link" is clicked', async () => {
    const user = userEvent.setup()
    render(<Harness initial={['https://ada.dev']} />)

    await user.click(screen.getByRole('button', { name: /add link/i }))

    expect(screen.getByLabelText('Portfolio URL 2')).toBeInTheDocument()
  })

  it('appends a row when Enter is pressed in a row', async () => {
    const user = userEvent.setup()
    render(<Harness initial={['https://ada.dev']} />)

    await user.type(screen.getByLabelText('Portfolio URL 1'), '{Enter}')

    expect(screen.getByLabelText('Portfolio URL 2')).toBeInTheDocument()
  })

  it('updates a url value as the user types', async () => {
    const user = userEvent.setup()
    render(<Harness initial={['https://ada.dev']} />)

    const input = screen.getByLabelText('Portfolio URL 1')
    await user.clear(input)
    await user.type(input, 'https://new.dev')

    expect(input).toHaveValue('https://new.dev')
  })

  it('removes the row that was clicked', async () => {
    const user = userEvent.setup()
    render(<Harness initial={['https://a.dev', 'https://b.dev']} />)

    await user.click(screen.getByRole('button', { name: /remove portfolio url 1/i }))

    expect(screen.queryByLabelText('Portfolio URL 2')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Portfolio URL 1')).toHaveValue('https://b.dev')
  })

  it('shows an inline error for an invalid url on blur', async () => {
    const user = userEvent.setup()
    render(<Harness initial={['https://ada.dev']} />)

    const input = screen.getByLabelText('Portfolio URL 1')
    await user.clear(input)
    await user.type(input, 'not a url')
    fireEvent.blur(input)

    expect(await screen.findByText(/enter a valid url/i)).toBeInTheDocument()
  })

  it('does not show an error for a valid url', () => {
    render(<Harness initial={['https://ada.dev']} />)

    fireEvent.blur(screen.getByLabelText('Portfolio URL 1'))

    expect(screen.queryByText(/enter a valid url/i)).not.toBeInTheDocument()
  })
})
