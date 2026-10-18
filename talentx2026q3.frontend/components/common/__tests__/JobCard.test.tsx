import { render, screen, fireEvent } from '@testing-library/react'
import { JobCard } from '../JobCard'
import type { JobDto } from '@/types/job'
import type { JobListItem } from '@/modules/job-listing/types/job.types'

const baseJobDto: JobDto = {
  id: 'job-101',
  title: 'Senior Frontend Engineer',
  companyName: 'Acme AI',
  location: 'San Francisco, CA',
  city: 'San Francisco',
  country: 'USA',
  employmentType: 'FullTime',
  experienceLevel: 'SeniorLevel',
  workArrangement: 'FullRemote',
  requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'GraphQL'],
  createdAt: new Date().toISOString(), // Today -> should have NEW badge
  expireAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
}

const olderJobListItem: JobListItem = {
  id: 'job-202',
  title: 'Lead Backend Developer',
  companyName: 'Stripe Labs',
  location: 'Remote',
  city: null,
  country: null,
  employmentType: 'Contract',
  experienceLevel: 'Lead',
  workArrangement: 'Hybrid',
  requiredSkills: ['Go', 'PostgreSQL'],
  createdAt: new Date(Date.now() - 10 * 86_400_000).toISOString(), // 10 days ago -> no NEW badge
  expireAt: new Date(Date.now() + 20 * 86_400_000).toISOString(),
}

