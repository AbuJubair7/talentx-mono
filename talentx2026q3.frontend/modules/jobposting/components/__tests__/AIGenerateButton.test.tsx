import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AIGenerateButton } from "../AIGenerateButton"

describe("AIGenerateButton", () => {
  it("renders with default label and sparkles icon", () => {
    render(<AIGenerateButton onClick={jest.fn()} isLoading={false} />)

    expect(screen.getByRole("button", { name: "Generate with AI" })).toBeInTheDocument()
    expect(screen.getByText("Generate with AI")).toBeInTheDocument()
  })

  it("renders with custom label", () => {
    render(<AIGenerateButton onClick={jest.fn()} isLoading={false} label="Generate Skills" />)

    expect(screen.getByRole("button", { name: "Generate Skills" })).toBeInTheDocument()
  })

  it("calls onClick when clicked", async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(<AIGenerateButton onClick={handleClick} isLoading={false} />)
    await user.click(screen.getByRole("button", { name: "Generate with AI" }))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("disables button and shows spinner when isLoading is true", async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(<AIGenerateButton onClick={handleClick} isLoading={true} />)
    const button = screen.getByRole("button", { name: "Generate with AI" })

    expect(button).toBeDisabled()
    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it("contains circular light border beam animation elements", () => {
    const { container } = render(<AIGenerateButton onClick={jest.fn()} isLoading={false} />)
    const animatedElements = container.querySelectorAll(".animate-border-beam")

    expect(animatedElements.length).toBeGreaterThanOrEqual(1)
  })
})
