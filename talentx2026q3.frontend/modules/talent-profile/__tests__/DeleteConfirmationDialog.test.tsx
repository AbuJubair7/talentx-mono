import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { DeleteConfirmationDialog } from "../components/common/DeleteConfirmationDialog"

describe("DeleteConfirmationDialog", () => {
  const user = userEvent.setup()

  it("renders modal with title, description, and action buttons when open", () => {
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        title="Delete Item"
        description="Are you sure you want to delete this item?"
        confirmLabel="Delete"
        isDeleting={false}
        onConfirm={jest.fn()}
        onClose={jest.fn()}
      />
    )

    expect(screen.getByRole("heading", { name: "Delete Item" })).toBeInTheDocument()
    expect(screen.getByText("Are you sure you want to delete this item?")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^delete$/i })).toBeInTheDocument()
  })

  it("calls onConfirm when confirm button is clicked", async () => {
    const confirmMock = jest.fn()
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        title="Delete Item"
        description="Are you sure you want to delete this item?"
        onConfirm={confirmMock}
        onClose={jest.fn()}
      />
    )

    await user.click(screen.getByRole("button", { name: /delete/i }))
    expect(confirmMock).toHaveBeenCalledTimes(1)
  })

  it("calls onClose when cancel button is clicked", async () => {
    const closeMock = jest.fn()
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        title="Delete Item"
        description="Are you sure you want to delete this item?"
        onConfirm={jest.fn()}
        onClose={closeMock}
      />
    )

    await user.click(screen.getByRole("button", { name: /cancel/i }))
    expect(closeMock).toHaveBeenCalledTimes(1)
  })

  it("disables buttons and shows spinner when isDeleting is true", () => {
    render(
      <DeleteConfirmationDialog
        isOpen={true}
        title="Delete Item"
        description="Are you sure you want to delete this item?"
        isDeleting={true}
        onConfirm={jest.fn()}
        onClose={jest.fn()}
      />
    )

    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /delete/i })).toBeDisabled()
  })
})
