import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EducationSection } from '../components/EducationSection'
import type { EducationDto } from '../types/resume.types'

function Harness({ initial }: { initial: EducationDto[] }) {
  const [items, setItems] = useState<EducationDto[]>(initial)
  return <EducationSection education={items} onChange={setItems} />
}

describe('EducationSection', () => {
  it('does not render numbered education labels', () => {
    render(<Harness initial={[{ degree: 'B.Sc. Computer Science', institution: 'MIT' }]} />)

    expect(screen.queryByText(/education 1/i)).not.toBeInTheDocument()
    expect(screen.getByDisplayValue('B.Sc. Computer Science')).toBeInTheDocument()
    expect(screen.getByDisplayValue('MIT')).toBeInTheDocument()
  })

  it('removes an entry through a meaningful accessible name', async () => {
    render(<Harness initial={[{ degree: 'B.Sc. Computer Science', institution: 'MIT' }]} />)

    await userEvent.click(screen.getByRole('button', { name: 'Remove B.Sc. Computer Science at MIT' }))

    expect(screen.getByText(/no education history found/i)).toBeInTheDocument()
  })

  it('falls back to a generic accessible name for an empty entry', () => {
    render(<Harness initial={[{}]} />)

    expect(screen.getByRole('button', { name: 'Remove education' })).toBeInTheDocument()
  })
})
