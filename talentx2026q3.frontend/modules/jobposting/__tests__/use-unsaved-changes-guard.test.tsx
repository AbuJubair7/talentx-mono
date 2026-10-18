import { render, screen, fireEvent, act } from "@testing-library/react"

import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard"

const mockRouterPush = jest.fn()
const mockRouterReplace = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush, replace: mockRouterReplace }),
}))

const linkClicked = jest.fn()

function Harness({ isDirty, warnOnUnload }: { isDirty: boolean; warnOnUnload?: boolean }) {
  const { isPrompting, confirmLeave, cancelLeave } = useUnsavedChangesGuard(isDirty, { warnOnUnload })
  return (
    <div>
      <a
        href="/dashboard"
        onClick={(e) => {
          e.preventDefault()
          linkClicked()
        }}
      >
        Dashboard
      </a>
      <a
        href="/dashboard"
        target="_blank"
        onClick={(e) => {
          e.preventDefault()
          linkClicked()
        }}
      >
        New tab
      </a>
      <span data-testid="status">{isPrompting ? "prompting" : "idle"}</span>
      <button onClick={confirmLeave}>confirm</button>
      <button onClick={cancelLeave}>cancel</button>
    </div>
  )
}

function dispatchBeforeUnload() {
  const event = new Event("beforeunload", { cancelable: true })
  // jsdom has no BeforeUnloadEvent; shadow Event's legacy boolean returnValue with a
  // plain field so the string the handler writes can be asserted.
  Object.defineProperty(event, "returnValue", { value: "", writable: true })
  window.dispatchEvent(event)
  return event as Event & { returnValue: unknown }
}

function pressBrowserBack() {
  act(() => {
    window.dispatchEvent(new PopStateEvent("popstate", { state: {} }))
  })
}

describe("useUnsavedChangesGuard", () => {
  let pushStateSpy: jest.SpyInstance
  let backSpy: jest.SpyInstance
  let goSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    pushStateSpy = jest.spyOn(window.history, "pushState").mockImplementation(() => {})
    backSpy = jest.spyOn(window.history, "back").mockImplementation(() => {})
    goSpy = jest.spyOn(window.history, "go").mockImplementation(() => {})
  })

  afterEach(() => {
    pushStateSpy.mockRestore()
    backSpy.mockRestore()
    goSpy.mockRestore()
  })

  describe("in-app links", () => {
    it("intercepts an in-app link click when dirty", () => {
      render(<Harness isDirty />)

      fireEvent.click(screen.getByText("Dashboard"))

      expect(screen.getByTestId("status")).toHaveTextContent("prompting")
      expect(linkClicked).not.toHaveBeenCalled()
      expect(mockRouterPush).not.toHaveBeenCalled()
      expect(mockRouterReplace).not.toHaveBeenCalled()
    })

    it("replaces the trap history entry with the clicked link on confirm", () => {
      render(<Harness isDirty />)

      fireEvent.click(screen.getByText("Dashboard"))
      fireEvent.click(screen.getByText("confirm"))

      expect(mockRouterReplace).toHaveBeenCalledWith("/dashboard")
      expect(mockRouterPush).not.toHaveBeenCalled()
      expect(screen.getByTestId("status")).toHaveTextContent("idle")
    })

    it("stops prompting on cancel without navigating", () => {
      render(<Harness isDirty />)

      fireEvent.click(screen.getByText("Dashboard"))
      fireEvent.click(screen.getByText("cancel"))

      expect(screen.getByTestId("status")).toHaveTextContent("idle")
      expect(mockRouterReplace).not.toHaveBeenCalled()
      expect(mockRouterPush).not.toHaveBeenCalled()
    })

    it("lets link clicks through when not dirty", () => {
      render(<Harness isDirty={false} />)

      fireEvent.click(screen.getByText("Dashboard"))

      expect(linkClicked).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId("status")).toHaveTextContent("idle")
    })

    it("ignores modifier-key clicks and new-tab links", () => {
      render(<Harness isDirty />)

      fireEvent.click(screen.getByText("Dashboard"), { ctrlKey: true })
      fireEvent.click(screen.getByText("New tab"))

      expect(linkClicked).toHaveBeenCalledTimes(2)
      expect(screen.getByTestId("status")).toHaveTextContent("idle")
    })
  })

  describe("refresh / close (beforeunload)", () => {
    it("prompts with a non-empty returnValue only while dirty", () => {
      const { rerender } = render(<Harness isDirty />)
      const dirtyEvent = dispatchBeforeUnload()
      expect(dirtyEvent.defaultPrevented).toBe(true)
      expect(dirtyEvent.returnValue).toBe("unsaved")

      rerender(<Harness isDirty={false} />)
      expect(dispatchBeforeUnload().defaultPrevented).toBe(false)
    })

    it("asks in the app but skips the browser prompt when only a question is pending (warnOnUnload false)", () => {
      render(<Harness isDirty warnOnUnload={false} />)

      expect(dispatchBeforeUnload().defaultPrevented).toBe(false)

      fireEvent.click(screen.getByText("Dashboard"))
      expect(screen.getByTestId("status")).toHaveTextContent("prompting")
    })

    it("does not prompt again once the employer chose to leave", () => {
      render(<Harness isDirty />)

      fireEvent.click(screen.getByText("Dashboard"))
      fireEvent.click(screen.getByText("confirm"))

      expect(dispatchBeforeUnload().defaultPrevented).toBe(false)
    })
  })

  describe("browser Back button", () => {
    it("pushes exactly one trap history entry when the form becomes dirty", () => {
      const { rerender } = render(<Harness isDirty={false} />)
      expect(pushStateSpy).not.toHaveBeenCalled()

      rerender(<Harness isDirty />)
      rerender(<Harness isDirty />)

      expect(pushStateSpy).toHaveBeenCalledTimes(1)
      expect(pushStateSpy).toHaveBeenCalledWith({ __txUnsavedGuard: true }, "")
    })

    it("prompts on Back while dirty and re-arms the trap", () => {
      render(<Harness isDirty />)

      pressBrowserBack()

      expect(screen.getByTestId("status")).toHaveTextContent("prompting")
      expect(pushStateSpy).toHaveBeenCalledTimes(2)
      expect(backSpy).not.toHaveBeenCalled()
    })

    it("goes back past the trap and this page on confirm", () => {
      render(<Harness isDirty />)

      pressBrowserBack()
      fireEvent.click(screen.getByText("confirm"))

      expect(goSpy).toHaveBeenCalledWith(-2)
      expect(mockRouterReplace).not.toHaveBeenCalled()
      expect(screen.getByTestId("status")).toHaveTextContent("idle")
    })

    it("stays on the page on cancel", () => {
      render(<Harness isDirty />)

      pressBrowserBack()
      fireEvent.click(screen.getByText("cancel"))

      expect(goSpy).not.toHaveBeenCalled()
      expect(screen.getByTestId("status")).toHaveTextContent("idle")
    })

    it("finishes the Back press without prompting when the form was saved after the trap was pushed", () => {
      const { rerender } = render(<Harness isDirty />)
      rerender(<Harness isDirty={false} />)

      pressBrowserBack()

      expect(backSpy).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId("status")).toHaveTextContent("idle")
    })

    it("does nothing on Back when the form was never dirty", () => {
      render(<Harness isDirty={false} />)

      pressBrowserBack()

      expect(backSpy).not.toHaveBeenCalled()
      expect(pushStateSpy).not.toHaveBeenCalled()
      expect(screen.getByTestId("status")).toHaveTextContent("idle")
    })
  })
})
