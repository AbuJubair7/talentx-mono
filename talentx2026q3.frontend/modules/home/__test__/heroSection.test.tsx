import { render, screen } from '@testing-library/react'
import { HeroSection } from '../components/heroSection'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: () => null,
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

describe('HeroSection Component', () => {
  it('renders the centered headline (H1) with accessible label and correct text', () => {
    render(<HeroSection />)

    const headingElement = screen.getByRole('heading', { level: 1 })
    expect(headingElement).toBeInTheDocument()
    expect(headingElement).toHaveAttribute(
      'aria-label',
      'Less effort to hire. Less wait to be hired.',
    )
    expect(headingElement.textContent).toContain('Less effort to hire.')
    expect(headingElement.textContent).toContain('Less wait to be hired.')
  })

  it('renders headline with normal wave animation words and staggered delays', () => {
    const { container } = render(<HeroSection />)

    const wavyWords = container.querySelectorAll('.animate-wave-word')
    expect(wavyWords.length).toBe(9)

    expect(wavyWords[0].textContent).toBe('Less')
    expect(wavyWords[0]).toHaveStyle({ '--wave-delay': '0.00s' })

    expect(wavyWords[1].textContent).toBe('effort')
    expect(wavyWords[1]).toHaveStyle({ '--wave-delay': '0.14s' })

    expect(wavyWords[2].textContent).toBe('to')
    expect(wavyWords[2]).toHaveStyle({ '--wave-delay': '0.28s' })

    expect(wavyWords[3].textContent).toBe('hire.')
    expect(wavyWords[3]).toHaveStyle({ '--wave-delay': '0.42s' })

    expect(wavyWords[4].textContent).toBe('Less')
    expect(wavyWords[4]).toHaveStyle({ '--wave-delay': '0.56s' })

    expect(wavyWords[5].textContent).toBe('wait')
    expect(wavyWords[5]).toHaveStyle({ '--wave-delay': '0.70s' })

    expect(wavyWords[6].textContent).toBe('to')
    expect(wavyWords[6]).toHaveStyle({ '--wave-delay': '0.84s' })

    expect(wavyWords[7].textContent).toBe('be')
    expect(wavyWords[7]).toHaveStyle({ '--wave-delay': '0.98s' })

    expect(wavyWords[8].textContent).toBe('hired.')
    expect(wavyWords[8]).toHaveStyle({ '--wave-delay': '1.12s' })
  })

  it('renders the context subtitle with balanced dual-value proposition', () => {
    render(<HeroSection />)

    const subtitleElement = screen.getByText(
      /TalentX is the intelligent marketplace connecting world-class tech companies with elite AI and engineering talent\. Match faster, hire smarter, build further\./i,
    )
    expect(subtitleElement).toBeInTheDocument()
  })

  it('renders dual-audience quick links pointing to /jobs and /job/jobpost', () => {
    render(<HeroSection />)

    const candidateLink = screen.getByRole('link', { name: /browse all open roles/i })
    expect(candidateLink).toBeInTheDocument()
    expect(candidateLink).toHaveAttribute('href', '/jobs')
    expect(candidateLink.textContent).toContain('Looking for work?')

    const employerLink = screen.getByRole('link', { name: /post a job for free/i })
    expect(employerLink).toBeInTheDocument()
    expect(employerLink).toHaveAttribute('href', '/job/jobpost')
    expect(employerLink.textContent).toContain('Hiring talent?')
  })

  it('renders JobSearchBar inside the hero section with input fields, select, and search button', () => {
    render(<HeroSection />)

    const keywordInput = screen.getByLabelText('Job title, skill, or keyword')
    const locationInput = screen.getByLabelText('Filter by location')
    const experienceSelect = screen.getByLabelText('Filter by experience level')
    const searchButton = screen.getByRole('button', { name: /search jobs/i })

    expect(keywordInput).toBeInTheDocument()
    expect(locationInput).toBeInTheDocument()
    expect(experienceSelect).toBeInTheDocument()
    expect(searchButton).toBeInTheDocument()
  })

  it('renders primary CTA buttons for talent and employer paths', () => {
    render(<HeroSection />)

    expect(screen.getByRole('button', { name: /find your opportunity/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /find great talent/i })).toBeInTheDocument()
  })

  it('does NOT render the obsolete 2-column split cards', () => {
    render(<HeroSection />)

    expect(screen.queryByText(/Find a startup role you love/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Hire top AI & tech talent/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Connect directly with founders/i)).not.toBeInTheDocument()
  })
})
