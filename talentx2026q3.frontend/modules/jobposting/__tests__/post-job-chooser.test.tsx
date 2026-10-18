import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper"
import { employerJobsService } from "@/modules/employer-jobs"

import { PostJobChooser } from "../components/PostJobChooser"
import { useJobWizardStore } from "../store/job-wizard-store"
import { readWizardBackup, writeWizardBackup } from "../utils/wizard-backup"

const mockRouterPush = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))

jest.mock("@/modules/employer-jobs", () => ({
  employerJobKeys: { jobsList: (params: unknown) => ["employer", "jobs", params] },
  employerJobsService: { getJobs: jest.fn() },
}))

jest.mock("../services/me.service", () => ({
  meService: {
    getCurrentEmployer: jest.fn(() =>
      Promise.resolve({ id: "emp-1", companyName: "Acme", verificationStatus: "Verified" })
    ),
  },
}))

const mockedGetJobs = jest.mocked(employerJobsService.getJobs)

// Stores an unsaved job for employer "emp-1", as the wizard would.
function storeBackup(title = "Senior React Developer") {
  writeWizardBackup({
    employerId: "emp-1",
    savedAt: "2026-10-08T10:42:00.000Z",
    formData: { ...useJobWizardStore.getState().formData, title },
    currentStep: 3,
    completedSteps: [1, 2],
    aiGenerated: { skills: false, description: false, requirements: false },
    draftJobId: null,
    keptOnPurpose: false,
  })
}

// A minimal draft list item; only id, title and createdAt matter to the chooser.
function draft(id: string, title: string, createdAt: string) {
  return { id, title, createdAt }
}

// Stubs the drafts request with the given items.
function mockDrafts(items: ReturnType<typeof draft>[]) {
  mockedGetJobs.mockResolvedValue({ items } as unknown as Awaited<ReturnType<typeof employerJobsService.getJobs>>)
}

// Renders the chooser next to a link, like any page of the employer portal.
function renderWithLink(href = "/job/jobpost") {
  return render(
    <>
      <a href={href}>Post a Job</a>
      <PostJobChooser />
    </>,
    { wrapper: createQueryWrapper() }
  )
}

// Records whether the chooser stopped the link, then stops jsdom's own navigation (which it can't perform).
let lastClickPrevented: boolean | null = null
function recordAndStopNavigation(event: MouseEvent) {
  lastClickPrevented = event.defaultPrevented
  event.preventDefault()
}

beforeEach(() => {
  jest.clearAllMocks()
  window.localStorage.clear()
  lastClickPrevented = null
  document.addEventListener("click", recordAndStopNavigation)
})

afterEach(() => {
  document.removeEventListener("click", recordAndStopNavigation)
  window.history.pushState({}, "", "/")
})

