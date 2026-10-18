import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTimePicker } from '../DateTimePicker';

describe('DateTimePicker', () => {
  it('renders trigger with placeholder when value is empty', () => {
    render(<DateTimePicker placeholder="Select date and time" />);
    expect(screen.getByText('Select date and time')).toBeInTheDocument();
  });

  it('renders formatted date-time display when value is provided', () => {
    // 2022-04-17T15:30 -> 04/17/2022 03:30 PM
    render(<DateTimePicker value="2022-04-17T15:30" />);
    expect(screen.getByText('04/17/2022 03:30 PM')).toBeInTheDocument();
  });

  it('opens popover dialog when trigger is clicked', async () => {
    render(<DateTimePicker value="2022-04-17T15:30" />);
    const trigger = screen.getByText('04/17/2022 03:30 PM');
    await userEvent.click(trigger);

    expect(screen.getByTestId('datetime-picker-popover')).toBeInTheDocument();
    expect(screen.getByText('April 2022')).toBeInTheDocument();
    expect(screen.getByText('CANCEL')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('allows selecting day and time inside popover and confirms on OK', async () => {
    const handleChange = jest.fn();
    render(<DateTimePicker value="2022-04-17T15:30" onChange={handleChange} />);
    
    // Open popover
    await userEvent.click(screen.getByText('04/17/2022 03:30 PM'));
    expect(screen.getByTestId('datetime-picker-popover')).toBeInTheDocument();

    // Click day 20
    await userEvent.click(screen.getByRole('button', { name: 'Day 20' }));

    // Click OK
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('2022-04-20T15:30');
    expect(screen.queryByTestId('datetime-picker-popover')).not.toBeInTheDocument();
  });

  it('closes popover without calling onChange when CANCEL is clicked', async () => {
    const handleChange = jest.fn();
    render(<DateTimePicker value="2022-04-17T15:30" onChange={handleChange} />);

    await userEvent.click(screen.getByText('04/17/2022 03:30 PM'));
    expect(screen.getByTestId('datetime-picker-popover')).toBeInTheDocument();

    // Click day 20
    await userEvent.click(screen.getByRole('button', { name: 'Day 20' }));

    // Click CANCEL
    await userEvent.click(screen.getByRole('button', { name: 'CANCEL' }));

    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.queryByTestId('datetime-picker-popover')).not.toBeInTheDocument();
  });

  it('handles hidden native input change event for form library & testing compatibility', () => {
    const handleChange = jest.fn();
    const { container } = render(<DateTimePicker value="2022-04-17T15:30" onChange={handleChange} />);

    const nativeInput = container.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    expect(nativeInput).toBeInTheDocument();

    fireEvent.change(nativeInput, { target: { value: '2026-10-15T10:00' } });
    expect(handleChange).toHaveBeenCalledWith('2026-10-15T10:00');
  });
});
