import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'

import { TimeslotFieldArray } from '../components/SendInterviewDialog/TimeslotFieldArray'
import type { SendInterviewFormValues } from '../schemas/send-interview-schema'

function Harness() {
  const {
    control,
    register,
    formState: { errors },
  } = useForm<SendInterviewFormValues>({
    defaultValues: {
      type: 'OnCall',
      assessmentUrl: '',
      assessmentDeadline: '',
      locationOrLink: '',
      instructions: '',
      timeslots: [],
    },
  })
  return <TimeslotFieldArray control={control} register={register} errors={errors} />
}

describe('TimeslotFieldArray', () => {
  it('starts with an empty-state hint and no slot rows', () => {
    render(<Harness />)
    expect(screen.getByText(/no timeslots offered yet/i)).toBeInTheDocument()
    expect(screen.queryByText('Start time')).not.toBeInTheDocument()
  })

  it('appends a slot row with start/end inputs on "Add timeslot"', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('button', { name: /add timeslot/i }))

    expect(screen.getByText('Start time')).toBeInTheDocument()
    expect(screen.getByText('End time')).toBeInTheDocument()
    expect(screen.queryByText(/no timeslots offered yet/i)).not.toBeInTheDocument()
  })

  it('removes a slot row on "Remove"', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('button', { name: /add timeslot/i }))
    await userEvent.click(screen.getByRole('button', { name: /add timeslot/i }))
    expect(screen.getAllByText('Start time')).toHaveLength(2)

    await userEvent.click(screen.getAllByRole('button', { name: /remove/i })[0])
    expect(screen.getAllByText('Start time')).toHaveLength(1)
  })

  it('marks the Timeslots section label as required', () => {
    render(<Harness />)
    expect(screen.getByText('Timeslots')).toHaveTextContent('*')
  })

  it('marks Start time and End time as required', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('button', { name: /add timeslot/i }))

    expect(screen.getByText('Start time')).toHaveTextContent('*')
    expect(screen.getByText('End time')).toHaveTextContent('*')
  })

  it('does not render a per-slot Meeting link field', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('button', { name: /add timeslot/i }))

    expect(screen.queryByText('Meeting link')).not.toBeInTheDocument()
  })
})
