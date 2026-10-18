import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper"
import type { ResumeExtractionResult } from "@/modules/resumes/types/resume.types"

import { ReplaceResumeDialog } from "../components/ReplaceResumeDialog"
import { useApplyExtractedProfile } from "../hooks/useApplyExtractedProfile"
import { useExtractResume } from "../hooks/useExtractResume"

jest.mock("../hooks/useExtractResume")
jest.mock("../hooks/useApplyExtractedProfile")

const mockedUseExtractResume = useExtractResume as jest.MockedFunction<typeof useExtractResume>
const mockedUseApplyExtractedProfile = useApplyExtractedProfile as jest.MockedFunction<typeof useApplyExtractedProfile>

// applyAccept: false — a real OS file picker constrained by the input's
// `accept` attribute would never offer a mismatched file in the first place;
// see the identical note in ProfilePictureUpload.test.tsx.
const user = userEvent.setup({ applyAccept: false })

const extraction: ResumeExtractionResult = {
  resumeUploadId: "upload-1",
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: null,
  location: null,
  linkedInUrl: null,
  portfolioUrls: [],
  workExperience: [],
  education: [],
  technicalSkills: ["TypeScript"],
  softSkills: [],
  toolsAndPlatforms: [],
  fileStorageKey: "",
}

// Dialog content is rendered through a portal into document.body, outside
// the container node `render()` returns — query from the document instead.
function getFileInput() {
  return document.querySelector('input[type="file"]') as HTMLInputElement
}

describe("ReplaceResumeDialog", () => {
  const extractResumeMutate = jest.fn()
  const applyExtractedProfileMutateAsync = jest.fn().mockResolvedValue(undefined)
  const onOpenChange = jest.fn()

  beforeEach(() => {
    extractResumeMutate.mockClear()
    applyExtractedProfileMutateAsync.mockClear()
    onOpenChange.mockClear()
    applyExtractedProfileMutateAsync.mockResolvedValue(undefined)

    // Mirrors what ResumeUploadDropzone actually does with an injected
    // mutation: call `mutate(file, { onSuccess })` and let the caller decide
    // what happens next — here, immediately resolving with a canned
    // extraction result so the preview step renders synchronously.
    extractResumeMutate.mockImplementation(
      (_file: File, options: { onSuccess: (data: ResumeExtractionResult) => void }) => {
        options.onSuccess(extraction)
      }
    )

    mockedUseExtractResume.mockReturnValue({
      isPending: false,
      mutate: extractResumeMutate,
    } as unknown as ReturnType<typeof useExtractResume>)

    mockedUseApplyExtractedProfile.mockReturnValue({
      mutateAsync: applyExtractedProfileMutateAsync,
    } as unknown as ReturnType<typeof useApplyExtractedProfile>)
  })

  it("renders the upload dropzone when opened", () => {
    render(<ReplaceResumeDialog open onOpenChange={onOpenChange} />, { wrapper: createQueryWrapper() })

    expect(screen.getByText(/drag & drop your resume here/i)).toBeInTheDocument()
  })

  it("shows the editable extraction preview after a successful upload", async () => {
    render(<ReplaceResumeDialog open onOpenChange={onOpenChange} />, { wrapper: createQueryWrapper() })

    const file = new File(["binary"], "resume.pdf", { type: "application/pdf" })
    await user.upload(getFileInput(), file)

    expect(extractResumeMutate).toHaveBeenCalledWith(file, expect.objectContaining({ onSuccess: expect.any(Function) }))
    expect(screen.getByRole("button", { name: /confirm/i })).toBeInTheDocument()
  })

  it("resubmits the actual selected File object — not just its metadata — when saving", async () => {
    render(<ReplaceResumeDialog open onOpenChange={onOpenChange} />, { wrapper: createQueryWrapper() })

    const file = new File(["binary"], "resume.pdf", { type: "application/pdf" })
    await user.upload(getFileInput(), file)

    await user.click(screen.getByRole("button", { name: /confirm/i }))

    expect(applyExtractedProfileMutateAsync).toHaveBeenCalledTimes(1)
    const [{ payload, resumeFile }] = applyExtractedProfileMutateAsync.mock.calls[0]

    expect(resumeFile).toBe(file)
    expect(payload).toEqual(expect.objectContaining({ technicalSkills: ["TypeScript"] }))
  })

  it("closes the dialog after a successful save", async () => {
    render(<ReplaceResumeDialog open onOpenChange={onOpenChange} />, { wrapper: createQueryWrapper() })

    await user.upload(getFileInput(), new File(["binary"], "resume.pdf", { type: "application/pdf" }))
    await user.click(screen.getByRole("button", { name: /confirm/i }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
