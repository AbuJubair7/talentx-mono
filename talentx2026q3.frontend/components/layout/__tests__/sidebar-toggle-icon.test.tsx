import React from "react";
import { render } from "@testing-library/react";
import { SidebarToggleIcon } from "../sidebar-toggle-icon";

describe("SidebarToggleIcon", () => {
  it("renders with default attributes and aria-hidden='true'", () => {
    const { container } = render(<SidebarToggleIcon />);
    const svgElement = container.querySelector("svg");

    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute("aria-hidden", "true");
    expect(svgElement).toHaveAttribute("viewBox", "-0.5 -0.5 16 16");
    expect(svgElement).toHaveAttribute("fill", "none");
  });

  it("accepts and merges className", () => {
    const { container } = render(
      <SidebarToggleIcon className="size-4 scale-x-[-1] text-muted-foreground" />
    );
    const svgElement = container.querySelector("svg");

    expect(svgElement).toHaveClass("size-4");
    expect(svgElement).toHaveClass("scale-x-[-1]");
    expect(svgElement).toHaveClass("text-muted-foreground");
  });

  it("renders paths with stroke='currentColor'", () => {
    const { container } = render(<SidebarToggleIcon />);
    const pathElements = container.querySelectorAll("path");

    expect(pathElements.length).toBe(3);
    pathElements.forEach((path) => {
      expect(path).toHaveAttribute("stroke", "currentColor");
    });
  });
});
