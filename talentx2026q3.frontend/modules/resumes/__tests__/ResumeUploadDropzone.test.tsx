import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper'
import { ResumeUploadDropzone, type ResumeUploadMutationLike } from '../components/ResumeUploadDropzone'

describe('ResumeUploadDropzone', () => {
  const dummyFile = new File(['dummy content'], 'test_resume.pdf', { type: 'application/pdf' })

  it('renders initial dropzone state', () => {
    render(<ResumeUploadDropzone onExtractionSuccess={jest.fn()} />, {
      wrapper: createQueryWrapper(),
    })

    expect(screen.getByText(/Drag & drop your resume here, or/i)).toBeInTheDocument()
    expect(screen.getByText(/Supports PDF or DOCX up to 5 MB/i)).toBeInTheDocument()
  })

  it('displays loading indicator when upload is pending', () => {
    const mockMutation: ResumeUploadMutationLike = {
      mutate: jest.fn(),
      isPending: true,
    }

    render(
      <ResumeUploadDropzone uploadMutation={mockMutation} onExtractionSuccess={jest.fn()} />,
      { wrapper: createQueryWrapper() }
    )

    expect(screen.getByText('Extracting resume details with AI...')).toBeInTheDocument()
  })

  it('shows prominent error state with Retry and Return buttons on extraction failure', async () => {
    const mockMutate = jest.fn().mockImplementation((_file, options) => {
      options?.onError?.({ status: 502, message: 'AI service down' })
    })

    const mockMutation: ResumeUploadMutationLike = {
      mutate: mockMutate,
      isPending: false,
    }

    const { container } = render(
      <ResumeUploadDropzone uploadMutation={mockMutation} onExtractionSuccess={jest.fn()} />,
      { wrapper: createQueryWrapper() }
    )

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [dummyFile] } })

    await waitFor(() => {
      expect(screen.getByText('Extraction Unsuccessful')).toBeInTheDocument()
    })

    expect(screen.getByText('test_resume.pdf')).toBeInTheDocument()
    expect(
      screen.getByText('The AI service encountered a temporary connection issue while parsing your document.')
    ).toBeInTheDocument()

    const retryButton = screen.getByRole('button', { name: /Retry extraction/i })
    const returnButton = screen.getByRole('button', { name: /Choose different file/i })

    expect(retryButton).toBeInTheDocument()
    expect(returnButton).toBeInTheDocument()
  })

  it('retries extraction when Retry button is clicked', async () => {
    let callCount = 0
    const mockMutate = jest.fn().mockImplementation((_file, options) => {
      callCount++
      if (callCount === 1) {
        options?.onError?.({ status: 502 })
      }
    })

    const mockMutation: ResumeUploadMutationLike = {
      mutate: mockMutate,
      isPending: false,
    }

    const { container } = render(
      <ResumeUploadDropzone uploadMutation={mockMutation} onExtractionSuccess={jest.fn()} />,
      { wrapper: createQueryWrapper() }
    )

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [dummyFile] } })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Retry extraction/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Retry extraction/i }))

    expect(mockMutate).toHaveBeenCalledTimes(2)
    expect(mockMutate).toHaveBeenLastCalledWith(dummyFile, expect.any(Object))
  })

  it('resets back to upload dropzone when Return button is clicked', async () => {
    const mockMutate = jest.fn().mockImplementation((_file, options) => {
      options?.onError?.({ status: 502 })
    })

    const mockMutation: ResumeUploadMutationLike = {
      mutate: mockMutate,
      isPending: false,
    }

    const { container } = render(
      <ResumeUploadDropzone uploadMutation={mockMutation} onExtractionSuccess={jest.fn()} />,
      { wrapper: createQueryWrapper() }
    )

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [dummyFile] } })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Choose different file/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Choose different file/i }))

    await waitFor(() => {
      expect(screen.queryByText('Extraction Unsuccessful')).not.toBeInTheDocument()
    })
    expect(screen.getByText(/Drag & drop your resume here, or/i)).toBeInTheDocument()
  })
})
