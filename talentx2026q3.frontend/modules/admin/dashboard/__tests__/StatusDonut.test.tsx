import { render, screen, within } from "@testing-library/react";
import "../test-utils/resize-observer-stub";
import { StatusDonut, type DonutSegment } from "../components/StatusDonut";

const SEGMENTS: DonutSegment[] = [
  { key: "a", label: "Verified", value: 6, color: "#0B6B57" },
  { key: "b", label: "Pending", value: 3, color: "#DC6803" },
  { key: "c", label: "Rejected", value: 1, color: "#D92D20" },
];

// The list item for one legend row, found by its label.
function legendRow(label: string): HTMLElement {
  return screen.getByText(label).closest("li") as HTMLElement;
}

// Proves the donut tells the admin the total, lists every status with its count and share (including empty ones),
// and copes with having no data at all.
describe("StatusDonut", () => {
  it("shows the total in the middle with its label", () => {
    render(<StatusDonut segments={SEGMENTS} centerLabel="Employers" ariaLabel="Employer breakdown" />);

    expect(screen.getByRole("img", { name: "Employer breakdown" })).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Employers")).toBeInTheDocument();
  });

  it("lists each status with its count and percentage of the total", () => {
    render(<StatusDonut segments={SEGMENTS} centerLabel="Employers" ariaLabel="Employer breakdown" />);

    expect(within(legendRow("Verified")).getByText("6")).toBeInTheDocument();
    expect(within(legendRow("Verified")).getByText("60%")).toBeInTheDocument();
    expect(within(legendRow("Pending")).getByText("30%")).toBeInTheDocument();
    expect(within(legendRow("Rejected")).getByText("10%")).toBeInTheDocument();
  });

  it("still lists a status that has no items, at 0%", () => {
    render(
      <StatusDonut
        segments={[...SEGMENTS, { key: "d", label: "Suspended", value: 0, color: "#000000" }]}
        centerLabel="Employers"
        ariaLabel="Employer breakdown"
      />
    );

    expect(within(legendRow("Suspended")).getByText("0")).toBeInTheDocument();
    expect(within(legendRow("Suspended")).getByText("0%")).toBeInTheDocument();
  });

  it("shows a zero total and 0% rows, never NaN, when there is no data", () => {
    const empty = SEGMENTS.map((segment) => ({ ...segment, value: 0 }));

    const { container } = render(<StatusDonut segments={empty} centerLabel="Employers" ariaLabel="Employer breakdown" />);

    expect(screen.getAllByText("0%")).toHaveLength(3);
    expect(container.textContent).not.toContain("NaN");
  });
});
