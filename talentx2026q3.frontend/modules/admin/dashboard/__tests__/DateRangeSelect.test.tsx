import { fireEvent, render, screen } from "@testing-library/react";
import { DateRangeSelect } from "../components/DateRangeSelect";

// Proves the picker offers every preset, shows exactly one as selected, and reports the admin's choice.
describe("DateRangeSelect", () => {
  it("offers the five presets inside a radio group", () => {
    render(<DateRangeSelect value="30d" onChange={jest.fn()} />);

    expect(screen.getByRole("radiogroup", { name: "Date range" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio").map((radio) => radio.textContent)).toEqual([
      "24H",
      "7D",
      "30D",
      "90D",
      "12M",
    ]);
  });

  it("marks only the current preset as selected", () => {
    render(<DateRangeSelect value="7d" onChange={jest.fn()} />);

    expect(screen.getByRole("radio", { name: "7D" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "30D" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getAllByRole("radio").filter((radio) => radio.getAttribute("aria-checked") === "true")).toHaveLength(1);
  });

  it("spells the range out in a tooltip", () => {
    render(<DateRangeSelect value="30d" onChange={jest.fn()} />);

    expect(screen.getByRole("radio", { name: "12M" })).toHaveAttribute("title", "Last 12 months");
  });

  it("reports the clicked preset", () => {
    const onChange = jest.fn();
    render(<DateRangeSelect value="30d" onChange={onChange} />);

    fireEvent.click(screen.getByRole("radio", { name: "24H" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("24h");
  });
});
