import { render, screen, fireEvent } from '@testing-library/react'
import { JobFilterSidebar } from '../components/JobFilterSidebar'

describe('JobFilterSidebar', () => {
  const defaultProps = {
    filters: {},
    onEmploymentTypeChange: jest.fn(),
    onExperienceLevelChange: jest.fn(),
    onWorkArrangementChange: jest.fn(),
    onClearAll: jest.fn(),
    hasActiveFilters: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders filter headings', () => {
    render(<JobFilterSidebar {...defaultProps} />)
    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByText('Work Mode')).toBeInTheDocument()
    expect(screen.getByText('Employment Type')).toBeInTheDocument()
    expect(screen.getByText('Experience Level')).toBeInTheDocument()
  })

  it('calls onWorkArrangementChange when selecting a work mode', () => {
    render(<JobFilterSidebar {...defaultProps} />)
    const remoteOption = screen.getByLabelText('Full Remote')
    fireEvent.click(remoteOption)
    expect(defaultProps.onWorkArrangementChange).toHaveBeenCalledWith('FullRemote')
  })

  it('calls onEmploymentTypeChange when selecting a job type', () => {
    render(<JobFilterSidebar {...defaultProps} />)
    const fullTimeOption = screen.getByLabelText('Full Time')
    fireEvent.click(fullTimeOption)
    expect(defaultProps.onEmploymentTypeChange).toHaveBeenCalledWith('FullTime')
  })

  it('calls onExperienceLevelChange when selecting experience level', () => {
    render(<JobFilterSidebar {...defaultProps} />)
    const seniorOption = screen.getByLabelText('Senior Level')
    fireEvent.click(seniorOption)
    expect(defaultProps.onExperienceLevelChange).toHaveBeenCalledWith('SeniorLevel')
  })

  it('shows active count and reset button when filters are active', () => {
    render(
      <JobFilterSidebar
        {...defaultProps}
        filters={{ workArrangement: 'FullRemote', employmentType: 'FullTime' }}
        hasActiveFilters={true}
      />
    )
    expect(screen.getByText('2')).toBeInTheDocument()
    const resetBtn = screen.getByText('Reset all')
    expect(resetBtn).toBeInTheDocument()
    fireEvent.click(resetBtn)
    expect(defaultProps.onClearAll).toHaveBeenCalledTimes(1)
  })
})
