import { render, screen } from "@testing-library/react"
import { FileTextIcon } from "lucide-react"

import { SectionEmptyState } from "../SectionEmptyState"

describe("SectionEmptyState", () => {
  it("renders title, description, and icon", () => {
    render(
      <SectionEmptyState
        icon={FileTextIcon}
        title="No career summary added yet"
        description="A short professional summary will appear here once added."
      />
    )

    expect(screen.getByRole("heading", { name: "No career summary added yet", level: 3 })).toBeInTheDocument()
    expect(
      screen.getByText("A short professional summary will appear here once added.")
    ).toBeInTheDocument()
  })
})
