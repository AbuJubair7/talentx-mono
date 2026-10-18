import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { WorkExperienceSection } from '../components/WorkExperienceSection'
import type { WorkExperienceDto } from '../types/resume.types'

function Harness({ initial }: { initial: WorkExperienceDto[] }) {
  const [items, setItems] = useState<WorkExperienceDto[]>(initial)
  return <WorkExperienceSection experiences={items} onChange={setItems} />
}

describe('WorkExperienceSection', () => {
  it('does not render numbered role labels', () => {
    render(<Harness initial={[{ jobTitle: 'Engineer', companyName: 'Acme' }]} />)

    expect(screen.queryByText(/role 1/i)).not.toBeInTheDocument()
    expect(screen.getByDisplayValue('Engineer')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Acme')).toBeInTheDocument()
  })

  it('removes an entry through a meaningful accessible name', async () => {
    render(<Harness initial={[{ jobTitle: 'Engineer', companyName: 'Acme' }]} />)

    await userEvent.click(screen.getByRole('button', { name: 'Remove Engineer at Acme' }))

    expect(screen.getByText(/no work experience found/i)).toBeInTheDocument()
  })

  it('falls back to a generic accessible name for an empty entry', () => {
    render(<Harness initial={[{}]} />)

    expect(screen.getByRole('button', { name: 'Remove work experience' })).toBeInTheDocument()
  })
})
