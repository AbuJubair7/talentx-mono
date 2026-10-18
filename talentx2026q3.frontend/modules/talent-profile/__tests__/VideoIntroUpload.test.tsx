import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { VideoIntroUpload } from "../components/VideoIntroUpload"
import { useMultipartUpload } from "../hooks/useMultipartUpload"

jest.mock("../hooks/useMultipartUpload")

const mockedUseMultipartUpload = useMultipartUpload as jest.MockedFunction<typeof useMultipartUpload>

// applyAccept: false — see the identical note in ProfilePictureUpload.test.tsx.
const user = userEvent.setup({ applyAccept: false })

describe("VideoIntroUpload", () => {
  const upload = jest.fn().mockResolvedValue(undefined)
  const cancel = jest.fn().mockResolvedValue(undefined)
  const reset = jest.fn()

  beforeAll(() => {
    URL.revokeObjectURL = jest.fn()
  })

  beforeEach(() => {
    upload.mockClear()
    cancel.mockClear()
    reset.mockClear()
    let objectUrlCount = 0
    URL.createObjectURL = jest.fn(() => `blob:mock-preview-${++objectUrlCount}`)
    ;(URL.revokeObjectURL as jest.Mock).mockClear()
    mockedUseMultipartUpload.mockReturnValue({
      status: "idle",
      progress: 0,
      error: null,
      upload,
      cancel,
      reset,
    })
  })

  it("rejects an oversized video before calling upload", async () => {
    render(<VideoIntroUpload currentVideoUrl={null} />)

    const oversizedFile = new File([new Uint8Array(51 * 1024 * 1024)], "big.mp4", { type: "video/mp4" })
    const input = screen.getByLabelText(/upload video/i) as HTMLInputElement

    await user.upload(input, oversizedFile)

    expect(upload).not.toHaveBeenCalled()
    expect(await screen.findByRole("alert")).toHaveTextContent(/50 MB or smaller/i)
  })

  it("rejects a disallowed content type before calling upload", async () => {
    render(<VideoIntroUpload currentVideoUrl={null} />)

    const wrongTypeFile = new File(["binary"], "clip.avi", { type: "video/x-msvideo" })
    const input = screen.getByLabelText(/upload video/i) as HTMLInputElement

    await user.upload(input, wrongTypeFile)

    expect(upload).not.toHaveBeenCalled()
    expect(await screen.findByRole("alert")).toHaveTextContent(/MP4, WEBM, or MOV/i)
  })

  it("shows a cancel button while uploading and calls cancel", async () => {
    mockedUseMultipartUpload.mockReturnValue({
      status: "uploading",
      progress: 42,
      error: null,
      upload,
      cancel,
      reset,
    })

    render(<VideoIntroUpload currentVideoUrl={null} />)

    expect(screen.getByRole("status")).toHaveTextContent("42%")

    await user.click(screen.getByRole("button", { name: /cancel/i }))
    expect(cancel).toHaveBeenCalledTimes(1)
  })

  it("revokes the previous preview URL before creating a new one on re-selection", async () => {
    render(<VideoIntroUpload currentVideoUrl={null} />)

    const input = screen.getByLabelText(/upload video/i) as HTMLInputElement

    await user.upload(input, new File(["binary"], "first.mp4", { type: "video/mp4" }))
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()

    await user.upload(input, new File(["binary"], "second.mp4", { type: "video/mp4" }))
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-preview-1")
  })

  it("revokes the outstanding preview URL on unmount", async () => {
    const { unmount } = render(<VideoIntroUpload currentVideoUrl={null} />)

    const input = screen.getByLabelText(/upload video/i) as HTMLInputElement
    await user.upload(input, new File(["binary"], "clip.mp4", { type: "video/mp4" }))

    unmount()

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-preview-1")
  })

  it("renders a progress bar with aria attributes during upload", () => {
    mockedUseMultipartUpload.mockReturnValue({
      status: "uploading",
      progress: 75,
      error: null,
      upload,
      cancel,
      reset,
    })

    render(<VideoIntroUpload currentVideoUrl={null} />)

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "75")
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-label", "Video upload progress")
  })

  it("renders Replace video label and video player when current video exists", () => {
    render(<VideoIntroUpload currentVideoUrl="https://example.com/intro.mp4" />)

    expect(screen.getByLabelText(/replace video/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/video introduction preview/i)).toBeInTheDocument()
  })
})
