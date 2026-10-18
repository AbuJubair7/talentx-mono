import { render, screen } from '@testing-library/react'
import { PromoCard } from '../components/browse/PromoCard'

describe('PromoCard', () => {
  it('renders the resume prompt and links to the profile media & resume tab', () => {
    render(<PromoCard />)

    expect(screen.getByText('Boost Your Visibility')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Keep Your Resume Up to Date' }),
    ).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /Update Resume/i })
    expect(link).toHaveAttribute('href', '/profile?tab=media-resume')
  })
})