describe('JobCard', () => {
  describe('Rendering Basics & Identity', () => {
    it('renders the job title and company name with verified badge', () => {
      render(<JobCard job={baseJobDto} />)

      expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument()
      expect(screen.getByText('Acme AI')).toBeInTheDocument()
      expect(screen.getByLabelText('Verified company')).toBeInTheDocument()
    })

    it('renders company avatar initials derived from company name', () => {
      render(<JobCard job={baseJobDto} />)
      expect(screen.getByText('AC')).toBeInTheDocument()
    })

    it('renders fallback company avatar initials when company name is missing', () => {
      const jobWithoutCompanyName = {
        ...baseJobDto,
        companyName: '',
      }
      render(<JobCard job={jobWithoutCompanyName} />)
      expect(screen.getByText('CO')).toBeInTheDocument()
    })

    it('renders link to job details route with stretched overlay link', () => {
      render(<JobCard job={baseJobDto} />)
      const link = screen.getByRole('link', { name: /Senior Frontend Engineer/i })
      expect(link).toHaveAttribute('href', '/jobs/job-101')
    })

    it('renders location formatted as "City, Country" when both are present', () => {
      render(<JobCard job={baseJobDto} />)
      expect(screen.getByText('San Francisco, USA')).toBeInTheDocument()
    })

    it('falls back to location property when city and country are not present', () => {
      render(<JobCard job={olderJobListItem} />)
      expect(screen.getByText('Remote')).toBeInTheDocument()
    })

    it('renders "View Role" ghost action button in the footer', () => {
      render(<JobCard job={baseJobDto} />)
      expect(screen.getByText('View Role')).toBeInTheDocument()
    })
  })

  describe('NEW Badge', () => {
    it('renders the NEW badge when job was posted within 3 days', () => {
      render(<JobCard job={baseJobDto} />)
      expect(screen.getByText('NEW')).toBeInTheDocument()
    })

    it('does not render the NEW badge when job was posted more than 3 days ago', () => {
      render(<JobCard job={olderJobListItem} />)
      expect(screen.queryByText('NEW')).not.toBeInTheDocument()
    })

    it('does not render the NEW badge when createdAt is missing or empty', () => {
      const jobWithoutDate = {
        ...baseJobDto,
        createdAt: '',
      }
      render(<JobCard job={jobWithoutDate} />)
      expect(screen.queryByText('NEW')).not.toBeInTheDocument()
    })
  })

  describe('Metadata Pill Badges', () => {
    it('renders formatted employment type badge', () => {
      render(<JobCard job={baseJobDto} />)
      expect(screen.getByText('Full Time')).toBeInTheDocument()
    })

    it('renders formatted work arrangement badge', () => {
      render(<JobCard job={baseJobDto} />)
      expect(screen.getByText('Full Remote')).toBeInTheDocument()
    })

    it('renders formatted experience level badge', () => {
      render(<JobCard job={baseJobDto} />)
      expect(screen.getByText('Senior Level')).toBeInTheDocument()
    })

    it('omits metadata pills when values are empty or undefined', () => {
      const sparseJob: JobDto = {
        id: 'job-303',
        title: 'Platform Architect',
        companyName: 'CloudScale',
        location: 'Berlin',
        employmentType: '' as JobDto['employmentType'],
        experienceLevel: '' as JobDto['experienceLevel'],
        workArrangement: '' as JobDto['workArrangement'],
        requiredSkills: [],
        createdAt: new Date().toISOString(),
        expireAt: new Date().toISOString(),
      }
      render(<JobCard job={sparseJob} />)
      expect(screen.queryByText('Full Time')).not.toBeInTheDocument()
      expect(screen.queryByText('Full Remote')).not.toBeInTheDocument()
      expect(screen.queryByText('Senior Level')).not.toBeInTheDocument()
    })
  })

  describe('Required Skill Chips', () => {
    it('renders up to 3 skill chips and shows overflow count', () => {
      render(<JobCard job={baseJobDto} />)
      // First 3 of 5 skills
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Tailwind CSS')).toBeInTheDocument()
      // Overflow count (+2)
      expect(screen.getByText('+2')).toBeInTheDocument()
      // 4th and 5th should not be directly rendered
      expect(screen.queryByText('Next.js')).not.toBeInTheDocument()
      expect(screen.queryByText('GraphQL')).not.toBeInTheDocument()
    })

    it('renders all skills without overflow count when 3 or fewer skills', () => {
      render(<JobCard job={olderJobListItem} />)
      expect(screen.getByText('Go')).toBeInTheDocument()
      expect(screen.getByText('PostgreSQL')).toBeInTheDocument()
      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
    })

    it('handles empty skill list gracefully without rendering skill container', () => {
      const jobWithoutSkills = {
        ...baseJobDto,
        requiredSkills: [],
      }
      const { container } = render(<JobCard job={jobWithoutSkills} />)
      expect(container.querySelector('.font-mono')).toBeNull()
    })
  })

  describe('Bookmark Action', () => {
    it('toggles bookmark state between saved and unsaved on click', () => {
      render(<JobCard job={baseJobDto} />)

      const bookmarkButton = screen.getByRole('button', { name: 'Save job' })
      expect(bookmarkButton).toBeInTheDocument()

      // Click to save
      fireEvent.click(bookmarkButton)
      expect(screen.getByRole('button', { name: 'Remove from saved jobs' })).toBeInTheDocument()

      // Click again to remove
      fireEvent.click(screen.getByRole('button', { name: 'Remove from saved jobs' }))
      expect(screen.getByRole('button', { name: 'Save job' })).toBeInTheDocument()
    })

    it('stops event propagation when bookmark button is clicked', () => {
      render(<JobCard job={baseJobDto} />)

      const bookmarkButton = screen.getByRole('button', { name: 'Save job' })
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true })
      const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation')

      fireEvent(bookmarkButton, clickEvent)
      expect(stopPropagationSpy).toHaveBeenCalled()
    })
  })

  describe('Data Source Compatibility (JobListItem vs JobDto)', () => {
    it('renders correctly with JobListItem data', () => {
      render(<JobCard job={olderJobListItem} />)
      expect(screen.getByText('Lead Backend Developer')).toBeInTheDocument()
      expect(screen.getByText('Stripe Labs')).toBeInTheDocument()
      expect(screen.getByText('Contract')).toBeInTheDocument()
      expect(screen.getByText('Hybrid')).toBeInTheDocument()
      expect(screen.getByText('Lead')).toBeInTheDocument()
    })

    it('renders correctly with JobDto data', () => {
      render(<JobCard job={baseJobDto} />)
      expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument()
      expect(screen.getByText('Acme AI')).toBeInTheDocument()
    })
  })
})
