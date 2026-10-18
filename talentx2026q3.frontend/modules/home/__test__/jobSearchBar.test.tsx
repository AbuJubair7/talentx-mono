import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { JobSearchBar } from '../components/jobSearchBar'
import { POPULAR_QUICK_SEARCH_TAGS } from '../constants/popularQuickSearchTags'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('JobSearchBar Component', () => {
  const mockRouterPush = jest.fn()

  const openExperienceSelect = () =>
    fireEvent.click(screen.getByLabelText('Filter by experience level'))

  // Base UI only commits mouse selection after pointerdown on the item.
  const chooseExperienceOption = (optionName: string) => {
    openExperienceSelect()
    const option = screen.getByRole('option', { name: optionName })
    fireEvent.pointerDown(option)
    fireEvent.click(option)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    })
  })

  it('renders all three input sections with their accessible inputs and icons', () => {
    render(<JobSearchBar />)

    const keywordInput = screen.getByLabelText('Job title, skill, or keyword')
    const locationInput = screen.getByLabelText('Filter by location')
    const experienceSelect = screen.getByLabelText('Filter by experience level')
    const searchButton = screen.getByRole('button', { name: /search jobs/i })

    expect(keywordInput).toBeInTheDocument()
    expect(locationInput).toBeInTheDocument()
    expect(experienceSelect).toBeInTheDocument()
    expect(searchButton).toBeInTheDocument()

    openExperienceSelect()
    expect(screen.getByRole('option', { name: 'Any' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /all experience levels/i })).not.toBeInTheDocument()
  })

  it('renders "Any" as the default experience level option and applies high contrast styling', () => {
    render(<JobSearchBar />)

    const experienceSelect = screen.getByLabelText('Filter by experience level')
    expect(experienceSelect).toHaveTextContent('Any')
    expect(experienceSelect).toHaveClass('text-slate-600')

    openExperienceSelect()
    expect(screen.getByRole('option', { name: 'Any' })).toBeInTheDocument()

    const keywordInput = screen.getByLabelText('Job title, skill, or keyword')
    expect(keywordInput).toHaveClass('placeholder:text-slate-600', 'placeholder:opacity-100')

    const locationInput = screen.getByLabelText('Filter by location')
    expect(locationInput).toHaveClass('placeholder:text-slate-600', 'placeholder:opacity-100')
  })

  it('does NOT display any "Popular:" keyword or label in the document', () => {
    render(<JobSearchBar />)
    expect(screen.queryByText(/popular:/i)).not.toBeInTheDocument()
  })

  it('renders all popular skill tags with their respective labels', () => {
    render(<JobSearchBar />)

    POPULAR_QUICK_SEARCH_TAGS.forEach((tag) => {
      const tagButton = screen.getByRole('button', { name: tag.label })
      expect(tagButton).toBeInTheDocument()
    })
  })

  it('allows typing a keyword, shows clear button, and clears keyword when clear button is clicked', () => {
    render(<JobSearchBar />)

    const keywordInput = screen.getByLabelText('Job title, skill, or keyword') as HTMLInputElement
    expect(screen.queryByLabelText('Clear keyword search')).not.toBeInTheDocument()

    fireEvent.change(keywordInput, { target: { value: 'Machine Learning' } })
    expect(keywordInput.value).toBe('Machine Learning')

    const clearButton = screen.getByLabelText('Clear keyword search')
    expect(clearButton).toBeInTheDocument()

    fireEvent.click(clearButton)
    expect(keywordInput.value).toBe('')
    expect(screen.queryByLabelText('Clear keyword search')).not.toBeInTheDocument()
  })

  it('allows typing a location, shows clear button, and clears location when clear button is clicked', () => {
    render(<JobSearchBar />)

    const locationInput = screen.getByLabelText('Filter by location') as HTMLInputElement
    expect(screen.queryByLabelText('Clear location search')).not.toBeInTheDocument()

    fireEvent.change(locationInput, { target: { value: 'San Francisco, CA' } })
    expect(locationInput.value).toBe('San Francisco, CA')

    const clearButton = screen.getByLabelText('Clear location search')
    expect(clearButton).toBeInTheDocument()

    fireEvent.click(clearButton)
    expect(locationInput.value).toBe('')
    expect(screen.queryByLabelText('Clear location search')).not.toBeInTheDocument()
  })

  it('allows selecting an experience level, shows clear button, and clears level when clicked', () => {
    render(<JobSearchBar />)

    const experienceSelect = screen.getByLabelText('Filter by experience level')
    expect(screen.queryByLabelText('Clear experience level filter')).not.toBeInTheDocument()

    chooseExperienceOption('Senior Level')
    expect(experienceSelect).toHaveTextContent('Senior Level')
    expect(experienceSelect).toHaveClass('text-slate-900')

    const clearButton = screen.getByLabelText('Clear experience level filter')
    expect(clearButton).toBeInTheDocument()

    fireEvent.click(clearButton)
    expect(experienceSelect).toHaveTextContent('Any')
    expect(screen.queryByLabelText('Clear experience level filter')).not.toBeInTheDocument()
  })

  it('submits form with all fields populated and navigates with correct query parameters', () => {
    render(<JobSearchBar />)

    const keywordInput = screen.getByLabelText('Job title, skill, or keyword')
    const locationInput = screen.getByLabelText('Filter by location')
    const searchButton = screen.getByRole('button', { name: /search jobs/i })

    fireEvent.change(keywordInput, { target: { value: 'Python' } })
    fireEvent.change(locationInput, { target: { value: 'Remote' } })
    chooseExperienceOption('Lead')

    fireEvent.click(searchButton)

    expect(mockRouterPush).toHaveBeenCalledTimes(1)
    expect(mockRouterPush).toHaveBeenCalledWith('/jobs?keyword=Python&experienceLevel=Lead&location=Remote')
  })

  it('submits empty form and navigates to /jobs', () => {
    render(<JobSearchBar />)

    const searchButton = screen.getByRole('button', { name: /search jobs/i })
    fireEvent.click(searchButton)

    expect(mockRouterPush).toHaveBeenCalledTimes(1)
    expect(mockRouterPush).toHaveBeenCalledWith('/jobs')
  })

  it('clicking a skill tag sets keyword and triggers router push with keyword query parameter', () => {
    render(<JobSearchBar />)

    const firstTag = POPULAR_QUICK_SEARCH_TAGS[0]
    const tagButton = screen.getByRole('button', { name: firstTag.label })

    fireEvent.click(tagButton)

    expect(mockRouterPush).toHaveBeenCalledTimes(1)
    expect(mockRouterPush).toHaveBeenCalledWith(`/jobs?keyword=${encodeURIComponent(firstTag.keyword)}`)

    const keywordInput = screen.getByLabelText('Job title, skill, or keyword') as HTMLInputElement
    expect(keywordInput.value).toBe(firstTag.keyword)
  })

  it('clicking a skill tag preserves existing experience level and location filters', () => {
    render(<JobSearchBar />)

    const locationInput = screen.getByLabelText('Filter by location')

    fireEvent.change(locationInput, { target: { value: 'Berlin' } })
    chooseExperienceOption('Mid Level')

    const pytorchTag = POPULAR_QUICK_SEARCH_TAGS.find((tag) => tag.label === 'PyTorch')!
    const tagButton = screen.getByRole('button', { name: pytorchTag.label })

    fireEvent.click(tagButton)

    expect(mockRouterPush).toHaveBeenCalledTimes(1)
    expect(mockRouterPush).toHaveBeenCalledWith(
      '/jobs?keyword=PyTorch&experienceLevel=MidLevel&location=Berlin'
    )
  })

  it('instantly clears placeholder when text input is focused and restores on blur', () => {
    render(<JobSearchBar />)

    const keywordInput = screen.getByLabelText('Job title, skill, or keyword') as HTMLInputElement
    expect(keywordInput.placeholder).not.toBe('')

    // Focus keyword input -> placeholder becomes immediately empty
    fireEvent.focus(keywordInput)
    expect(keywordInput.placeholder).toBe('')

    // Blur keyword input -> restores placeholder
    fireEvent.blur(keywordInput)
    expect(keywordInput.placeholder).not.toBe('')

    const locationInput = screen.getByLabelText('Filter by location') as HTMLInputElement
    expect(locationInput.placeholder).toBe("City, country, or 'Remote'")

    // Focus location input -> placeholder becomes immediately empty
    fireEvent.focus(locationInput)
    expect(locationInput.placeholder).toBe('')

    // Blur location input -> restores placeholder
    fireEvent.blur(locationInput)
    expect(locationInput.placeholder).toBe("City, country, or 'Remote'")
  })
})
