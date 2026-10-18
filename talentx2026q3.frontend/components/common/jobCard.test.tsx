import { render, screen } from '@testing-library/react'
import { JobCard } from '@/components/common/JobCard'
import type { JobDto } from '@/types/job'

const baseJob: JobDto = {
  id: 'job-123',
  title: 'Backend Engineer (.NET)',
  companyName: 'Northwind Labs',
  location: 'Remote',
  employmentType: 'Contract',
  experienceLevel: 'SeniorLevel',
  workArrangement: 'FullRemote',
  requiredSkills: ['C#', '.NET'],
  createdAt: '2026-08-01T00:00:00Z',
  expireAt: '2026-12-31T00:00:00Z',
}

describe('JobCard Legacy Compatibility', () => {
  it('renders the job title and company name', () => {
    render(<JobCard job={baseJob} />)
    expect(screen.getByText('Backend Engineer (.NET)')).toBeInTheDocument()
    expect(screen.getByText('Northwind Labs')).toBeInTheDocument()
  })

  it('renders the location', () => {
    render(<JobCard job={baseJob} />)
    expect(screen.getByText('Remote')).toBeInTheDocument()
  })

  it('renders the employment type badge', () => {
    render(<JobCard job={baseJob} />)
    expect(screen.getByText('Contract')).toBeInTheDocument()
  })

  it('links to the correct job details route', () => {
    render(<JobCard job={baseJob} />)
    const links = screen.getAllByRole('link')
    expect(links.some((anchor) => anchor.getAttribute('href') === '/jobs/job-123')).toBe(true)
  })

  it('shows a "View Role" action', () => {
    render(<JobCard job={baseJob} />)
    expect(screen.getByText(/View Role/i)).toBeInTheDocument()
  })

  it('shows a company avatar from the first letters of the company name', () => {
    render(<JobCard job={baseJob} />)
    expect(screen.getByText('NO')).toBeInTheDocument()
  })

  it('renders different data correctly', () => {
    const otherJob: JobDto = {
      id: 'job-999',
      title: 'Frontend Developer',
      companyName: 'Acme Inc',
      location: 'Dhaka, Bangladesh',
      city: 'Dhaka',
      country: 'Bangladesh',
      employmentType: 'FullTime',
      experienceLevel: 'MidLevel',
      workArrangement: 'Hybrid',
      requiredSkills: ['React'],
      createdAt: '2026-08-01T00:00:00Z',
      expireAt: '2026-12-31T00:00:00Z',
    }
    render(<JobCard job={otherJob} />)
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument()
    expect(screen.getByText('Acme Inc')).toBeInTheDocument()
    expect(screen.getByText('Dhaka, Bangladesh')).toBeInTheDocument()
    expect(screen.getByText('Full Time')).toBeInTheDocument()
  })
})