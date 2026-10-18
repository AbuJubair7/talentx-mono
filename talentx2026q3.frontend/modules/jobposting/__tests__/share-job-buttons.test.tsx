import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ShareJobButtons } from "../../job-listing/components/ShareJobButtons"

const mockOpen = jest.fn()
Object.defineProperty(window, "open", { value: mockOpen, writable: true })

beforeEach(() => {
  jest.clearAllMocks()
})

describe("ShareJobButtons", () => {
  const defaultProps = {
    jobTitle: "Backend Engineer",
    companyName: "Acme Corp",
    jobId: "job-123",
  }

  it("renders share heading", () => {
    render(<ShareJobButtons {...defaultProps} />)
    expect(screen.getByText("Share this job")).toBeInTheDocument()
  })

  it("renders LinkedIn button", () => {
    render(<ShareJobButtons {...defaultProps} />)
    expect(screen.getByText("LinkedIn")).toBeInTheDocument()
  })

  it("renders Facebook button", () => {
    render(<ShareJobButtons {...defaultProps} />)
    expect(screen.getByText("Facebook")).toBeInTheDocument()
  })

  it("renders Copy URL button", () => {
    render(<ShareJobButtons {...defaultProps} />)
    expect(screen.getByText("Copy URL")).toBeInTheDocument()
  })

  it("opens LinkedIn share URL on click", async () => {
    const user = userEvent.setup()
    render(<ShareJobButtons {...defaultProps} />)

    await user.click(screen.getByText("LinkedIn"))
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining("linkedin.com/sharing/share-offsite"),
      "_blank",
      "noopener,noreferrer"
    )
  })

  it("opens Facebook share URL on click", async () => {
    const user = userEvent.setup()
    render(<ShareJobButtons {...defaultProps} />)

    await user.click(screen.getByText("Facebook"))
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining("facebook.com/sharer/sharer.php"),
      "_blank",
      "noopener,noreferrer"
    )
  })

  it("copies URL to clipboard on Copy URL click", async () => {
    const user = userEvent.setup()
    const writeTextSpy = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextSpy },
      writable: true,
      configurable: true,
    })

    render(<ShareJobButtons {...defaultProps} />)

    await act(async () => {
      await user.click(screen.getByText("Copy URL"))
    })

    expect(writeTextSpy).toHaveBeenCalledWith(expect.stringContaining("/jobs/job-123"))
  })

  it("shows Copied! feedback after copying", async () => {
    const user = userEvent.setup()
    render(<ShareJobButtons {...defaultProps} />)

    await act(async () => {
      await user.click(screen.getByText("Copy URL"))
    })

    await waitFor(() => {
      expect(screen.getByText("Copied!")).toBeInTheDocument()
    })
  })

  it("reverts to Copy URL after 2 seconds", async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<ShareJobButtons {...defaultProps} />)

    await act(async () => {
      await user.click(screen.getByText("Copy URL"))
    })

    act(() => {
      jest.advanceTimersByTime(2000)
    })

    await waitFor(() => {
      expect(screen.getByText("Copy URL")).toBeInTheDocument()
    })
    jest.useRealTimers()
  })
})