// Proves Post a Job asks about drafts on the current page, opens the right destination, and never blocks posting.
describe("PostJobChooser", () => {
  it("opens the wizard when there are no drafts, asking only for drafts", async () => {
    mockDrafts([])
    renderWithLink()

    await userEvent.click(screen.getByRole("link", { name: "Post a Job" }))

    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith("/job/jobpost"))
    expect(mockedGetJobs).toHaveBeenCalledWith({ status: "Draft", pageSize: 50 }, expect.anything())
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("opens the wizard when the drafts can't be loaded", async () => {
    mockedGetJobs.mockRejectedValue(new Error("Network Error"))
    renderWithLink()

    await userEvent.click(screen.getByRole("link", { name: "Post a Job" }))

    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith("/job/jobpost"))
  })

  it("shows the popup on the current page instead of following the link when drafts exist", async () => {
    mockDrafts([draft("d-1", "Backend Engineer", "2026-10-01T10:00:00Z")])
    renderWithLink()

    await userEvent.click(screen.getByRole("link", { name: "Post a Job" }))

    expect(await screen.findByRole("dialog")).toBeInTheDocument()
    expect(lastClickPrevented).toBe(true)
    expect(mockRouterPush).not.toHaveBeenCalled()
  })

  it("goes to the wizard on Start fresh", async () => {
    mockDrafts([draft("d-1", "Backend Engineer", "2026-10-01T10:00:00Z")])
    renderWithLink()

    await userEvent.click(screen.getByRole("link", { name: "Post a Job" }))
    await userEvent.click(await screen.findByRole("button", { name: "Start fresh" }))

    expect(mockRouterPush).toHaveBeenCalledWith("/job/jobpost")
  })

  it("opens the only draft's edit page directly", async () => {
    mockDrafts([draft("d-1", "Backend Engineer", "2026-10-01T10:00:00Z")])
    renderWithLink()

    await userEvent.click(screen.getByRole("link", { name: "Post a Job" }))
    await userEvent.click(await screen.findByRole("button", { name: "Continue from draft (1)" }))

    expect(mockRouterPush).toHaveBeenCalledWith("/job/d-1/edit")
  })

  it("lists several drafts newest first, opens the chosen one, and Back returns to the two choices", async () => {
    mockDrafts([
      draft("d-old", "Data Analyst", "2026-09-01T10:00:00Z"),
      draft("d-new", "Frontend Engineer", "2026-10-05T10:00:00Z"),
    ])
    renderWithLink()

    await userEvent.click(screen.getByRole("link", { name: "Post a Job" }))
    await userEvent.click(await screen.findByRole("button", { name: "Continue from draft (2)" }))

    const titles = screen.getAllByRole("listitem").map((item) => item.textContent)
    expect(titles[0]).toContain("Frontend Engineer")
    expect(titles[1]).toContain("Data Analyst")

    await userEvent.click(screen.getByRole("button", { name: "Back" }))
    expect(screen.getByRole("button", { name: "Start fresh" })).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Continue from draft (2)" }))
    await userEvent.click(screen.getByRole("button", { name: /Data Analyst/ }))
    expect(mockRouterPush).toHaveBeenCalledWith("/job/d-old/edit")
  })

  it("closes on Esc and stays on the current page", async () => {
    mockDrafts([draft("d-1", "Backend Engineer", "2026-10-01T10:00:00Z")])
    renderWithLink()

    await userEvent.click(screen.getByRole("link", { name: "Post a Job" }))
    await screen.findByRole("dialog")
    await userEvent.keyboard("{Escape}")

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(mockRouterPush).not.toHaveBeenCalled()
  })

  it("leaves Ctrl+click alone so the link can open in a new tab", async () => {
    mockDrafts([draft("d-1", "Backend Engineer", "2026-10-01T10:00:00Z")])
    renderWithLink()

    // One session, so the held Ctrl is still down for the click (each bare userEvent.* call starts a fresh one).
    const user = userEvent.setup()
    await user.keyboard("{Control>}")
    await user.click(screen.getByRole("link", { name: "Post a Job" }))
    await user.keyboard("{/Control}")

    expect(lastClickPrevented).toBe(false)
    expect(mockedGetJobs).not.toHaveBeenCalled()
  })

  it("ignores links to other pages", async () => {
    renderWithLink("/dashboard")

    await userEvent.click(screen.getByRole("link", { name: "Post a Job" }))

    expect(lastClickPrevented).toBe(false)
    expect(mockedGetJobs).not.toHaveBeenCalled()
  })

  it("leaves the link alone while already on the wizard, so its unsaved-changes guard stays in charge", async () => {
    window.history.pushState({}, "", "/job/jobpost")
    renderWithLink()

    await userEvent.click(screen.getByRole("link", { name: "Post a Job" }))

    expect(lastClickPrevented).toBe(false)
    expect(mockedGetJobs).not.toHaveBeenCalled()
  })
})

// Proves an unsaved job kept in the browser is offered first, and only thrown away when the employer starts fresh.
describe("PostJobChooser with an unsaved job in the browser", () => {
  it("offers to resume it even without server drafts", async () => {
    mockDrafts([])
    storeBackup()
    renderWithLink()

    await userEvent.click(screen.getByRole("link", { name: "Post a Job" }))

    expect(await screen.findByRole("button", { name: /Resume unsaved job/ })).toHaveTextContent(
      "Senior React Developer"
    )
    expect(screen.getByRole("button", { name: "Start fresh" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Continue from draft/ })).not.toBeInTheDocument()
    expect(mockRouterPush).not.toHaveBeenCalled()
  })

  it("shows resume, continue from draft and start fresh together", async () => {
    mockDrafts([draft("d-1", "Backend Engineer", "2026-10-01T10:00:00Z")])
    storeBackup()
    renderWithLink()

    await userEvent.click(screen.getByRole("link", { name: "Post a Job" }))

    expect(await screen.findByRole("button", { name: /Resume unsaved job/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Continue from draft (1)" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Start fresh" })).toBeInTheDocument()
  })

  it("opens the wizard in resume mode", async () => {
    mockDrafts([])
    storeBackup()
    renderWithLink()

    await userEvent.click(screen.getByRole("link", { name: "Post a Job" }))
    await userEvent.click(await screen.findByRole("button", { name: /Resume unsaved job/ }))

    expect(mockRouterPush).toHaveBeenCalledWith("/job/jobpost?resume=1")
    expect(readWizardBackup("emp-1")).not.toBeNull()
  })

  it("discards the unsaved job on Start fresh", async () => {
    mockDrafts([])
    storeBackup()
    renderWithLink()

    await userEvent.click(screen.getByRole("link", { name: "Post a Job" }))
    await userEvent.click(await screen.findByRole("button", { name: "Start fresh" }))

    expect(mockRouterPush).toHaveBeenCalledWith("/job/jobpost")
    expect(readWizardBackup("emp-1")).toBeNull()
  })

  it("keeps the unsaved job when the popup is closed with Esc", async () => {
    mockDrafts([])
    storeBackup()
    renderWithLink()

    await userEvent.click(screen.getByRole("link", { name: "Post a Job" }))
    await screen.findByRole("dialog")
    await userEvent.keyboard("{Escape}")

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(readWizardBackup("emp-1")).not.toBeNull()
  })
})
