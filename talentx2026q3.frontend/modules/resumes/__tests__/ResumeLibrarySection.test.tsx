import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper"

import { ResumeLibrarySection } from "../components/ResumeLibrarySection"
import { useDeleteResume } from "../hooks/useDeleteResume"
import { useRenameResume } from "../hooks/useRenameResume"
import { useSavedResumes } from "../hooks/useSavedResumes"
import { useSetDefaultResume } from "../hooks/useSetDefaultResume"
import type { SavedResume } from "../types/resume.types"

jest.mock("../hooks/useSavedResumes")
jest.mock("../hooks/useDeleteResume")
jest.mock("../hooks/useSetDefaultResume")
jest.mock("../hooks/useSaveResume", () => ({
  useSaveResume: () => ({ isPending: false, mutateAsync: jest.fn() }),
}))
jest.mock("../hooks/useRenameResume")
jest.mock("../hooks/useResumeUrl", () => ({
  useResumeUrl: () => ({ data: null, isPending: false, isError: false }),
}))
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

const mockedUseSavedResumes = useSavedResumes as jest.MockedFunction<typeof useSavedResumes>
const mockedUseDeleteResume = useDeleteResume as jest.MockedFunction<typeof useDeleteResume>
const mockedUseSetDefaultResume = useSetDefaultResume as jest.MockedFunction<typeof useSetDefaultResume>
const mockedUseRenameResume = useRenameResume as jest.MockedFunction<typeof useRenameResume>

const deleteMutate = jest.fn()
const setDefaultMutate = jest.fn()
const renameMutate = jest.fn()

function savedResume(overrides: Partial<SavedResume> = {}): SavedResume {
  return {
    id: "resume-1",
    displayName: "Backend Resume",
    originalFileName: "backend.pdf",
    contentType: "application/pdf",
    sizeBytes: 1024 * 1024,
    isDefault: true,
    uploadedAt: "2026-09-01T12:00:00Z",
    ...overrides,
  }
}

function mockList(resumes: SavedResume[], maxResumes = 5) {
  mockedUseSavedResumes.mockReturnValue({
    data: { resumes, maxResumes },
    isPending: false,
    isError: false,
    refetch: jest.fn(),
  } as unknown as ReturnType<typeof useSavedResumes>)
}

// base-ui menus open on a raw click; userEvent's pointer sequence does not toggle them in jsdom.
function openActionsMenu(displayName = "Backend Resume") {
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`more actions for ${displayName}`, "i") }))
}

describe("ResumeLibrarySection", () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseDeleteResume.mockReturnValue({
      isPending: false,
      mutate: deleteMutate,
    } as unknown as ReturnType<typeof useDeleteResume>)
    mockedUseSetDefaultResume.mockReturnValue({
      isPending: false,
      variables: undefined,
      mutate: setDefaultMutate,
    } as unknown as ReturnType<typeof useSetDefaultResume>)
    mockedUseRenameResume.mockReturnValue({
      isPending: false,
      variables: undefined,
      mutate: renameMutate,
    } as unknown as ReturnType<typeof useRenameResume>)
  })

  it("shows the empty state and count when no resumes are saved", () => {
    mockList([])

    render(<ResumeLibrarySection />, { wrapper: createQueryWrapper() })

    expect(screen.getByText("0 of 5 saved")).toBeInTheDocument()
    expect(screen.getByText("No resumes yet")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /add resume/i })).toBeEnabled()
  })

  it("renders saved resumes with the default badge", () => {
    mockList([
      savedResume(),
      savedResume({ id: "resume-2", displayName: "Design Resume", isDefault: false }),
    ])

    render(<ResumeLibrarySection />, { wrapper: createQueryWrapper() })

    expect(screen.getByText("2 of 5 saved")).toBeInTheDocument()
    expect(screen.getByText("Backend Resume")).toBeInTheDocument()
    expect(screen.getByText("Design Resume")).toBeInTheDocument()
    expect(screen.getByText("Default")).toBeInTheDocument()
  })

  it("disables adding and shows the limit notice at five resumes", () => {
    mockList(Array.from({ length: 5 }, (_, index) =>
      savedResume({ id: `resume-${index + 1}`, displayName: `Resume ${index + 1}`, isDefault: index === 0 }),
    ))

    render(<ResumeLibrarySection />, { wrapper: createQueryWrapper() })

    expect(screen.getByText("5 of 5 saved")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /add resume/i })).toBeDisabled()
    expect(screen.getByText(/5-resume limit/i)).toBeInTheDocument()
  })

  it("sets a resume as default from the actions menu", async () => {
    mockList([savedResume({ isDefault: false })])

    render(<ResumeLibrarySection />, { wrapper: createQueryWrapper() })

    openActionsMenu()
    fireEvent.click(screen.getByRole("menuitem", { name: /set as default/i }))

    expect(setDefaultMutate).toHaveBeenCalledWith("resume-1")
  })

  it("asks for confirmation before deleting", async () => {
    mockList([savedResume()])

    render(<ResumeLibrarySection />, { wrapper: createQueryWrapper() })

    openActionsMenu()
    fireEvent.click(screen.getByRole("menuitem", { name: /delete/i }))

    expect(screen.getByText(/delete "backend resume"/i)).toBeInTheDocument()
    expect(screen.getByText(/employers keep access/i)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Delete resume" }))

    expect(deleteMutate).toHaveBeenCalledWith("resume-1", expect.anything())
  })

  it("shows an error state when the list fails", () => {
    mockedUseSavedResumes.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useSavedResumes>)

    render(<ResumeLibrarySection />, { wrapper: createQueryWrapper() })

    expect(screen.getByRole("alert")).toHaveTextContent(/couldn't load your resumes/i)
  })
})
