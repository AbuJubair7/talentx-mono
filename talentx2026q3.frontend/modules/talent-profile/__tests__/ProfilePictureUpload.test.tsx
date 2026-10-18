import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ProfilePictureUpload } from "../components/ProfilePictureUpload"
import { usePresignedUpload } from "../hooks/usePresignedUpload"

jest.mock("../hooks/usePresignedUpload")

const mockedUsePresignedUpload = usePresignedUpload as jest.MockedFunction<typeof usePresignedUpload>

// applyAccept: false — a real OS file picker constrained by the input's
// `accept` attribute would never offer a mismatched file in the first place;
// these tests exist specifically to prove our own guard rejects one anyway
// (e.g. a file dragged-and-dropped, which bypasses `accept` entirely).
const user = userEvent.setup({ applyAccept: false })

describe("ProfilePictureUpload", () => {
  const upload = jest.fn().mockResolvedValue(undefined)
  const reset = jest.fn()

  beforeAll(() => {
    URL.revokeObjectURL = jest.fn()
  })

  beforeEach(() => {
    upload.mockClear()
    reset.mockClear()
    let objectUrlCount = 0
    URL.createObjectURL = jest.fn(() => `blob:mock-preview-${++objectUrlCount}`)
    ;(URL.revokeObjectURL as jest.Mock).mockClear()
    mockedUsePresignedUpload.mockReturnValue({
      status: "idle",
      progress: 0,
      error: null,
      upload,
      reset,
    })
  })

  it("rejects an oversized image before calling upload", async () => {
    render(<ProfilePictureUpload currentPictureUrl={null} nameForInitials="Ada Lovelace" />)

    const oversizedFile = new File([new Uint8Array(6 * 1024 * 1024)], "big.jpg", { type: "image/jpeg" })
    const input = screen.getByLabelText(/upload photo/i) as HTMLInputElement

    await user.upload(input, oversizedFile)

    expect(upload).not.toHaveBeenCalled()
    expect(await screen.findByRole("alert")).toHaveTextContent(/5 MB or smaller/i)
  })

  it("rejects a disallowed content type before calling upload", async () => {
    render(<ProfilePictureUpload currentPictureUrl={null} nameForInitials="Ada Lovelace" />)

    const wrongTypeFile = new File(["binary"], "resume.pdf", { type: "application/pdf" })
    const input = screen.getByLabelText(/upload photo/i) as HTMLInputElement

    await user.upload(input, wrongTypeFile)

    expect(upload).not.toHaveBeenCalled()
    expect(await screen.findByRole("alert")).toHaveTextContent(/JPEG, PNG, or WEBP/i)
  })

  it("calls upload for a valid image", async () => {
    render(<ProfilePictureUpload currentPictureUrl={null} nameForInitials="Ada Lovelace" />)

    const validFile = new File(["binary"], "photo.jpg", { type: "image/jpeg" })
    const input = screen.getByLabelText(/upload photo/i) as HTMLInputElement

    await user.upload(input, validFile)

    expect(upload).toHaveBeenCalledWith(validFile)
  })

  it("revokes the previous preview URL before creating a new one on re-selection", async () => {
    render(<ProfilePictureUpload currentPictureUrl={null} nameForInitials="Ada Lovelace" />)

    const input = screen.getByLabelText(/upload photo/i) as HTMLInputElement

    await user.upload(input, new File(["binary"], "first.jpg", { type: "image/jpeg" }))
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()

    await user.upload(input, new File(["binary"], "second.jpg", { type: "image/jpeg" }))
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-preview-1")
  })

  it("revokes the outstanding preview URL on unmount", async () => {
    const { unmount } = render(<ProfilePictureUpload currentPictureUrl={null} nameForInitials="Ada Lovelace" />)

    const input = screen.getByLabelText(/upload photo/i) as HTMLInputElement
    await user.upload(input, new File(["binary"], "photo.jpg", { type: "image/jpeg" }))

    unmount()

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-preview-1")
  })

  it("renders progress bar and status when upload is in progress", () => {
    mockedUsePresignedUpload.mockReturnValue({
      status: "uploading",
      progress: 65,
      error: null,
      upload,
      reset,
    })

    render(<ProfilePictureUpload currentPictureUrl={null} nameForInitials="Ada Lovelace" />)

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "65")
    expect(screen.getByRole("status")).toHaveTextContent("65%")
  })

  it("renders Replace photo label when current picture exists", () => {
    render(<ProfilePictureUpload currentPictureUrl="https://example.com/pic.jpg" nameForInitials="Ada Lovelace" />)

    expect(screen.getByLabelText(/replace photo/i)).toBeInTheDocument()
  })
})
