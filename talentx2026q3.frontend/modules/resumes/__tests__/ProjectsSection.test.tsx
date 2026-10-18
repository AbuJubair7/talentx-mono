import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ProjectsSection } from '../components/ProjectsSection'
import type { ProjectDto } from '../types/resume.types'

function Harness({ initial }: { initial: ProjectDto[] }) {
  const [items, setItems] = useState<ProjectDto[]>(initial)
  return <ProjectsSection projects={items} onChange={setItems} />
}

describe('ProjectsSection', () => {
  it('renders project fields and allows updating', () => {
    render(
      <Harness
        initial={[
          {
            projectName: 'Cache System',
            role: 'Lead Architect',
            projectType: 'Professional',
            startDate: '2023',
            endDate: '2024',
            description: 'In-memory cache.',
          },
        ]}
      />
    )

    expect(screen.getByDisplayValue('Cache System')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Lead Architect')).toBeInTheDocument()
    expect(screen.getByDisplayValue('In-memory cache.')).toBeInTheDocument()
  })

  it('removes an entry through an accessible name', async () => {
    render(
      <Harness
        initial={[
          {
            projectName: 'Cache System',
            role: 'Architect',
          },
        ]}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Remove Cache System (Architect)' }))
    expect(screen.getByText(/no projects found/i)).toBeInTheDocument()
  })

  it('adds a new project when Add project button is clicked', async () => {
    render(<Harness initial={[]} />)

    expect(screen.getByText(/no projects found/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /add project/i }))

    expect(screen.getByPlaceholderText(/e\.g\. Distributed Cache System/i)).toBeInTheDocument()
  })
})
